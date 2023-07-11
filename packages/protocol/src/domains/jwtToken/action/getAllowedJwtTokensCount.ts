import { IApiUserGroupParams } from 'multirpc-sdk';

import { MultiService } from 'modules/api/MultiService';
import { web3Api } from 'store/queries';

export const {
  useLazyFetchAllowedJwtTokensCountQuery,
  endpoints: { fetchAllowedJwtTokensCount },
} = web3Api.injectEndpoints({
  endpoints: build => ({
    fetchAllowedJwtTokensCount: build.query<number, IApiUserGroupParams>({
      queryFn: async ({ group }) => {
        const api = MultiService.getService().getAccountGateway();

        const data = await api.getAllowedJwtTokensCount({ group });

        return { data };
      },
    }),
  }),
});
