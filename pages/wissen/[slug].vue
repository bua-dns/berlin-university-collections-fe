<script setup>
const route = useRoute();
const { locale } = useI18n();

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

onMounted(() => {
  Prism.highlightAll();
});
</script>
<template>
  <Head>
    <Title>{{ useGetTranslatedContent('title', locale, topic.data[0]) }}</Title>
  </Head>
  <div class="page knowledge-topic" v-if="topic">
    <h1 class="text-center page-header">{{ useGetTranslatedContent('title', locale, topic.data[0]) }}</h1>
    <div class="page-content" v-html="useGetTranslatedContent('topic_text', locale, topic.data[0])" />
  </div>
</template>
<style lang='scss'>
.knowledge-topic {
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
</style>