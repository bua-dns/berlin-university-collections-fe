export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug parameter is required',
    });
  }

  try {
    // Fetch the specific collection item by slug using filter
    const itemResponse = await $fetch('https://mstub-db.bua-dns.de/items/collection_items/', {
      query: {
        'filter[slug][_eq]': slug,
        fields: '*.*, card_entries.card_entries_id.*',
      }
    });

    const items = itemResponse.data;
    
    if (!items || items.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Item not found',
      });
    }

    const item = items[0];

    // Fetch minerals data
    const mineralsResponse = await $fetch('https://mstub-db.bua-dns.de/items/minerals', {
      query: {
        fields: '*.*',
        limit: -1,
      }
    });

    const minerals = mineralsResponse.data || [];

    // Find relevant minerals
    const relevantMinerals = minerals.filter(mineral => {
      return item.mineral_denominations_relations?.includes(mineral.slug);
    });

    // Helper functions
    function getCardEntriesValues(field) {
      if (!item.card_entries || !item.card_entries.length) return '';
      const entries = new Set(item.card_entries.map(entry => entry.card_entries_id[field]));
      return Array.from(entries).join(', ');
    }

    function getStrunzInfo(entry) {
      if (entry.strunz_10) {
        return `Strunz: ${entry.strunz_10} (10. Aufl.)`;
      }
      if (entry.strunz_9) {
        return `Strunz: ${entry.strunz_9} (9. Aufl.)`;
      }
      if (entry.strunz_8) {
        return `Strunz: ${entry.strunz_8} (8. Aufl.)`;
      }
      return null;
    }

    // Enhance relevantMinerals with Strunz info
    const enrichedMinerals = relevantMinerals.map(mineral => ({
      ...mineral,
      strunzInfo: getStrunzInfo(mineral)
    }));

    // Build card entries metadata
    const cardEntriesMetadata = {
      mineral_denomination_card: getCardEntriesValues('mineral_denomination_card'),
      find_spot: getCardEntriesValues('find_spot'),
      number_of_specimens_indication: getCardEntriesValues('number_of_specimens_indication'),
      number_of_specimens_interpretation: getCardEntriesValues('number_of_specimens_interpretation'),
    };

    return {
      item,
      relevantMinerals: enrichedMinerals,
      cardEntriesMetadata,
    };

  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch item data',
    });
  }
});
