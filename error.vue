<script setup>
const w = {
  'de': {
    'error_404': 'Seite nicht gefunden',
    'error_500': 'Interner Serverfehler',
    'go_home': 'Zur Startseite',
  },
  'en': {
    'error_404': 'Page Not Found',
    'error_500': 'Internal Server Error',
    'go_home': 'Go to Homepage',
  }
}
const { locale } = useI18n();
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
});
const handleError = () => clearError({ redirect: '/' });
</script>
<template>
  <div class="container my-5 text-center">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="alert alert-danger" role="alert">
          <h1 class="alert-heading">{{ error?.statusCode }}</h1>
          <p class="mb-3">{{ error?.statusMessage || 'An error occurred' }}</p>
          <hr>
          <button @click="handleError" class="btn btn-primary">
            <i class="bi bi-house-door me-2"></i>{{ w[locale].go_home }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>