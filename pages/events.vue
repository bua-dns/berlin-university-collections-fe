<script setup>
/* Used auto-imported composables: projectConfig */
const theme = useState("theme")
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);

const slug = 'events'
const titleWording = 'page_events'

const { data } = await useFetchPage(slug)
const page = data.value.data[0]

const eventsData = useState('events');
const events = eventsData.value.data
  .filter(event => {
    const currentDate = new Date();
    const eventDate = new Date(event.date);
    const twoDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 2));
    return eventDate > twoDaysAgo;
  })
  .sort((a, b) => new Date(a.date) - new Date(b.date));
const pastEvents = eventsData.value.data
  .filter(event => {
    const currentDate = new Date();
    const eventDate = new Date(event.date);
    const twoDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 2));
    return eventDate <= twoDaysAgo;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));
function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    // hour: 'numeric',
    // minute: 'numeric',
  });
}

function getTimeFormat(time) {
  return new Date(`2021-01-01T${time}`).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

</script>

<template>

  <Head>
    <Title>{{ w.page_projekte }}</Title>
  </Head>
  <div class="page p_dns-page" v-if="data && page.status === 'published'">
    <h1 class="mb-4 text-center">{{ useGetTranslatedContent('title', locale, page) }}</h1>
    <template v-if="!page.display_sidebar">
      <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
    </template>
    <template v-if="page.display_sidebar">
      <div class="page-container">
        <div class="page-content" v-html="useGetTranslatedContent('page_content', locale, page)" />
        <div class="sidebar">
          <div class="mt-3 mb-5 sidebar-header" v-if="page.sidebar_header_image">
            <img :src="projectConfig.imageBaseUrl + '/' + page.sidebar_header_image + '?key=sidebar-header'"
              alt="sidebar image" />
          </div>
          <div class="sidebar-content" v-if="page.sidebar_content" v-html="useGetTranslatedContent('sidebar_content', locale, page)" />
        </div>
      </div>
    </template>
    <div v-if="events && events.length" class="events-listing mt-5">
      <div v-for="event in events" :key="event.id" class="event-entry">
        <Event :event="event" />
      </div>
    </div>
    <h1 class="past-events-heading">{{ w.past_events }}</h1>
    <hr />
    <div v-if="pastEvents && pastEvents.length" class="events-listing mt-5">
      <div v-for="event in pastEvents" :key="event.id" class="event-entry">
        <Event :event="event" />
      </div>
    </div>

  </div>
</template>

<style lang='scss'>
.p_dns-page {
  .past-events-heading {
    margin-top: 7.5rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  .page-container {
    display: block;

    .page-content {}

    .sidebar {
      .sidebar-header {
        display: none;

        img {}
      }
    }
  }

  .page-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--feature-card-width), 1fr));
    gap: 1.5rem;
  }
}
.events-listing {
  .event-entry {
    margin-bottom: 3rem;
  }
}

@media screen and (min-width: 768px) {
  .p_dns-page {
    .page-container {
      display: flex;
      gap: 2.5rem;

      .page-content {
        flex: 2;
      }

      .sidebar {
        .sidebar-header {
          display: block;
        }

        flex: 1;
      }
    }
  }

}
</style>
