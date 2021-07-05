<template>
  <div class="buttons-container">
    <button @click="toggleAutoRotate" :class="shouldRotate ? 'btn-on' : ''">
      Rotate ({{ shouldRotate ? 'On' : 'Off' }})
    </button>
  </div>
</template>

<script lang="ts">
import {GlobeInstance} from 'globe.gl';
import {defineComponent, inject, ref} from 'vue';

export default defineComponent({
  name: 'ToggleButtons',
  setup: () => {
    const shouldRotate = ref(false);
    const world = inject<GlobeInstance>('world');

    const toggleAutoRotate = () => {
      shouldRotate.value = !shouldRotate.value;
      (world?.controls() as any).autoRotate = shouldRotate.value;
    };

    return {
      toggleAutoRotate,
      shouldRotate,
    };
  },
});
</script>

<style scoped>
.buttons-container {
  grid-area: buttons;
  margin: 1rem;
  text-align: end;
}

.buttons-container > button {
  pointer-events: all;
}
</style>
