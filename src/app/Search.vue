<template>
  <form class="search-container" @submit.prevent="searchSubmit">
    <input
      v-model="searchInput"
      style="pointer-events: all"
      type="text"
      placeholder="Search Pool Ticker"
    />
  </form>
</template>

<script lang="ts">
import {defineComponent, inject, nextTick, ref} from 'vue';
import {GlobeInstance} from 'globe.gl';
import Fuse from 'fuse.js';
import {worldPoolPointOfView} from '../common';

export default defineComponent({
  name: 'Search',
  setup: (_, {emit}) => {
    const searchInput = ref('');
    const world = inject<GlobeInstance>('world');
    const data = inject<WorldData[]>('data');

    if (!world || !data) throw new Error('must have world and data');

    const fuse = new Fuse(data, {keys: ['text', 'label']});
    const searchSubmit = async () => {
      const found = fuse.search(searchInput.value)[0]?.item;
      if (!found) return;
      emit('update:foundPool', found);
      await nextTick();
      worldPoolPointOfView(world, found);
    };

    return {searchInput, searchSubmit};
  },
});
</script>

<style scoped>
.search-container {
  grid-area: search;
  align-self: start;
  justify-self: start;
  margin: 1rem;
}
</style>
