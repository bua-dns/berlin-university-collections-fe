<script setup>
const route = useRoute();
const { locale } = useI18n();
const theme = useState('theme');
const w = theme.value.data.wording[locale.value];

const id = route.params['id'];

const { data: mafItems, pending } = await useFetch('/api/maf');

const item = computed(() => {
  if (mafItems.value?.data) {
    return mafItems.value.data.find(i => i.id == id);
  }
  return null;
});

const getTitle = (item) => {
  return item.label || item.device || item.search?.title || 'Untitled';
};

const getImageUrl = (img) => {
  const uri = img.uri || img.url;
  if (!uri) return '';
  if (uri.startsWith('http')) {
    return uri;
  }
  return `https://files.berlin-university-collections.de/maf-images/${uri}`;
};

const showLightbox = ref(false);
const currentImageIndex = ref(0);
const numImages = computed(() => item.value?.online_images?.length || 0);

const openLightbox = (index) => {
  currentImageIndex.value = index;
  showLightbox.value = true;
};

const closeLightbox = (e) => {
  if (e.key === "Escape") {
    showLightbox.value = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', closeLightbox);
});

onUnmounted(() => {
  window.removeEventListener('keydown', closeLightbox);
});
</script>

<template>
  <div class="page university-collection-item">
    <Head>
      <Title>{{ item ? getTitle(item) : id }}</Title>
    </Head>

    <div v-if="pending" class="text-center p-8">Loading...</div>
    
    <div v-else-if="item" class="maf-detail">
      <h2 class="mb-4 text-center">Medienarchäologischer Fundus</h2>
      <h1 class="page-header text-center">{{ getTitle(item) }}</h1>
      
      <div class="backlink">
        <NuxtLink to="/maf">zurück zur Übersicht</NuxtLink>
      </div>

      <div class="max-w-6xl mx-auto p-4">
        <div class="content-layout">
          <!-- Metadata Section (Left) -->
          <div class="metadata-section">
            <div class="metadata grid grid-cols-1 gap-3">
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

              <div class="field" v-if="item.remarks">
                <div class="field-label font-bold text-gray-700">Bemerkungen</div>
                <div class="field-value">{{ item.remarks }}</div>
              </div>
            </div>
          </div>

          <!-- Main Image Section (Right) -->
          <div class="image-section" v-if="item.online_images && item.online_images.length > 0">
            <div class="main-image-container" @click="openLightbox(0)" style="cursor: pointer;">
              <MafImageDisplay :images="[item.online_images[0]]" :alt="getTitle(item)" cover />
            </div>
          </div>
        </div>

        <!-- Additional Images (Below) -->
        <div class="additional-images mt-4" v-if="item.online_images && item.online_images.length > 1">
          <div class="maf-gallery">
            <div v-for="(img, index) in item.online_images.slice(1)" :key="index" class="maf-gallery-item">
              <img :src="getImageUrl(img)" :alt="`${getTitle(item)} - Image ${index + 2}`" @click="openLightbox(index + 1)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center p-8">
      <h2 class="mb-4 text-center">Item {{ id }}</h2>
      <p>Item not found.</p>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="showLightbox" class="lightbox">
        <div class="lightbox-close" @click="showLightbox = false">
          <svg class="icon" width="24" height="24" fill="currentColor">
            <use xlink:href="@/assets/img/bootstrap-icons.svg#x"></use>
          </svg>
        </div>
        <div class="lightbox-nav" v-if="numImages > 1">
          <div class="lightbox-prev" @click="currentImageIndex = (currentImageIndex - 1 + numImages) % numImages">
            <div class="icon-container">
              <svg class="icon" width="24" height="24" fill="currentColor">
                <use xlink:href="@/assets/img/bootstrap-icons.svg#chevron-left"></use>
              </svg>
            </div>
          </div>
          <div class="lightbox-next" @click="currentImageIndex = (currentImageIndex + 1) % numImages">
            <div class="icon-container">
              <svg class="icon" width="24" height="24" fill="currentColor">
                <use xlink:href="@/assets/img/bootstrap-icons.svg#chevron-right"></use>
              </svg>
            </div>
          </div>
        </div>
        <div class="lightbox-content">
          <img :src="getImageUrl(item.online_images[currentImageIndex])">
        </div>
      </div>
    </Teleport>
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
  
  .content-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .metadata-section {
    order: 2;
    
    @media (min-width: 768px) {
      order: 1;
    }
  }

  .image-section {
    order: 1;
    
    @media (min-width: 768px) {
      order: 2;
    }

    .main-image-container {
      position: sticky;
      top: 2rem;
    }
  }

  .additional-images {
    margin-top: 2rem;
    
    .maf-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 250px));
      gap: 1rem;
      
      .maf-gallery-item {
        img {
          display: block;
          width: 100%;
          cursor: pointer;
          transition: transform 0.2s;
          background-color: #f3f4f6;
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
  }
  
  .field {
    background: #f9fafb;
    padding: 0.625rem 0.875rem;
    border-radius: 0.375rem;
    
    .field-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.125rem;
    }
    
    .field-value {
      font-size: 1rem;
    }
  }
}
</style>
