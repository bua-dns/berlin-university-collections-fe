// server/api/mstub/item/[slug].get.js
import { mstubItemMapping } from "~/utils/mappings/mstubItem.js"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Slug parameter is required" })
  }

  try {
    const itemResponse = await $fetch("https://mstub-db.bua-dns.de/items/collection_items", {
      query: {
        "filter[slug][_eq]": slug,
        fields: "*.*,card_entries.card_entries_id.*,representations.directus_files_id.*",
        limit: 1,
      },
    })

    const items = Array.isArray(itemResponse?.data) ? itemResponse.data : itemResponse?.data ? [itemResponse.data] : []

    if (!items.length) {
      console.debug("[mstub:item] No items for slug:", slug, "Raw:", itemResponse)
      throw createError({ statusCode: 404, statusMessage: "Item not found" })
    }

    const rawItem = items[0]

    // --- Mapper compatibility shim -----------------------------------------
    // If your mapper expects Strapi shape (item.attributes.*), wrap accordingly.
    const asStrapiLike = (obj) => {
      if (obj && obj.attributes) return obj // already strapi-like
      return { id: obj?.id, attributes: obj ?? {} }
    }

    // A very defensive fallback if the custom mapper fails
    const fallbackMap = (obj) => {
      const cardEntries = Array.isArray(obj?.card_entries) ? obj.card_entries : []
      return {
        // keep a minimal, stable structure your UI can work with
        id: obj?.id ?? null,
        slug: obj?.slug ?? null,
        title: obj?.title ?? obj?.titel ?? obj?.object_title ?? null,
        mineral_denominations_relations: Array.isArray(obj?.mineral_denominations_relations)
          ? obj.mineral_denominations_relations
          : [],

        // keep representations (images) if present
        representations: Array.isArray(obj?.representations) ? obj.representations : [],

        // keep card entries flattened (only what we need later)
        card_entries: cardEntries.map((e) => ({
          card_entries_id: e?.card_entries_id ?? {},
        })),

        // keep the full raw too for debugging (client won’t use it)
        _raw: obj,
      }
    }

    let item
    try {
      // Try your existing mapper first
      item = mstubItemMapping(asStrapiLike(rawItem))
    } catch (mapErr) {
      // Log detailed reason server-side; don’t 500 the request.
      console.error("[mstub:item] mstubItemMapping failed:", mapErr)
      item = fallbackMap(rawItem)
    }

    // --- Minerals lookup -----------------------------------------------------
    const mineralsResponse = await $fetch("https://mstub-db.bua-dns.de/items/minerals", {
      query: { fields: "*.*", limit: -1 },
    })
    const minerals = Array.isArray(mineralsResponse?.data) ? mineralsResponse.data : []

    const relationSlugs = Array.isArray(item?.mineral_denominations_relations)
      ? item.mineral_denominations_relations
      : []

    const relevantMinerals = minerals.filter((m) => m?.slug && relationSlugs.includes(m.slug))

    const getStrunzInfo = (entry) => {
      if (!entry) return null
      if (entry.strunz_10) return `Strunz: ${entry.strunz_10} (10. Aufl.)`
      if (entry.strunz_9) return `Strunz: ${entry.strunz_9} (9. Aufl.)`
      if (entry.strunz_8) return `Strunz: ${entry.strunz_8} (8. Aufl.)`
      return null
    }

    const enrichedMinerals = relevantMinerals.map((mineral) => ({
      ...mineral,
      strunzInfo: getStrunzInfo(mineral),
    }))

    const getCardEntriesValues = (field) => {
      const list = Array.isArray(item?.card_entries) ? item.card_entries : []
      if (!list.length) return ""
      const values = new Set()
      for (const entry of list) {
        const card = entry?.card_entries_id
        const val = card?.[field]
        if (val) values.add(val)
      }
      return Array.from(values).join(", ")
    }

    const cardEntriesMetadata = {
      mineral_denomination_card: getCardEntriesValues("mineral_denomination_card"),
      find_spot: getCardEntriesValues("find_spot"),
      number_of_specimens_indication: getCardEntriesValues("number_of_specimens_indication"),
      number_of_specimens_interpretation: getCardEntriesValues("number_of_specimens_interpretation"),
    }

    console.debug("[mstub:item] OK slug:", slug, {
      mineralsTotal: minerals.length,
      relevantMinerals: enrichedMinerals.length,
    })

    return {
      item,
      relevantMinerals: enrichedMinerals,
      cardEntriesMetadata,
    }
  } catch (error) {
    console.error("[mstub:item] Error for slug:", slug, error)
    // If you want to see the real mapper error in dev, uncomment next two lines:
    // if (process.env.NODE_ENV !== 'production') {
    //   return sendError(event, createError({ statusCode: 500, statusMessage: String(error?.message || error) }))
    // }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to fetch item data",
    })
  }
})
