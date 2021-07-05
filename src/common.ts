import {GlobeInstance} from 'globe.gl';

export const LABEL_SIZE = 0.08;
export const BLOCK_PRODUCTION_RATE_SECONDS = 20;

export const mutateWorldData = (
  data: WorldData[],
  indexMap: IndexMap,
  id: string,
  mod: Partial<WorldData>
) => {
  const foundIndex: number | undefined = indexMap[id];
  if (foundIndex === undefined) return;
  const item = {...data[foundIndex], ...mod};
  return data.splice(foundIndex, 1, item)?.[0];
};

export const lovelaceToAda = (n: string | number) => {
  const valStr = String(n);
  if (valStr === '0' || valStr.length < 6) return 0;
  return parseFloat(valStr.slice(0, -6));
};

export const worldDataFromIndex = (data: WorldData[], indexMap: IndexMap) => (
  poolId: string
): WorldData | undefined => {
  return data[indexMap[poolId]];
};

export const worldPoolPointOfView = (
  world: GlobeInstance,
  pool: WorldData,
  isGround: boolean = false
) => {
  const cameraDelta = isGround ? 0 : Math.pow(0.9, pool.level);
  const altitude = isGround ? 0.618 : pool.level + 0.1;
  world.pointOfView(
    {
      lat: pool.lat - cameraDelta,
      lng: pool.lng - cameraDelta,
      altitude,
    },
    3000
  );
};
