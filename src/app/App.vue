<template>
  <div class="container">
    <Search
      v-model:foundPool="foundPool"
      @showFoundOnly="showFoundOnly = $event"
    />
    <LabelClick :foundPool="foundPool" />
    <ToggleButtons />
    <Blocks @updateBlocks="blocks = $event" @selectPool="foundPool = $event" />
  </div>
  <!-- <div class="debug-container">foundPool: {{ foundPool && foundPool.poolId }}</div> -->
</template>

<script lang="ts">
import {defineComponent, inject, nextTick, ref, watch} from 'vue';
import {GlobeInstance} from 'globe.gl';
import Search from './Search.vue';
import LabelClick from './LabelClick.vue';
import ToggleButtons from './ToggleButtons.vue';
import Blocks from './Blocks.vue';
import {LABEL_SIZE, mutateWorldData, worldPoolPointOfView} from '../common';
import {interpolateOranges} from 'd3';

export default defineComponent({
  name: 'App',
  components: {
    Search,
    LabelClick,
    ToggleButtons,
    Blocks,
  },
  setup: () => {
    const world = inject<GlobeInstance>('world');
    const data = inject<WorldData[]>('data');
    const dataIndexMap = inject<IndexMap>('map');
    if (!world || !data || !dataIndexMap)
      throw new Error('must have world and data');

    const foundPool = ref<WorldData | null>(null);
    const blocks = ref<BlockDetail[]>([]);
    const showFoundOnly = ref(false);

    world
      .onLabelClick((e: any) => {
        foundPool.value = (e as unknown) as WorldData;
      })
      .onGlobeClick(() => {
        foundPool.value = null;
      });

    const _mutateWorldData = (poolId: string, partial: Partial<WorldData>) =>
      mutateWorldData(data, dataIndexMap, poolId, partial);

    watch(foundPool, async (curFoundPool, prevFoundPool) => {
      if (prevFoundPool) {
        const foundPrevPoolBlockIndex = blocks.value.findIndex(
          b => b.pool_id === prevFoundPool.poolId
        );
        if (foundPrevPoolBlockIndex < 0) {
          _mutateWorldData(prevFoundPool.poolId, {color: 'lightgrey'});
        } else {
          _mutateWorldData(prevFoundPool.poolId, {
            color: getBlockColor(foundPrevPoolBlockIndex, blocks.value.length),
          });
        }
      }
      if (curFoundPool) {
        _mutateWorldData(curFoundPool.poolId, {color: '#fb42a7'});
        if (showFoundOnly.value) {
          const _data = data
            .filter(p => p.poolId === curFoundPool?.poolId)
            .map(p => ({
              ...p,
              level: 0,
              size: LABEL_SIZE * 2.618,
              radius: 0.5,
            }));

          world.labelsData(_data);
          await nextTick();
          worldPoolPointOfView(world, _data[0], true);
        } else {
          world.labelsData(data);
          await nextTick();
          worldPoolPointOfView(world, curFoundPool);
        }
      }
    });

    const getBlockColor = (index: number, length: number) =>
      interpolateOranges((1 - index / length) / 1.9 + 0.3);

    watch(blocks, curBlocks => {
      if (showFoundOnly.value) return;

      curBlocks.forEach((b, i) => {
        const p = data[dataIndexMap[b.pool_id]];
        if (p !== undefined && foundPool.value?.poolId !== p.poolId) {
          _mutateWorldData(p.poolId, {
            color: getBlockColor(i, curBlocks.length),
          });
        }
      });
      world.labelsData(data);
    });

    return {foundPool, blocks, showFoundOnly};
  },
});
</script>

<style scoped>
.container {
  pointer-events: none;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 2rem;
  left: 0;
  display: grid;
  grid-template-areas:
    'search buttons'
    'blocks pool';
}
</style>
