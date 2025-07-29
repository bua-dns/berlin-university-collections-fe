<script setup>
/* Used auto-imported composables: projectConfig */
const theme = useState("theme")
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);


const slug = 'impressum'
const titleWording = 'page_imprint'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]
// const pageContent = data.value.data[0].page_content
</script>

<template>
  <Head>
    <Title>{{ w.page_imprint }}</Title>
  </Head>
  <div class="page" v-if="data">
    <h1 class="text-center">{{ useGetTranslatedContent('title', locale, page) }}</h1>
    <!-- <div class="page-content" v-html="pageContent"/> -->
    <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)"/>
  </div>
</template>
