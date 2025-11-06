<script setup>
defineProps(['collection', 'display']);
defineEmits(['setActiveCollectionId']);
const theme = useState('theme');
const w = theme.value.data.wording.de;
</script>
<template>
  <div v-if="display === true" @click="$emit('setActiveCollectionId', collection.id)" class="card">
    <div class="card-keeper" :style="getUniMarkerColors(collection.current_keeper, 'border-bottom-color')"
      v-if="collection.current_keeper">
      <span class="dns_uni_marker" :style="getUniMarkerColors(collection.current_keeper, 'background-color')"></span>
      {{ collection.current_keeper }}
    </div>
    <div class="card-label" v-if="collection.label">
      <strong>{{ collection.label }}</strong>
    </div>
    <div class="card-sm-description" v-if="collection.description"
      v-html="truncateText(convertLineBreaks(collection.description), 240)" />
    <div class="card-sm-description" v-if="!collection.description">
      {{ w.no_collection_description }}
    </div>

  </div>
</template>
<style scoped lang="scss">
.card {
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #fff;
  opacity: 0.85;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
}

.card-keeper {
  border-bottom: 2px solid #333;
  font-size: 0.85rem;
}

.card-label {
  padding: 1rem 0;
}

.card-sm-description {
  font-size: 0.75rem;
  color: #000;
}

a {
  word-wrap: break-word;
}
</style>