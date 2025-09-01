<script setup>
/* Used auto-imported composables: projectConfig */
const { data: themeContent } = await useFetch(`${projectConfig.dataBaseUrl}/theme_content`);
const { data: personsTeamContent } = await useFetch(`${projectConfig.dataBaseUrl}/persons_team`,
  {
    query: {
      fields: '*,translations.*',
      limit: -1,
    }
  }
);
const { data: institutionsContent } = await useFetch(`${projectConfig.dataBaseUrl}/institutions`);
const { data: backgroundImages } = await useFetch(`${projectConfig.dataBaseUrl}/background_images`,
  {
    query: {
      fields: '*,object_from_collection.id,object_from_collection.label,object_from_collection.current_keeper, translations.*',
      limit: -1
    }
  });
const { data: taxonomyTermsData } = await useFetch(`${projectConfig.dataBaseUrl}/taxonomy_terms`, {
  query: {
    fields: 'id, label, spws_taxonomy, translations.*',
    limit: -1,
    meta: 'total_count',
  }
});
const { data: projectsData } = await useFetch(`${projectConfig.dataBaseUrl}/projects`, {
  query: {
    fields: projectConfig.fields.projects.join(','),
    limit: -1,
  }
});
const { data: eventsData } = await useFetch(`${projectConfig.dataBaseUrl}/events`, {
  query: {
    fields: projectConfig.fields.projects.join(','),
    limit: -1,
  }
});

const { data: ikbCategoriesData } = await useFetch(`https://ikb-lbs-hub.bua-dns.de/items/dns_categories`, {
  query: {
    fields: '*.*',
    limit: -1,
  }
});
const { data: ikbConfigurationData } = await useFetch(`https://ikb-lbs-hub.bua-dns.de/items/configuration`, {
  query: {
    fields: '*.*',
    limit: -1,
  }
});
const { data: mstubMineralsData } = await useFetch(`https://mstub-db.bua-dns.de/items/minerals`, {
  query: {
    fields: '*.*',
    limit: -1,
  }
});
const { data: mstubItemsData } = await useFetch(`https://mstub-db.bua-dns.de/items/collection_items`, {
  query: {
    fields: '*.*, card_entries.card_entries_id.*',
    limit: -1,
  }
});
const { data: kmTopicsItemsData } = await useFetch(`${projectConfig.dataBaseUrl}/km_topics`, {
  query: {
    fields: '*.*',
    limit: -1,
  }
});
const { data: cylinderSealsData } = await useFetch(`https://va-005-api.berlin-university-collections.de/api/digitized-items`, {
  query: {
    // provisorisch!
    limit: 50,
    'populate[0]': 'object_type',
    'populate[1]': 'materials',
    'populate[2]': 'techniques',
    'populate[3]': 'main_image',
    'populate[4]': 'event.event_type',
    'populate[5]': 'event.event_date',
    'populate[6]': 'event.place',
    // 'populate[7]': 'event.description',
  }
});
const { data: demonstratorsData } = await useFetch(`${projectConfig.dataBaseUrl}/demonstrators`, {
  query: {
    fields: 'id, label, link, translations.*',
    limit: -1,
    meta: 'total_count',
  }
});

const theme = useState('theme', () => themeContent);
useState('personsTeam', () => personsTeamContent);
useState('institutions', () => institutionsContent);
useState('taxonomyTerms', () => taxonomyTermsData);
useState('background_images', () => backgroundImages);
useState('projects', () => projectsData);
useState('events', () => eventsData);
// useState('resources', () => resourcesData);
useState('ikbCategories', () => ikbCategoriesData);
useState('ikbConfiguration', () => ikbConfigurationData);
useState('minerals', () => mstubMineralsData);
useState('mstubItems', () => mstubItemsData);
useState('kmTopics', () => kmTopicsItemsData);
useState('cylinderSeals', () => cylinderSealsData);
useState('demonstrators', () => demonstratorsData);

const w = theme.value.data.wording.de;
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${w.collection_portal_title}` : w.collection_portal_title;
  }
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- <div>{{ theme.data }}</div> -->
</template>