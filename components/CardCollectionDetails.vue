<script setup>
const props = defineProps(['collection', 'termFilter', 'activeCollectionId']);
defineEmits(['setTermFilter', 'setActiveCollectionId']);
const theme = useState('theme');
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);
const taxonomies = theme.value.data.settings.taxonomies;

function activeTerm(taxonomy, term) {
  if (props.termFilter[taxonomy] && props.termFilter[taxonomy].includes(term)) {
    return " active";
  }
  return "";
}
function filterValues(values, field) {
  if (field === 'collection_portal') {
    return values.filter(value => {
      return !value.url.includes('berlin-university-collections.de');
    });
  }
  return values;
} 


const showLightbox = ref(false);
const imageBasePath = "https://sammlungsportal.bua-dns.de/assets/";

function getImageUrls(images){
  let imageUrls = [];
  if (images && images.length > 0) {
    images.forEach(image => {
      if (image.directus_files_id) {
        imageUrls.push(image.directus_files_id.filename_disk);
      }
    });
  }
  return imageUrls;
};
</script>
<template>
  <div v-if="collection.display" :class="collection.id === activeCollectionId ? 'card-collection-detail card active-collection' : 'card'"
    :id="'collection-' + collection.id">
    <div v-if="collection.id === activeCollectionId" @click="$emit('setActiveCollectionId', null)" :title="w.deselect"
      class="card-deselect"></div>
    <div class="card-keeper" :style="getUniMarkerColors(collection.current_keeper, 'border-bottom-color')"
      v-if="collection.current_keeper">
      <span class="dns_uni_marker" :style="getUniMarkerColors(collection.current_keeper, 'background-color')"></span>
      {{ collection.current_keeper }}
    </div>
    <div class="card-label" v-if="collection.label">
      <strong>{{ collection.label }}</strong>
    </div>
    <div class="card-cols">
      <div class="card-col">
        <div v-if="collection.description" class="card-description" v-html="convertLineBreaks(collection.description)">
        </div>
      </div>
      <div class="card-col">
        <dl>
          <template v-if="collection.address && collection.address.length > 0">
            <dt>
              <svg class="icon-inline me-1" width="16" height="16" fill="currentColor">
                <use xlink:href="@/assets/img/bootstrap-icons.svg#buildings"></use>
              </svg>
              {{ w.address }}
            </dt>
            <dd v-for="(address, idx) in collection.address" :key="'address_' + collection.id + '_' + idx">
              <span v-html="convertLineBreaks(address.address_data)"></span><br>
              {{ address.postal_code }} {{ address.city }}
            </dd>
          </template>
          <template v-if="collection.phone">
            <dt>{{ w.phone }}</dt>
            <dd>
              <a :href="'tel:' + stripEntry(collection.phone)">{{ stripEntry(collection.phone) }}</a>
            </dd>
          </template>
          <template v-if="collection.email">
            <dt>
              <svg class="icon-inline me-1" width="16" height="16" fill="currentColor">
                <use xlink:href="@/assets/img/bootstrap-icons.svg#envelope"></use>
              </svg>
              {{ w.email }}
            </dt>
            <dd><a :href="'mailto:' + stripEntry(collection.email)">{{ stripEntry(collection.email) }}</a></dd>
          </template>
          <template v-if="collection.opening_hours">
            <dt>
              <svg class="icon-inline me-1" width="16" height="16" fill="currentColor">
                <use xlink:href="@/assets/img/bootstrap-icons.svg#clock"></use>
              </svg>
              {{ w.opening_hours }}
            </dt>
            <dd v-html="convertLineBreaks(collection.opening_hours)"></dd>
          </template>
          <template v-if="collection.homepage">
            <dt>
              <svg class="icon-inline me-1" width="16" height="16" fill="currentColor">
                <use xlink:href="@/assets/img/bootstrap-icons.svg#house"></use>
              </svg>
              {{ w.homepage }}
            </dt>
            <dd>
              <a :href="collection.homepage" :title="collection.homepage" target="_blank" rel="noopener">
                {{ stripUrl(collection.homepage) }}
              </a>
            </dd>
          </template>
          <template v-if="collection.collection_portal && collection.collection_portal.length > 0">
            <dt>
              <svg class="icon-inline me-1" width="16" height="16" fill="currentColor">
                <use xlink:href="@/assets/img/bootstrap-icons.svg#record-circle"></use>
              </svg>
              {{ w.collection_portal }}
            </dt>
            <dd>
              <ul>
                <li v-for="(portal, idx) in filterValues(collection.collection_portal, 'collection_portal')" :key="'portal_' + collection.id + '_' + idx">
                  <a :href="portal.url" target="_blank" rel="noopener">{{ portal.name }}</a>
                </li>
              </ul>
            </dd>
          </template>
        </dl>
      </div>
    </div>
    <div class="resources">
      <template v-if="collection.dns_objects_in_own_databases && collection.dns_objects_in_own_databases.length">
        <template
          v-if="collection.dns_objects_in_own_databases && collection.dns_objects_in_own_databases.length === 1">
          <h3>Objekte in eigener Datenbank</h3>
        </template>
        <template v-if="collection.dns_objects_in_own_databases && collection.dns_objects_in_own_databases.length > 1">
          <h3>Objekte in eigenen Datenbanken</h3>
        </template>
        <div class="resource" v-for="(resource, id) in collection.dns_objects_in_own_databases"
          :key="`resource-own${id}`">
          <div class="resource-name">{{ resource.label }}</div>
          <div class="resource-description" v-html="resource.description" />
          <div class="resource-link">
            <a :href="resource.link" target="_blank" rel="noopener">zu den Objekten der Sammlung</a>
          </div>
          <!-- {{ resource }} -->
        </div>
      </template>
      <template
        v-if="collection.dns_objects_in_external_databases && collection.dns_objects_in_external_databases.length">
        <template
          v-if="collection.dns_objects_in_external_databases && collection.dns_objects_in_external_databases.length === 1">
          <h3>Objekte in externer Datenbank</h3>
        </template>
        <template
          v-if="collection.dns_objects_in_external_databases && collection.dns_objects_in_external_databases.length > 1">
          <h3>Objekte in externen Datenbanken</h3>
        </template>
        <div class="resource" v-for="(resource, index) in collection.dns_objects_in_external_databases"
          :key="`resource-own${index}`">
          <div class="resource-name">{{ resource.label }}</div>
          <!-- 
                    
          DEV: Iterieren über verschachtelte Elemente in den Sprachversionen ermöglichen 
           
          
          
          -->
          <div class="resource-description" v-html="useGetTranslatedRepeatableContent('description', locale, collection, index)" />
          <div class="resource-link">
            <a :href="resource.link" target="_blank" rel="noopener">zu den Objekten der Sammlung</a>
          </div>
        </div>
      </template>
      <pre v-if="false">{{ collection }}</pre>
    </div>
    <div v-if="collection.collection_images && collection.collection_images.length" class="my-5 collection-images">
      <ImageViewer :images="getImageUrls(collection.collection_images) " previewMode="gallery"
        previewImageWidth="120" />
    </div>
    <div class="tag-navigation-title"><strong>{{ w.tag_navigation_title }}</strong>{{ w.tag_navigation_hint }}</div>
    <div class="tag-navigation">
      <template v-for="taxonomy in taxonomies" :key="'collection-card-taxonomy-' + taxonomy">
        <div v-if="collection[taxonomy] && collection[taxonomy].length > 0 && taxonomy !== 'current_keeper'"
          class="tag-card">
          <h4 class="tag-title">{{ w[taxonomy] }}</h4>
          <div class="tags">
            <button v-for="(term, idx) in collection[taxonomy]" :key="'term-' + collection.id + '_' + idx"
              :class="'tag' + activeTerm(taxonomy, term.taxonomy_terms_id.label)"
              @click="$emit('setTermFilter', taxonomy, term.taxonomy_terms_id.label)">
              {{ term.taxonomy_terms_id.label }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<style lang="scss">
.card-collection-detail {
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #fff;
  position: relative;
  scroll-margin-top: 64px;

  &:not(:last-child) {
    margin-bottom: 1rem;
  }
  &.active {
    border: 2px solid #2b5c8c;
    background-color: #f3f3ff;
  }
  .resources {
    margin: 1rem 0;
    font-size: var(--font-size-text);
    h3 {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    .resource {
      display: grid;
      gap: 1rem;
      grid-template-columns: 1fr 3fr 1fr;
      margin-bottom: 1rem;
      @media screen and (max-width: 768px) {
        grid-template-columns: 1fr;
        margin-bottom: 2rem;
        p {
          margin-bottom: 0;
        }
      }
    }
  }
}
.collection-images {
  margin: 1rem auto;
  max-width: 80%;
}
.card-keeper {
  border-bottom: 2px solid #333;
  font-size: 0.85rem;
}
.card-label {
  padding: 1rem 0;
}
.card-cols {
  .card-col {
    &:nth-child(2) {
      margin-top: 1rem;
    }
  }
}

@media (min-width: 768px) {
  .card-cols {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    .card-col {
      flex: 1 1 50%;
      padding: 0 1rem;

      &:first-child {
        padding-left: 0;
      }

      &:last-child {
        padding-right: 0;
      }

      &:nth-child(2) {
        margin-top: 0;
      }
    }
  }
}
dl {
  margin: 0;
}
dt,
dd {
  overflow-wrap: break-word;
  hyphens: auto;
}
dt:not(:first-child) {
  margin-top: 0.5rem;
}
dd ul {
  margin: 0;
  padding-left: 0;
}
.label {
  font-weight: bold;
}
a {
  overflow-wrap: break-word;
}
.card-img-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 1.5rem;

  img {
    display: block;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--color-navigation-border);
    cursor: pointer;
  }
}
</style>