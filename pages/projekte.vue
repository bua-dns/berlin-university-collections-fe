<script setup>
/* Used auto-imported composables: projectConfig */
const theme = useState("theme")
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);


// config for specific page

// DEV: replace by slug from path
const slug = 'projekte'
// const titleWording = 'page_projekte'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]

const projectsData = useState('projects');
const projects = projectsData.value.data
  .filter(project => project.show_on_projects_page === 'true');

const categorizedProjects = computed(() => {
  let statuses = {
    'planned': [],
    'completed': [],
    'running': []
  };
  if (!projects || projects.length === 0) {
    return statuses;
  }
  projects.forEach(project => {
    if (project.progress_status === 'planned') {
      statuses.planned.push(project);
    } else if (project.progress_status === 'completed') {
      statuses.completed.push(project);
    } else if (project.progress_status === 'running') {
      statuses.running.push(project);
    }
  });
  return statuses;
});

</script>

<template>

  <Head>
    <Title>{{ w.page_projekte }}</Title>
  </Head>
  <div class="page p_dns-page" v-if="data && page.status === 'published'">
    <h1 class="text-center page-header">{{ useGetTranslatedContent('title', locale, page) }}</h1>
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
    <template v-if="categorizedProjects.running.length > 0">
      <h2 class="text-center mb-4 mt-5 py-3">{{ w.projects_running }}</h2>
      <div v-if="true" class="projects-listing page-card-grid mx-5">
        <div class="project-display" v-for="(project, idx) in categorizedProjects.running" :key="`page-card-${idx}`">
          <Card :cardImage="project.preview_image?.filename_disk"
            :cardTitle="useGetTranslatedContent('title', locale, project)"
            :cardText="useGetTranslatedContent('sub_line', locale, project)"
            :cardMoreButtonLabel="w.more_about_this_project" :cardMoreButtonLink="`/projects/${project.slug}`"
            :cardBodyMinHeight="'13rem'" />
        </div>
      </div>
    </template>
    <template v-if="categorizedProjects.planned.length > 0">
      <h2 class="text-center mb-4 mt-5 py-3">{{ w.projects_planned }}</h2>
      <div v-if="true" class="projects-listing page-card-grid mx-5">
        <div class="project-display" v-for="(project, idx) in categorizedProjects.planned" :key="`page-card-${idx}`">
          <Card :cardImage="project.preview_image?.filename_disk"
            :cardTitle="useGetTranslatedContent('title', locale, project)"
            :cardText="useGetTranslatedContent('sub_line', locale, project)"
            :cardMoreButtonLabel="w.more_about_this_project" :cardMoreButtonLink="`/projects/${project.slug}`"
            :cardBodyMinHeight="'13rem'" />
        </div>
      </div>
    </template>
    <template v-if="categorizedProjects.completed.length > 0">
      <h2 class="text-center mb-4 mt-5 py-3">{{ w.projects_completed }}</h2>
      <div v-if="true" class="projects-listing page-card-grid mx-5">
        <div class="project-display" v-for="(project, idx) in categorizedProjects.completed" :key="`page-card-${idx}`">
          <Card :cardImage="project.preview_image?.filename_disk"
            :cardTitle="useGetTranslatedContent('title', locale, project)"
            :cardText="useGetTranslatedContent('sub_line', locale, project)"
            :cardMoreButtonLabel="w.more_about_this_project" :cardMoreButtonLink="`/projects/${project.slug}`"
            :cardBodyMinHeight="'13rem'" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang='scss'>

.p_dns-page {
  .page-container {
    display: block;

    .page-content {
    }
    .sidebar {
      .sidebar-header {
        display: none;
        img {

        }
      }
    }
  }
  .page-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--feature-card-width), 1fr));
    gap: 1.5rem;
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
