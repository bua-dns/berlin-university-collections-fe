<script setup>
const route = useRoute();
const router = useRouter();
const theme = useState("theme")
const { locale } = useI18n()
const w = computed(() => theme.value.data.wording[locale.value])

// DEV: replace by slug from path
const slug = "rollsiegel-fu"
// const titleWording = 'page_projekte'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]

const sealsData = useState("cylinderSeals")
const seals = sealsData.value.data || []

const mineralStore = useMineralStore()
const currentMineral = computed(() => mineralStore.currentMineral)

const mineralsData = useState("minerals")
const mstubItemsData = useState("mstubItems")

const minerals = mineralsData.value.data || []
const mstubItems = mstubItemsData.value.data || []
// const sample = mstubItems.filter((item) => item.representations && item.representations.length > 0).slice(0, 50) || []
const samples = ref([])
// const currentMineral = ref(null);

const filteredMstubItems = computed(() => {
  if (!currentMineral.value) return []

  return mstubItems
    .filter((item) => item.mineral_denominations_relations.includes(currentMineral.value))
    .sort((a, b) => {
      const hasA = a.representations.length > 0
      const hasB = b.representations.length > 0

      if (hasA && !hasB) return -1
      if (!hasA && hasB) return 1

      // Optional: if both have representations, sort by length ascending
      if (hasA && hasB) {
        return a.representations.length - b.representations.length
      }

      return 0 // both have none
    })
})
function setSamples() {
  const itemsWithImages = mstubItems.filter(item => item.representations?.length > 0)

  // Shuffle the array
  const shuffled = [...itemsWithImages].sort(() => Math.random() - 0.5)

  // Return first 10
  return shuffled.slice(0, 10)
}
function navigateTo(path) {
  router.push(path)
}

onMounted(() => {
  samples.value = setSamples()
})
</script>

<template>
  <div>
    <section class="page image-listing-page workbench">
      <h1 class="text-center page-header">{{ useGetTranslatedContent("title", locale, page) }}</h1>
      <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
    </section>
    <section class="demonstrator page image-listing-page workbench full-width">
      <div class="collection-items">
          <CardCollectionItems v-for="item in seals" :key="item.id">
            <template #image v-if="item.main_image?.formats?.medium?.url">
              <NuxtLinkLocale :to="`/seals/${item.slug}`" class="">
                <img :src="useGetSealsImageUrl(item.main_image.formats.medium.url)" alt="Item Image" />
              </NuxtLinkLocale>
            </template>
            <template #image v-if="item.representations && item.representations.length === 0">
                <img class="image-placeholder" src="@/assets/img/image-placeholder.svg" alt="Item Image" />
            </template>
            <template #title>{{ item.object_title }}</template>
            <template #meta>

              <div class="field" v-if="useGetSealsBasicInfo(item)">
                <div class="field-value">{{ useGetSealsBasicInfo(item).productionEventDate }}</div>
              </div>
            </template>
            <template #footer>
              <NuxtLinkLocale :to="`/seals/${item.slug}`" class="btn btn-primary">mehr zu diesem Objekt
              </NuxtLinkLocale>
            </template>
          </CardCollectionItems>
        </div>
      <pre v-if="false">{{ seals }}</pre>
    </section>
  </div>
</template>

<style scoped lang="scss">
.workbench {
  .controls {
    max-width: var(--page-width);
    margin: 1rem auto 2rem;
  }

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
