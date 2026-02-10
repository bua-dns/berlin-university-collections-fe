<script setup>
const isDev = import.meta.dev

// existing: load categories from your internal endpoint
const { data, pending, error } = await useFetch("/api/maf/categories")

const categories = computed(() => (data.value?.data || []).slice())

// stable sorting by displayed label
const displayName = (c) => c?.term_de || c?.label || ""
const sorted = computed(() =>
  categories.value
    .filter((c) => c?.label)
    .sort((a, b) => displayName(a).localeCompare(displayName(b), "de")),
)

// heuristic sizing for the “cloud”
const sizeClass = (label = "") => {
  const n = label.length
  if (n <= 12) return "tag--xl"
  if (n <= 18) return "tag--lg"
  if (n <= 26) return "tag--md"
  return "tag--sm"
}

// DEV output state (category -> items)
const selectedCategory = ref(null)
const itemsResp = ref(null)
const itemsPending = ref(false)
const itemsError = ref(null)

const onCategoryClick = async (cat) => {
  // Smoke test requirement: NO navigation, just fetch + output.
  // Keep panel DEV-only to avoid production UI noise.
  if (!isDev) return

  selectedCategory.value = cat
  itemsResp.value = null
  itemsError.value = null
  itemsPending.value = true

  try {
    const url = `/api/maf/categories/${encodeURIComponent(cat.documentId)}/items`
    const resp = await $fetch(url)
    itemsResp.value = resp

    console.debug("[DEV] category items fetched:", {
      category: cat,
      endpoint: url,
      count: resp?.data?.length ?? 0,
      first: resp?.data?.[0] ?? null,
    })
  } catch (e) {
    itemsError.value = e
    console.error("[DEV] failed to fetch category items:", e)
  } finally {
    itemsPending.value = false
  }
}
</script>

<template>
  <section class="maf-categories">
    <h2 class="title">Kategorien</h2>

    <div v-if="pending" class="state">Loading categories…</div>
    <div v-else-if="error" class="state state--error">Failed to load categories.</div>

    <div v-else class="cloud" aria-label="Category cloud">
      <!-- DEV smoke test: button instead of NuxtLink (no navigation) -->
      <button
        v-for="cat in sorted"
        :key="cat.documentId"
        type="button"
        class="tag"
        :class="sizeClass(cat.label)"
        :title="cat.label"
        @click="onCategoryClick(cat)"
      >
        {{ cat.term_de || cat.label }}
      </button>
    </div>

    <!-- DEV OUTPUT PANEL -->
    <div v-if="isDev" class="dev-panel">
      <h3 class="dev-title">DEV: Category items</h3>

      <div v-if="!selectedCategory" class="dev-hint">
        Click a category to fetch its items (no navigation).
      </div>

      <div v-else class="dev-meta">
        <div><b>Category:</b> {{ selectedCategory.term_de || selectedCategory.label }}</div>
        <div><b>documentId:</b> {{ selectedCategory.documentId }}</div>

        <div v-if="itemsPending">Loading items…</div>
        <div v-else-if="itemsError" class="state state--error">Failed to load items.</div>
        <div v-else-if="itemsResp"><b>Count:</b> {{ itemsResp?.data?.length ?? 0 }}</div>
      </div>

      <pre v-if="itemsResp" class="dev-pre">{{ itemsResp }}</pre>
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
  justify-content: center;
  gap: 0.5rem 0.6rem;
}

/* “tag” styling (shared by links/buttons) */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.6rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  text-decoration: none;
  line-height: 1.1;
  transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
  background: rgba(0, 0, 0, 0.02);
  color: inherit;
  cursor: pointer;
}

/* make button look like the old NuxtLink tag */
button.tag {
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
}

.tag:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 0, 0, 0.35);
  background: rgba(0, 0, 0, 0.05);
}

/* cloud sizing */
.tag--xl {
  font-size: 1.15rem;
  font-weight: 600;
}
.tag--lg {
  font-size: 1.05rem;
  font-weight: 560;
}
.tag--md {
  font-size: 0.98rem;
  font-weight: 520;
}
.tag--sm {
  font-size: 0.9rem;
  font-weight: 480;
  opacity: 0.95;
}

/* states */
.state {
  opacity: 0.85;
}
.state--error {
  color: #b00020;
}

/* dev panel */
.dev-panel {
  margin: 1.25rem auto 0;
  max-width: 1100px;
  text-align: left;
  padding: 0.75rem 0.9rem;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.02);
}

.dev-title {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  font-weight: 650;
}

.dev-hint {
  opacity: 0.8;
  font-size: 0.9rem;
}

.dev-meta {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.35;
}

.dev-pre {
  margin: 0;
  padding: 0.6rem;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.03);
  overflow: auto;
  font-size: 12px;
  line-height: 1.35;
  max-height: 420px;
}
</style>
