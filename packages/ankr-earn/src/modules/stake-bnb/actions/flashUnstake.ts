import BigNumber from 'bignumber.js';
import { push } from 'connected-react-router';

import { IWeb3SendResult } from '@ankr.com/provider';

import { queryFnNotifyWrapper, web3Api } from 'modules/api/web3Api';
import { getUnstakeDate } from 'modules/stake/actions/getUnstakeDate';

import { CacheTags } from '../const';
import { RoutesConfig } from '../Routes';
import { TBnbSyntToken } from '../types';
import { getBinanceSDK } from '../utils/getBinanceSDK';
import { onError } from '../utils/onError';

interface IUnstakeArgs {
  amount: BigNumber;
  token: TBnbSyntToken;
}

export const { useFlashUnstakeBNBMutation } = web3Api.injectEndpoints({
  endpoints: build => ({
    flashUnstakeBNB: build.mutation<IWeb3SendResult, IUnstakeArgs>({
      queryFn: queryFnNotifyWrapper<IUnstakeArgs, never, IWeb3SendResult>(
        async ({ amount, token }) => {
          const sdk = await getBinanceSDK();

          return { data: await sdk.flashUnstake(amount, token) };
        },
        onError,
      ),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        return queryFulfilled.then(response => {
          const { transactionHash } = response.data;
          const { token } = args;

          if (transactionHash) {
            const path = RoutesConfig.flashUnstakeSuccess.generatePath(
              token,
              response.data.transactionHash,
            );

            dispatch(getUnstakeDate());

            dispatch(push(path));
          }
        });
      },
      invalidatesTags: [CacheTags.common],
    }),
  }),
});
