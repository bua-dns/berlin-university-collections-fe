<script setup>
const theme = useState("theme")
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);


// config for specific page

// DEV: replace by slug from path
const slug = 'services'
// const titleWording = 'page_projekte'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]

const servicesData = useState('services');
const services = servicesData.value.data

</script>

<template>

  <Head>
    <Title>{{ w.page_projekte }}</Title>
  </Head>
  <div class="page p_dns-page" v-if="data && page.status === 'published'">
    <h1 class="text-center page-header">{{ useGetTranslatedContent('title', locale, page) }}</h1>
    <div class="dev-out">
      <pre v-if="false">
        servicesData:
        {{ services }}
      </pre>

    </div>
    <template v-if="!page.display_sidebar">
      <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
    </template>
    <template v-if="page.display_sidebar">
      <div class="page-container">
        <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
        <pre v-if="false">{{ page }}</pre>
        <div class="sidebar">
          <div class="mt-3 mb-5 sidebar-header" v-if="page.sidebar_header_image">
            <img :src="projectConfig.imageBaseUrl + '/' + page.sidebar_header_image + '?key=sidebar-header'"
              alt="sidebar image" />
          </div>
          <div class="sidebar-content" v-html="useGetTranslatedContent('sidebar_content', locale, page)" />
        </div>
      </div>
    </template>
    <h2 class="text-center mb-4 mt-5 py-3">{{ w.services_offered }}</h2>
    <div v-if="true" class="services-listing page-card-grid mx-5">
      <div class="project-display" v-for="(service, idx) in services" :key="`service-card-${idx}`">
        <Card :cardImage="service.preview_image?.filename_disk"
          :cardTitle="useGetTranslatedContent('title', locale, service)"
          :cardText="useGetTranslatedContent('teaser_text', locale, service)"
          :cardMoreButtonLabel="w.more_about_this_service" :cardMoreButtonLink="`/services/${service.slug}`"
          :cardBodyMinHeight="'13rem'" />
      </div>
    </div>
  </div>
</template>

<style lang='scss'>
.p_dns-page {
  .page-container {
    display: block;

    .page-content {}

    .sidebar {
      .sidebar-header {
        display: none;

        img {}
      }
    }
  }

  .page-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--feature-card-width), 1fr));
    gap: 1.5rem;
  }
}

@media screen and (min-width: 768px) {
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
