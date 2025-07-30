<script setup>
// No props needed since all content comes via named slots
</script>

<template>
  <div class="card">
    <div class="card-image">
      <slot name="image" />
    </div>
    <div class="card-body">
      <div class="card-title">
        <slot name="title" />
      </div>
      <div class="card-meta">
        <slot name="meta" />
      </div>
    </div>
    <div class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.1rem 0.3rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
}

.card-image {
  width: 100%;
  img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
  }
}

.card-body {
  flex: 1;
  padding: 1rem;

  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .card-meta {
    font-size: 0.875rem;
    color: #666;
  }
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}
</style>
