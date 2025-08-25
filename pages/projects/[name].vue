<script setup>
const route = useRoute();
const { locale } = useI18n();
const theme = useState('theme');
const w = theme.value.data.wording[locale.value];
const projectName = route.params.name;

const projects = useState('projects');
const project = projects.value.data.find((project) => project.slug === projectName);

// extract image filenames from images property of project
const images = project.images.map((image) => {
  if (!image.directus_files_id) return null;
  return image.directus_files_id.filename_disk;
});
</script>
<template>
  <div class="page projects" :class="{'with-sidebar': project.display_sidebar === '1'}">
    <Head>
      <Title>{{ w.page_projekte }}</Title>
    </Head>
    <div class="output">
      <pre v-if="false">{{ project }}</pre>
    </div>
    <h1 class="page-header-with-subtitle text-center">{{ useGetTranslatedContent('title', locale, project) }}</h1>
    <h2 class="page-header-subtitle text-center">{{ useGetTranslatedContent('sub_line', locale, project) }}</h2>
    <div class="projects-content-container">
      <div class="main-content">
        <div class="description" v-html="useGetTranslatedContent('description', locale, project)"></div>
      </div>
      <div class="sidebar" v-if="project.display_sidebar">
        <div class="partners" v-if="project.cooperation_partners?.length">
          <h4>{{ w.cooperation_partners }}</h4>
          <ul>
            <li v-for="partner in project.cooperation_partners">
              <a :href="partner.institutions_id.website" target="_blank">
                <img v-if="partner.institutions_id.logo"
                :src="`${projectConfig.imageBaseUrl}/${partner.institutions_id.logo}?key=sidebar-logo`"
                :alt="`Logo ${partner.institutions_id.name_short}`" />
              </a>
            </li>
          </ul>
        </div>
        <div v-for="(logo, index) in project.logos_coop_partners" :key="`logo-${index}`" class="my-4">
          <img :src="`${projectConfig.imageBaseUrl}/${logo.directus_files_id}?key=sidebar-logo`" alt="Logo of Partner" />
        </div>
        <div class="sidebar-content" v-html="useGetTranslatedContent('sidebar_content', locale, project)"></div>
      </div>
    </div>
    <div class="images mt-4">
      <ImageViewer :images="images" previewMode="gallery" previewImageWidth="240"></ImageViewer>
    </div>
    <pre v-if="false">{{ project }}</pre>
  </div>
</template>
<style lang="scss">
.page.projects {
  .projects-content-container {
    display: block;
    h2, h3, h4 {
      margin: 0 0 1rem;
    }
  }
  .sidebar {
    display: none;
    font-size: var(--font-size-text-extra-small);
    h4, h5 {
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
    .projects-content-container {
      display: grid;
      grid-template-columns: 2.5fr 1fr;
      gap: 3rem;

      @media screen and (max-width: 768px){
        grid-template-columns: 1fr;
      }
    }
    .main-content {
    }
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

.description {

}

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