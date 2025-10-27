<script setup>
const route = useRoute();
const { locale } = useI18n();
const theme = useState('theme');
const w = theme.value.data.wording[locale.value];

const slug = route.params['item']
</script>
<template>
  <div class="page university-collection-item">

    <Head>
      <Title></Title>
    </Head>
    <h2 class="mb-4 text-center">{{ slug }}</h2>

</div>
  </template>
<style lang="scss">
.page.university-collection-item {
  .backlink {
    text-align: center;
    margin: 1.5rem auto;
  }
  
}
</style>