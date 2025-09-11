<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: { type: [Object, Array, String, Number, Boolean], required: true },
  label: { type: String, default: 'JSON' },
  pretty: { type: Boolean, default: true },
  feedbackMs: { type: Number, default: 1500 },
})

const status = ref('')
let timer = null

async function copy() {
  if (!import.meta.client) return

  const text = props.pretty
    ? JSON.stringify(props.data, null, 2)
    : JSON.stringify(props.data)

  try {
    await navigator.clipboard.writeText(text)
    show('In Zwischenablage kopiert!')
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.top = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      show('In Zwischenablage kopiert!')
    } catch {
      show('Kopieren fehlgeschlagen')
    }
  }
}

function show(msg) {
  status.value = msg
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (status.value = ''), props.feedbackMs)
}
</script>

<!-- components/CopyJsonButton.vue -->
<template>
  <div class="copy-json-button">
    <button type="button" @click="copy" class="btn btn-primary btn-download" :title="`Copy ${label} to clipboard`">
      {{ label }}
    </button>

    <!-- absolute feedback -->
    <div v-if="status" class="feedback" aria-live="polite" role="status">
      {{ status }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.copy-json-button {
  position: relative;
}
.feedback {
  position: absolute;
  top: 105%;
  font-size: 0.75rem;
  color: #4b5563; // Tailwind gray-600 equivalent
  white-space: nowrap;
}
</style>
