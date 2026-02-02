import { mafApiConfig } from "~/EXTRA/apis/maf.js"

export default cachedEventHandler(
  async () => {
    try {
      const cfg = typeof mafApiConfig === "function" ? mafApiConfig() : mafApiConfig

      // cfg.baseUrl can be either:
      // - https://va-003-api.berlin-university-collections.de
      // - https://va-003-api.berlin-university-collections.de/api
      const rawBase = (cfg?.baseUrl || "https://va-003-api.berlin-university-collections.de").replace(/\/+$/, "")

      // Ensure we end up at ".../api"
      const apiBase = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`

      const headers = {
        accept: "application/json",
        ...(cfg?.token ? { Authorization: `Bearer ${cfg.token}` } : {}),
      }

      const pageSize = 100

      // 1) fetch first page to get pagination
      const first = await $fetch(`${apiBase}/categories`, {
        query: {
          "pagination[pageSize]": pageSize,
          "pagination[page]": 1,
        },
        headers,
      })

      const pageCount = first?.meta?.pagination?.pageCount || 1

      // 2) fetch remaining pages (if any)
      const pages = [first]

      if (pageCount > 1) {
        const rest = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, i) => i + 2).map((page) =>
            $fetch(`${apiBase}/categories`, {
              query: {
                "pagination[pageSize]": pageSize,
                "pagination[page]": page,
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

      return {
        data: Array.from(map.values()),
        meta: {
          pagination: {
            page: 1,
            pageSize,
            pageCount,
            total: map.size,
          },
        },
      }
    } catch (error) {
      console.error("MAF API Error (categories):", error)
      throw createError({
        statusCode: error?.statusCode || 500,
        statusMessage: error?.message || "Failed to fetch categories from MAF API",
      })
    }
  },
  {
    maxAge: 60 * 1, // 1 minute fresh
    staleMaxAge: 60 * 10, // 10 minutes stale (dev-friendly; adjust later)
    swr: true,
  },
)
