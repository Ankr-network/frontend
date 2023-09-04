import { IApiUserGroupParams, IGetWhitelistParamsResponse } from 'multirpc-sdk';

import { selectJwtTokens } from 'domains/jwtToken/store/selectors';
import { MultiService } from 'modules/api/MultiService';
import { RootState } from 'store';
import { web3Api } from 'store/queries';
import { createNotifyingQueryFn } from 'store/utils/createNotifyingQueryFn';

import { WhiteListItem } from '../types';

export const {
  useLazyFetchAllWhitelistsQuery,

  endpoints: { fetchAllWhitelists },
} = web3Api.injectEndpoints({
  endpoints: build => ({
    fetchAllWhitelists: build.query<
      IGetWhitelistParamsResponse[],
      IApiUserGroupParams
    >({
      queryFn: createNotifyingQueryFn(async ({ group }, { getState }) => {
        const service = MultiService.getService().getAccountingGateway();

        const projects = selectJwtTokens(getState() as RootState);

        const whitelists = await Promise.all(
          projects.map(projectItem =>
            service.getWhitelist({
              token: projectItem.userEndpointToken,
              type: WhiteListItem.all,
              group,
            }),
          ),
        );

        return { data: whitelists };
      }),
    }),
  }),
});
