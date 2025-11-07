<script setup>
const theme = useState("theme");
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);

const slug = 'wissen';

const { data } = await useFetchPage(slug);
const page = data.value.data[0];

const { data: topics } = await useFetch(`${projectConfig.dataBaseUrl}/km_topics`, {
  query: {
    fields: projectConfig.fields.km_topics.join(','),
    limit: -1,
    sort: 'sort',
    meta: 'total_count',
  },
});
</script>

<template>
  <Head>
    <Title>{{ w.page_wissen }}</Title>
  </Head>
  <div class="page p_dns-page" v-if="data">
    <h1 class="page-header text-center" v-html="useGetTranslatedContent('title', locale, page)" />
    <div class="page-container">
      <div class="page-content">
        <div v-html="useGetTranslatedContent('page_content', locale, page)" />
      </div>
      <template v-if="useGetTranslatedContent('sidebar_content', locale, page)">
        <div class="sidebar">
          <div v-if="page.sidebar_header_image" class="mb-2 sidebar-header">
            <img :src="projectConfig.imageBaseUrl + '/' + page.sidebar_header_image + '?key=sidebar-header'"
              alt="sidebar image" />
          </div>
          <div v-html="useGetTranslatedContent('sidebar_content', locale, page)" class="sidebar-content" />
        </div>
      </template>
    </div>
    <div class="topics" v-if="topics.data.length">
      <h2 class="text-center my-4">{{ w.page_wissen_topics }}</h2>
      <div class="topics-list">
        <div class="topic" v-for="topic in topics.data" :key="topic.id">
          <h3 class="mb-2">{{ useGetTranslatedContent('title', locale, topic) }}</h3>
          <div class="teaser" v-html="useGetTranslatedContent('teaser', locale, topic)"></div>
          <div class="btn-container text-center">
            <NuxtLinkLocale :to="`/wissen/${topic.slug}`" class="btn btn-primary">{{ w.read_more }}</NuxtLinkLocale>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang='scss'>
.p_dns-page {
  .page-container {
    display: block;
    .page-content {
      h2,
      h3,
      h4 {
        margin: 0 0 1rem;
      }
    }
    .sidebar {
      font-size: var(--font-size-text-small);
      .sidebar-header {
        img {
          margin: 0 auto;
        }
      }
    }
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
        flex: 1;
        .sidebar-header {
          display: block;
        }
      }
    }
  }
}

.topic {
  border: 1px solid var(--bs-border-color-translucent);
  border-radius: var(--bs-border-radius);
  padding: 1rem;
  margin: 0 0 1rem 0;
}

@media screen and (min-width: 768px) {
  .topics-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(363px, 1fr));
    gap: 1rem;
  }
  .topic {
    margin: 0;
  }
}
</style>
