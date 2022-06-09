import { RequestAction } from '@redux-requests/core';
import BigNumber from 'bignumber.js';
import { createAction as createSmartAction } from 'redux-smart-actions';
import { IStoreState } from 'store';

import { featuresConfig } from 'modules/common/const';
import { TStore } from 'modules/common/types/ReduxRequests';
import { showNotification } from 'modules/notifications';

import { PolkadotStakeSDK } from '../api/PolkadotStakeSDK';
import { EPolkadotNetworks } from '../types';
import { getFormattedErrMsg, IError } from '../utils/getFormattedErrMsg';

import { fetchStakeStats } from './fetchStakeStats';
import { fetchTxHistory } from './fetchTxHistory';

interface IRes {
  data: void;
}

export const stake = createSmartAction<
  RequestAction<void, void>,
  [EPolkadotNetworks, BigNumber]
>(
  'polkadot/stake',
  (network, amount): RequestAction => ({
    request: {
      promise: (async (): Promise<void> => {
        const sdk = await PolkadotStakeSDK.getInstance();

        return sdk.stake(network, amount);
      })(),
    },
    meta: {
      asMutation: true,
      onError: (
        error: IError,
        _action: RequestAction,
        store: TStore<IStoreState>,
      ): Error => {
        const err = new Error(getFormattedErrMsg(error));

        store.dispatch(
          showNotification({
            message: err.toString(),
            variant: 'error',
          }),
        );

        throw err;
      },
      onSuccess: (
        response: IRes,
        _action: RequestAction,
        store: TStore<IStoreState>,
      ): IRes => {
        store.dispatchRequest(fetchStakeStats());

        if (featuresConfig.isActivePolkadotStaking) {
          store.dispatchRequest(fetchTxHistory(network));
        }

        return response;
      },
    },
  }),
);
