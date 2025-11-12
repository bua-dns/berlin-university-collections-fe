<script setup>
import { defineComponent, h } from "vue";

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

const TocTree = defineComponent({
  name: "TocTree",
  props: {
    nodes: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const handleClick = (event, id) => {
      event.preventDefault();
      event.stopPropagation();
      const target = document.getElementById(id);
      const main = document.getElementsByTagName("main")[0];
      if (target && main) {
        const headerOffset = main.classList.contains("scrolled") ? 88 : 152;
        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({ top: Math.max(offsetPosition, 0), behavior: "smooth" });
      }
      // if (history.replaceState) {
      //   history.replaceState(null, "", `#${id}`);
      // } else {
      //   window.location.hash = id;
      // }
    };

    const renderNodes = (nodes) =>
      nodes.length
        ? h(
            "ul",
            nodes.map((node) =>
              h(
                "li",
                { key: node.id },
                [
                  h(
                    "a",
                    {
                      href: `#${node.id}`,
                      innerHTML: node.title,
                      onClick: (event) => handleClick(event, node.id),
                    },
                  ),
                  node.children.length ? renderNodes(node.children) : null,
                ].filter(Boolean),
              ),
            ),
          )
        : null;

    return () => renderNodes(props.nodes);
  },
});

content.value = useMakeTitleIDs(useGetTranslatedContent('topic_text', locale, topic.value.data[0]), topic.value.data[0].toc_depth || 3);
toc.value = useGetToc(content.value, topic.value.data[0].toc_depth || 3);

onMounted(() => {
  Prism.highlightAll();
});
</script>
<template>

  <Head>
    <Title>{{ useGetTranslatedContent('title', locale, topic.data[0]) }}</Title>
  </Head>
  <div class="knowledge-topic" v-if="topic">
    <div class="page-toc">
      <h2>{{ w.toc }}</h2>
      <div v-if="toc.length" class="toc-content">
        <TocTree :nodes="toc" />
      </div>
    </div>
    <div class="page-content-container">
      <h1 class="text-center page-header">{{ useGetTranslatedContent('title', locale, topic.data[0]) }}</h1>
      <div class="page-content" v-html="content" />
    </div>
  </div>
</template>
<style lang='scss'>
.knowledge-topic {
  max-width: 106rem;
  background-color: var(--color-page-content-background);
  padding: var(--page-padding);
  margin: 0 auto;
  .page-toc {
    margin-bottom: 1.5rem;
    h2 {
      line-height: 1.25;
      margin-bottom: 1rem;
      text-align: center;
    }
    .toc-content {
      padding: 1rem;
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
        padding-left: 1rem;
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
    grid-template-columns: 20rem 1fr;
    column-gap: 2rem;
    align-items: flex-start;
    .page-toc {
      position: sticky;
      top: 88px;
      height: fit-content;
      margin-bottom: 0;
      max-width: 40rem;
      min-width: 20rem;
    }
    .page-content-container {
      min-width: 0;
    }
  }
}
@media (min-width: 1200px) {
  .knowledge-topic {
    grid-template-columns: 30rem 1fr;
  }
}

</style>