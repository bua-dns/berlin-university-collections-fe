import { cylinderSealsItemMapping } from "~/utils/mappings/cylinderSeals.js"



export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug parameter is required',
    });
  }

  try {
    // Fetch the specific collection item by slug using Strapi filter syntax
    const itemResponse = await $fetch("https://va-005-api.berlin-university-collections.de/api/digitized-items", {
      query: {
        "filters[slug][$eq]": slug,
        'populate[0]': 'object_type',
        'populate[1]': 'materials',
        'populate[2]': 'techniques',
        'populate[3]': 'main_image',
        'populate[4]': 'event.event_type',
        'populate[5]': 'event.event_date',
        'populate[6]': 'event.place.vocab_terms',
      },
    })

    const items = itemResponse.data;
    
    if (!items || items.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Item not found',
      });
    }

    const item = cylinderSealsItemMapping(items[0])

    return item;

  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    });
  }
});