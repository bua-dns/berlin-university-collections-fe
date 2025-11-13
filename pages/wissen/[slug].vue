<script setup>
// import TocTree from "~/components/TocTree.vue";

const route = useRoute();
const theme = useState("theme");
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);

import Prism from "prismjs";
Prism.manual = true;

import "prismjs/components/prism-json.js";
import "prismjs/components/prism-csv.js";
import "prismjs/themes/prism-tomorrow.css";

const { data: topic } = await useFetch(`${projectConfig.dataBaseUrl}/km_topics`, {
  query: {
    fields: projectConfig.fields.km_topic.join(','),
    limit: 1,
    filter: {
      slug: {
        _eq: route.params.slug
      }
    },
    meta: 'total_count',
  },
});
if (!topic.value?.data?.length) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

const content = ref("");
const toc = ref([]);

content.value = useMakeTitleIDs(useGetTranslatedContent('topic_text', locale.value, topic.value.data[0]), topic.value.data[0].toc_depth || 3);
toc.value = useGetToc(content.value, topic.value.data[0].toc_depth || 3);

onMounted(() => {
  Prism.highlightAll();
});
</script>
<template>

  <Head>
    <Title>{{ useGetTranslatedContent('title', locale, topic.data[0]) }}</Title>
  </Head>
  <div class="knowledge-page-container">
    <h1 class="text-center knowledge-page-header">{{ useGetTranslatedContent('title', locale, topic.data[0]) }}</h1>
    <div class="knowledge-topic" v-if="topic">
      <div class="page-toc">
        <div v-if="toc.length" class="toc-content">
          <h2>{{ w.toc }}</h2>
          <TocTree :nodes="toc" />
        </div>
      </div>
      <div class="page-content-container">
        <div class="page-content" v-html="content" />
      </div>
    </div>
  </div>
</template>
<style lang='scss'>
.knowledge-page-container {
  max-width: 118ch;
  margin: 0 auto;
}
.knowledge-page-header {
  margin: 0rem 0 2.5rem 0;
  padding: 1rem 2rem 0;
}
.knowledge-topic {
  background-color: var(--color-page-content-background);
  padding: var(--page-padding);
  .page-toc {
    margin-bottom: 1.5rem;
    h2 {
      line-height: 1.25;
      margin-bottom: 1rem;
      text-align: center;
    }
    .toc-content {
      padding: 1.25rem;
      border: 1px solid var(--color-border-subtle, #d0d5dd);
      border-radius: 0.75rem;
      background: var(--color-card-background, #f7f9fb);
      ul {
        list-style: none;
        margin: 0;
        padding-left: 0;
      }
      li {
        margin: 0;
      }
      li + li {
        margin-top: 0.35rem;
      }
      ul ul {
        margin-top: 0.3rem;
        padding-left: 1.25rem;
        border-left: 1px solid var(--color-border-subtle, #d0d5dd);
      }
      a {
        display: inline-block;
        padding: 0.25rem 0;
        color: var(--color-text, inherit);
        text-decoration: none;
        transition: color 0.2s ease;
      }
      a:hover,
      a:focus {
        color: var(--color-accent-primary, #325fab);
      }
      > ul > li > a {
        font-weight: 600;
      }
      ul ul > li > a {
        font-size: 0.95rem;
        font-weight: 400;
      }
    }
  }
  .page-content {
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 1rem;
      line-height: 1.5;
      strong {
        font-weight: 600;
      }
    }
    :not(pre)>code[class*="language-"],
    pre[class*="language-"] {
      background: #141a21;
      border-radius: 6px;
    }
  }
}
@media (min-width: 768px) {
  .knowledge-topic {
    display: grid;
    // grid-template-columns: 30ch 1fr;
    // golden ratio
    grid-template-columns: 1fr 1.618fr;
    column-gap: 3ch;
    align-items: flex-start;
    .page-toc {
      position: sticky;
      top: 88px;
      height: fit-content;
      margin-bottom: 0;
    }
    .page-content-container {
      min-width: 0;
    }
  }
}
@media (min-width: 1200px) {
  .knowledge-topic {
    // grid-template-columns: 40ch 1fr;
    column-gap: 4ch;
  }
}

</style>