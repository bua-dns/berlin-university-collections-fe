<script setup>
/* Used auto-imported composables: projectConfig */
const theme = useState("theme")
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);

const slug = 'kontakt'
const titleWording = 'page_contact'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]
</script>

<template>
  <Head>
    <Title>{{ w.page_contact }}</Title>
  </Head>
  <div class="page" v-if="data">
    <h1 class="text-center page-header">{{ w[titleWording] }}</h1>
    <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)"/>
  </div>
</template>
