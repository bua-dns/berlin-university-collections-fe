<script setup>
const theme = useState("theme");
const ikbConfiguration = useState('ikbConfiguration');
const w = theme.value.data.wording.de

const slug = 'data-inspector-mstub'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]

const diSearch = useDISearchStore();


function sortMinerals(items) {
  return items.sort((a, b) => {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  });
}
const mineralsData = useState("minerals");
const minerals = sortMinerals(mineralsData.value.data);
const selectedMineral = ref(null);
function selectMineral(mineral) {
  if (selectedMineral.value && selectedMineral.value.label === mineral) {
    selectedMineral.value = null;
    // console.log('post', mineral, selectedMineral.value?.label);
    displayMode.value = "categories";
    return;
  }
  selectedMineral.value = minerals.find((entry) => entry.label === mineral);
  displayMode.value = "items";
}
function getMineralImage(filenameDisk) {
  return "https://mstub-db.bua-dns.de/assets/" + filenameDisk;
}

const displayMode = ref("categories");

</script>

<template>

  <Head>
    <Title>{{ w.page_data_inspector_mstub }}</Title>
  </Head>
  <div class="data-inspector" v-if="true">
    <div class="intro">
      <h1 class="page-header text-center">{{ w.page_data_inspector_mstub}}<span class="badge-beta">beta</span></h1>
      <div class="dev-output" v-if="false">
        diSearch<br>
        <pre>{{ diSearch.term }}</pre>
        <!-- <pre>selectedPriorities<br>{{ selectedPriorities }}</pre> -->
      </div>
    </div>

    <div class="intro" v-html="page.page_content" />
    <div class="controls">
      <h3 class="minerals-cloud-title">Minerale des Teilbestandes Schenkung Karl Keller</h3>
      <div class="minerals-listing">
        <div class="minerals-listing__container">
          <div class="minerals-listing__item clickable" v-for="(mineral, index) in minerals" :key="`mineral${index}`"
            @click="selectMineral(mineral.label)"
            :class="{ 'active': selectedMineral?.label === mineral.label }"
          >
              {{ mineral.label }}
              <!-- <pre>{{ mineral.id }}</pre> -->
          </div>
        </div>
      </div>
      <div class="mineral-display" v-if="selectedMineral">
        <h4>{{ selectedMineral.label }}</h4>
        <div class="mineral-display-body">
          <div class="labeling">
            <h5><span class="lang">EN</span> {{ selectedMineral.wikidata_label_en }}</h5>
          </div>
          <div class="reference-data">
            <h5>Strunz (10. Aufl.) {{ selectedMineral.strunz_10 }}</h5>
            <h5 v-if="selectedMineral.wikidata_id"><a :href="`https://www.wikidata.org/wiki/${selectedMineral.wikidata_id}`" target="_blank">
              Wikidata ({{ selectedMineral.wikidata_id }})
            </a></h5>
            <h5 v-if="selectedMineral.mindat">
              <a
                :href="`https://www.mindat.org/min-${selectedMineral.mindat}.html`"
                target="_blank" title="Link zum Mindat-Eintrag">Mindat ({{ selectedMineral.mindat }})
              </a>
            </h5>
          </div>
          <div class="cover-image" v-if="selectedMineral.cover_image && selectedMineral.cover_image.filename_disk">
            <img :src="getMineralImage(selectedMineral.cover_image.filename_disk)" alt="Bild des Minerals" />
          </div>
        </div>
      </div>
      <pre v-if="false && selectedMineral">{{ selectedMineral }}</pre>
    </div>
    <div v-if="displayMode === 'categories'">
      <DataInspectorMediaSamplesMinerals />
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
  h3.minerals-cloud-title {
    font-weight: 400;
    margin: 2rem 0 1rem;
    text-align: center;
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
// new: Minerals
.minerals-listing__container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: .5rem;
  .minerals-listing__item {
    &.active {
      font-weight: 700;
    }
  }
}
.mineral-display {
  margin-top: 4rem;
  h4 {
    font-size: 1.25rem;
    font-weight: 700;
  }
  h5 {
    margin-top: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
    .lang {
      font-size: 0.775rem;
      color: grey;
    }
  }
  .mineral-display-body {
    display: flex;
    gap: 2rem;
    margin-top: .25rem;

    .labeling {
    }
    .reference-data {

    }
    .cover-image {
      img {
        padding: .125rem;
        max-width: 6rem;
        height: auto;
        border: 1px solid hsl(0, 0%, 90%);
      }
    }
  }
}
</style>
