<script setup>
// config: set min height for cards
const collectionCardMinHeight = '19rem';

/* Used auto-imported composables: projectConfig */
const router = useRouter();
const route = useRoute();

const theme = useState("theme")
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);


// config for specific page

// DEV: replace by slug from path
const slug = 'online-ressourcen'
// const titleWording = 'page_online-ressourcen'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]

const { data: resourcesData } = await useFetch(`${projectConfig.dataBaseUrl}/online_resources`, {
  query: {
    fields: projectConfig.fields.resources.join(','),
    limit: -1,
  }
});
const resources = resourcesData.value.data
  .filter((resource) => resource.status === 'published')
  .sort((a, b) => a.position - b.position);

const { data:collectionsData } = await useFetch('https://sammlungsportal.bua-dns.de/items/bua_collections', {
  query: {
    fields: 'id, label, current_keeper, dns_objects_in_external_databases, name, dns_objects_in_own_databases, translations.*',
    limit: -1,
  },
});

// function getTranslatedRepeaterContent(translations, field, label, fallback, index) {
//   // Always return both languages; fall back to `fallback` if anything is missing
//   if (!Array.isArray(translations)) return { de: fallback, en: fallback };

//   // Build a quick lookup by language code
//   const byLang = Object.fromEntries(
//     translations.map(t => [t.languages_code, t])
//   );

//   const pick = (lang) => {
//     const t = byLang[lang];
//     const arr = t && Array.isArray(t[field]) ? t[field] : null;
//     const item = arr && arr[index] ? arr[index] : null;
//     const val = item && item[label];
//     return val ?? fallback;
//   };

//   return {
//     de: pick('de'),
//     en: pick('en'),
//   };
// }

function getTranslatedRepeaterContentFixed(collection, locale, dbType) {
  if (!collection) return '';
  if (!collection.translations || !Array.isArray(collection.translations)) return collection.description || '';

  const translation = collection.translations.find(t => t.languages_code === locale && Array.isArray(t[dbType]) && t[dbType].some(item => item.label === collection.label));

  // console.log(translation);

  if (translation) {
    const entry = translation[dbType].find(item => item.label === collection.label);
    if (entry && entry.description) {
      return entry.description;
    }
  }

  // try to fall back to German translation
  if (locale !== 'de') {
    const deTranslation = collection.translations.find(t => t.languages_code === 'de' && Array.isArray(t[dbType]) && t[dbType].some(item => item.label === collection.label));
    if (deTranslation) {
      const entry = deTranslation[dbType].find(item => item.label === collection.label);
      if (entry && entry.description) {
        return entry.description;
      }
    }
  }

  return collection.description || '';

}


const ownResources = computed(() => {
  if (!collectionsData.value) return [];
  const collections = collectionsData.value.data
    .filter((collection) => collection.dns_objects_in_own_databases)
    .map((collection) => ({
      id: collection.id,
      label: collection.label,
      dns_objects_in_own_databases: collection.dns_objects_in_own_databases,
      currentKeeper: collection.current_keeper,
      translations: collection.translations || [],

    }));
    let entries = [];
    for (let collection of collections) {
      for (let resource of collection.dns_objects_in_own_databases) {
        entries.push({
          collection: collection.label,
          id: collection.id,
          currentKeeper: collection.currentKeeper,
          translations: collection.translations,
          ...resource,
        });
      }
    }
    return entries
      .sort((a, b) => {
        if (a.collection < b.collection) return -1;
        if (a.collection > b.collection) return 1;
        return 0;
      });

});

function sortEntries(entries, field) {
  return entries.sort((a, b) => {
    if (a[field] < b[field]) return -1;
    if (a[field] > b[field]) return 1;
    return 0;
  });
}

const relatedCollections = computed(() => {
  if (!collectionsData) return {};
  const index = {};
  for (let resource of resources) {
    if (!index[resource.slug]) {
      index[resource.slug] = [];
    }
  }
  for (let collection of collectionsData.value.data) {
    if (!collection.dns_objects_in_external_databases) continue;
    for (let resource of collection.dns_objects_in_external_databases) {
      if (index[resource.online_resource]) {
        index[resource.online_resource].push({
          collection: collection.label,
          id: collection.id,
          currentKeeper: collection.current_keeper,
          translations: collection.translations || [],
          ...collection.dns_objects_in_external_databases
            .find((item) => item.online_resource === resource.online_resource),
        });
      }
    }
  }
  for (let entry in index) {
    if (!index[entry] || !index[entry].length) continue;
    index[entry] = index[entry]
  }
  return index;
});
function scrollToEntry(entry) {
  const scrollTarget = document.getElementById(entry);
  setTimeout(() => {
    scrollTarget.scrollIntoView({ behavior: "smooth" });
  }, 100);
  // console.log('scrolling to', entry);
}
function setQueryParamResource(resourceId) {
  const params = {
    resource: resourceId,
  };
  router.push({ query: params });
}
function selectResource(resourceId) {
  setQueryParamResource(resourceId);
  scrollToEntry('resource-' + resourceId);
}

onMounted(() => {
  const resource = route.query.resource || '';
  if (resource) {
    selectResource(resource);
  }
});
function getCardText(description, moreItemsHint) {
  if (description && moreItemsHint) {
    return `${description}${moreItemsHint}`;
  }
  if (description) {
    return description;
  }
  if (moreItemsHint) {
    return `${moreItemsHint}`;
  }
  return '';
}
function shortenKeeperInfo(keeper) {
  if (!keeper) return '';
  if (keeper === 'Freie Universität Berlin') return 'FU Berlin';
  if (keeper === 'Humboldt-Universität zu Berlin') return 'HU Berlin';
  if (keeper === 'Technische Universität Berlin') return 'TU Berlin';
  if (keeper === 'Charité – Universitätsmedizin Berlin') return 'Charité';
  return keeper;
}



</script>

<template>

  <Head>
    <Title>{{ w.page_online_ressourcen }}</Title>
  </Head>
  <div class="page wide segmented online-resources" v-if="data && page.status === 'published'">
    <pre v-if="false" style="background-color: #fff;">
      foo - resourcesData
      {{ resourcesData }}
      <hr></hr>foo - collectionsData
      {{ collectionsData }}
      <hr></hr>foo - ownResources
      {{ ownResources }}
      <hr></hr>foo - relatedCollections
      {{ relatedCollections }}
    </pre>
    <template v-if="!page.display_sidebar">
      <section class="controls page-segment">
        <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
      </section>
    </template>
    <template v-if="page.display_sidebar">
      <section class="page-segment">
        <h1 class="mb-4 text-center">{{ useGetTranslatedContent('title', locale, page) }}</h1>
        <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
        <div class="sidebar" v-if="page.display_sidebar === '1'">
          <div class="mt-3 mb-5 sidebar-header" v-if="page.sidebar_header_image">
            <img :src="projectConfig.imageBaseUrl + '/' + page.sidebar_header_image + '?key=sidebar-header'"
              alt="sidebar image" />
          </div>
          <div v-if="page.sidebar_content"
            class="sidebar-content"
            v-html="useGetTranslatedContent('sidebar_content', locale, page)" />
        </div>
      </section>
    </template>
    <section class="controls page-segment">
      <div class="own-resources-button">
        <button @click="selectResource('0')" class="tag">
          <span class="tag-name">{{ w.online_resources_own_resources }}</span>
          <span class="tag-count">({{ ownResources.length }})</span>
        </button>
      </div>
      <div class="resource-cloud">
        <button v-for="resource in resources"
          :key="`resource-${resource.id}`"
          @click="selectResource(resource.id)"
          class="tag">
          <span class="tag-name">{{ resource.name }}</span>
          <span class="tag-count">{{ relatedCollections[resource.slug].length }}</span>
        </button>
      </div>
    </section>
    <div class="resources-listing">
      <div class="own-database-listing" id="resource-0">
        <section class="own-resources page-segment">
          <h2>{{ w.online_resources_own_resources }}</h2>
        </section>
        <section class="own-resources page-segment page-card-grid">
          <Card v-for="(collection, index) in ownResources"
            :key="`own-${index}`"
            :cardImage="collection.screenshot"
            :cardTitle="collection.collection"
            :rubric="shortenKeeperInfo(collection.currentKeeper)"
            :cardText="getCardText(
                // getTranslatedRepeaterContent(collection.translations, 'dns_objects_in_own_databases', 'description', collection.description, 0)[locale],
                getTranslatedRepeaterContentFixed(collection, locale, 'dns_objects_in_own_databases'),
                collection.more_items_hint
              )"
            :cardMoreButtonLabel="`zur Ressource (ca. ${ formatNumberWithPeriods(collection.amount_of_objects) } Objekte)`"
            :cardMoreButtonLink="collection.link" :cardTitleLink="collection.link"
            :cardBodyMinHeight="collectionCardMinHeight" />
        </section>
      </div>
      <div class="external-database-listing">
        <section class="external-resources page-segment">
          <h2>{{ w.online_resources_external_resources }}</h2>
        </section>
        <section v-for="resource in resources"
          class="resource-entry page-segment"
          :key="resource.id"
          :id="`resource-${resource.id}`">
          <h2>
            <a :href="resource.url" :alt="`Link zu ${resource.name}`" target="_blank">
              {{ resource.name }}
            </a>
          </h2>
          <div class="main-container">
            <div class="content">
              <div class="resource-description" v-html="useGetTranslatedContent('description', locale, resource)" />
              <a :href="resource.url" target="_blank">{{ resource.name }} aufrufen ...</a>
            </div>
            <div class="screenshot" v-if="resource.main_screenshot">
              <a :href="resource.url" target="_blank">
                <img class="main-screenshot"
                  :src="`${ projectConfig.imageBaseUrl }/${resource.main_screenshot}?key=online-resource-cover`" alt="">
              </a>
            </div>
          </div>
          <div class="collection-listing mt-5">
            <h3 class="mb-4">{{ w.collections_in_bua_resource }} - {{ resource.slug }}</h3>
            <div v-if="relatedCollections[resource.slug]" class=" page-card-grid mt-2">
              <div v-for="(collection, index) in sortEntries(relatedCollections[resource.slug], 'collection')"
                :key="`collection-${index}`">
                <Card
                  :cardImage="collection.screenshot"
                  :cardTitle="collection.collection"
                  :rubric="shortenKeeperInfo(collection.currentKeeper)"
                  :cardText="getCardText(
                    getTranslatedRepeaterContentFixed(collection, locale, 'dns_objects_in_external_databases'),
                    collection.more_items_hint
                  )"
                  :cardMoreButtonLabel="`zur Ressource (ca. ${ formatNumberWithPeriods(collection.amount_of_objects) } Objekte)`"
                  :cardMoreButtonLink="collection.link" :cardTitleLink="collection.link"
                  :cardBodyMinHeight="collectionCardMinHeight" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang='scss'>

.online-resources {
  .page-container {
    display: block;

    .page-content {
    }
    .sidebar {
      .sidebar-header {
        display: none;

      }
    }
  }
  .controls {
    margin: 2rem 0 1rem;
    .own-resources-button {
      margin: 0 0 1rem;
    }
    .resource-cloud, .own-resources-button {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
      justify-content: center;

      .tag {
        .tag-name {
            display: inline-block;
            font-size: .85rem;
        }
        .tag-count {
          display: inline-block;
          margin-left: 0.5rem;
          color: var(--color-text);
          background-color: var(--color-taxonomy-button-background);
          border: 1px solid var(--color-taxonomy-button-background-marked);
          min-width: 1.9rem;
          border-radius: 3px;
          font-size: .85rem;
          padding: 0.25em 0.5em;
        }
      }
    }
  }
  .resources-listing {
    margin-top: 2rem;
    .resource-entry {
      scroll-margin-top: calc(var(--header-height) + 2.5rem);
      h2 {
        margin-bottom: 1.5rem;
      }
      .main-container {
        display: flex;
        gap: 1.5rem;
        justify-content: space-between;
        .content {
          flex: 2;
        }
        .screenshot {
          display: none;
          flex: 1.2;
          .main-screenshot {
            width: 36rem;
            height: auto;
          }
          @media screen and (min-width: 768px){
            display: flex;
          }
        }
      }
    }
  }
  .own-database-listing {
    scroll-margin-top: calc(var(--header-height) + 2.5rem);
  }
  .page-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    gap: 1.5rem;
    margin-bottom: 4rem;
    @media screen and (min-width: 576px){
      grid-template-columns: repeat(auto-fill, minmax(var(--feature-card-width), 1fr));

    }
  }
}
@media screen and (min-width: 768px){
  .p_dns-page {
    .page-container {
        display: flex;
        gap: 2.5rem;

        .page-content {
          flex: 2;
        }

        .sidebar {
          .sidebar-header {
            display: block;
          }
          flex: 1;
        }
      }
  }

}

</style>
