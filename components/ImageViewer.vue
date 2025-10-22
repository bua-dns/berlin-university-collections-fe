<script setup>
// DEV: find solution for dynamic alt image property!
/* Used auto-imported composables: projectConfig */

// implementation note: make sure to pass an array of image filenames to the images prop, even if there is only one image

const props = defineProps({
  images: { // expects directus download filenames with extension
    type: Array
  },
  startImage: {
    type: String,
    default: '0'
  },
  previewImage: {
    type: String,
    default: '0'
  },
  previewMode: { // 'gallery' or 'single'
    type: String,
    default: 'single'
  },
  previewImageWidth: { // width of preview image in pixels
    type: String,
    default: '240'
  },
  fourInARow: { // only for gallery mode, if true, forces 4 images in a row
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['close']);
const theme = useState('theme');
const w = theme.value.data.wording.de;
const numImages = ref(props.images.length);
const currentImage = ref(props.startImage || 0);

function getPreview() {
  let previewImageNumber = parseInt(props.previewImage) || 0;
  if(
    props.images.length > 0 &&
    props.previewImage !== undefined &&
    props.previewMode === 'single'
  ) {
    return props.images[previewImageNumber]
  }
  return props.images[0];
}
function openLightbox(index) {
  currentImage.value = index;
  showLightbox.value = true;
}
const showLightbox = ref(false);

// close lightbox on escape key
const closeLightbox = (e) => {
  if (e.key === "Escape") {
    showLightbox.value = false;
  }
};
onMounted(() => {
  window.addEventListener('keydown', closeLightbox);
});
onUnmounted(() => {
  window.removeEventListener('keydown', closeLightbox);
});

// construct image url from dynamic and static, project-specific parts
// size: 'preview' or 'full' for lightbox
function composeImageUrl(image, size) {
  let keyParam = '';
  if (size === 'preview') keyParam = '?key=preview-image';
  if (size === 'full') keyParam = '?key=light-box-image';
  return `${projectConfig.imageBaseUrl}/${image}${keyParam}`;
}
function getPreviewImageStyles() {
  if(props.previewMode !== 'single') return '';
  return `width: ${props.previewImageWidth || 240}px;`;
}
function getPreviewImageGridStyles() {
  if(props.previewMode !== 'gallery') return '';
  if(props.fourInARow) return 'grid-template-columns: repeat(4, 1fr);';
  return `grid-template-columns: repeat(auto-fill, minmax(${props.previewImageWidth || 220}px, 250px));`;
}
</script>

<template>
  <div class="image-viewer-component">
    <template v-if="props.previewMode === 'single' || !props.previewMode">
      <div class="preview-single">
        <img @click="openLightbox(0)"
          :src="composeImageUrl(getPreview(), 'preview')"
          alt=""
          :style="getPreviewImageStyles()"
        >
      </div>
    </template>
    <template v-if="props.previewMode === 'gallery'">
      <div class="previews-gallery" :style="getPreviewImageGridStyles()">
        <img v-for="(image, index) in props.images"
          :key="index"
          :src="composeImageUrl(image, 'preview')"
          alt=""
          @click="openLightbox(index)"
        >
      </div>
    </template>
    <Teleport to="body">
      <div v-if="showLightbox" class="lightbox">
          <div class="lightbox-close" @click="showLightbox = false">
            <svg class="icon" width="24" height="24" fill="currentColor">
              <use xlink:href="@/assets/img/bootstrap-icons.svg#x"></use>
            </svg>
          </div>
          <div class="lightbox-nav" v-if="numImages > 1">
            <div class="lightbox-prev" @click="currentImage = (currentImage - 1 + numImages) % numImages">
              <div class="icon-container">
                <svg class="icon" width="24" height="24" fill="currentColor">
                  <use xlink:href="@/assets/img/bootstrap-icons.svg#chevron-left"></use>
                </svg>
              </div>
            </div>
            <div class="lightbox-next" @click="currentImage = (currentImage + 1) % numImages">
              <div class="icon-container">
                <svg class="icon" width="24" height="24" fill="currentColor">
                  <use xlink:href="@/assets/img/bootstrap-icons.svg#chevron-right"></use>
                </svg>
              </div>
            </div>
          </div>
          <div class="lightbox-content" style="color: white;">
            <img :src="composeImageUrl(images[currentImage], 'full')">
          </div>
        </div>
    </Teleport>
  </div>

</template>

<style lang='scss'>
.image-viewer-component {

  // general behavior of img elements
  img {
    display: block;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.05);
    }
  }
  // previewMode: single
  .preview-single {
    img {
      width: 100%;
    }
  }
  // previewMode: gallery
  .previews-gallery {
    display: grid;
    // grid template columns: defined dynamically at element level
    gap: 1rem;
    img {
      width: 100%;
    }
  }
}
</style>