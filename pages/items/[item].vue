<script setup>
const route = useRoute();
const { locale } = useI18n();
const theme = useState('theme');
const w = theme.value.data.wording[locale.value];

const slug = route.params['item'];
</script>

<template>
  <div class="page university-collection-item">
    <Head>
      <Title>{{ slug }}</Title>
    </Head>

    <div class="text-center p-8">
      <h2 class="mb-4 text-center">{{ slug }}</h2>
      <p>Item not found or collection not supported.</p>
    </div>
  </div>
</template>

<style lang="scss">
.page.university-collection-item {
  padding: 2rem;
}
</style>