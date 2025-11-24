<script setup>
const route = useRoute();
const { locale } = useI18n();
const theme = useState('theme');
const w = theme.value.data.wording[locale.value];

const slug = route.params['item'];
const isMaf = slug.startsWith('maf-');

const { data: mafItems, pending } = await useFetch('/api/maf', {
  immediate: isMaf
});

const item = computed(() => {
  if (isMaf && mafItems.value?.data) {
    const id = slug.replace('maf-', '');
    return mafItems.value.data.find(i => i.id == id);
  }
  return null;
});

const getTitle = (item) => {
  return item.label || item.device || item.search?.title || 'Untitled';
};
</script>

<template>
  <div class="page university-collection-item">
    <Head>
      <Title>{{ item ? getTitle(item) : slug }}</Title>
    </Head>

    <div v-if="pending" class="text-center p-8">Loading...</div>
    
    <div v-else-if="isMaf && item" class="maf-detail">
      <h2 class="mb-4 text-center">Medienarchäologischer Fundus</h2>
      <h1 class="page-header text-center">{{ getTitle(item) }}</h1>
      
      <div class="backlink">
        <NuxtLink to="/maf">zurück zur Übersicht</NuxtLink>
      </div>

      <div class="max-w-4xl mx-auto p-4">
        <div class="mb-8">
          <MafImageDisplay :images="item.online_images" :alt="getTitle(item)" />
        </div>

        <div class="metadata grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="field" v-if="item.manufacturer">
            <div class="field-label font-bold text-gray-700">Hersteller</div>
            <div class="field-value">{{ item.manufacturer }}</div>
          </div>
          
          <div class="field" v-if="item.model">
            <div class="field-label font-bold text-gray-700">Modell</div>
            <div class="field-value">{{ item.model }}</div>
          </div>

          <div class="field" v-if="item.production_year_display">
            <div class="field-label font-bold text-gray-700">Produktionsjahr</div>
            <div class="field-value">{{ item.production_year_display }}</div>
          </div>

          <div class="field" v-if="item.country">
            <div class="field-label font-bold text-gray-700">Land</div>
            <div class="field-value">{{ item.country }}</div>
          </div>

          <div class="field" v-if="item.inventory_number">
            <div class="field-label font-bold text-gray-700">Inventarnummer</div>
            <div class="field-value">{{ item.inventory_number }}</div>
          </div>

          <div class="field" v-if="item.artifact_number">
            <div class="field-label font-bold text-gray-700">Artefaktnummer</div>
            <div class="field-value">{{ item.artifact_number }}</div>
          </div>

          <div class="field" v-if="item.current_status">
            <div class="field-label font-bold text-gray-700">Status</div>
            <div class="field-value">{{ item.current_status }}</div>
          </div>

          <div class="field" v-if="item.existence_documented">
            <div class="field-label font-bold text-gray-700">Standort</div>
            <div class="field-value">{{ item.existence_documented }}</div>
          </div>

          <div class="field col-span-1 md:col-span-2" v-if="item.remarks">
            <div class="field-label font-bold text-gray-700">Bemerkungen</div>
            <div class="field-value">{{ item.remarks }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center p-8">
      <h2 class="mb-4 text-center">{{ slug }}</h2>
      <p>Item not found or collection not supported.</p>
    </div>
  </div>
</template>

<style lang="scss">
.page.university-collection-item {
  .backlink {
    text-align: center;
    margin: 1.5rem auto;
    a {
      text-decoration: underline;
      &:hover {
        text-decoration: none;
      }
    }
  }
  
  .field {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    
    .field-label {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
    
    .field-value {
      font-size: 1.125rem;
    }
  }
}
</style>