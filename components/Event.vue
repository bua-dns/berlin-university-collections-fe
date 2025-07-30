<script setup>
defineProps(['event']);
const theme = useState("theme")
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);

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
  <div class="event-header">
    <div class="date-time">
      <svg class="icon" width="16" height="16" fill="currentColor">
        <use xlink:href="@/assets/img/bootstrap-icons.svg#calendar-event"></use>
      </svg>
      <div class="date-time-info">
        {{ formatDate(event.date) }}, {{ getTimeFormat(event.time_start) }}<span v-if="event.time_end">-{{
          getTimeFormat(event.time_end) }}</span>
        Uhr
      </div>
    </div>
    <h3>{{ useGetTranslatedContent('title', locale, event) }}</h3>
    <h4>{{ useGetTranslatedContent('subtitle', locale, event) }}</h4>
    <div class="location" v-if="useGetTranslatedContent('venue', locale, event)">
      <svg class="icon" width="16" height="16" fill="currentColor">
        <use xlink:href="@/assets/img/bootstrap-icons.svg#geo-alt"></use>
      </svg>
      <div class="location-info" v-html="useGetTranslatedContent('venue', locale, event)" />
    </div>
  </div>
  <div class="event-body">
    <div class="description" v-html="useGetTranslatedContent('description', locale, event)" />
    <div class="event-type">{{ w[event.event_type] }}</div>
    <div class="registration-info">{{ w[event.registration] }}</div>
  </div>

</template>

<style lang="scss">
        .event-header {
          margin-bottom: 1rem;
    
          .date-time {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.0rem;
            margin-bottom: .5rem;
          }
          h3, h4 {
            padding-left: 1.5rem;
          }
          h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            
          }
    
          h4 {
            font-size: 1.0rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
    
          .location {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.0rem;
            margin-bottom: 0.5rem;
    
            .icon {
              flex: 0 0 1rem;
            }
    
            .location-info {
              vertical-align: middle;
    
              p {
                margin: 0;
              }
            }
          }
        }
    
        .event-body {
          padding: 0 1.5rem;
    
          .description {
            margin-bottom: 1rem;
          }
    
          .event-type {
            font-size: 1rem;
          }
    
          .registration-info {
            font-size: 1rem;
            margin-bottom: 0.5rem;
          }
        }
</style>