/* istanbul ignore file */
import {
  AvailableWriteProviders,
  AvailableReadProviders,
} from '@ankr.com/provider';

import { isMainnet } from '../common';

export const AVALANCHE_WRITE_PROVIDER_ID =
  AvailableWriteProviders.ethCompatible;

export const AVALANCHE_READ_PROVIDER_ID = isMainnet
  ? AvailableReadProviders.avalancheChain
  : AvailableReadProviders.avalancheChainTest;

export const AVAX_DECIMALS = 18;
export const AVAX_SCALE_FACTOR = 1e18;

export const AVAX_MAX_BLOCK_RANGE = 3_000;

// Note: 750_000 blocks = ~26 days
export const AVAX_MAX_HISTORY_RANGE = AVAX_MAX_BLOCK_RANGE * 250;

export const AVAX_MAX_PARALLEL_REQ = 100;
