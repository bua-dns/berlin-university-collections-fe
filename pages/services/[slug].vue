<script setup>
const route = useRoute();
const { locale } = useI18n();
const theme = useState('theme');
const w = theme.value.data.wording[locale.value];
const serviceSlug = route.params.slug;

const services = useState('services');
const service = services.value.data.find((service) => service.slug === serviceSlug);


</script>
<template>
  <div class="page services" :class="{ 'with-sidebar': service.display_sidebar === '1' }">

    <Head>
      <Title>{{ w.page_services }}</Title>
    </Head>
    <div class="output">
      <pre v-if="false">{{ service }}</pre>
    </div>
    <h1 class="page-header-with-subtitle text-center">{{ useGetTranslatedContent('title', locale, service) }}</h1>
    <div class="services-content-container">
      <div class="main-content">
        <div class="description" v-html="useGetTranslatedContent('description', locale, service)"></div>
      </div>
      <div v-if="service.display_sidebar === '1'" class="sidebar">
        <div v-html="useGetTranslatedContent('sidebar_content', locale, service)">
        </div>
        <img v-if="service.preview_image"
          :src="`${projectConfig.imageBaseUrl}/${service.preview_image.filename_disk}?key=sidebar-logo`"
          :alt="'Symboldbild ' + service.title" />
        
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.page.services {
  .services-content-container {
    display: block;

    h2,
    h3,
    h4 {
      margin: 0 0 1rem;
    }
  }

  .sidebar {
    display: none;
    font-size: var(--font-size-text-extra-small);

    h4,
    h5 {
      font-size: var(--font-size-small);
      margin: 0 0 .5rem;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: block;
        margin: 1rem 0;
      }
    }
  }

  &.with-sidebar {
    .services-content-container {
      display: grid;
      grid-template-columns: 2.5fr 1fr;
      gap: 3rem;

      @media screen and (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .main-content {}

    .sidebar {
      display: block;

      .sidebar-content {
        font-size: var(--font-size-text-small);

        h4 {
          font-size: var(--font-size-text-small);
        }
      }
    }
  }
}

.description {}

.image-gallery {
  margin: 2rem 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 1rem;

  .image-container {
    flex-basis: 12rem;

    img {
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }
    }
  }
}
</style>