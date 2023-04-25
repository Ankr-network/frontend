import { Chain } from '../../types';
import { MultiService } from 'modules/api/MultiService';
import { web3Api } from 'store/queries';
import { LatestRequest } from 'multirpc-sdk';

export interface IFetchPrivateChainsInfoResult {
  chains: Chain[];
  allChains: Chain[];
}

export const {
  endpoints: { privateLatestRequests },
  useLazyPrivateLatestRequestsQuery,
} = web3Api.injectEndpoints({
  endpoints: build => ({
    privateLatestRequests: build.query<LatestRequest[], void>({
      queryFn: async () => {
        const service = MultiService.getService();

        const { user_requests: userRequests } = await service
          .getAccountGateway()
          .getLatestRequests();

        return {
          data: userRequests,
        };
      },
    }),
  }),
});
