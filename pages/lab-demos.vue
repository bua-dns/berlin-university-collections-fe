<script setup>
/* Used auto-imported composables: projectConfig */
const theme = useState("theme")
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);

const slug = 'lab-demos'
const titleWording = 'page_dns'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]
</script>

<template>

  <Head>
    <Title>{{ w.page_dns }}</Title>
  </Head>
  <div class="page p_dns-page" v-if="data">
    <h1 class="page-header text-center" v-html="useGetTranslatedContent('title', locale, page)" />
    <template v-if="!page.display_sidebar">
      <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
    </template>
    <template v-if="useGetTranslatedContent('sidebar_content', locale, page)">
      <div class="page-container">
        <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
        <div class="sidebar">
          <div class="mb-5 sidebar-header" v-if="page.sidebar_header_image">
            <img :src="projectConfig.imageBaseUrl + '/' + page.sidebar_header_image + '?key=sidebar-header'"
              alt="sidebar image" />
          </div>
          <div class="sidebar-content" v-if="page.sidebar_content" v-html="useGetTranslatedContent('sidebar_content', locale, page)" />
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
      h2, h3, h4 {
      margin: 0 0 1rem;
    }
    }
    .sidebar {
      font-size: var(--font-size-text-small);
      .sidebar-header {
        display: none;
        img {
        }
      }
    }
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
          flex: 1;
          .sidebar-header {
            display: block;
          }
        }
      }
  }
  
}

</style>
