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

const emit = defineEmits(['validImageCount']);

const imageErrors = ref(new Set());

const getImageUrl = (img) => {
  const uri = img.uri || img.url;
  if (!uri) return '';
  if (uri.startsWith('http')) {
    return uri;
  }
  return `https://files.berlin-university-collections.de/maf-images/${uri}`;
}

const handleImageError = (index) => {
  imageErrors.value.add(index);
  updateValidCount();
}

const shouldShowImage = (index) => {
  return !imageErrors.value.has(index);
}

const updateValidCount = () => {
  const validCount = (props.images?.length || 0) - imageErrors.value.size;
  emit('validImageCount', validCount);
}
</script>

<template>
  <div class="maf-image-display" v-if="images && images.length > 0">
    <div v-if="cover && shouldShowImage(0)" class="cover-container">
      <img :src="getImageUrl(images[0])" 
        :alt="alt"
        class="cover-image" 
        loading="lazy"
        @error="handleImageError(0)" />
    </div>
    <div v-else class="grid-container">
      <div v-for="(img, index) in images" :key="index" class="grid-item" v-show="shouldShowImage(index)">
        <img :src="getImageUrl(img)" 
          :alt="`${alt} - ${index + 1}`"
          class="grid-image"
          loading="lazy"
          @error="handleImageError(index)" />
      </div>
    </div>
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
