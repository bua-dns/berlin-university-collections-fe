<script setup>
const route = useRoute();
const { locale } = useI18n();
const theme = useState('theme');
const w = theme.value.data.wording[locale.value];
const serviceSlug = route.params.slug;

const services = useState('services');
const service = services.value.data.find((service) => service.slug === serviceSlug);

const projectsData = useState('projects');
const projects = projectsData.value.data
const relatedProjects = computed(() => {
  // return "test"
  const poolOfProjects = [];
  const serviceId = service.id.toString();
  for (let project of projects) {
    if (!project.related_services || project.related_services.length === 0) continue;
      console.log("project.related_services: ", JSON.stringify(project.related_services));
    const relatedServiceIds = project.related_services.map((s) => s.services_id.toString());
    if (relatedServiceIds.includes(serviceId)) {
      poolOfProjects.push(project);
    }
   } 
  return poolOfProjects;
});


</script>

<template>
  <div class="page services" :class="{ 'with-sidebar': service.display_sidebar === '1' }">

    <Head>
      <Title>{{ w.page_services }}</Title>
    </Head>
    <h1 class="page-header text-center">{{ useGetTranslatedContent('title', locale, service) }}</h1>
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
    <section v-if="relatedProjects.length > 0" class="related-projects">
      <h2 class="text-center mb-4 mt-5 py-3">{{ w.projects_for_this_service}}</h2>
      <div v-if="true" class="projects-listing page-card-grid mx-5">
        <div class="project-display" v-for="(project, idx) in relatedProjects" :key="`page-card-${idx}`">
          <Card :cardImage="project.preview_image?.filename_disk"
            :cardTitle="useGetTranslatedContent('title', locale, project)"
            :cardText="useGetTranslatedContent('sub_line', locale, project)"
            :cardMoreButtonLabel="w.more_about_this_project" :cardMoreButtonLink="`/projects/${project.slug}`"
            :cardBodyMinHeight="'13rem'" />
        </div>
      </div>
    </section>
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
    .page-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--feature-card-width), 1fr));
    gap: 1.5rem;
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