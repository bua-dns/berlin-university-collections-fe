<script setup>

const counter = useState('counter', () => {
  return {
    list1: ['term1'],
    list2: ['term1']
  }
})

</script>

<template>

  <div class="page image-listing-page" v-if="true">
    <section class="cms-page">
      <h1 class="text-center page-header">workbench</h1>
      <div>
        List 1: {{ counter.list1 }}
      </div>
      <div>
        List 2: {{ counter.list2 }}
      </div>
      <TestComponent store="counter"/>

      <div class="dev-outs" v-if="false">
        counter: <br>
        {{ counter }}
      </div>
      <!-- <DEVDisplayUseStore /> -->
    </section>
  </div>
</template>

<style lang='scss'>
button {
  display: block;
  margin: 1rem
}
.image-listing-page {
  .listing {
    .entry {
      scroll-margin-top: 88px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      @media screen and (min-width: 768px) {
        flex-direction: row;
        gap: 2.5rem;
      }

      .image-part {
        flex: 1;

        img {
          width: 100%;
          height: auto;
        }

        .credits {
          font-size: var(--font-size-text-extra-small);
        }
      }

      .text-part {
        flex: 1;
        font-size: var(--font-size-text-small);

        .description {
          font-size: var(--font-size-text-small);

          p {
            margin: 0;
          }
        }

        .link {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0.5rem;
        }
      }
    }
  }
}
</style>

