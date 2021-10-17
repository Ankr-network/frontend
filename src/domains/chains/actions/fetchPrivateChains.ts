import { RequestAction } from '@redux-requests/core';
import { createAction as createSmartAction } from 'redux-smart-actions';
import { IJwtToken } from '@ankr.com/multirpc';

import { MultiService } from '../../../modules/api/MultiService';
import {
  IApiChain,
  IFetchChainsResponseData,
  mapChains,
} from '../api/queryChains';
import { credentialsGuard } from '../../../modules/auth/utils/credentialsGuard';

export const fetchPrivateChains = createSmartAction<
  RequestAction<IFetchChainsResponseData, IApiChain[]>
>('chains/fetchPrivateChains', () => ({
  request: {
    promise: async (jwtToken: IJwtToken) => {
      const { service } = MultiService.getInstance();

      const chains = await service.fetchPrivateUrls(jwtToken);

      return {
        chains,
      };
    },
  },
  meta: {
    asMutation: false,
    getData: mapChains,
    onRequest: credentialsGuard,
  },
}));
