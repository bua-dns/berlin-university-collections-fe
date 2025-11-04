import { ikbApiConfig } from "~/config/apis/ikb.js"
import { getResponseHeader, setResponseHeader } from "h3"

// ---- utils -------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchPage(cfg, page, pageSize = 100, attempt = 1) {
  const { baseUrl, endpoint, token } = cfg
  const maxAttempts = 6

  // Exponential backoff + jitter
  const jitter = Math.floor(Math.random() * 150)
  if (attempt > 1) await sleep(300 * Math.pow(2, attempt - 1) + jitter)

  try {
    return await $fetch(`${baseUrl}${endpoint}`, {
      query: {
        "pagination[pageSize]": pageSize,
        "pagination[page]": page,
        sort: "id:asc", // keep pagination stable
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      retry: 0, // we handle retries ourselves
    })
  } catch (err) {
    const status = err?.response?.status || err?.statusCode
    const retryAfterHdr = err?.response?.headers?.get?.("retry-after")
    if ((status === 429 || (status >= 500 && status < 600)) && attempt < maxAttempts) {
      const retryAfterMs = retryAfterHdr ? Number(retryAfterHdr) * 1000 : 0
      if (retryAfterMs) await sleep(retryAfterMs)
      return fetchPage(cfg, page, pageSize, attempt + 1)
    }
    throw err
  }
}

async function runWithConcurrency(items, limit, fn) {
  const results = []
  const queue = items.slice()
  const workers = []

  const worker = async () => {
    while (queue.length) {
      const item = queue.shift()
      try {
        const res = await fn(item)
        results.push({ ok: true, item, res })
      } catch (e) {
        results.push({ ok: false, item, error: e })
      }
    }
  }

  const n = Math.min(limit, queue.length || limit)
  for (let i = 0; i < n; i++) workers.push(worker())
  await Promise.all(workers)
  return results
}

// ---- handler -----------------------------------------------------------

export default cachedEventHandler(
  async (event) => {
    const startTime = Date.now()
    const cfg = ikbApiConfig

    try {
      // 1) Discover totals with stable sort
      const firstPage = await $fetch(`${cfg.baseUrl}${cfg.endpoint}`, {
        query: {
          "pagination[pageSize]": 100,
          "pagination[page]": 1,
          sort: "id:asc",
        },
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          accept: "application/json",
        },
        retry: 0,
      })

      const pagination = firstPage.meta?.pagination
      const totalPages = pagination?.pageCount || 1
      const total = pagination?.total || firstPage.data?.length || 0

      console.log(`IKB API: Expecting ${total} items across ${totalPages} pages`)

      // 2) Collect remaining pages with bounded concurrency
      const pages = Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => i + 2)
      const CONCURRENCY = 10 // tune 6–12 depending on server capacity
      const pageSize = 100

      const mapById = new Map()
      ;(firstPage.data || []).forEach((it) => mapById.set(it.id, it))

      const batchResults = await runWithConcurrency(pages, CONCURRENCY, (p) => fetchPage(cfg, p, pageSize))

      const failedPages = []
      for (const r of batchResults) {
        if (r.ok && r.res?.data) {
          for (const it of r.res.data) mapById.set(it.id, it)
        } else {
          failedPages.push(r.item)
          console.error(`IKB page ${r.item} failed:`, r.error?.message || r.error)
        }
      }

      // 3) Sequential fallback for stubborn pages
      if (failedPages.length) {
        console.warn(`IKB API: ${failedPages.length} pages failed in batch mode. Falling back to sequential fetch...`)
        const stillFailed = []
        for (const p of failedPages) {
          try {
            const res = await fetchPage(cfg, p, pageSize)
            ;(res?.data || []).forEach((it) => mapById.set(it.id, it))
          } catch (e) {
            stillFailed.push(p)
            console.error(`Sequential fetch failed for page ${p}:`, e?.message || e)
          }
        }
        if (stillFailed.length) {
          console.warn(
            `IKB API: Final failed pages after sequential fallback: ${stillFailed
              .slice(0, 50)
              .join(", ")}${stillFailed.length > 50 ? " ..." : ""}`
          )
        }
      }

      // 4) Parse stringified JSON fields & de-dupe
      const allItems = Array.from(mapById.values()).map((item) => {
        const mappedItem = { ...item }
        if (item.wikidata_references && typeof item.wikidata_references === "string") {
          try {
            mappedItem.wikidata_references = JSON.parse(item.wikidata_references)
          } catch {
            mappedItem.wikidata_references = null
          }
        }
        if (item.searchfields && typeof item.searchfields === "string") {
          try {
            mappedItem.searchfields = JSON.parse(item.searchfields)
          } catch {
            mappedItem.searchfields = null
          }
        }
        return mappedItem
      })

      // Keep deterministic order and avoid exceeding total (edge case)
      allItems.sort((a, b) => (a.id > b.id ? 1 : -1))
      const finalItems = allItems.length > total ? allItems.slice(0, total) : allItems

      const endTime = Date.now()
      const fetchDuration = endTime - startTime
      const itemsMissing = Math.max(0, total - finalItems.length)

      // Cache diagnostics (may be undefined on some setups; that's fine)
      const cacheStatus =
        getResponseHeader(event, "x-nitro-cache") || getResponseHeader(event, "X-Nitro-Cache") || "UNKNOWN"
      const cacheAgeSeconds = Number(getResponseHeader(event, "age") || getResponseHeader(event, "Age") || 0)

      // Server-Timing for quick inspection in DevTools
      setResponseHeader(event, "Server-Timing", `ikb-total;desc="handler total";dur=${fetchDuration}`)

      return {
        meta: {
          itemsFetched: finalItems.length,
          expectedTotal: total,
          itemsMissing,
          totalPages,
          fetchDurationMs: fetchDuration,
          fetchDurationSeconds: (fetchDuration / 1000).toFixed(2),
          fetchedAt: new Date().toISOString(),
          concurrency: CONCURRENCY,
          pageSize,
          stableSort: "id:asc",
          cacheStatus, // HIT | MISS | STALE | UNKNOWN
          cacheAgeSeconds,
        },
        data: finalItems,
      }
    } catch (error) {
      console.error("IKB API Error:", error)
      throw createError({
        statusCode: error?.statusCode || 500,
        statusMessage: error?.message || "Failed to fetch IKB items",
      })
    }
  },
  {
    // Cache settings
    maxAge: 60 * 10, // 10 minutes fresh
    staleMaxAge: 60 * 60, // up to 60 min as stale
    swr: true, // Stale-While-Revalidate
  }
)
