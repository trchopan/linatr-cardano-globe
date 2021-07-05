<template>
  <form class="search-container" @submit.prevent="searchSubmit">
    <input
      v-model="searchInput"
      style="pointer-events: all"
      type="text"
      placeholder="Search Pool Ticker"
    />
    <button
      @click="toggleShowFoundOnly"
      :class="showFoundOnly ? 'btn-on' : ''"
      type="button"
    >
      Show Only Found pool
    </button>
  </form>
</template>

<script lang="ts">
import {defineComponent, inject, ref} from 'vue';
import {GlobeInstance} from 'globe.gl';
import Fuse from 'fuse.js';

export default defineComponent({
  name: 'Search',
  setup: (_, {emit}) => {
    const world = inject<GlobeInstance>('world');
    const data = inject<WorldData[]>('data');

    if (!world || !data) throw new Error('must have world and data');

    const searchInput = ref('');
    const showFoundOnly = ref(false);

    const fuse = new Fuse(data, {keys: ['text', 'label']});
    const searchSubmit = async () => {
      const found = fuse.search(searchInput.value)[0]?.item;
      emit('update:foundPool', found || null);
    };

    const toggleShowFoundOnly = () => {
      showFoundOnly.value = !showFoundOnly.value;
      emit('showFoundOnly', showFoundOnly.value);
    };

    return {
      searchInput,
      searchSubmit,
      showFoundOnly,
      toggleShowFoundOnly,
    };
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

.search-container > button {
  pointer-events: all;
}
</style>
