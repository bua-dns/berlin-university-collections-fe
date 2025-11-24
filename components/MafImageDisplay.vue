<script setup>
const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  alt: {
    type: String,
    default: ''
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
  <div v-if="images && images.length > 0" class="grid grid-cols-2 gap-1">
    <div v-for="(img, index) in images" :key="index" class="relative aspect-square overflow-hidden bg-gray-100">
      <img 
        :src="getImageUrl(img)" 
        :alt="`${alt} - ${index + 1}`" 
        class="object-cover w-full h-full hover:scale-110 transition-transform duration-300" 
        loading="lazy"
      />
    </div>
  </div>
  <div v-else class="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
    No Image
  </div>
</template>
