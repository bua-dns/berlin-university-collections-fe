<script setup>
const theme = useState("theme");
const ikbConfiguration = useState('ikbConfiguration');
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);

const slug = 'data-inspector-lehrbildsammlung-ikb'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]

const diSearch = useDISearchStore()

const ikbCategories = useState("ikbCategories");
const categoriesIndex = computed(() => {
  if (!ikbCategories.value || !ikbCategories.value.data) return {}
  let index = {};
  for (let entry of ikbCategories.value.data) {
    index[entry.label] = {
      p31: entry.P31_instance_of.map((item) => item.q_number),
    };
  }
  return index;
});

const priorityOptions = ikbConfiguration.value.data.dns_priority_options;
const priorityOptionsThemes = ikbConfiguration.value.data.dns_priority_options_themes;

const selectedPriorities = ref([]);
function togglePriority(priority) {
  if (selectedPriorities.value.includes(priority)) {
    selectedPriorities.value = selectedPriorities.value.filter((entry) => entry !== priority);
  } else {
    selectedPriorities.value.push(priority);
  }
}

const results = ref([]);
const wdEntities = computed(() => {
  if (!results.value || !results.value.data || results.value.data.length === 0) return [];
  for (let item of results.value.data) {
    item.weight = 0;
    for(let priority of selectedPriorities.value) {
      if (checkCriterium({
          item,
          prop: 'dns_p31_listing', 
          criterium: categoriesIndex.value[priority]['p31']
        })) {
        item.weight = 1;
      }
    }
  }
  return results.value.data
    .sort((a, b) => b.weight - a.weight);
});

const term = computed(() => diSearch.term);


// Watch the term variable and call searchWdEntities whenever it changes
watch(term, async (newTerm) => {
  diSearch.term = newTerm;
  if (newTerm.length > 2) {
    displayMode.value = "search";
    results.value = await searchWdEntities(newTerm);
  };
  if (newTerm.length <= 2) {
    results.value = [];
  }
});


const selectedEntities = ref([]);
const selectedEntitiesForDisplay = ref([]);
const allEntitiesSelected = ref(false);
// const allEntitiesSelected = computed(() => {
//   return selectedEntities.value.length === wdEntities?.length;
// });
function selectAllEntities(priority) {
  if (allEntitiesSelected.value) {
    selectedEntities.value = [];
    allEntitiesSelected.value = false;
    return;
  }
  if (priority === 1) {
    selectedEntities.value = wdEntities.value.filter((entry) => entry.weight === 1);
    allEntitiesSelected.value = true;
    return
  }
  selectedEntities.value = wdEntities.value;
  allEntitiesSelected.value = true;
  
}
function clearSearch() {
  diSearch.term = "";
  selectedEntities.value = [];
  selectedEntitiesForDisplay.value = [];
  displayMode.value = "search";
  selectedPriorities.value = [];  
}
function addEntity(entity) {
  if (selectedEntities.value.includes(entity)) {
    selectedEntities.value = selectedEntities.value.filter((entry) => entry !== entity);
  } else {
    selectedEntities.value.push(entity);
  }
}

const displayMode = ref("search");

function displaySelectedEntities() {
  selectedEntitiesForDisplay.value = selectedEntities.value;
  selectedEntities.value = [];
  displayMode.value = "display";
  term.value = '';
}
const markAllLimit = 100;
</script>

<template>

  <Head>
    <Title>{{ w.page_data_inspector_ikb }}</Title>
  </Head>
  <div class="data-inspector" v-if="true">
    <div class="intro">
      <h1 class="page-header text-center">{{ w.page_data_inspector_ikb}}<span class="badge-beta">beta</span></h1>
    </div>

    <div class="intro" v-html="useGetTranslatedContent('page_content', locale, page)" />
    <div class="controls">
      <h3>Suche nach Objekten, die auf den Lehrbildern dargestellt sind</h3>
      <div class="priority-selection">
        <span>Priorisiere Typus dargestelltes Objekt:</span>
        <div class="option" v-for="option in priorityOptions" :key="`option-${option}`">
          <input type="checkbox" :checked="selectedPriorities.includes(option)" @click="togglePriority(option)" />
          <span class="handle">{{ option }}</span>
        </div>
      </div>
      <div class="priority-selection">
        <span>Priorisiere thematisch:</span>
        <div class="option" v-for="option in priorityOptionsThemes" :key="`option-${option}`">
          <input type="checkbox" :checked="selectedPriorities.includes(option)" @click="togglePriority(option)" />
          <span class="handle">{{ option }}</span>
        </div>
      </div>
      <div class="search">
        <SearchBox :disabled="displayMode === 'display'" :searchStore="diSearch"/>

        <input type="submit" value="markierte anzeigen" class="submit search-box-submit"
          v-if="selectedEntities?.length > 0" @click="displaySelectedEntities()" />
        <input type="button" @click="clearSearch()" v-if="displayMode === 'display'" value="neue Suche"
          class="submit search-box-submit" />
        <div class="suggestions" v-if="displayMode === 'search' && term?.length > 2 ">
          <template v-if="!wdEntities || wdEntities.length < 1">
            Keine passenden Objekte gefunden
          </template>
          <template v-if="  getPrioritizedEntities(wdEntities, 1) && 
                            getPrioritizedEntities(wdEntities, 1).length && 
                            getPrioritizedEntities(wdEntities, 1).length < markAllLimit">
            <label class="suggestion-list-item">
              <input type="checkbox" value="" :checked="allEntitiesSelected" @click="selectAllEntities(1)" />
              <span>alle priorisierten markieren ({{ getPrioritizedEntities(wdEntities, 1).length}})</span>
            </label>
            <hr>
          </template>
          <template v-if="  wdEntities.length > 1 && 
                            getPrioritizedEntities(wdEntities,0).length < markAllLimit">
            <label class="suggestion-list-item">
              <input type="checkbox" value="" :checked="allEntitiesSelected" @click="selectAllEntities(0)" />
              <span>alle markieren ({{ wdEntities.length }})</span>
            </label>
            <hr>
          </template>

          <div class="suggestion clickable" v-for="entry in wdEntities" :key="entry">
            <label class="suggestion-list-item">
              <input type="checkbox" :value="entry" :checked="selectedEntities.includes(entry)"
                @click="addEntity(entry)" />
              <span class="handle" :class="({ 'priority': entry.weight === 1 }) ">{{ entry.handle }}</span>

            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="display-entities">
      <template v-if="displayMode === 'display'" {{ selectedEntitiesForDisplay.length }}>
        <WDEntity v-for="entity in selectedEntitiesForDisplay" :key="`entity${entity.id}`" :entity="entity" />
      </template>
    </div>
    <div v-if="displayMode === 'search'">
      <DataInspectorMediaSamples />
    </div>
  </div>
</template>

<style lang='scss' scoped>
.data-inspector {
  max-width: 90rem;
  margin: 0 auto;
  .intro {
    .badge-beta {
      position: relative;
      top: -1rem;
      background-color: var(--color-taxonomy-button-background);
      font-size: 1rem;
      color: var(--color-bua-blue-dark);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      margin-left: 0.5rem;
    } 
  }
  .display-entities {
    margin-top: 2rem;
  }
}
.controls {
  margin-top: 1rem;
  h3 {
    font-weight: 400;
    margin-bottom: 1rem;
  }
  .priority-selection {
    margin: .75rem 0;
    display: flex;
    gap: .5rem;
    align-items: center;
    .option {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
  }
  .search {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;

    input {
      border: 1px solid var(--color-border);
      border-radius: 0.125rem;
      padding: 0.5rem 1rem;
      font-size: 1.25rem;
      height: 2.25rem;
    }

    input[type="submit"] {
      background-color: lightblue;
      color: var(--color-text);
      cursor: pointer;

      &:hover {
        background-color: var(--color-background-selected);
      }
    }

    .submit {
      padding: 0.5rem 1rem;
      color: var(--color-text);
      font-size: 1rem;
      cursor: pointer;

      &:hover {
        background-color: var(--color-background-selected);
      }
    }

    .suggestions {
      position: absolute;
      top: 3.5rem;
      z-index: 2;
      width: 100%;
      max-height: 80rem;
      max-height: 65vh;
      background-color: hsl(0, 0%, 100%);
      padding: 0.5rem 1rem;
      overflow-x: hidden;
      overflow-y: auto;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

      .suggestion:hover {
        background-color: hsl(0, 0%, 94%);
      }
    }

    .suggestion-list-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      span.priority {
        font-weight: 400;
      }

      input[type="checkbox"] {
        cursor: pointer;
      }
    }
  }
}

</style>
