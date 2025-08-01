<script setup>
const route = useRoute();
const { locale } = useI18n();
const theme = useState('theme');
const w = theme.value.data.wording[locale.value];

const slug = route.params['mstubslug']

/* Used auto-imported composables: projectConfig */

const mineralsData = useState("minerals")
const mstubItemsData = useState("mstubItems")

const minerals = mineralsData.value.data || []
const mstubItems = mstubItemsData.value.data || []

const item = mstubItems.find(item => item.slug === slug)
const relevantMinerals = minerals.filter(mineral => {
  return item.mineral_denominations_relations.includes(mineral.slug)
});

function getImages(representations) {
  return representations.map((image) => {
    return useGetMSTUBImageUrl(image.directus_files_id)
  });
}
function getCardEntriesValues(field) {
  if (!item.card_entries || !item.card_entries.length) return '';
  const entries = new Set(item.card_entries.map(entry => entry.card_entries_id[field]));
  return Array.from(entries).join(', ');
}
function getStrunzInfo(entry) {
  if (entry.strunz_10) {
    return `Strunz: ${entry.strunz_10} (10. Aufl.)`;
  }
  if (entry.strunz_9) {
    return `Strunz: ${entry.strunz_9} (9. Aufl.)`;
  }
  if (entry.strunz_8) {
    return `Strunz: ${entry.strunz_8} (8. Aufl.)`;
  }
  return null;
}


</script>
<template>
  <div class="page mstub-item">

    <Head>
      <Title></Title>
    </Head>
    <h2 class="mb-4 text-center">Demonstrator Sammlungspräsentation<br></br>Mineralogische Sammlungen der TU</h2>
    <h1 class="page-header text-center">{{ item.mineral_denomination_inventory }} ({{
      item.inventory_number }})</h1>
    <h3>Normdaten Mineral(e) lt. Schlagwortkartei</h3>
    <div class="minerals-info" v-if="relevantMinerals.length > 0 && relevantMinerals[0].wikidata_label_de">
      <div class="mineral-info-detail" v-for="mineral in relevantMinerals" :key="mineral.slug">
        <div class="mineral-name-card">
          {{ mineral.label }}
        </div>
        <div class="mineral-name">
          {{ mineral.wikidata_label_de }} ({{ mineral.wikidata_label_en }})
        </div>
        <div class="strunz">
          {{ getStrunzInfo(mineral) }}
        </div>
        <div class="wikidata-link">
          <a :href="`https://www.wikidata.org/wiki/${mineral.wikidata_id}`" target="_blank">Wikidata ({{
            mineral.wikidata_id }})</a>
        </div>
        <div class="mindat">
          <a :href="`https://www.mindat.org/min-${mineral.mindat}.html`" target="_blank">Mindat ({{ mineral.mindat
            }})</a>
        </div>
      </div>
    </div>
    <div class="metadata">
      <div class="field">
        <div class="field-label">Verzeichnet in der Schlagwortkartei als</div>
        <div class="field-value">{{ getCardEntriesValues('mineral_denomination_card') }}</div>
      </div>
      <div class="field">
        <div class="field-label">Erwerbungsdatum</div>
        <div class="field-value">{{ item.acquisition_date }}</div>
      </div>
      <div class="field">
        <div class="field-label">Fundortangaben in der Schlagwortkartei</div>
        <div class="field-value">{{ getCardEntriesValues('find_spot') }}</div>
      </div>
      <div class="field">
        <div class="field-label">Anzahl der Exemplare</div>
        <div class="field-value">
          <template
            v-if="getCardEntriesValues('number_of_specimens_indication') && !getCardEntriesValues('number_of_specimens_interpretation')">
            {{ getCardEntriesValues('number_of_specimens_indication') }}
          </template>
          <template v-if="getCardEntriesValues('number_of_specimens_interpretation')">
            {{ getCardEntriesValues('number_of_specimens_interpretation') }}
          </template>
          <template
            v-if="!getCardEntriesValues('number_of_specimens_interpretation') && !getCardEntriesValues('number_of_specimens_indication')">
            1
          </template>
        </div>
      </div>
    </div>
    <pre v-if="false">{{ relevantMinerals }}</pre>
    <pre v-if="false">{{ item }}</pre>
    <div class="object-images" v-if="item.representations && item.representations.length > 0">
      <LightBoxMstubItem v-for="(image, index) in getImages(item.representations)" :key="index" :image="image" />
    </div>
    <pre v-if="false">{{ slug }}</pre>
  </div>
</template>
<style lang="scss">
.page.mstub-item {
  .minerals-info {
    padding-bottom: 1rem;
    margin-bottom: 2rem;
    margin-top: 1rem;
    border-bottom: 1px solid var(--color-border);

    .mineral-info-detail {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      flex-wrap: wrap;
      .mineral-name-card {
        font-weight: bold;
      }
      .mineral-name {
        font-style: italic;
      }

      .strunz {
        font-style: italic;
      }

      .wikidata-link,
      .mindat {
        
      }
    }
  }

  .metadata {
    margin: 2rem 0;

    .field {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;

      .field-label {
        font-size: var(--font-size-text-small);
        text-transform: uppercase;
      }
    }
  }

  .object-images {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
    gap: 1rem;

    .ikb-image-viewer {
      width: 100%;
      max-width: 100%;
    }
  }


}

.description {}
</style>