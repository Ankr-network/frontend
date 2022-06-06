import { RequestAction } from '@redux-requests/core';
import BigNumber from 'bignumber.js';
import { createAction } from 'redux-smart-actions';

import { withStore } from 'modules/common/utils/withStore';

import { BinanceSDK, IGetTxReceipt } from '../api/BinanceSDK';

export interface IGetTXData {
  amount: BigNumber;
  isPending: boolean;
  destinationAddress?: string;
}

export const getTxData = createAction<RequestAction<IGetTXData, IGetTXData>>(
  'bnb/getTxData',
  ({ txHash }: { txHash: string }) => ({
    request: {
      promise: async (): Promise<IGetTXData> => {
        const sdk = await BinanceSDK.getInstance();

        return sdk.fetchTxData(txHash);
      },
    },
    meta: {
      asMutation: false,
      showNotificationOnError: true,
      onRequest: withStore,
    },
  }),
);

const POLL_INTERVAL_SECONDS = 3;

export const getTxReceipt = createAction<
  RequestAction<IGetTxReceipt, IGetTxReceipt>
>('bnb/getTxReceipt', ({ txHash }: { txHash: string }) => ({
  request: {
    promise: (async () => null)(),
  },
  meta: {
    asMutation: false,
    showNotificationOnError: true,
    poll: POLL_INTERVAL_SECONDS,
    getData: data => data,
    onRequest: request => {
      request.promise = BinanceSDK.getInstance().then(sdk =>
        sdk.fetchTxReceipt(txHash),
      );

      return request;
    },
  },
}));
