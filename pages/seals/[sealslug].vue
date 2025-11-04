<script setup>
const route = useRoute();
const { locale } = useI18n();
const theme = useState('theme');
const w = theme.value.data.wording[locale.value];

const slug = route.params['sealslug']

/* Used auto-imported composables: projectConfig */

const sealsData = useState("cylinderSeals")
const seals = sealsData.value.data || []

const oneSealData = await $fetch(`/api/cylinder-seals/item/${slug}`)

const seal = seals.find(item => item.slug === slug)



</script>
<template>
  <div class="page seals-item">

    <Head>
      <Title></Title>
    </Head>
    <h2 class="mb-4 text-center">Pilotprojekt 3D-Digitalisierung Rollsiegel<br></br>Institut für Vorderasiatische
      Archäologie der FU </h2>
    <h1 class="page-header text-center">{{ seal.object_title }}<br></br>({{ seal.inventory_number }})</h1>
    <div class="backlink">
      <NuxtLinkLocale :tabIndex="tabIndex" @click="navState = 'close'" to="/rollsiegel-fu">
        zurück zur Übersicht</NuxtLinkLocale>
    </div>
    <pre v-if="true">{{ oneSealData }}</pre>
    <div v-if="seal.main_image?.formats?.medium?.url" class="object-image">
      <a v-if="seal.link_to_3d_viewer && seal.main_image?.formats?.medium?.url" :href="seal.link_to_3d_viewer"
        target="_blank" rel="noopener" alt="zum 3D-Viewer">
        <img :src="useGetSealsImageUrl(seal.main_image.formats.medium.url)" alt="zum 3D-Viewer" />
        <div class="hint">zum 3D-Viewer</div>
      </a>
    </div>
    <div class="text-center mt-4">
      <a v-if="seal.link_to_3d_viewer && seal.main_image?.formats?.medium?.url" :href="seal.link_to_3d_viewer"
        target="_blank" rel="noopener" alt="zum 3D-Viewer">
        zum 3D-Viewer
      </a>
    </div>
    <div class="metadata" v-if="true">
      <div class="field" v-if="seal.dimensions">
        <div class="field-value">
          <span v-if="seal.materials[0]">{{ seal.materials[0].vocab_label }}, </span>
          <span v-if="seal.dimensions">{{ seal.dimensions }}</span>
          <span v-if="seal.published_in"><br></br>Publiziert in: {{ seal.published_in }}</span>
        </div>
      </div>
      <div class="field" v-if="seal.object_description">
        <div class="field-value" v-html="seal.object_description" />
      </div>
      <div class="object-history" v-if="seal.event && seal.event.length > 0">
        <h3>Objektgeschichte/Provenienz</h3>
        <ul>
          <li class="field-value" v-for="event in seal.event" :key="event.id" v-html="event.label" />
        </ul>

      </div>
    </div>

    <div class="share-buttons">
      <DownloadJsonButton :data="seal" filename="mapped-items.json" label="Objektdaten als JSON herunterladen"/>
      <CopyJsonButton :data="seal" label="Objektdaten als JSON kopieren" :pretty="true" />
    </div>
    <div class="backlink">
      <NuxtLinkLocale :tabIndex="tabIndex" @click="navState = 'close'" to="/rollsiegel-fu">
        zurück zur Übersicht</NuxtLinkLocale>
    </div>
  </div>
</template>
<style lang="scss">
.page.seals-item {
  .backlink {
    text-align: center;
    margin: 1.5rem auto;
  }

  .object-image {
    text-align: center;
    position: relative;

    img {
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border: 2px solid var(--color-border);
    }

    .hint {
      display: none;
    }

    &:hover .hint {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      color: var(--color-link)
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

  .credits {
    font-style: italic;
    margin-bottom: 1rem;
  }
  .share-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  }
}
</style>