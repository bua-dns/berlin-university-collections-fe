<script setup>


const props = defineProps({
  terms: {
    type: Array,
    required: true,
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  filterKey: {
    type: String,
    default: 'slug',
  },
  placeholder: {
    type: String,
    default: 'Suchbegriff',
  }
})

const inputThreshold = 2
const searchTerm = ref("")
const selectedTerms = ref([])
const selectedTerm = ref(null)
const mineralStore = useMineralStore()

const focused = ref(false)

const suggestions = computed(() => {
  if (!searchTerm || searchTerm.value.length < inputThreshold) return props.terms
  return props.terms.filter(term =>
    term[props.filterKey]?.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})


function toggleSelectedSuggestion(suggestion) {
  mineralStore.setMineral(suggestion.slug) 
  searchTerm.value = ""
}

</script>


<template>
  <div class="search-box">
    <input
      type="text"
      v-model="searchTerm"
      :placeholder="placeholder"
    />
    
    <!-- Suggestions -->
    <div class="suggestions" v-if="searchTerm && searchTerm.length >= inputThreshold">
      <pre v-if="false">suggestions {{ suggestions }}</pre>
      <template v-if="!suggestions.length">
        Keine passenden Einträge gefunden
      </template>
      <template v-else>
        <div
          class="suggestion clickable"
          v-for="(entry, entryIndex) in suggestions"
          :key="`suggestion-${entryIndex}`"
        >
          <div class="suggestion-list-item">
            <div
              class="label"
              @mousedown.prevent="toggleSelectedSuggestion(entry)"
            >
              {{ entry.label }}
            </div>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>


<style scoped lang="scss">
.search-box {
  position: relative;
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
  overflow: visible;

  input[type="text"] {
    flex: 1;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    &:focus {
      border-color: #999;
    }
  }

  .suggestions {
  position: absolute;
  left: 0rem;
  top: 2rem;
  margin-top: 0.5rem;
  width: 24rem; // or adjust accordingly
  max-height: 40vh;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 9999;

    .suggestion {
      padding: 0.5rem;
      border-bottom: 1px solid #efefef;

      &:last-child {
        border-bottom: none;
      }

      .suggestion-list-item {
        display: flex;
        align-items: center;
        cursor: pointer;

        .label {
          font-size: 1rem;
          color: #333;
          transition: color 0.2s ease-in-out;

          &:hover {
            color: #007bff;
          }
        }
      }
    }
  }

  .selected-terms {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .term-tag {
      display: flex;
      align-items: center;
      background-color: #eef2f7;
      color: #333;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

      .remove {
        margin-left: 0.5rem;
        cursor: pointer;
        font-weight: bold;
        color: #888;
        transition: color 0.2s ease;

        &:hover {
          color: #e00;
        }
      }
    }
  }
}
</style>

