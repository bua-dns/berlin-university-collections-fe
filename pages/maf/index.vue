<script setup>
const { data: items, pending, error } = await useFetch('/api/maf');

const getTitle = (item) => {
  return item.label || item.device || item.search?.title || 'Untitled';
};

const getDescription = (item) => {
  const parts = [];
  if (item.manufacturer) parts.push(item.manufacturer);
  if (item.production_year_display) parts.push(item.production_year_display);
  if (item.country) parts.push(item.country);
  return parts.join(', ') || item.remarks || '';
};


</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">MAF Collection</h1>
    
    <div v-if="items && items.meta" class="bg-gray-100 p-4 rounded-lg mb-6 shadow-sm border border-gray-200">
      <h2 class="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
        <span class="i-heroicons-chart-bar-square w-5 h-5"></span>
        Request Metadata
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="bg-white p-3 rounded border border-gray-200">
          <span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Items Fetched</span>
          <div class="flex items-baseline">
            <span class="font-mono font-bold text-xl text-blue-600">{{ items.meta.itemsFetched }}</span>
            <span class="text-gray-400 text-xs ml-2">of {{ items.meta.expectedTotal }}</span>
          </div>
        </div>
        <div class="bg-white p-3 rounded border border-gray-200">
          <span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Total Pages</span>
          <span class="font-mono font-bold text-xl text-gray-800">{{ items.meta.totalPages }}</span>
        </div>
        <div class="bg-white p-3 rounded border border-gray-200">
          <span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Duration</span>
          <div class="flex items-baseline">
            <span class="font-mono font-bold text-xl text-gray-800">{{ items.meta.fetchDurationSeconds }}s</span>
            <span class="text-gray-400 text-xs ml-2">({{ items.meta.fetchDurationMs }}ms)</span>
          </div>
        </div>
        <div class="bg-white p-3 rounded border border-gray-200">
          <span class="block text-gray-500 text-xs uppercase tracking-wider mb-1">Fetched At</span>
          <div class="font-mono text-sm font-medium text-gray-800">{{ new Date(items.meta.fetchedAt).toLocaleTimeString() }}</div>
          <div class="text-gray-400 text-xs">{{ new Date(items.meta.fetchedAt).toLocaleDateString() }}</div>
        </div>
      </div>
      <div v-if="items.meta.itemsMissing > 0" class="mt-3 bg-red-50 text-red-700 p-2 rounded border border-red-200 text-sm flex items-center gap-2">
        <span class="font-bold">Warning:</span> {{ items.meta.itemsMissing }} items missing from expected total.
      </div>
    </div>

    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error loading items: {{ error.message }}</div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="item in items.data" :key="item.id" class="border rounded p-4 shadow hover:shadow-lg transition">
        <NuxtLink :to="item.search?.slug || `/items/maf-${item.id}`">
          <div class="mb-2">
            <MafImageDisplay :images="item.online_images" :alt="getTitle(item)" />
          </div>
          
          <h2 class="text-xl font-semibold mb-2">{{ getTitle(item) }}</h2>
          <p class="text-sm text-gray-600 truncate">{{ getDescription(item) || 'No description' }}</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles here if Tailwind is not fully set up or if specific overrides are needed */
</style>
