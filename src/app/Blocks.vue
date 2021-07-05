<template>
  <div class="blocks-container">
    <div v-show="showBlocksList" class="block-list">
      <div v-for="(b, i) in blocks" :key="b.slotNo" class="block-row">
        <div># {{ b.epochNo }}/{{ b.slotNo }}</div>
        <div
          class="ticker-link"
          :style="{color: getBlockColor(i, blocks.length)}"
          @click="onClickPool(b.pool_id)"
        >
          <b>{{ getPoolTicker(b.pool_id) }}</b>
        </div>
        <div>{{ b.createdAt }} UTC</div>
        <div>Txs: {{ b.transactionsCount }}</div>
        <a :href="linkWithUtm(b.createdByInfo)" target="_blank">
          link
        </a>
      </div>
    </div>
    <div class="blocklist-buttons-container">
      <button
        @click="toggleAutoFetchBlock"
        :class="autoFetchBlocks ? 'btn-on' : ''"
      >
        Fetch Blocks ({{
          autoFetchBlocks ? fetchBlocksCountdown + 's' : 'Off'
        }})
      </button>
      <button v-if="blocks.length" @click="showBlocksList = !showBlocksList">
        {{ showBlocksList ? 'Hide' : 'Show' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import {ref, defineComponent, inject} from 'vue';
import {interpolateOranges} from 'd3';
import {
  BLOCK_PRODUCTION_RATE_SECONDS,
  worldDataFromIndex,
  worldPoolPointOfView,
} from '../common';
import {GlobeInstance} from 'globe.gl';

export default defineComponent({
  name: 'Blocks',
  setup: (_, {emit}) => {
    const world = inject<GlobeInstance>('world');
    const data = inject<WorldData[]>('data');
    const dataIndexMap = inject<IndexMap>('map');
    if (!world || !data || !dataIndexMap)
      throw new Error('must have world and data');

    const autoFetchBlocks = ref(false);
    const showBlocksList = ref(false);
    const blocks = ref<BlockDetail[]>([]);
    const fetchBlocksCountdown = ref(0);

    const toggleAutoFetchBlock = () => {
      autoFetchBlocks.value = !autoFetchBlocks.value;
    };

    const fetchBlocks = async () => {
      try {
        const {data} = await axios.get<BlockDetail[]>(
          'https://js.adapools.org/blocks.json'
        );
        console.log('>>> blocks', data);
        blocks.value = data;

        emit('updateBlocks', data);
      } catch (err) {
        console.error('cannot get blocks', err);
      }
    };
    setInterval(async () => {
      if (autoFetchBlocks.value && fetchBlocksCountdown.value === 0) {
        await fetchBlocks();
        fetchBlocksCountdown.value = BLOCK_PRODUCTION_RATE_SECONDS;
      }
      if (autoFetchBlocks.value) {
        fetchBlocksCountdown.value--;
      }
    }, 1000);

    const getBlockColor = (index: number, length: number) =>
      interpolateOranges((1 - index / length) / 1.9 + 0.3);

    const getPool = worldDataFromIndex(data, dataIndexMap);
    const getPoolTicker = (poolId: string) =>
      getPool(poolId)?.text || 'no-ticker';

    const onClickPool = (poolId: string) => {
      const pool = getPool(poolId);
      console.log('>>>', poolId, pool);
      if (!pool) return;
      emit('selectPool', pool);
      worldPoolPointOfView(world, pool);
    };

    const linkWithUtm = (link: string) =>
      link + '?utm_source=globle.linatr.me&utm_medium=web';

    return {
      blocks,
      autoFetchBlocks,
      showBlocksList,
      fetchBlocksCountdown,
      toggleAutoFetchBlock,
      getBlockColor,
      dataIndexMap,
      onClickPool,
      getPoolTicker,
      linkWithUtm,
    };
  },
});
</script>

<style scoped>
.blocks-container {
  pointer-events: all;
  grid-area: blocks;
  align-self: end;
  justify-self: start;
  margin: 1rem;
}

.block-list {
  max-height: 20rem;
  overflow-y: scroll;
}

.block-row {
  display: grid;
  grid-gap: 0.5em;
  grid-template-columns: 5.5rem 4rem 12rem 4.5rem 1.5rem;
  padding: 0.3rem 0.5rem;
  background: black;
  color: #ffaf00;
}

.ticker-link {
  cursor: pointer;
}

.blocklist-buttons-container {
  display: flex;
}
</style>
