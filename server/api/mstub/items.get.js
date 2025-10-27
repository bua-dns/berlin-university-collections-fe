export default defineEventHandler(async (event) => {
  try {
    const data = await $fetch("https://mstub-db.bua-dns.de/items/minerals", {
      query: {
        fields: "*.*",
        limit: -1,
      },
    })

    return data
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to fetch collection items",
    })
  }
})
