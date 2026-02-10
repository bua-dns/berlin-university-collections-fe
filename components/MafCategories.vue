<script setup>
const isDev = import.meta.dev

// Categories
const { data, pending, error } = await useFetch("/api/maf/categories")
const categories = computed(() => (data.value?.data || []).slice())

const displayName = (c) => c?.term_de || c?.label || ""
const sorted = computed(() =>
  categories.value
    .filter((c) => c?.documentId)
    .sort((a, b) => displayName(a).localeCompare(displayName(b), "de")),
)

// Category cloud sizing (simple heuristic)
const sizeClass = (label = "") => {
  const n = label.length
  if (n <= 14) return "tag--lg"
  if (n <= 22) return "tag--md"
  return "tag--sm"
}

// Items state
const selectedCategory = ref(null)
const items = ref([])
const itemsPending = ref(false)
const itemsError = ref(null)

// Optional: keep last raw response for DEV inspection
const lastResponse = ref(null)

const titleOf = (it) => it?.device || it?.label || it?.documentId || `Item ${it?.id ?? ""}`
const yearOf = (it) => it?.production_year_display || ""
const makerOf = (it) => it?.manufacturer || ""
const modelOf = (it) => it?.model || ""
const countryOf = (it) => it?.country || ""

const imageUrlOf = (img) => {
  if (!img) return ""
  const uri = img.uri || img.url
  if (!uri) return ""
  if (uri.startsWith("http")) return uri
  return `https://files.berlin-university-collections.de/maf-images/${uri}`
}

const coverImageOf = (it) => (Array.isArray(it?.online_images) && it.online_images.length ? it.online_images[0] : null)
const hasImage = (it) => !!coverImageOf(it)
const extraImageCountOf = (it) => {
  const n = Array.isArray(it?.online_images) ? it.online_images.length : 0
  return Math.max(0, n - 1)
}

// Sort: items with images first, then by title
const sortedItems = computed(() => {
  const arr = Array.isArray(items.value) ? items.value.slice() : []
  arr.sort((a, b) => {
    const ai = hasImage(a) ? 0 : 1
    const bi = hasImage(b) ? 0 : 1
    if (ai !== bi) return ai - bi
    return titleOf(a).localeCompare(titleOf(b), "de")
  })
  return arr
})

const loadItemsForCategory = async (cat) => {
  selectedCategory.value = cat
  items.value = []
  itemsError.value = null
  itemsPending.value = true
  lastResponse.value = null

  try {
    const url = `/api/maf/categories/${encodeURIComponent(cat.documentId)}/items`
    const resp = await $fetch(url)

    lastResponse.value = resp
    items.value = resp?.data || []

    if (isDev) {
      console.debug("[DEV] category items fetched:", {
        category: cat,
        endpoint: url,
        count: items.value.length,
        first: items.value[0] ?? null,
      })
    }
  } catch (e) {
    itemsError.value = e
    if (isDev) console.error("[DEV] failed to fetch category items:", e)
  } finally {
    itemsPending.value = false
  }
}

const clearSelection = () => {
  selectedCategory.value = null
  items.value = []
  itemsError.value = null
  itemsPending.value = false
  lastResponse.value = null
}
</script>

<template>
  <section class="maf-categories">
    <h2 class="title">Kategorien</h2>

    <div v-if="pending" class="state">Loading categories…</div>
    <div v-else-if="error" class="state state--error">Failed to load categories.</div>

    <div v-else class="cloud" aria-label="Category cloud">
      <button
        v-for="cat in sorted"
        :key="cat.documentId"
        type="button"
        class="tag"
        :class="sizeClass(cat.label)"
        :title="cat.label"
        @click="loadItemsForCategory(cat)"
      >
        {{ cat.term_de || cat.label }}
      </button>
    </div>

    <!-- Listing (inline, no navigation) -->
    <section v-if="selectedCategory" class="listing">
      <header class="listing-header">
        <div class="listing-title">
          Items: <span class="listing-cat">{{ selectedCategory.term_de || selectedCategory.label }}</span>
        </div>

        <div class="listing-actions">
          <span v-if="itemsPending" class="pill">Loading…</span>
          <span v-else class="pill">{{ sortedItems.length }} items</span>
          <button type="button" class="btn" @click="clearSelection">Close</button>
        </div>
      </header>

      <div v-if="itemsError" class="state state--error">
        Failed to load items for this category.
      </div>

      <div v-else-if="!itemsPending && !sortedItems.length" class="state">
        No items found.
      </div>

      <div v-else class="grid" aria-label="Items list">
        <article v-for="it in sortedItems" :key="it.documentId || it.id" class="card">
          <div class="media">
            <div v-if="coverImageOf(it)" class="media-frame">
              <!-- If MafImageDisplay exists, use it; otherwise swap to <img> below -->
              <MafImageDisplay :images="[coverImageOf(it)]" :alt="titleOf(it)" cover />
            </div>

            <div v-else class="media-placeholder">No image</div>

            <div v-if="extraImageCountOf(it) > 0" class="media-badge">
              +{{ extraImageCountOf(it) }}
            </div>
          </div>

          <div class="body">
            <div class="item-title" :title="titleOf(it)">{{ titleOf(it) }}</div>

            <div class="meta">
              <div v-if="makerOf(it)"><span class="k">Hersteller:</span> <span class="v">{{ makerOf(it) }}</span></div>
              <div v-if="modelOf(it)"><span class="k">Modell:</span> <span class="v">{{ modelOf(it) }}</span></div>
              <div class="meta-row">
                <span v-if="yearOf(it)"><span class="k">Datierung:</span> <span class="v">{{ yearOf(it) }}</span></span>
                <span v-if="countryOf(it)" class="meta-sep">•</span>
                <span v-if="countryOf(it)"><span class="k">Land:</span> <span class="v">{{ countryOf(it) }}</span></span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Optional dev inspection (collapsed) -->
      <details v-if="isDev && lastResponse" class="dev-details">
        <summary>DEV: Raw response</summary>
        <pre class="dev-pre">{{ lastResponse }}</pre>
      </details>
    </section>
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
  font-weight: 650;
}

.cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem 0.6rem;
}

/* tags */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.6rem;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 6px;
  line-height: 1.1;
  background: rgba(0,0,0,0.02);
  color: inherit;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
  transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
}
.tag:hover {
  transform: translateY(-1px);
  border-color: rgba(0,0,0,0.35);
  background: rgba(0,0,0,0.05);
}
.tag--lg { font-size: 1.05rem; font-weight: 600; }
.tag--md { font-size: 0.98rem; font-weight: 520; }
.tag--sm { font-size: 0.9rem;  font-weight: 480; opacity: 0.95; }

/* listing container */
.listing {
  margin: 1.2rem auto 0;
  max-width: 1200px;
  text-align: left;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 10px;
  background: rgba(0,0,0,0.015);
}

.listing-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  margin-bottom: 0.75rem;
}

.listing-title {
  font-weight: 700;
  font-size: 1rem;
}
.listing-cat {
  font-weight: 700;
}

.listing-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.pill {
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 999px;
  background: rgba(0,0,0,0.02);
  white-space: nowrap;
}

.btn {
  font-size: 0.85rem;
  padding: 0.25rem 0.55rem;
  border: 1px solid rgba(0,0,0,0.18);
  border-radius: 7px;
  background: rgba(255,255,255,0.6);
  cursor: pointer;
}
.btn:hover {
  background: rgba(0,0,0,0.04);
}

/* grid */
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}
@media (max-width: 1050px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .grid { grid-template-columns: 1fr; }
}

.card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.7rem;
  padding: 0.65rem;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 10px;
  background: rgba(255,255,255,0.55);
}
.media {
  position: relative;
}
.media-frame {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.12);
  background: rgba(0,0,0,0.03);
  min-height: 90px;
}
.media-placeholder {
  display: grid;
  place-items: center;
  min-height: 90px;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
  background: rgba(0,0,0,0.03);
  color: rgba(0,0,0,0.6);
  font-size: 0.85rem;
}
.media-badge {
  position: absolute;
  right: 6px;
  bottom: 6px;
  font-size: 0.78rem;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.18);
  background: rgba(255,255,255,0.85);
}

/* text */
.body {
  display: grid;
  align-content: start;
  gap: 0.35rem;
}
.item-title {
  font-weight: 700;
  font-size: 0.92rem;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  font-size: 0.85rem;
  line-height: 1.35;
  opacity: 0.92;
}
.k {
  font-weight: 650;
  opacity: 0.75;
}
.v {
  white-space: pre-line;
}
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.meta-sep {
  opacity: 0.5;
}

/* state */
.state {
  opacity: 0.85;
  padding: 0.25rem 0;
}
.state--error {
  color: #b00020;
}

/* dev */
.dev-details {
  margin-top: 0.75rem;
}
.dev-details summary {
  cursor: pointer;
  opacity: 0.8;
  font-size: 0.9rem;
}
.dev-pre {
  margin: 0.5rem 0 0;
  padding: 0.6rem;
  border-radius: 8px;
  background: rgba(0,0,0,0.03);
  overflow: auto;
  font-size: 12px;
  line-height: 1.35;
  max-height: 420px;
}
</style>
