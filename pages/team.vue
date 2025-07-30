<script setup>
/* Used auto-imported composables: projectConfig */
const theme = useState("theme");
const personsTeam = useState("personsTeam");

const members = personsTeam.value.data
  .sort((a, b) => a.sort_order - b.sort_order)
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);

const slug = 'team'
const titleWording = 'page_team'

// useGetTranslatedContent('page_content', locale, page)
// const page = data.value.data[0]
</script>

<template>

  <Head>
    <Title>{{ w.page_team }}</Title>
  </Head>
  <div class="page p_dns-page" v-if="true">
    <h1 class="page-header text-center">{{ w[titleWording] }}</h1>
    <div class="person mt-4"
      v-for="(person, index) in members"
      :key="`person-${index}`"
    >
      <h3 class="mb-1">{{ person.name }}</h3>
      <h4 class="mb-2 sans-serif">{{ useGetTranslatedContent('position', locale, person) }}</h4>
      <div class="short-presentation" v-html="useGetTranslatedContent('short_presentation', locale, person)"/>
      <a 
        :href="`mailto:${person.mail_contact}`" 
        target="_blank"
        alt="Mailkontakt"
      >{{person.mail_contact}}</a>
    </div>
  </div>
</template>

<style lang='scss'>

.person {
  h4 {
    font-size: var(--font-size-text);
  }
  p {
    margin-bottom: .5rem;
  }
}

.p_dns-page {
  .page-container {
    display: block;
    .page-content {
    }
    .sidebar {
      font-size: var(--font-size-text-small);
      .sidebar-header {
        display: none;
        img {
          
        }
      }
    }
  }
}
@media screen and (min-width: 768px){
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
