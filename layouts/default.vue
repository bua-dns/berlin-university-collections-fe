<script setup>
const route = useRoute();
const { locale } = useI18n();
const backgroundImages = useState('background_images');
const randImageRoutes = [
  'sammlungen',
  'sammlungen___de',
  'sammlungen___en',
  'index',
  'index___de',
  'index___en',
  'online-ressourcen',
  'online-ressourcen___de',
  'online-ressourcen___en',
  'demos',
  'demos___de',
  'demos___en'
];
const clientEnv = ref(false);

function getRandomImage(page) {
  const images = (page === 'index')
    ? backgroundImages.value.data.filter(image => image.use_for_front_page === '1' && !image.page_specific)
    : backgroundImages.value.data.filter(image => !image.page_specific);
  return images[Math.floor(Math.random() * images.length)];
}
// function getSpecificImage(page) {
//   return backgroundImages.value.data.find(image => image.name === page);
// }
const randomImage = ref({});

watch(() => route.name, () => {
  // console.log('route changed to', route.name);
  if (randImageRoutes.includes(route.name)) {
    randomImage.value[route.name] = getRandomImage(route.name);
  }

});

onMounted(() => {
  clientEnv.value = true;
  randImageRoutes.forEach(page => {
    randomImage.value[page] = getRandomImage(page);
  });
});

const scrollState = useState('scroll');
const mainClass = computed(() => {
  if (scrollState.value) {
    return 'scrolled';
  }
  else {
    return '';
  }
});
const localeClass = computed(() => {
  return 't_default lang-' + locale.value;
});

useHead({
  htmlAttrs: {
    lang: locale.value,
  },
});

</script>
<template>
  <div :class="localeClass">
    <TheHeader />
    <TheNavigation />
    <div v-if="clientEnv && randImageRoutes.includes($route.name)" class="bg-img">
      <img :src="projectConfig.imageBaseUrl + '/' + randomImage[$route.name]?.image + '?key=bg-image'"
        :alt="randomImage[$route.name]?.credits">
    </div>
    <div v-else-if="$route.name === 'koloniale-kontexte'" class="bg-img">
      <img src="@/assets/img/background-images/Tsumeb_Montage.jpg" alt="background Koloniale Kontexte">
    </div>
    <main :class="mainClass">
      <slot />
    </main>
    <TheFooter />
    <InfoBadge v-if="clientEnv && randImageRoutes.includes($route.name)" :image="randomImage[$route.name]" />
  </div>
</template>


<style lang="scss">
.t_default {
  position: relative;
}

.bg-img {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -10;
  background-color: var(--color-background);

  @media (min-width: 1248px) {
    display: block;
  }

  img {
    display: none;
  }
}
@media screen and (min-width: 1400px){
  .bg-img {
    background-color: hsl(0, 0%, 0%);
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      opacity: .65;
    }
  }
}
</style>