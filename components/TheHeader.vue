<script setup>
const theme = useState("theme");
const { locale } = useI18n();
const w = computed(() => theme.value.data.wording[locale.value]);
const switchLocalePath = useSwitchLocalePath();


// const navState = useState("nav", () => "close");
// const toggleNav = () => {
//   navState.value = navState.value === "close" ? "open" : "close";
// };

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const scrollOffset = 40;
const scrollState = useState("scroll", () => false);
const handleScroll = () => {
  const navbar = document.querySelector(".dns-page-header");
  if (window.scrollY > scrollOffset && !navbar.classList.contains("scrolled")) {
    navbar.classList.add("scrolled");
    scrollState.value = true;
  } else if (window.scrollY <= scrollOffset && navbar.classList.contains("scrolled")) {
    navbar.classList.remove("scrolled");
    scrollState.value = false;
  }
};
</script>

<template>
  <header class="navbar fixed-top dns-page-header">
    <NuxtLinkLocale to="/" class="dns-branding">
      <div class="dns-logo-container">
        <svg id="Ebene_1" data-name="Ebene 1" xmlns="http://www.w3.org/2000/svg" width="119" height="89.25"
          viewBox="0 0 119 89.25" class="mx-lg-4 mx-2 dns-navbar-logo">
          <line x1="22.31" y1="21.32" x2="49.09" y2="44.13"
            style="fill: #525252; stroke: #525252; stroke-miterlimit: 10; stroke-width: 5px" />
          <line x1="49.09" y1="44.13" x2="100.16" y2="63.47"
            style="fill: #525252; stroke: #525252; stroke-miterlimit: 10; stroke-width: 5px" />
          <line x1="50.08" y1="45.12" x2="93.71" y2="18.35"
            style="fill: #525252; stroke: #525252; stroke-miterlimit: 10; stroke-width: 5px" />
          <circle cx="22.04" cy="20.29" r="18.84" style="fill: #848f7f; stroke-width: 0px" />
          <line x1="17.35" y1="71.9" x2="49.09" y2="45.12"
            style="fill: #525252; stroke: #525252; stroke-miterlimit: 10; stroke-width: 5px" />
          <circle cx="49.09" cy="45.12" r="12.4" style="fill: #525252; stroke-width: 0px" />
          <circle cx="93.22" cy="18.84" r="18.84" style="fill: #9acd00; stroke-width: 0px" />
          <circle cx="18.84" cy="70.41" r="18.84" style="fill: #c30e20; stroke-width: 0px" />
          <circle cx="100.16" cy="63.47" r="18.84" style="fill: #00376b; stroke-width: 0px" />
        </svg>
      </div>

      <div class="dns-site-title-container">
        <div class="dns-site-title title">{{ w.site_title }}</div>
        <div class="dns-site-subtitle title">{{ w.site_subtitle }}</div>
      </div>
    </NuxtLinkLocale>
    <nav class="dns-main-navigation">
      <ul>
        <li>
          <NuxtLinkLocale to="/">{{ w.nav_page_start }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/sammlungen">{{ w.nav_page_sammlungen }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/online-ressourcen">{{ w.nav_page_online_ressourcen }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/projekte">{{ w.nav_page_projekte}}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/lab-demos">{{ w.nav_page_lab}}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/kontakt">{{ w.nav_page_contact }}</NuxtLinkLocale>
        </li>
      </ul>
    </nav>
    <div class="controls-wrapper">
      <div class="locale-switch">
        <nuxt-link @click="navState = 'close'"
          :to="switchLocalePath('en')">
          EN
        </nuxt-link>
         |
        <nuxt-link @click="navState = 'close'"
          :to="switchLocalePath('de')">
          DE
        </nuxt-link>
      </div>
      <div class="mx-lg-4 mx-2 dns-navbar-controls">
        <Hamburger />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.dns-page-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: var(--header-height);
  @media screen and (min-width: 576px) {
    height: var(--header-height);
  }
  transition: all .25s, padding 0.25s;
  z-index: 200;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-header-background);
  line-height: 1;
  box-shadow: 0 0 0.625rem 0 rgba(0, 0, 0, 0.4);
  .dns-branding {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
    flex-wrap: nowrap;
    text-decoration: none;
    color: var(--color-text);
    .dns-logo-container {
      flex-basis: 4rem;
      display: flex;
      height: calc(var(--header-height) - 2rem);
      transition: all 0.25s;
      justify-content: flex-start;
      align-items: center;
      .dns-navbar-logo {
        display: block;
        width: 3.2rem;
        height: auto;
        @media screen and (min-width: 576px) {
          height: calc(var(--header-height) - 1.25rem);
          width: 5.0rem;
        }
      }
    }
  }

  .dns-main-navigation {
    display: none;
    @media (min-width: 1200px) {
      display: flex;
      align-items: center;
      ul {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        margin: 0;
        padding: 0;
        list-style: none;
        li {
          margin: 0;
          padding: 0;
          a {
            display: block;
            padding: .7rem;
            text-decoration: none;
            color: var(--color-text);
            transition: all 0.25s;
            &:hover,
            &:focus,
            &:active,
            &.router-link-exact-active:hover,
            &.router-link-exact-active:focus,
            &.router-link-exact-active:active {
              color: var(--color-text-inverted);
              background-color: var(--color-navigation-background-hover);
            }
            &.router-link-exact-active,
            &.router-link-exact-active,
            &.router-link-exact-active {
              // color: var(--color-text-inverted);
              color: var(--color-navigation-text-active);
              background-color: var(--color-navigation-background-active);
            }
          }
        }
      }
    }
  }
}
.dns-site-title-container {
  flex: 1;
  margin-left: 0.5rem;

  .dns-site-title {
    font-weight: 700;
    font-size: .9rem;
    line-height: 1.1;
    transition: all 0.25s;

    @media screen and (min-width: 576px) {
      font-size: 1.5rem;
      line-height: 1.25;
    }
  }
  .dns-site-subtitle {
    font-size: .75rem;
    font-weight: 400;
    transition: all 0.25s;
  }

  @media screen and (min-width: 576px) {
    margin-left: 0.5rem;
  }
}
@media screen and (min-width: 576px) {
  header.scrolled {
    .dns-logo-container {

    }
    .dns-site-title-container {
      .dns-site-title {
        font-size: 1rem;
      }
      .dns-site-subtitle {
        font-size: .75rem;
      }
    }
  }
  header {
    .dns-site-title-container {
      .dns-site-title {

        font-size: 1.5rem;
        line-height: 1.5;
      }
      .dns-site-subtitle {
        font-size: 1.125rem;
        line-height: 1;
      }
    }
  }

  .scrolled {
    height: var(--header-height-scrolled);
    .dns-branding {
      .dns-logo-container {


        .dns-navbar-logo {
          width: 3.25rem;
        }
      }
    }
  }
}
@media screen and (min-width: 1400px) {
  header.scrolled {
    .dns-logo-container {

    }
    .dns-site-title-container {
      .dns-site-title {
        font-size: 1.125rem;
      }
      .dns-site-subtitle {
        font-size: .875rem;
      }
    }
  }
  header {
    .dns-site-title-container {
      .dns-site-title {

        font-size: 1.5rem;
        line-height: 1.5;
      }
      .dns-site-subtitle {
        font-size: 1.125rem;
        line-height: 1;
      }
    }
  }

  .scrolled {
    height: var(--header-height-scrolled);
    .dns-branding {
      .dns-logo-container {


        .dns-navbar-logo {
          width: 4rem;
        }
      }
    }
  }
}
.controls-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-basis: 4rem;
  @media screen and (min-width: 576px) {
    flex-basis: auto;
    .dns-navbar-controls {
      margin-right: 1rem;
    }
  }
  .locale-switch {
    // min-width: 6rem;
    white-space: nowrap;
    text-align: right;
    font-size: .875rem;
    color: var(--color-text);
    a {
      text-decoration: none;
      color: var(--color-text);
      transition: all 0.25s;
      &:hover,
      &:focus,
      &:active {
        color: var(--color-text-inverted);
        background-color: var(--color-navigation-background-hover);
      }
    }
  }
}
</style>

