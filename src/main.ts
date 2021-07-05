import './style.css';
import Globe from 'globe.gl';
import axios from 'axios';
import {isEmpty, last} from 'lodash';
import {createApp} from 'vue';
import App from './app/App.vue';
import {lovelaceToAda} from './common';

const LABEL_SIZE = 0.08;

(async () => {
  const downloadingDiv = document.getElementById(
    'download-process'
  ) as HTMLDivElement;
  const {data: pools} = await axios.get<PoolDetail[]>(
    'https://firebasestorage.googleapis.com/v0/b/sacred-atom-314603.appspot.com/o/Cache%2FlivePools.json?alt=media&token=c58be64e-038e-46fc-8b81-1ab1db450498',
    {
      onDownloadProgress: e => {
        if (e.loaded === e.total) {
          downloadingDiv.className = 'hide';
          return;
        }
        const percent = ((e.loaded / e.total) * 100).toFixed(0);
        downloadingDiv.innerText = `Downloading Pools Data ${percent}%`;
      },
    }
  );

  console.log(pools);

  const distance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      let radlat1 = (Math.PI * lat1) / 180;
      let radlat2 = (Math.PI * lat2) / 180;
      let theta = lon1 - lon2;
      let radtheta = (Math.PI * theta) / 180;
      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1.609344;
      return dist;
    }
  };

  const levelValue = (levels: {threshol: number; value: number}[]) => (
    val: number
  ) => {
    for (const l of levels) {
      if (val < l.threshol) {
        return l.value;
      }
    }
    return last(levels)?.value || NaN;
  };

  const adaLevelScale = 10;
  const adaSizeScale = 0.03;

  const adaSizeLevel = levelValue([
    {threshol: Math.pow(adaLevelScale, 4), value: adaSizeScale * 1},
    {threshol: Math.pow(adaLevelScale, 5), value: adaSizeScale * 2},
    {threshol: Math.pow(adaLevelScale, 6), value: adaSizeScale * 3},
    {threshol: Math.pow(adaLevelScale, 7), value: adaSizeScale * 4},
    {threshol: Math.pow(adaLevelScale, 8), value: adaSizeScale * 5},
  ]);

  const poolsWithFirstRelay = pools
    .map(p => ({
      ...p,
      relay: p.relays[0],
    }))
    .filter(p => !isEmpty(p.relays));

  let poolLatLonGroup: {
    lat: number;
    lon: number;
    pools: PoolDetail[];
  }[] = [];

  for (const p of poolsWithFirstRelay) {
    const {lat: lat1, lon: lon1} = p.relay;
    const foundLatLonIndex = poolLatLonGroup.findIndex(g => {
      const {lat: lat2, lon: lon2} = g;
      return distance(lat1, lon1, lat2, lon2) < 50;
    });
    if (foundLatLonIndex < 0) {
      poolLatLonGroup.push({
        lat: lat1,
        lon: lon1,
        pools: [p],
      });
      continue;
    }
    const pools = poolLatLonGroup[foundLatLonIndex].pools.concat(p);
    poolLatLonGroup[foundLatLonIndex].pools = pools.sort((a, b) => {
      const aStake = lovelaceToAda(a.live.active_stake);
      const bStake = lovelaceToAda(b.live.active_stake);
      return bStake - aStake;
    });
  }

  const makeLabel = (p: PoolDetail) => {
    const {ticker, name} = p.metadata;
    const {active_stake, blocks_minted} = p.live;
    const {isp, country, city} = p.relays[0];
    const activeStake = lovelaceToAda(active_stake)
      .toLocaleString()
      .split('.')[0];

    return `
<div class="pool-tooltip">
  <div>${ticker} - ${name}</div>
  <div>Active Stake: ${activeStake} ₳</div>
  <div>Block minted: ${blocks_minted}</div>
  <div>${isp}</div>
  <div>${city}, ${country}</div>
</div>
`;
  };

  const data = poolLatLonGroup.reduce((acc, cur) => {
    if (cur.lon === undefined || cur.lon === undefined) return acc;
    return acc.concat(
      cur.pools
        .filter(
          p => !!p.metadata.name && lovelaceToAda(p.live.active_stake) > 0
        )
        .map((p, index) => {
          const {ticker} = p.metadata;
          return {
            poolId: p.poolId,
            lat: cur.lat,
            lng: cur.lon,
            label: makeLabel(p),
            text: ticker,
            size: LABEL_SIZE,
            radius: adaSizeLevel(lovelaceToAda(p.live.active_stake)),
            level: index * 0.018,
            color: 'lightgrey',
            activeStake: p.live.active_stake,
            activeStakeAda: lovelaceToAda(p.live.active_stake),
          };
        })
    );
  }, [] as WorldData[]);

  console.log(data);

  const world = Globe()(document.getElementById('globe')!)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .labelText('text')
    .labelLabel('label')
    .labelSize('size')
    .labelColor('color')
    .labelDotRadius('radius')
    .labelAltitude('level');

  world.labelsData(data);

  const dataIndexMap = data.reduce((acc, cur, index) => {
    acc[cur.poolId] = index;
    return acc;
  }, {} as IndexMap);

  createApp(App)
    .provide('world', world)
    .provide('data', data)
    .provide('map', dataIndexMap)
    .mount('#app');
})();
