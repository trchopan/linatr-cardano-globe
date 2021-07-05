<template>
  <div
    v-if="foundPool"
    ref="detail"
    class="detail-container"
    v-html="foundPool.label"
  ></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'LabelClick',
  props: {
    foundPool: {type: Object},
  },
});
</script>

<style scoped>
.detail-container {
  grid-area: pool;
  align-self: end;
  justify-self: end;
  margin: 1rem;
}
</style>
