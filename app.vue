<script setup>
/* Used auto-imported composables: projectConfig */
const { data: themeContent } = await useFetch(`${projectConfig.dataBaseUrl}/theme_content`);
const { data: personsTeamContent } = await useFetch(`${projectConfig.dataBaseUrl}/persons_team`);
const { data: institutionsContent } = await useFetch(`${projectConfig.dataBaseUrl}/institutions`);
const { data: backgroundImages } = await useFetch(`${projectConfig.dataBaseUrl}/background_images`,
  {
    query: {
      fields: '*,object_from_collection.id,object_from_collection.label,object_from_collection.current_keeper',
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
    fields: '*.*',
    limit: -1,
  }
});
const { data: kmTopicsItemsData } = await useFetch(`${projectConfig.dataBaseUrl}/km_topics`, {
  query: {
    fields: '*.*',
    limit: -1,
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