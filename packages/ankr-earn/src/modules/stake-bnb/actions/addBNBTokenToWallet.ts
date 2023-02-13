import { t } from '@ankr.com/common';

import { getOnErrorWithCustomText } from 'modules/api/utils/getOnErrorWithCustomText';
import { queryFnNotifyWrapper, web3Api } from 'modules/api/web3Api';

import { CacheTags } from '../const';
import { TBnbSyntToken } from '../types';
import { getBinanceSDK } from '../utils/getBinanceSDK';

export const { useAddBNBTokenToWalletMutation } = web3Api.injectEndpoints({
  endpoints: build => ({
    addBNBTokenToWallet: build.mutation<boolean, TBnbSyntToken>({
      queryFn: queryFnNotifyWrapper<TBnbSyntToken, never, boolean>(
        async token => {
          const sdk = await getBinanceSDK();
          return { data: await sdk.addTokenToWallet(token) };
        },
        getOnErrorWithCustomText(t('stake-bnb.errors.add-to-wallet')),
      ),
      invalidatesTags: [CacheTags.common],
    }),
  }),
});
