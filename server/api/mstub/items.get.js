export default cachedEventHandler(async (event) => {
  try {
    const data = await $fetch("https://mstub-db.bua-dns.de/items/collection_items", {
      query: {
        fields: "*.*, card_entries.card_entries_id.*",
        limit: -1,
      },
      headers: {
        accept: "application/json",
      },
    })

    return data
  } catch (error) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || "Failed to fetch collection items",
    })
  }
}, {
  // Cache settings
  maxAge: 60 * 10,        // 10 minutes fresh
  staleMaxAge: 60 * 60,   // up to 60 min as stale
  swr: true,              // Stale-While-Revalidate
})

