const specificFields = {
  page_number_inventory: {
    label: "Seitenzahl im Inventar",
    type: "text",
  },
  acquisition_date: {
    label: "Erwerbungsdatum",
    type: "date",
  },
  provenance: {
    label: "Herkunft",
    type: "text",
  },
  annotation_inventory: {
    label: "Anmerkung im Inventar",
    type: "text",
  },
}

function mapSpecificFields(item) {
  const mappedFields = {}
  Object.keys(specificFields).forEach((fieldKey) => {
    const fieldDef = specificFields[fieldKey]
    if (item[fieldKey]) {
      mappedFields[fieldDef.label] = item[fieldKey]
    }
  })
  return mappedFields
}

function buildSearchpool(item) {
  const searchpool = []
  const relevantFields = ["mineral_denomination_inventory", "inv_inventory"]

  relevantFields.forEach((field) => {
    if (item[field]) {
      searchpool.push(item[field])
    }
  })

  return searchpool.join(" | ")
}

function getImages(representations) {
  if (!representations || representations.length === 0) return null
  const baseUrl = "https://mstub-db.bua-dns.de/assets"
  return representations.map(rep => `${baseUrl}/${rep.directus_files_id.id}`)
}

export function mstubItemMapping(item) {
  return {
    metadata: {
      common: {
        title: item.mineral_denomination_inventory || "kein Titel",
        identifier: item.inventory_number || "kein Identifier",
        description: null,
      },
      specific: mapSpecificFields(item),
      classification: {
        type: "mineral specimen",
      },
      media: {
        mainImage: getImages(item.representations)[0] || null,
        allImages: getImages(item.representations) || [],
        videos: [],
      },
      search: {
        searchpool: buildSearchpool(item),
      },
    },
    ...item,
  }
}
