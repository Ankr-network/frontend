import {
  EBlockchain,
  ethNetworkIdByBlockchainMap,
  getTokenPriceByChainId,
} from 'multirpc-sdk';

import { createNotifyingQueryFn } from 'store/utils/createNotifyingQueryFn';
import { createQuerySelectors } from 'store/utils/createQuerySelectors';
import { web3Api } from 'store/queries';

import { ZERO_STRING } from '../const';

export interface IFetchNativeTokenPriceParams {
  network: EBlockchain;
}

// The endpoint name is listed in endpointsSerializedByParams constant
// in packages/protocol/src/store/queries/index.ts file.
// If the name has changed it should be refelected there as well.
export const {
  endpoints: { fetchNativeTokenPrice },
  useFetchNativeTokenPriceQuery,
  useLazyFetchNativeTokenPriceQuery,
} = web3Api.injectEndpoints({
  endpoints: build => ({
    fetchNativeTokenPrice: build.query<string, IFetchNativeTokenPriceParams>({
      queryFn: createNotifyingQueryFn(async ({ network }) => {
        const chainId = ethNetworkIdByBlockchainMap[network];

        const price = await getTokenPriceByChainId(chainId);

        return { data: price ?? ZERO_STRING };
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  selectStateCachedByParams: selectNativeTokenPriceState,
  selectDataWithFallbackCachedByParams: selectNativeTokenPrice,
  selectLoadingCachedByParams: selectNativeTokenPriceLoading,
} = createQuerySelectors({
  endpoint: fetchNativeTokenPrice,
  fallback: ZERO_STRING,
});
