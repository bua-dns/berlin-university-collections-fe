<script setup>
/* Used auto-imported composables and utils:
 * - projectConfig
 * - getLabelUrl
 */
const theme = useState('theme');
const taxonomyTerms = useState('taxonomyTerms');
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);

const fields = [
  'translations.*',
  'title',
  // cardsets
  'cardset_collections.navigation_cards_id.*.*',
  'cardset_featured.navigation_cards_id.*.*',

  // intros
  'intro',
  'cardset_collections_intro',
  'subject_selection_intro',
  'object_type_selection_intro',
  'cardset_featured_intro',
].join(',');

const { data: homepage } = await useFetch(`${projectConfig.dataBaseUrl}/homepage`, {
  query: {
    fields
  },
});

const page = homepage.value.data;

const featuredCards = homepage.value.data.cardset_featured
  .map((card) => card.navigation_cards_id);
const subjects = computed(() => {
  return taxonomyTerms.value.data
    .filter((term) => term.spws_taxonomy === 'subject')
    // .sort((a, b) => a.label.localeCompare(b.label));
});
const objectTypes = computed(() => {
  return taxonomyTerms.value.data
    .filter((term) => term.spws_taxonomy === 'genre')
    // .sort((a, b) => a.label.localeCompare(b.label));

});

const { data: newscards } = await useFetch(`${projectConfig.dataBaseUrl}/news_cards`, {
  query: {
    fields: '*,translations.*',
    limit: -1,
    meta: 'total_count',
  }
});

const newscardstrans = computed(() => {
  return newscards.value.data
    .filter(card => card.status === 'published')
    .map((card) => {
      let translation = card.translations.find((t) => t.languages_code === locale.value);
      if (!translation) {
        if (locale.value === 'de') {
          return null;
        } else {
          translation = card.translations.find((t) => t.languages_code === 'de');
          translation['featured'] = card.featured;
          translation['image'] = card.image;
          return {
            // ...card,
            ...translation,
          };
        }
      } else {
        translation['featured'] = card.featured;
        translation['image'] = card.image;
        return {
          // ...card,
          ...translation,
        };
      }
    })
    // sort by 'sort' field
    .filter(card => card !== null)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));
});

const carouselConfig = {
  // height: '60vh',
  itemsToShow: 1,
  gap: 10,
  // autoplay: 4000,
  wrapAround: true,
  snapAlign: 'start',
  // pauseAutoplayOnHover: false,
  // transition: 1500,
  breakpoints: {
    644: {
      itemsToShow: 2,
      snapAlign: 'start',
      // gap: 10,
    },
    928: {
      itemsToShow: 3,
      snapAlign: 'start',
      // gap: 10,
    },
  },
};

</script>
<template>

  <Head>
    <Title>BUA Sammlungsplattform</Title>
  </Head>
  <div class="page segmented pt-4 pb-1 ">
    <section class="homepage-intro page-segment">
      <pre v-if="false">{{ page }}</pre>
      <h1 class="mb-lg-4 mt-2 text-center intro-heading">{{ useGetTranslatedContent('title', locale, page) }}</h1>
      <div class="intro-content">
        <div class="intro-text" v-html="useGetTranslatedContent('intro', locale, page)"></div>
      </div>
    </section>

    <!-- slider -->
    <section class="page-segment">
      <h2 class="text-center section-heading-lg mb-3">{{ w.news }}</h2>
      <Carousel v-bind="carouselConfig" breakpoint-mode="carousel" class="vue-carousel-news-cards">
        <Slide v-for="slide in newscardstrans" :key="slide.id">
          <div class="carousel__item card h-100" :class="{ 'featured': slide.featured }">
            <img v-if="slide.image" :src="projectConfig.imageBaseUrl + '/' + slide.image" :alt="slide.title || ''"
              class="card-img-top" />
            <div class="card-body">
              <h3 class="slide-title card-title mb-3">{{ slide.title }}</h3>
              <div class="slide-content card-text" v-html="slide.body"></div>
            </div>
            <div class="slide-more card-footer text-center">
              <NuxtLinkLocale :to=" slide.more_button_link" class="btn btn-primary">{{ slide.more_button_label }}
              </NuxtLinkLocale>
            </div>
          </div>
        </Slide>
        <template #addons>
          <Navigation />
          <Pagination />
        </template>
      </Carousel>
    </section>
    <!-- University cards -->
    <section class=" mt-4 university-collections page-segment">
      <h2 class="mb-lg-3 text-center section-heading">{{ w.university_collections_heading }}</h2>
      <div class="mt-4 university-cards">
        <div v-for="(card, idx) in homepage.data.cardset_collections" :key="idx"
          :class="'card dns-card university-card ' + card.navigation_cards_id.label"
          :style="'border-color:' + card.navigation_cards_id.background_color + ';'">
          <NuxtLink :to="card.navigation_cards_id.more_button_link" class="card-link large light">
            {{ useGetTranslatedContent('title', locale, card.navigation_cards_id) }}
          </NuxtLink>
        </div>
      </div>
    </section>
    <!-- Taxonomy cards -->
    <section class="mt-lg-4 row taxonomy-cards page-segment">
      <div class="select-cards-section subjects col-lg mt-4 mt-lg-0">
        <div class="mb-3 intro" v-html="useGetTranslatedContent('subject_selection_intro', locale, page)" />
        <pre v-if="false">{{ taxonomyTerms }}</pre>
        <div class="subject-grid">
          <div v-for="(subject, idx) in subjects" :key="idx" class="card dns-card selection-card">
            <NuxtLink :to="'/sammlungen?dns_taxonomy_subjects=' + getLabelUrl(subject.label)" class="card-link medium">
              {{ useGetTranslatedContent('label', locale, subject) }}
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="select-cards-section object-types col-lg mt-4 mt-lg-0">
        <div class="mb-3 intro" v-html="useGetTranslatedContent('object_type_selection_intro', locale, page)" />
        <div class="subject-grid">
          <div v-for="(type, idx) in objectTypes" :key="idx" class="card dns-card selection-card">
            <NuxtLink :to="'/sammlungen?dns_taxonomy_genre=' +
              getLabelUrl(type.label)" class="card-link medium">
              {{ useGetTranslatedContent('label', locale, type) }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
    <!-- Featured cards -->
    <section class="mt-4 featured-cards page-segment">
      <h2 class=" mb-lg-4 text-center section-heading">{{ w.featured_heading }}</h2>
      <div class="intro" v-if="homepage.data.cardset_featured_intro"
        v-html="useGetTranslatedContent('cardset_featured_intro', locale, page)" />
      <div class="features-grid">
        <div v-for="(card, index) in featuredCards" :key="`card-${index}`" class="feature-card">
          <!-- <pre>{{ card }}</pre>
           {{ useGetTranslatedContent('title', locale, card.navigation_cards_id) }}-->
          <Card :cardImage="card.card_image.filename_disk" :cardTitle="useGetTranslatedContent('title', locale, card)"
            :cardText="useGetTranslatedContent('card_text', locale, card)"
            :cardMoreButtonLabel="useGetTranslatedContent('more_button_label', locale, card)"
            :cardMoreButtonLink="card.more_button_link" cardBodyMinHeight="13rem" />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.homepage-intro {
  .intro-heading {
    font-size: 1.4rem;
    margin-bottom: 2rem;
    @media screen and (min-width: 768px) {
      font-size: 2.25rem;
    }
  }

  .intro-content {
    display: block;
    @media screen and (min-width: 1000px) {
      display: flex;
      gap: 3.5rem;
    }
    .intro-text {
      font-size: 1rem;
      line-height: 1.25rem;
      @media screen and (min-width: 768px) {
        flex: 2; // Takes up 2 parts of the flex container
        font-size: 1.25rem;
        line-height: 1.75rem;
      }
    }

    aside {
      font-size: 1rem;
      background-color: var(--color-bua-brown-light);
      border-radius: 6px;
      padding: 1.25rem;
      @media screen and (min-width: 768px) {
        flex: 1; // Takes up 1 part of the flex container
        font-size: .875rem;

      }
    }
  }
}

.dns-card {
  border-radius: var(--selection-card-border-radius);
  cursor: pointer;
  &:hover {
    background-color: hsl(0, 0%, 38%);
    // background-color: hsl(38, 21%, 41%);
  }
  &.university-card {
    min-height: 5rem;
    border-left: .5rem solid transparent;
    // border-right: .5rem solid transparent;
    background-color: var(--color-university-card-fill);
    &:hover {
      background-color: var(--color-university-card-fill-hover);
    }
  }
}

.BUA-Sammlungen {
  grid-area: bua;
}

.FU-Sammlungen {
  grid-area: fu;
}

.HU-Sammlungen {
  grid-area: hu;
}

.TU-Sammlungen {
  grid-area: tu;
}

.CH-Sammlungen {
  grid-area: ch;
}

.university-cards {
  display: grid;
  gap: 0.5rem;
  grid-template-areas:
    'bua'
    'fu'
    'hu'
    'tu'
    'ch';
  @media (min-width: 568px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas:
      'bua bua'
      'fu hu'
      'tu ch';
  }
  @media screen and (min-width: 992px) {
    grid-template-columns: repeat(5, 1fr);
    grid-template-areas:
      'bua fu hu tu ch';
  }
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: .5rem;
  .selection-card {
    border: 1px solid var(--color-selection-card-border);
    background-color: var(--color-selection-card-fill);
    color: var(--color-selection-card-text);
    font-weight: 400;
    font-size: 3rem;
    min-height: 3.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: var(--color-selection-card-fill-hover);
    }
    .card-link {
      color: var(--color-selection-card-text);
    }
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--feature-card-width), 1fr));
  gap: 1.5rem;
}

.card-link {
  // height: 100%;
  &.medium {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .8rem;
    padding: .5rem;
    text-align: center;
  }
  &.large {
    display: block;
    padding: 1rem;
    // padding: 1.75rem 1rem;
    font-size: 1.125rem;
    color: var(--color-text);
  }
  &.light {
    // color: var(--color-text-inverted);
    color: hsl(38, 21%, 21%);
  }
}

.news-card {
  gap: 1.5rem;
  flex-wrap: wrap;
  aside {
    // flex: 0 1 48%;
    padding: 1rem;
    background-color: var(--color-bua-brown-light);
    border-radius: var(--selection-card-border-radius);
  }
}

.card.featured {
  background-color: var(--color-bua-brown-light);
}

.vue-carousel-news-cards {
  margin: 0;
  padding: 0 30px;
  .carousel__viewport {
    margin-bottom: 40px;
    padding: 0 2px;
  }
  .carousel__pagination {
    bottom: -40px;
    // bottom: 0;
  }
  .carousel__slide {
    padding: 0 3px;
  }
}

</style>