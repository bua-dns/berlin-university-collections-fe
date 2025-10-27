export default defineEventHandler(async (event) => {
  const collections = ['mstub'];
  
  try {
    const results = {};
    
    // Fetch all collections in parallel
    await Promise.all(
      collections.map(async (collection) => {
        try {
          const data = await $fetch(`/api/${collection}/items`, {
            baseURL: event.node.req.headers.host 
              ? `http://${event.node.req.headers.host}`
              : 'http://localhost:3000'
          });
          results[collection] = data;
        } catch (err) {
          console.error(`Failed to fetch ${collection} items:`, err);
          results[collection] = null;
        }
      })
    );

    return results;
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch collection items',
    });
  }
});
