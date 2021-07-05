interface PoolDetail {
  poolId: string;
  live: PoolLive;
  metadata: PoolMetadata;
  relays: IPGeo[];
}

interface PoolLive {
  vrf_key: string;
  blocks_minted: number;
  live_stake: string;
  live_size: number;
  live_saturation: number;
  live_delegators: number;
  active_stake: string;
  active_size: number;
  declared_pledge: string;
  live_pledge: string;
  margin_cost: number;
  fixed_cost: string;
  reward_account: string;
  owners: string[];
  registration: string[];
  retirement: string[];
}

interface PoolMetadata {
  url: string;
  hash: string;
  ticker: string;
  name: string;
  description: string;
  homepage: string;
}

interface IPGeo {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

interface BlockDetail {
  id: string;
  epochNo: string;
  slotNo: string;
  createdAt: string;
  transactionsCount: string;
  output: string;
  fees: string;
  createdBy: string;
  createdByInfo: string;
  size: string;
  pool_id: string;
  pool: PoolDetail;
}

interface WorldData {
  poolId: string;
  lat: number;
  lng: number;
  text: string;
  label: string;
  radius: number;
  level: number;
  color: string;
  size: number;
}

interface IndexMap {
  [id: string]: number;
}
