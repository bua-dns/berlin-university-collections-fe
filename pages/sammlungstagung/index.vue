<script setup>
// const theme = useState("theme")
const { locale } = useI18n();
// const w = computed(() => theme.value.data.wording[locale.value]);

const slug = 'programm-sammlungstagung-2025';
const { data } = await useFetchPage(slug)
const page = data.value.data[0]
const content = ref('');
const sidebarContent = useGetTranslatedContent('sidebar_content', locale, page);

onBeforeMount(() => {
  content.value = useMakeDetails(useGetTranslatedContent('page_content', locale, page), 'H1');
});
</script>

<template>
  <Head>
    <Title>{{ useGetTranslatedContent('title', locale, page) }}</Title>
  </Head>
  <div class="page collection-conference-2025" v-if="data">
    <pre v-if="false">{{ content }}</pre>
    <h1 class="page-header text-center mb-5">{{ useGetTranslatedContent('title', locale, page) }}</h1>
    <ClientOnly>
      <template v-if="!page.display_sidebar">
        <div v-if="content" class="page-content" v-html="content" />
      </template>
      <template v-if=" page.display_sidebar">
        <div class="page-container">
          <div v-if="content" class="page-content" v-html="content" />
          <div class="sidebar">
            <div class="mb-5 sidebar-header" v-if="page.sidebar_header_image">
              <img :src="projectConfig.imageBaseUrl + '/' + page.sidebar_header_image + '?key=sidebar-header-contain'"
                alt="sidebar image" />
            </div>
            <div class="sidebar-content" v-if="sidebarContent" v-html="sidebarContent" />
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style lang='scss'>
.collection-conference-2025 {

  .page-container {
    display: block;

    .page-content {

      > h2 {
        margin: 2rem 0 2rem 0;
        text-align: center;
      }

      .btn:hover,
      .btn:focus {
        text-decoration: none;
        color: var(--bs-btn-hover-color);
      }

      // Program section dropdowns
      .program-section {
        margin-bottom: 1.5rem;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: box-shadow 0.2s ease;

        &:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .program-dropdown {
        summary {
          list-style: none;
          cursor: pointer;
          padding: 1.25rem;
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          position: relative;

          &::-webkit-details-marker {
            display: none;
          }

          &::before {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-chevron-right' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708'/%3E%3C/svg%3E");
            margin-right: 0.75rem;
            font-size: 0;
            color: #6c757d;
            transition: transform 0.2s ease;
            display: inline-block;
          }

          &:hover {
            background-color: #e9ecef;
            border-bottom-color: #adb5bd;
          }

          h1 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #212529;
          }
        }

        &[open] summary::before {
          transform: rotate(90deg);
        }

        .program-dropdown-content {
          padding: 1.5rem;
          background-color: white;
          border-top: none;
          overflow-x: auto;

          h2 {
            margin-top: 0;
            // margin-bottom: 1.25rem;
            font-size: 1.05rem;
            font-weight: 600;
            color: #495057;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e9ecef;
          }

          h3 {
            margin: 1.5rem 0 0.5rem;
          }

          p {
            margin: 0.5rem 0 1rem;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            // margin-bottom: 1.5rem;
            background-color: white;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

            td {
              padding: 1rem 0.75rem;
              border-bottom: 1px solid #f1f3f4;
              border-right: 1px solid #f1f3f4;
              vertical-align: top;
              line-height: 1.5;

              &:first-child {
                font-weight: 600;
                background-color: #f8f9fa;
                color: #495057;
                white-space: nowrap;
                width: 150px;
                border-right: 1px solid #e9ecef;
              }

              &:last-child {
                border-right: none;
              }

              strong {
                color: #212529;
              }

              a {
                color: #0d6efd;
                text-decoration: none;

                &:hover {
                  text-decoration: underline;
                }
              }

              em {
                // color: #6c757d;
                font-style: italic;
              }
            }

            tr:last-child td {
              border-bottom: none;
            }

            tr:hover {
              background-color: #f8f9fa;
            }
          }

          hr {
            border: none;
            height: 1px;
            background-color: #dee2e6;
            margin: 2rem 0;
          }
        }
      }
    }

    .sidebar {
      font-size: var(--font-size-text-small);

      .sidebar-header {
        display: block;
      }
    }
  }
}

@media screen and (min-width: 768px) {
  .collection-conference-2025 {
    .page-container {
      display: flex;
      gap: 2.5rem;

      .page-content {
        flex: 2;

        .program-dropdown-content {
          table td:first-child {
            width: 200px;
          }
        }
      }

      .sidebar {
        flex: 1;

        .sidebar-header {
          display: block;
        }
      }
    }
  }
}
</style>
