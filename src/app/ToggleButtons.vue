<template>
  <div class="buttons-container">
    <button @click="toggleAutoRotate" :class="shouldRotate ? 'btn-on' : ''">
      Rotate ({{ shouldRotate ? 'On' : 'Off' }})
    </button>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, ref} from 'vue';
import {GlobeInstance} from 'globe.gl';

export default defineComponent({
  name: 'ToggleButtons',
  setup: () => {
    const world = inject<GlobeInstance>('world');
    const shouldRotate = ref(false);

    if (!world) throw new Error('must have world and data');

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
