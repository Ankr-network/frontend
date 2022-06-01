import { RequestAction } from '@redux-requests/core';
import BigNumber from 'bignumber.js';
import { push } from 'connected-react-router';
import { createAction as createSmartAction } from 'redux-smart-actions';
import { IStoreState } from 'store';

import { TStore } from 'modules/common/types/ReduxRequests';

import { AvalancheSDK } from '../api/AvalancheSDK';
import { RoutesConfig } from '../Routes';
import { TAvaxSyntToken } from '../types';

import { fetchStats } from './fetchStats';
import { fetchTxHistory } from './fetchTxHistory';

interface IRes {
  data: void;
}

interface IStakeArgs {
  amount: BigNumber;
  token: TAvaxSyntToken;
}

export const stake = createSmartAction<RequestAction<void, void>, [IStakeArgs]>(
  'avax/stake',
  ({ amount, token }): RequestAction => ({
    request: {
      promise: (async (): Promise<{ txHash: string }> => {
        const sdk = await AvalancheSDK.getInstance();

        return sdk.stake(amount);
      })(),
    },
    meta: {
      asMutation: true,
      showNotificationOnError: true,
      onSuccess: (
        response,
        _action: RequestAction,
        store: TStore<IStoreState>,
      ): IRes => {
        store.dispatchRequest(fetchStats());
        store.dispatchRequest(fetchTxHistory());

        if (response.data.txHash) {
          store.dispatch(
            push(
              RoutesConfig.stakeSteps.generatePath({
                txHash: response.data.txHash,
                tokenOut: token,
              }),
            ),
          );
        }

        return response;
      },
    },
  }),
);
