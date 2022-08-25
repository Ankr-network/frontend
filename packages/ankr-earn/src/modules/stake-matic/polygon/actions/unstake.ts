import { RequestAction } from '@redux-requests/core';
import BigNumber from 'bignumber.js';
import { createAction as createSmartAction } from 'redux-smart-actions';
import { IStoreState } from 'store';

import { MaticPolygonSDK } from '@ankr.com/staking-sdk';

import { TStore } from 'modules/common/types/ReduxRequests';
import { TMaticSyntToken } from 'modules/stake-matic/common/types';

import { MATIC_POLYGON_ACTIONS_PREFIX } from '../const';

import { getCommonData } from './getCommonData';
import { getUnstakeStats } from './getUnstakeStats';

interface IRes {
  data: void;
}

interface IUnstakeProps {
  amount: BigNumber;
  token: TMaticSyntToken;
}

export const unstake = createSmartAction<
  RequestAction<void, void>,
  [IUnstakeProps]
>(`${MATIC_POLYGON_ACTIONS_PREFIX}unstake`, ({ amount, token }) => ({
  request: {
    promise: (async (): Promise<void> => {
      const sdk = await MaticPolygonSDK.getInstance();

      return sdk.unstake(amount, token);
    })(),
  },
  meta: {
    asMutation: true,
    showNotificationOnError: true,
    onError: (
      error: Error,
      _action: RequestAction,
      store: TStore<IStoreState>,
    ): Error => {
      store.dispatchRequest(getCommonData());
      store.dispatchRequest(getUnstakeStats());

      throw error;
    },
    onSuccess: (
      response: IRes,
      _action: RequestAction,
      store: TStore<IStoreState>,
    ): IRes => {
      store.dispatchRequest(getCommonData());
      store.dispatchRequest(getUnstakeStats());

      return response;
    },
  },
}));
