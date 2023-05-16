import { EthAddressType } from 'multirpc-sdk';
import { push } from 'connected-react-router';

import { GetState, RootState } from 'store';
import { TwoFAQueryFnParams } from 'store/queries/types';
import {
  getTrackingParams,
  trackLoginSuccess,
} from './loginByGoogleSecretCodeUtils';
import { createQueryFnWithErrorHandler } from 'store/utils/createQueryFnWithErrorHandler';
import { loginSyntheticJwt } from './loginSyntheticJwtToken';
import { loginUserJwt } from './loginUserJwt';
import { trackWeb2SignUpFailure } from 'modules/analytics/mixpanel/trackWeb2SignUpFailure';
import { userSettingsGetActiveEmailBinding } from 'domains/userSettings/actions/email/getActiveEmailBinding';
import { web3Api } from 'store/queries';
import { ChainsRoutesConfig } from 'domains/chains/routes';
import { oauthLoginByGoogleSecretCode } from './loginByGoogleSecretCode';

export type EmptyObject = Record<string, unknown>;

export interface OauthLoginByGoogleSecretCodeParams {
  group?: string;
}

export const {
  endpoints: { oauthLoginJwt },
  useLazyOauthLoginJwtQuery,
} = web3Api.injectEndpoints({
  endpoints: build => ({
    oauthLoginJwt: build.query<
      EmptyObject,
      TwoFAQueryFnParams<OauthLoginByGoogleSecretCodeParams>
    >({
      queryFn: createQueryFnWithErrorHandler({
        queryFn: async (
          { params: { group }, totp },
          { dispatch, getState },
        ) => {
          const {
            data: {
              address,
              authorizationToken,
              encryptionPublicKey,
              ethAddressType,
            } = {},
          } = oauthLoginByGoogleSecretCode.select(undefined as any)(
            getState() as RootState,
          );

          if (ethAddressType === EthAddressType.Generated) {
            await loginSyntheticJwt(
              dispatch,
              {
                address,
                authorizationToken,
                encryptionPublicKey,
                ethAddressType,
              },
              totp,
            );
          }

          if (ethAddressType === EthAddressType.User) {
            await loginUserJwt(dispatch, {
              address,
              authorizationToken,
              encryptionPublicKey,
              ethAddressType,
            });
          }

          await dispatch(
            userSettingsGetActiveEmailBinding.initiate({
              params: undefined as void,
              shouldNotify: false,
            }),
          );

          await trackLoginSuccess({ dispatch, getState, group });

          return { data: {} };
        },
        errorHandler: (error, _args, { getState }) => {
          trackWeb2SignUpFailure(getTrackingParams(getState as GetState));

          return {
            error,
          };
        },
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        await queryFulfilled;

        dispatch(push(ChainsRoutesConfig.chains.generatePath()));
      },
    }),
  }),
});
