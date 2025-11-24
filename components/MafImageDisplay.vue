<script setup>
const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  alt: {
    type: String,
    default: ''
  },
  cover: {
    type: Boolean,
    default: false
  },
  hideMissing: {
    type: Boolean,
    default: false
  }
})

const getImageUrl = (img) => {
  const uri = img.uri || img.url;
  if (!uri) return '';
  if (uri.startsWith('http')) {
    return uri;
  }
  return `https://files.berlin-university-collections.de/maf-images/${uri}`;
}
</script>

<template>
  <div class="maf-image-display" v-if="images && images.length > 0">
    <div v-if="cover" class="cover-container">
      <img :src="getImageUrl(images[0])" :alt="alt"
        class="cover-image" loading="lazy" />
    </div>
    <div v-else class="grid-container">
      <div v-for="(img, index) in images" :key="index" class="grid-item">
        <img :src="getImageUrl(img)" :alt="`${alt} - ${index + 1}`"
          class="grid-image"
          loading="lazy" />
      </div>
    </div>
  </div>
  <div v-else-if="!hideMissing" class="placeholder">
    No Image
  </div>
</template>

<style lang="scss" scoped>
.maf-image-display {
  width: 100%;
}

.cover-container {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;

  .cover-image {
    object-fit: contain;
    width: 100%;
    height: 100%;
    transition: transform 300ms;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem;
}

.grid-item {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background-color: #f3f4f6;

  .grid-image {
    object-fit: contain;
    width: 100%;
    height: 100%;
    margin: auto;
    padding: 0.25rem;
    background-color: #111827;
    transition: transform 300ms;
    display: block;
  }
}

.placeholder {
  height: 12rem;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}
</style>
