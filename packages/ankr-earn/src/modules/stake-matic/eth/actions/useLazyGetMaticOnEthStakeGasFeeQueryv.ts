import { t } from '@ankr.com/common';
import BigNumber from 'bignumber.js';

import { getOnErrorWithCustomText } from 'modules/api/utils/getOnErrorWithCustomText';
import { queryFnNotifyWrapper, web3Api } from 'modules/api/web3Api';
import { TMaticSyntToken } from 'modules/stake-matic/common/types';

import { getPolygonOnEthereumSDK } from '../utils/getPolygonOnEthereumSDK';

interface IGetStakeGasFeeProps {
  amount: BigNumber;
  token: TMaticSyntToken;
}

export const { useLazyGetMaticOnEthStakeGasFeeQuery } = web3Api.injectEndpoints(
  {
    endpoints: build => ({
      getMaticOnEthStakeGasFee: build.query<BigNumber, IGetStakeGasFeeProps>({
        queryFn: queryFnNotifyWrapper<IGetStakeGasFeeProps, never, BigNumber>(
          async ({ amount, token }) => {
            const sdk = await getPolygonOnEthereumSDK();

            return { data: await sdk.getStakeGasFee(amount, token) };
          },
          getOnErrorWithCustomText(
            t('stake-matic-common.errors.stake-gas-fee'),
          ),
        ),
      }),
    }),
  },
);
