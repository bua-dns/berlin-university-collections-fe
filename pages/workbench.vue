<script setup>
const { locale } = useI18n();
const theme = useState('theme');
const w = computed(() => theme.value.data.wording[locale.value]);

const mineralsData = useState('minerals');
const mstubItemsData = useState('mstubItems');


const minerals = mineralsData.value.data || [];
const mstubItems = mstubItemsData.value.data || [];
const sample = mstubItems
  .filter(item => item.representations && item.representations.length > 0)
  .slice(0, 50) || [];

</script>

<template>
  <Head>
    <Title>Workbench</Title>
  </Head>
  <div class="page full-width" v-if="true">
    <h1 class="text-center">Workbench</h1>
    <div class="page-content" >
      <CardCollectionItems>
        <template #image>
          <img src="@/assets\img\image-placeholder.svg" alt="Sample Image">
        </template>
        <template #title>Sample Title</template>
        <template #meta>Sample Meta Information</template>
        <template #footer>Sample Footer Content</template>
      </CardCollectionItems>  
        <template #image>
          <img src="https://picsum.photos/200/300" alt="Sample Image">
        </template>
        <template #title>Sample Title</template>
        <template #meta>Sample Meta Information</template>
        <template #footer>Sample Footer Content</template>
    </div>
    <div class="dev-output">
      <h3>Development Output</h3>
      <pre v-if="true">{{ minerals.length }}</pre>
      <pre v-if="true">{{ mstubItems.length }}</pre>
      <pre v-if="true">{{ sample }}</pre>
    </div>
  </div>
</template>

<style scoped lang='scss'>
.workbench {

}

</style>

