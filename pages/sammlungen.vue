<script setup>

// data fetch from directus
const { data } = await useFetch(`${projectConfig.dataBaseUrl}/bua_collections`, {
  query: {
    // fields: collectionsFetchFields.join(','),
    fields: projectConfig.fields.collections.join(','),
    limit: -1,
    sort: 'label',
    meta: 'total_count',
  },
});
const router = useRouter();
const route = useRoute();
const theme = useState('theme');
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);
const settings = theme.value.data.settings;

// add display property to collections
data.value.data.forEach((collection) => {
  collection.display = true;
  // general opt-out via directus field 'exclude_from_listing'
  if (collection.exclude_from_listing === '1' || collection.hide === 'true') {
    collection.display = false;
  }
});

// SORT         ----------------------------------------------------------------

// Sort and order for collections listing
// By now, the value ist fixed to "label" and can't be changed in UI.
const sortby = ref("label");
const order = ref("asc");

const sortedData = computed(() => {
  return data.value.data
    .sort((a, b) => {
      if (a[sortby.value] < b[sortby.value]) {
        return order.value == "asc" ? -1 : 1;
      }
      if (a[sortby.value] > b[sortby.value]) {
        return order.value == "asc" ? 1 : -1;
      }
      return 0;
    });
});

// FILTER      -----------------------------------------------------------------

// Toggle the filter control bar
const showFilters = ref(true);
function toggleFilters() {
  showFilters.value = !showFilters.value;
}

/**
 * collection[taxonomy] can be array or string, but the
 * data structure gets normalized for both cases.
 *
 * The structure of the terms object is always:
 * {
 *   "taxonomy1": [
 *     { label: "term1", count: 1 },
 *     ...
 *   ],
 *   ...
 * }
 */
const terms = ref({});
function setupTerms() {
  data.value.data.forEach((collection) => {
    settings.taxonomies.forEach((taxonomy) => {
      terms.value[taxonomy] = terms.value[taxonomy] || [];
      if (collection[taxonomy] && collection[taxonomy].length > 0) {
        if (!Array.isArray(collection[taxonomy])) {
          if (!terms.value[taxonomy].find((term) => term.label === collection[taxonomy])) {
            terms.value[taxonomy].push({ label: collection[taxonomy], count: 1 });
          } else {
            terms.value[taxonomy].find((term) => term.label === collection[taxonomy]).count++;
          }
        } else {
          collection[taxonomy].forEach((taxonomyTerm) => {
            if (!terms.value[taxonomy].find((term) => term.label === taxonomyTerm.taxonomy_terms_id.label)) {
              terms.value[taxonomy].push({ label: taxonomyTerm.taxonomy_terms_id.label, count: 1 });
            } else {
              terms.value[taxonomy].find((term) => term.label === taxonomyTerm.taxonomy_terms_id.label).count++;
            }
          });
        }
      }
    });
  });
  // Object.keys(terms.value).forEach((taxonomy) => {
  //   terms.value[taxonomy].sort((a, b) => a.label.localeCompare(b.label));
  // });
  const index = {
    "Freie Universität Berlin": 1,
    "Humboldt-Universität zu Berlin": 2,
    "Technische Universität Berlin": 3,
    "Charité – Universitätsmedizin Berlin": 4,
  };

  Object.keys(terms.value).forEach((taxonomy) => {
    terms.value[taxonomy]
    // make sur that the conventional order is kept
    .sort((a, b) => {
      const aIndex = index[a.label];
      const bIndex = index[b.label];

      if (aIndex !== undefined && bIndex !== undefined) {
        // Both labels are in the index; sort by index values
        return aIndex - bIndex;
      } else if (aIndex !== undefined) {
        // Only 'a' is in the index; it comes first
        return -1;
      } else if (bIndex !== undefined) {
        // Only 'b' is in the index; it comes first
        return 1;
      } else {
        // Neither are in the index; fall back to localeCompare
        return a.label.localeCompare(b.label);
      }
    });
  });
}
setupTerms();

/**
 * The 'termFilter' object stores current filter values for each taxonomy.
 * The filter values are added to the object in the setTermFilter function.
 *
 * Data structure:
 * {
 *   "taxonomy1": ["term1", "term2"],
 *   ...
 * }
 */
const termFilter = ref({});

// The setTermFilter function sets the termFilter for a given taxonomy
// and changes the display property of all collections accordingly.
function setTermFilter(taxonomy, term) {
  // toggle term (add or remove when already present)
  if (taxonomy && term) {
    termFilter.value[taxonomy] = termFilter.value[taxonomy] || [];
    if (termFilter.value[taxonomy] && termFilter.value[taxonomy].includes(term)) {
      termFilter.value[taxonomy] = termFilter.value[taxonomy].filter((item) => item !== term);
    } else {
      termFilter.value[taxonomy].push(term);
    }
  }
  // apply filter
  data.value.data.forEach((collection) => {
    collection.display = settings.taxonomies.every((settingTaxonomy) => {
      if (!termFilter.value[settingTaxonomy] || termFilter.value[settingTaxonomy].length === 0) {
        return true;
      }
      return termFilter.value[settingTaxonomy].some((filterValue) =>
        (Array.isArray(collection[settingTaxonomy])
          ? collection[settingTaxonomy].map((term) => term.taxonomy_terms_id.label)
          : [collection[settingTaxonomy]]
        ).includes(filterValue)
      );
    });
    // general opt-out via directus field 'exclude_from_listing'
    if (collection.exclude_from_listing === '1') {
      collection.display = false;
    }
  });
  setQueryParams();
  scrollToResults();
}

// The 'activeCollectionsNum' computed reference is used to determine the number of collections that are displayed.
const activeCollectionsNum = computed(() => {
  return data.value.data.filter((collection) => collection.display).length;
});

// Sets the css class 'active' for a specific term in a taxonomy.
function setActiveTermClass(taxonomy, term) {
  if (termFilter.value[taxonomy] && termFilter.value[taxonomy].includes(term)) {
    return " active";
  }
  return "";
}

// Checks if a taxonomy has an active term to control if filter details for this taxonomy shall be open
function hasTaxonomyActiveTerm(taxonomy) {
  if (termFilter.value[taxonomy] && termFilter.value[taxonomy].length > 0) {
    return true;
  }
  return false;
}

/**
 * The 'filterDetails' object stores the open state of the filter details for each taxonomy.
 *
 * The structure of the filterDetails object:
 * {
 *   "taxonomy1": true|false,
 *   ...
 * }
 */
const filterDetails = ref({});

// The isFilterDetailsOpen function checks if the filter details for a taxonomy are open.
function isFilterDetailsOpen(taxonomy) {
  if (taxonomy === 'current_keeper' || hasTaxonomyActiveTerm(taxonomy) || filterDetails.value[taxonomy]) {
    return true;
  }
  return false;
}

/**
 * The toggleDetail function toggles the open state of the filter details for a taxonomy.
 *
 * @param {string} taxonomy - The name of the taxonomy.
 * @param {Event} event - The event object. Deconstructs the 'open' property from the event target.
 */
function toggleDetail(taxonomy, { target }) {
  filterDetails.value[taxonomy] = target.open;
}

// reset filters for all taxonomies
function resetFilters() {
  Object.keys(termFilter.value).forEach((term) => {
    termFilter.value[term] = [];
  });
  filterDetails.value = {};
  data.value.data.forEach((collection) => {
    collection.display = true;
    // general opt-out via directus field 'exclude_from_listing'
    if (collection.exclude_from_listing === '1') {
      collection.display = false;
    }
  });
  setQueryParams();
}

// UTILS              ----------------------------------------------------------

// state of UI option to scroll to results after selecting a term
const scrollToResultsAfterSelect = ref(false);

// scroll to results after selecting a term
function scrollToResults(always = false) {
  if (scrollToResultsAfterSelect.value || always) {
    const scrollTarget = document.getElementById("collections_display");
    setTimeout(() => {
      scrollTarget.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
}

// handle user's selection of a collection for detailed display (only one at a time)
const activeCollectionId = ref(null);

function setActiveCollectionId(id) {
  activeCollectionId.value = id;
  setQueryParams();
  if (id !== null) {
    setTimeout(() => {
      const scrollTarget = document.getElementById("active-card-container");
      scrollTarget.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

}

// Returns the collection with the given id.
function getCollectionById(id) {
  return data.value.data.find((collection) => collection.id === id);
}

// store errors in array, added in the onMounted function
const errors = ref([]);

// closes the error display.
function closeErrorDisplay() {
  errors.value = [];
}

// sets the query parameters: taxonomies and active collection
function setQueryParams() {
  const params = {};
  Object.keys(termFilter.value).forEach((taxonomy) => {
    if (termFilter.value[taxonomy] && termFilter.value[taxonomy].length > 0) {
      params[taxonomy] = termFilter.value[taxonomy].map((term) => encodeURIComponent(term)).join(",");
    }
  });
  if (activeCollectionId.value !== null) {
    params.acid = encodeURIComponent(activeCollectionId.value);
  }
  router.push({ query: params });
}

/**
 * Checks the query parameters and sets the active collection id and term filter accordingly.
 * If the query parameters contain an active collection id, it checks if the collection exists in the data collections;
 * if it does, it sets the active collection id; otherwise, it adds an error to the errors list.
 * If the query parameters contain a term filter, it sets the term filter accordingly.
 * If the query parameters contain an unknown taxonomy, it adds an error to the errors list.
 * If the query parameters contain an unknown term label, it adds an error to the errors list.
 */
onMounted(() => {
  let hasFilter = false;
  Object.keys(route.query).forEach((taxonomy) => {
    const decoded = decodeURIComponent(route.query[taxonomy]);
    if (taxonomy === "acid") {
      if (decoded && getCollectionById(decoded)) {
        setActiveCollectionId(decoded);
      } else {
        errors.value.push("error_activeCollectionId");
      }
    } else {
      if (!settings.taxonomies.includes(taxonomy)) {
        errors.value.push("error_tagType");
      } else {
        if (!termFilter.value[taxonomy]) {
          termFilter.value[taxonomy] = [];
        }
        route.query[taxonomy].split(",").forEach((term) => {
          const decodedTerm = decodeURIComponent(term);
          if (!terms.value[taxonomy].find((item) => item.label === decodedTerm)) {
            errors.value.push("error_tagLabel");
          } else {
            hasFilter = true;
            termFilter.value[taxonomy].push(decodedTerm);
          }
        });
      }
    }
  });
  if (hasFilter) {
    setTermFilter();
  }
});

</script>

<template>
  
  <Head>
    <Title>{{ w.page_collections }}</Title>
  </Head>
  <div class="grid-control-bar" id="grid-control-bar">
    <div class="basic-controls">
      <div class="dev-output">
        <pre v-if="false">{{ sortedData[0] }}</pre>
      </div>
      <!-- <h2>Die {{ data.meta.total_count }} digital erfassten Sammlungen der BUA-Universitäten</h2> -->
      <div class="collections-counter">
        {{ w.num_collections }}: {{ data.meta.total_count }} {{ w.shown }}: {{ activeCollectionsNum }}
      </div>
      <div class="dns-button-group">
        <div class="filter-controls dns-group-element">
          <button :class="(showFilters) ? 'dns-button btn-filter active' : 'dns-button btn-filter'" @click="toggleFilters">
            <span :title="w.show_filters">
              <svg class="icon" width="16" height="16" fill="currentColor">
                <use xlink:href="@/assets/img/bootstrap-icons.svg#filter"></use>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
    <div v-if="showFilters" class="filter-control-bar">
      <div class="filter-control-bar-controls">
        <button class="dns-button btn-filter" @click="resetFilters">
          <span :title="w.reset_all_filters">
            <svg class="icon" width="16" height="16" fill="currentColor">
              <use xlink:href="@/assets/img/bootstrap-icons.svg#arrow-counterclockwise"></use>
            </svg>
          </span>
        </button>
      </div>
      <details v-for="(taxonomyTerms, taxonomy) in terms" :id="'filter-card-' + taxonomy"
        :key="'filter-card-' + taxonomy" class="filter-card" @toggle="toggleDetail(taxonomy, $event)"
        :open="isFilterDetailsOpen(taxonomy) ? true : null">
        <summary class="tag-title">{{ w[taxonomy] }}</summary>
        <div class="tags">
          <button v-for="(term, termIdx) in taxonomyTerms" :key="'filter-card-' + taxonomy + '-' + termIdx"
            @click="setTermFilter(taxonomy, term.label)" :class="'tag' + setActiveTermClass(taxonomy, term.label)">
            <span class="tag-name">{{ term.label }}</span>
            <span class="tag-count">{{ term.count }}</span>
          </button>
        </div>
      </details>
    </div>
  </div>
  <div v-if="activeCollectionId" class="active-card-container" id="active-card-container">
    <div class="collection_cards_wrapper single-card">
      <CardCollectionDetails :collection="getCollectionById(activeCollectionId)" :termFilter="termFilter"
        :activeCollectionId="activeCollectionId" @set-term-filter="setTermFilter"
        @set-active-collection-id="setActiveCollectionId" />
    </div>
  </div>
  <div class="grid-control-bar state-and-sort">
    <div class="filter-state">
      <dl class="display-element">
        <dt>{{ w.collections_of }}:</dt>
        <dd v-if="termFilter.current_keeper && termFilter.current_keeper.length > 0"
          v-for="(keeper, idx) in termFilter.current_keeper" :key="'filter-state-keeper-' + idx">
          {{ keeper }}
        </dd>
        <dd v-else>{{ w.all_keepers }}</dd>
      </dl>
      <div class="display-element-container">
        <template v-for="(terms, taxonomy) in termFilter" :key="'filter-state-terms-' + taxonomy">
          <dl v-if="taxonomy !== 'current_keeper' && terms.length > 0" class="display-element">
            <dt>{{ w[taxonomy] }}:</dt>
            <dd v-for="(term, idx) in terms" :key="'filter-state-term-' + idx">
              {{ term }}
            </dd>
          </dl>
        </template>
      </div>
    </div>
    <div class="sort-controls">
      <div class="dns-input-group">
        <label for="tag-cloud-sort-order" class="order-label">
          <svg class="icon-sm me-1" width="16" height="16" fill="currentColor">
            <use xlink:href="@/assets/img/bootstrap-icons.svg#sort-alpha-down"></use>
          </svg>
          <span class="description">{{ w.order }}</span>
        </label>
        <select id="tag-cloud-sort-order" class="order-select" v-model="order">
          <option value="asc">{{ w.ascending }}</option>
          <option value="desc">{{ w.descending }}</option>
        </select>
      </div>
    </div>
  </div>
  <div class="collections_display" id="collections_display">
    <div v-if="errors.length > 0" class="url_errors_wrapper">
      <div class="url_errors">
        <div @click="closeErrorDisplay" :title="w.close" class="card-deselect card-deselect-inverse"></div>
        <h4 class="sans-serif mt-0">{{ w.url_errors }}</h4>
        <ul>
          <li v-if="errors.includes('error_activeCollectionId')">
            {{ w.error_activeCollectionId }}
          </li>
          <li v-if="errors.includes('error_tagType')">
            {{ w.error_tagType }}
          </li>
          <li v-if="errors.includes('error_tagLabel')">
            {{ w.error_tagLabel }}
          </li>
        </ul>
      </div>
    </div>
    <div class="collection_cards_wrapper card-grid">
      <CardCollectionGrid v-for="collection in sortedData" :key="collection.id" :collection="collection"
        @set-active-collection-id="setActiveCollectionId" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.active-card-container {
  scroll-margin-top: var(--collections-scroll-margin-top);
}

.collections_display {
  scroll-margin-top: var(--collections-scroll-margin-top);
  margin-bottom: -1rem;
}

.url_errors_wrapper,
.collection_cards_wrapper {
  width: min(100%, 1200px);
  margin-inline: auto;
  padding: 1rem 0;
  position: relative;

  &.single-card {
    padding-bottom: 0;
  }
}

.url_errors_wrapper {
  padding-bottom: 0;
}

.url_errors {
  padding: 1rem;
  border: 1px solid #6a0000;
  border-radius: 8px;
  background-color: #942932;
  color: #ffffff;
  position: relative;
  scroll-margin-top: 64px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 1rem;
}

.grid-control-bar {
  width: min(100%, 1200px);
  margin: 116px auto 0;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;

  &.state-and-sort {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .filter-state {
    flex: 1 1;

    .display-element-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.5rem 0 0;
    }

    dl.display-element {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;
      gap: 0.25rem 0.5rem;
      margin: 0;
      line-height: 1;

      dt {
        font-weight: bold;
      }

      dd {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 300;
        line-height: 1;
        padding: 0.4em 0.6em;
        border: 0;
        border-radius: 4px;
        background-color: hsl(0, 0%, 100%);
        border-color: var(--color-taxonomy-button-border);
        border-style: solid;
        border-width: 1px;
        color: #000;
      }
    }
  }
}

.basic-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.collections-counter {
  font-size: 1rem;
}

.sort-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.sort-label,
.order-label {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0.25rem;
  line-height: 1;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  border: 1px solid var(--color-btn-border);
  border-right: 0;
}

.sort-select,
.order-select {
  flex-grow: 1;
  margin: 0;
  padding: .5rem .25rem .5rem .25rem;
  line-height: 1;
  border: 1px solid var(--color-btn-border);
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.filter-control-bar {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-taxonomy-button-border);
}

.filter-control-bar-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.filter-card {
  margin: 0.5rem 0;

  &:last-child {
    margin-bottom: 0;
  }

  .tag-name {
    display: inline-block;
  }

  .tag-count {
    display: inline-block;
    margin-left: 0.5rem;
    color: var(--color-text);
    background-color: var(--color-taxonomy-button-background);
    border: 1px solid var(--color-taxonomy-button-background-marked);
    min-width: 1.9rem;
    border-radius: 3px;
    font-size: .85rem;
    padding: 0.25em 0.5em;
  }
}

details {
  position: relative;
}

summary {
  display: block;
  position: relative;
  cursor: pointer;

  &::before,
  &::after {
    width: .75em;
    height: 2px;
    position: absolute;
    top: 50%;
    right: 0;
    content: '';
    background-color: var(--color-text);
    text-align: right;
    transform: translateY(-50%);
    transition: transform .2s ease-in-out;
  }

  &::after {
    transform: translateY(-50%) rotate(90deg);

    [open] & {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  &::-webkit-details-marker {
    display: none;
  }

}

.dns-input-group {
  display: flex;
  flex-grow: 1;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.icon-sm {
  width: 1.25rem;
  height: 1.25rem;
}

.dns-form-switch-right {
  margin: 0;
  padding-left: 0;

  .form-check-input {
    margin-left: 0.75em;
    margin-right: 0.25em;
    float: none;
    cursor: pointer;
  }
}
</style>