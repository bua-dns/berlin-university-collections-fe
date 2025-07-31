<script setup>
const { locale } = useI18n();
const theme = useState('theme');
const w = computed(() => theme.value.data.wording[locale.value]);

import { useMineralStore } from '@/stores/useMineralStore'
const mineralStore = useMineralStore()
const currentMineral = computed(() => mineralStore.currentMineral)

const mineralsData = useState('minerals');
const mstubItemsData = useState('mstubItems');


const minerals = mineralsData.value.data || [];
const mstubItems = mstubItemsData.value.data || [];
const sample = mstubItems
  .filter(item => item.representations && item.representations.length > 0)
  .slice(0, 50) || [];

// const currentMineral = ref(null);

const filteredMstubItems = computed(() => {
  if (!currentMineral.value) return [];
  
  return mstubItems
    .filter(item => item.mineral_denominations_relations.includes(currentMineral.value))
    .sort((a, b) => {
      const hasA = a.representations.length > 0;
      const hasB = b.representations.length > 0;

      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;

      // Optional: if both have representations, sort by length ascending
      if (hasA && hasB) {
        return a.representations.length - b.representations.length;
      }

      return 0; // both have none
    });
});

</script>

<template>

  <div class="page image-listing-page workbench full-width" v-if="true">
    <section class="cms-page">
      <h1 class="text-center page-header">Workbench</h1>
      <pre v-if="true">{{ currentMineral }}</pre>
      <pre v-if="true">{{ filteredMstubItems.length }}</pre>
      <div class="controls">
        <SearchBoxTerms
          :terms="minerals"
          labelKey="label"
          filterKey="slug"
          @selected="currentMineral = $event.slug"
        />
      </div>
      <div class="collection-items">
        <CardCollectionItems v-for="item in filteredMstubItems" :key="item.id">
          <template #image v-if="item.representations && item.representations.length > 0">
            <img :src="useGetMSTUBImageUrl(item.representations[0].directus_files_id)" alt="Item Image" />
          </template>
          <template #image v-if="item.representations && item.representations.length === 0">
            <img class="image-placeholder" src="@/assets/img/image-placeholder.svg" alt="Item Image" />
          </template>
          <template #title>{{ item.mineral_denomination_inventory }}</template>
          <template #meta>
            <div class="field">
              <div class="field-label">Erwerbungsdatum</div>
              <div class="field-value">{{ item.acquisition_date }}</div>
            </div>
            <div class="field">
              <div class="field-label">Inventarnummer</div>
              <div class="field-value">{{ item.inventory_number }}</div>
            </div>
          </template>
          <template #footer>
            <button class="btn btn-primary">Mehr zu diesem Objekt</button>
          </template>
        </CardCollectionItems>
      </div>
      <pre v-if="true">minerals {{ minerals }}</pre>
      <pre v-if="true">sample {{ sample }}</pre>
      
    </section>
  </div>
</template>

<style scoped lang='scss'>
.workbench {
  .collection-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .field {
    margin-bottom: 10px;

    .field-label {
      font-weight: bold;
    }

    .field-value {
      color: #555;
    }
  }

  .btn {
    margin-top: 10px;
  }
}
.image-placeholder {
  width: 6rem;
  display: block;
  margin: 0 auto;
  opacity: 0.5;
}
</style>

