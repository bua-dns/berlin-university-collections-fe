<script setup>
const router = useRouter();
const theme = useState("theme")
const { locale } = useI18n()
const w = computed(() => theme.value.data.wording[locale.value])
// DEV: replace by slug from path
const slug = "maf-hu-page";
// const titleWording = 'page_projekte'

const { data } = await useFetchPage(slug)
const page = data.value.data[0] || {}

const { data: items, pending, error } = await useFetch('/api/maf');

const searchQuery = ref('');
const validImageCounts = ref({});

const filteredItems = computed(() => {
  if (!items.value?.data) return [];
  if (!searchQuery.value || searchQuery.value.length < 3) return [];
  
  const query = searchQuery.value.toLowerCase();
  
  const results = items.value.data.filter(item => {
    const text = [
      item.label,
      item.device,
      item.manufacturer,
      item.model,
      item.remarks,
      item.country,
      item.inventory_number,
      item.artifact_number,
      item.search?.title
    ].filter(Boolean).join(' ').toLowerCase();
    
    return text.includes(query);
  });

  return results.sort((a, b) => {
    const hasImagesA = a.online_images && a.online_images.length > 0;
    const hasImagesB = b.online_images && b.online_images.length > 0;
    if (hasImagesA && !hasImagesB) return -1;
    if (!hasImagesA && hasImagesB) return 1;
    return 0;
  });
});

const getTitle = (item) => {
  return item.label || item.device || item.search?.title || 'Untitled';
};

const getDescription = (item) => {
  const parts = [];
  if (item.manufacturer) parts.push(item.manufacturer);
  if (item.production_year_display) parts.push(item.production_year_display);
  if (item.country) parts.push(item.country);
  return parts.join(', ') || item.remarks || '';
};

const updateValidImageCount = (itemId, count) => {
  validImageCounts.value[itemId] = count;
};

const getValidImageCount = (itemId) => {
  return validImageCounts.value[itemId] ?? null;
};
</script>

<template>
  <section class="page image-listing-page workbench">
    <section class="page image-listing-page workbench">
      <h1 class="text-center page-header">{{ useGetTranslatedContent("title", locale, page) }}</h1>
      <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
    </section>

    <div class="search-controls">
      <div class="search-input-wrapper">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Suche in der Sammlung..." 
          class="search-input"
        />
        <div v-if="searchQuery" 
             @click="searchQuery = ''"
             class="clear-button">
          ✕
        </div>
      </div>
      <div class="search-status">
        <span v-if="searchQuery && searchQuery.length < 3">Bitte geben Sie mindestens 3 Zeichen ein.</span>
        <span v-else-if="searchQuery && filteredItems.length === 0">Keine Ergebnisse gefunden.</span>
        <span v-else-if="filteredItems.length > 0">{{ filteredItems.length }} Objekte gefunden</span>
        <span v-else>Bitte geben Sie einen Suchbegriff ein.</span>
      </div>
    </div>
    <div class="categories">
      <MafCategories />
    </div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error loading items: {{ error.message }}</div>
    
    <div v-else class="collection-items">
      <CardCollectionItems v-for="item in filteredItems" :key="item.id">
        <template #image>
          <NuxtLink :to="item.search?.slug || `/maf-hu/${item.id}`" class="image-link-wrapper">
            <MafImageDisplay 
              :images="item.online_images" 
              :alt="getTitle(item)" 
              cover 
              hide-missing
              @validImageCount="(count) => updateValidImageCount(item.id, count)" />
            <div v-if="getValidImageCount(item.id) > 0" class="image-count-badge">
              <span class="image-icon">📷</span>
              <span class="image-number">{{ getValidImageCount(item.id) }}</span>
            </div>
          </NuxtLink>
        </template>
        
        <template #title>
          <NuxtLink :to="item.search?.slug || `/maf-hu/${item.id}`">
            {{ getTitle(item) }}
          </NuxtLink>
        </template>

        <template #meta>
          <div class="field" v-if="item.manufacturer">
            <div class="field-label">Hersteller</div>
            <div class="field-value">{{ item.manufacturer }}</div>
          </div>
          <div class="field" v-if="item.production_year_display">
            <div class="field-label">Jahr</div>
            <div class="field-value">{{ item.production_year_display }}</div>
          </div>
          <div class="field" v-if="item.country">
            <div class="field-label">Land</div>
            <div class="field-value">{{ item.country }}</div>
          </div>
          <div class="field" v-if="item.remarks">
            <div class="field-label">Bemerkungen</div>
            <div class="field-value">{{ item.remarks }}</div>
          </div>
        </template>
      </CardCollectionItems>
    </div>
    <pre v-if="false">{{page}}</pre>
  </section>
</template>

<style scoped lang="scss">
.search-controls {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 36rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
}

.clear-button {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #9ca3af;

  &:hover {
    color: #4b5563;
  }
}

.search-status {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.collection-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.image-link-wrapper {
  position: relative;
  display: block;
}

.image-count-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  
  .image-icon {
    font-size: 1rem;
  }
  
  .image-number {
    line-height: 1;
  }
}

.field {
  margin-bottom: 10px;
}

.field-label {
  font-weight: bold;
  font-size: 0.875rem;
  color: #666;
}

.field-value {
  color: #333;
}
</style>
