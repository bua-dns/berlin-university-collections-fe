const specificFields = {
  dimensions: {
    label: "Abmessungen",
    type: "text",
  },
  published_in: {
    label: "Publiziert in",
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
  const relevantFields = ["object_title", "inventory_number", "object_description"]

  relevantFields.forEach((field) => {
    if (item[field]) {
      searchpool.push(item[field])
    }
  })

  return searchpool.join(" | ")
}

function getImage(data) {
  if (!data || !data.id || !data.formats || !data.formats.medium) return null
  const baseUrl = "https://va-005-api.berlin-university-collections.de"
  const url = data.formats.medium.url.replace('medium_', '')
  return `${baseUrl}${url}`
}

export function cylinderSealsItemMapping(item) {
  // return item
  return {
    metadata: {
      common: {
        title: item.object_title || "kein Titel",
        identifier: item.inventory_number || "kein Identifier",
        description: item.object_description || null,
      },
      specific: mapSpecificFields(item),
      classification: {
        type: "cylinder seal",
      },
      media: {
        mainImage: getImage(item.main_image) || null,
      },
      search: {
        searchpool: buildSearchpool(item),
      },
    },
    ...item,
  }
}
