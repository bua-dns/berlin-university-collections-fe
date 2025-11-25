import { mafApiConfig } from "~/EXTRA/apis/maf.js";

export default cachedEventHandler(async (event) => {
  const startTime = Date.now();
  
  try {
    const { baseUrl, token, endpoint } = mafApiConfig;
    
    // Fetch first page to get pagination info
    const firstPage = await $fetch(`${baseUrl}${endpoint}`, {
      query: {
        "pagination[pageSize]": 100,
        "pagination[page]": 1,
        "populate[0]": "online_images",
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    });

    const pagination = firstPage.meta?.pagination;
    const totalPages = pagination?.pageCount || 1;
    const total = pagination?.total || 0;
    
    console.log(`MAF API: Fetching ${total} items across ${totalPages} pages`);

    // Collect all items using Map to avoid duplicates
    const itemsMap = new Map();
    
    // Add items from first page
    (firstPage.data || []).forEach(item => {
      itemsMap.set(item.id, item);
    });

    // If there are more pages, fetch them all concurrently
    if (totalPages > 1) {
      const BATCH_SIZE = 50; // Fetch in batches to avoid overwhelming the server
      let failedPages = [];
      
      // Create array of page numbers to fetch (pages 2 to totalPages)
      const pagesToFetch = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      
      // Fetch in batches
      for (let batchStart = 0; batchStart < pagesToFetch.length; batchStart += BATCH_SIZE) {
        const batch = pagesToFetch.slice(batchStart, batchStart + BATCH_SIZE);
        console.log(`MAF API: Fetching batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(pagesToFetch.length / BATCH_SIZE)} (pages ${batch[0]}-${batch[batch.length - 1]})`);
        
        const batchPromises = batch.map(page =>
          $fetch(`${baseUrl}${endpoint}`, {
            query: {
              "pagination[pageSize]": 100,
              "pagination[page]": page,
              "populate[0]": "online_images",
            },
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "application/json",
            },
          })
          .then(result => ({ page, result, success: true }))
          .catch((error) => {
            console.error(`Failed to fetch MAF page ${page}:`, error.message);
            return { page, result: null, success: false };
          })
        );
        
        const results = await Promise.all(batchPromises);
        
        // Add successful items to map
        results.forEach(({ page, result, success }) => {
          if (success && result?.data) {
            result.data.forEach(item => {
              itemsMap.set(item.id, item);
            });
          } else if (!success) {
            failedPages.push(page);
          }
        });
      }

      // Retry failed pages sequentially (more reliable)
      if (failedPages.length > 0) {
        console.log(`MAF API: Retrying ${failedPages.length} failed pages sequentially...`);
        const stillFailed = [];
        
        for (const page of failedPages) {
          try {
            const result = await $fetch(`${baseUrl}${endpoint}`, {
              query: {
                "pagination[pageSize]": 100,
                "pagination[page]": page,
                "populate[0]": "online_images",
              },
              headers: {
                Authorization: `Bearer ${token}`,
                accept: "application/json",
              },
            });
            
            (result.data || []).forEach(item => {
              itemsMap.set(item.id, item);
            });
          } catch (error) {
            console.error(`Sequential retry failed for page ${page}:`, error.message);
            stillFailed.push(page);
          }
        }
        
        if (stillFailed.length > 0) {
          console.warn(`MAF API: ${stillFailed.length} pages still failed:`, stillFailed.slice(0, 20));
        } else {
          console.log(`MAF API: All failed pages successfully retried!`);
        }
      }
    }

    // Convert map to array and parse stringified JSON fields
    const allItems = Array.from(itemsMap.values());
    const mappedItems = allItems.map((item) => {
      const mappedItem = { ...item };

      // Parse wikidata_references if it exists and is a string
      if (item.wikidata_references && typeof item.wikidata_references === 'string') {
        try {
          mappedItem.wikidata_references = JSON.parse(item.wikidata_references);
        } catch (e) {
          console.error(`Failed to parse wikidata_references for item ${item.id}:`, e.message);
          mappedItem.wikidata_references = null;
        }
      }

      // Parse searchfields and restructure into search object
      let searchfields = null;
      if (item.searchfields && typeof item.searchfields === 'string') {
        try {
          searchfields = JSON.parse(item.searchfields);
        } catch (e) {
          console.error(`Failed to parse searchfields for item ${item.id}:`, e.message);
        }
      } else if (item.searchfields && typeof item.searchfields === 'object') {
        // Already parsed (shouldn't happen, but handle it)
        searchfields = item.searchfields;
      }

      // Determine title: depicted_object > depicted_locations > title (fallback)
      let displayTitle = item.title || '';
      if (item.depicted_object && item.depicted_object.trim()) {
        displayTitle = item.depicted_object;
      } else if (item.depicted_locations && item.depicted_locations.trim()) {
        displayTitle = item.depicted_locations;
      }

      // Create search object with title, slug, and searchfields
      mappedItem.search = {
        title: displayTitle,
        slug: `/maf-hu/${item.mr_ref || item.id}`,
        searchfields: searchfields,
      };

      // Remove the old searchfields property from root
      delete mappedItem.searchfields;

      return mappedItem;
    });

    console.log(`MAF API: Successfully fetched ${mappedItems.length} unique items`);

    const endTime = Date.now();
    const fetchDuration = endTime - startTime;
    const itemsMissing = total - mappedItems.length;

    if (itemsMissing > 0) {
      console.warn(`MAF API: Missing ${itemsMissing} items (expected ${total}, got ${mappedItems.length})`);
    }

    return {
      meta: {
        itemsFetched: mappedItems.length,
        expectedTotal: total,
        itemsMissing: itemsMissing,
        totalPages: totalPages,
        fetchDurationMs: fetchDuration,
        fetchDurationSeconds: (fetchDuration / 1000).toFixed(2),
        fetchedAt: new Date().toISOString(),
      },
      data: mappedItems,
    };
  } catch (error) {
    console.error("MAF API Error:", error);
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || "Failed to fetch MAF items",
    });
  }
}, {
  // Cache settings
  maxAge: 60 * 1,        // 1 minute fresh
  staleMaxAge: 60 * 60,   // up to 60 min as stale
  swr: true,              // Stale-While-Revalidate
});
