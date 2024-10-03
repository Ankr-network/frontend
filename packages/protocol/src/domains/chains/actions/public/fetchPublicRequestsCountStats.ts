import { Timeframe } from 'multirpc-sdk';
import BigNumber from 'bignumber.js';
import { ChainID } from '@ankr.com/chains-list';

import { AppDispatch } from 'store';
import { MultiService } from 'modules/api/MultiService';
import { REFETCH_STATS_INTERVAL } from 'modules/common/constants/const';
import { createQueryFnWithErrorHandler } from 'store/utils/createQueryFnWithErrorHandler';
import { isReactSnap } from 'modules/common/utils/isReactSnap';
import { web3Api } from 'store/queries';

import { chainsFetchStandaloneRequests } from './fetchStandaloneRequests';
import { STANDALONE_CHAINS } from '../../utils/statsUtils';

// RTK Query will never run an endpoint if it has already been run.
// Here we have few calls of the same endpoint but with different args,
// so we have to make sure we call each of them one by one.
const fetchStandaloneStats = async (
  dispatch: AppDispatch,
  timeframe: Timeframe,
) => {
  const standaloneChains = Object.entries(STANDALONE_CHAINS);
  const results = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const [chainId, url] of standaloneChains) {
    // eslint-disable-next-line no-await-in-loop
    const stats = await dispatch(
      chainsFetchStandaloneRequests.initiate({
        chainId: chainId as ChainID,
        url: url + timeframe,
      }),
    );

    results.push(stats);
  }

  return results;
};

// The endpoint name is listed in endpointsSerializedByParams constant
// in packages/protocol/src/store/queries/index.ts file.
// If the name has changed it should be refelected there as well.
export const { useFetchPublicRequestsCountStatsQuery } =
  web3Api.injectEndpoints({
    endpoints: build => ({
      fetchPublicRequestsCountStats: build.query<
        Record<ChainID, string>,
        Timeframe
      >({
        // overriden to keep data in cache according to refetch interval
        keepUnusedDataFor: REFETCH_STATS_INTERVAL,
        queryFn: createQueryFnWithErrorHandler({
          queryFn: async (timeframe, { dispatch }) => {
            if (isReactSnap) {
              return { data: {} };
            }

            const totalRequestsData = (
              await MultiService.getService()
                .getPublicGateway()
                .getPublicTimeframesStats(timeframe)
            ).totalRequests;

            const results = await fetchStandaloneStats(dispatch, timeframe);

            const standaloneStats = results.map(item => {
              return {
                chainId: item.data?.chainId,
                requests: item.data?.data?.totalRequests || 0,
              };
            });

            Object.keys(totalRequestsData).forEach(key => {
              if (key in STANDALONE_CHAINS) {
                const standaloneData = standaloneStats.find(
                  item => item.chainId === key,
                );

                const totalRequests = new BigNumber(totalRequestsData[key])
                  .plus(standaloneData?.requests || 0)
                  .toString();

                totalRequestsData[key] = totalRequests;
              }
            });

            return { data: totalRequestsData };
          },
          errorHandler: error => ({ error }),
        }),
      }),
    }),
    overrideExisting: true,
  });
