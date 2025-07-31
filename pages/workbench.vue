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

  <div class="page image-listing-page" v-if="true">
    <section class="cms-page">
      <h1 class="text-center page-header">workbench</h1>
      <div>
        List 1: {{ counter.list1 }}
      </div>
      <div>
        List 2: {{ counter.list2 }}
      </div>
      <TestComponent store="counter"/>

      <div class="dev-outs" v-if="false">
        counter: <br>
        {{ counter }}
      </div>
      <!-- <DEVDisplayUseStore /> -->
    </section>
  </div>
</template>

<style scoped lang='scss'>
.workbench {

}

</style>

