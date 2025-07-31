import { defineStore } from "pinia"
import { ref } from "vue"

export const useMineralStore = defineStore("mineral", () => {
  const currentMineral = ref(null)

  function setMineral(mineral) {
    currentMineral.value = mineral
  }

  return { currentMineral, setMineral }
})
