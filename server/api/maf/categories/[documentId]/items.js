import { mafApiConfig } from "~/EXTRA/apis/maf.js"

export default cachedEventHandler(
  async (event) => {
    const startTime = Date.now()

    try {
      const categoryDocId = getRouterParam(event, "documentId")
      if (!categoryDocId) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing category documentId",
        })
      }

      const cfg = typeof mafApiConfig === "function" ? mafApiConfig() : mafApiConfig

      // cfg.baseUrl can be either:
      // - https://va-003-api.berlin-university-collections.de
      // - https://va-003-api.berlin-university-collections.de/api
      const rawBase = (cfg?.baseUrl || "https://va-003-api.berlin-university-collections.de").replace(/\/+$/, "")
      const apiBase = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`

      const headers = {
        accept: "application/json",
        ...(cfg?.token ? { Authorization: `Bearer ${cfg.token}` } : {}),
      }

      const pageSize = 100

      // 1) fetch first page to get pagination
      const first = await $fetch(`${apiBase}/collection-items`, {
        query: {
          "filters[categories][documentId][$eq]": categoryDocId,
          "pagination[pageSize]": pageSize,
          "pagination[page]": 1,
          // keep consistent with your items endpoint:
          "populate[0]": "online_images",
          "populate[1]": "categories",
        },
        headers,
      })

      const pageCount = first?.meta?.pagination?.pageCount || 1
      const expectedTotal = first?.meta?.pagination?.total ?? null

      // 2) fetch remaining pages (if any)
      const pages = [first]

      if (pageCount > 1) {
        const rest = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, i) => i + 2).map((page) =>
            $fetch(`${apiBase}/collection-items`, {
              query: {
                "filters[categories][documentId][$eq]": categoryDocId,
                "pagination[pageSize]": pageSize,
                "pagination[page]": page,
                "populate[0]": "online_images",
                "populate[1]": "categories",
              },
              headers,
            }),
          ),
        )
        pages.push(...rest)
      }

      // 3) merge data (dedupe by id just in case)
      const map = new Map()
      for (const p of pages) {
        for (const item of p?.data || []) map.set(item.id, item)
      }

      const data = Array.from(map.values())

      return {
        meta: {
          category: { documentId: categoryDocId },
          pagination: {
            page: 1,
            pageSize,
            pageCount,
            total: data.length,
            expectedTotal,
          },
          fetchDurationMs: Date.now() - startTime,
          fetchedAt: new Date().toISOString(),
        },
        data,
      }
    } catch (error) {
      console.error("MAF API Error (category items):", error)
      throw createError({
        statusCode: error?.statusCode || 500,
        statusMessage: error?.message || "Failed to fetch collection items by category",
      })
    }
  },
  {
    maxAge: 60 * 1, // 1 minute fresh
    staleMaxAge: 60 * 10, // 10 minutes stale
    swr: true,
  },
)
