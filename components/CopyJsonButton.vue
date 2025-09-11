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
  // ✅ modern check
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
  <div class="inline-flex items-center gap-2">
    <button
      type="button"
      @click="copy"
      class="btn btn-primary btn-download"
      :title="`Copy ${label} to clipboard`"
    >
      {{ label }}
    </button>

    <!-- brief feedback -->
    <span
      v-if="status"
      class="feedback"
      aria-live="polite"
      role="status"
    >
      {{ status }}
    </span>
  </div>
</template>
<style scoped lang="scss">
.feedback {
  font-size: 0.875rem;
  padding-left: 0.5rem;
}
</style>