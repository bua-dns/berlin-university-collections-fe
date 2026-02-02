<script setup>
const { data, pending, error } = await useFetch('/api/maf/categories')

const categories = computed(() => (data.value?.data || []).slice())

// Optional: stable sorting by displayed label
const displayName = (c) => c?.term_de || c?.label || ''
const sorted = computed(() =>
  categories.value
    .filter(c => c?.label)
    .sort((a, b) => displayName(a).localeCompare(displayName(b), 'de'))
)

// Small heuristic: vary size by label length (since we don’t have counts yet)
const sizeClass = (label = '') => {
  const n = label.length
  if (n <= 12) return 'tag--xl'
  if (n <= 18) return 'tag--lg'
  if (n <= 26) return 'tag--md'
  return 'tag--sm'
}
</script>

<template>
  <section class="maf-categories">
    <h2 class="title">Kategorien</h2>

    <div v-if="pending" class="state">Loading categories…</div>
    <div v-else-if="error" class="state state--error">Failed to load categories.</div>

    <div v-else class="cloud" aria-label="Category cloud">
      <NuxtLink
        v-for="cat in sorted"
        :key="cat.documentId"
        class="tag"
        :class="sizeClass(cat.label)"
        :to="`/maf-hu/category/${encodeURIComponent(cat.label)}`"
        :title="cat.label"
      >
        {{ cat.term_de || cat.label }}
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.maf-categories {
  margin: 2rem 0;
  text-align: center;
}

.title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;   /* 👈 center the cloud */
  gap: 0.5rem 0.6rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.6rem;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 4px;        /* 👈 less rounded */
  text-decoration: none;
  line-height: 1.1;
  transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
  background: rgba(0,0,0,0.02);
  color: inherit;
}

.tag:hover {
  transform: translateY(-1px);
  border-color: rgba(0,0,0,0.35);
  background: rgba(0,0,0,0.05);
}

/* cloud sizing */
.tag--xl { font-size: 1.15rem; font-weight: 600; }
.tag--lg { font-size: 1.05rem; font-weight: 560; }
.tag--md { font-size: 0.98rem; font-weight: 520; }
.tag--sm { font-size: 0.9rem;  font-weight: 480; opacity: 0.95; }

</style>
