import BigNumber from 'bignumber.js';
import { IWeb3SendResult } from '@ankr.com/provider';
import { Web3Address } from 'multirpc-sdk';

import { GetState } from 'store';
import { web3Api } from 'store/queries';
import { createWeb3NotifyingQueryFn } from 'store/utils/createNotifyingQueryFn';
import { createQueryFnWithWeb3ServiceGuard } from 'store/utils/createQueryFnWithWeb3ServiceGuard';
import { setTopUpTransaction } from 'domains/account/store/accountTopUpSlice';
import { ECurrency } from 'modules/billing/types';

import { getCurrentTransactionAddress } from '../../utils/getCurrentTransactionAddress';

interface IDepositForUserUSDTRequestParams {
  tokenDecimals: number;
  amount: BigNumber;
  depositContractAddress: Web3Address;
  tokenAddress: Web3Address;
  targetAddress: Web3Address;
}

export const {
  endpoints: { topUpDepositForUserUSDT },
  useLazyTopUpDepositForUserUSDTQuery,
} = web3Api.injectEndpoints({
  endpoints: build => ({
    topUpDepositForUserUSDT: build.query<
      IWeb3SendResult | null,
      IDepositForUserUSDTRequestParams
    >({
      queryFn: createQueryFnWithWeb3ServiceGuard({
        queryFn: createWeb3NotifyingQueryFn(
          async ({
            params: {
              tokenDecimals,
              amount,
              targetAddress,
              depositContractAddress,
              tokenAddress,
            },
            web3Service,
          }) => {
            const depositResponse = await web3Service
              .getUsdtContractService({
                depositContractAddress,
                tokenAddress,
              })
              .depositUSDTToPAYGForUser(
                amount,
                tokenDecimals,
                targetAddress,
                tokenAddress,
                depositContractAddress,
              );

            return { data: depositResponse };
          },
        ),
        fallback: { data: null },
      }),
      onQueryStarted: async (_args, { getState, dispatch, queryFulfilled }) => {
        const { data: depositResponse } = await queryFulfilled;

        const address = getCurrentTransactionAddress(getState as GetState);

        if (depositResponse?.transactionHash) {
          dispatch(
            setTopUpTransaction({
              address,
              topUpTransactionHash: depositResponse.transactionHash,
              currency: ECurrency.USDT,
            }),
          );
        }
      },
    }),
  }),
});
