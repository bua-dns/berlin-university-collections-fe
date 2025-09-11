<!-- components/DownloadJsonButton.vue -->
<script setup>
const props = defineProps({
  /** The data to stringify & download */
  data: {
    type: [Object, Array, String, Number, Boolean],
    required: true,
  },
  /** Button text (defaults to "JSON") */
  label: {
    type: String,
    default: 'JSON',
  },
  /** Output file name */
  filename: {
    type: String,
    default: 'data.json',
  },
  /** Pretty-print JSON with 2-space indentation */
  pretty: {
    type: Boolean,
    default: true,
  },
})

function download() {
  if (!import.meta.client) return

  try {
    const json =
      props.pretty ? JSON.stringify(props.data, null, 2) : JSON.stringify(props.data)

    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = props.filename || 'data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Download failed:', e)
  }
}
</script>

<template>
  <button
    type="button"
    @click="download"
    class="btn btn-primary btn-download"
    :title="`Download ${label}`"
  >
    {{ label }}
  </button>
</template>
