import { EthAddressType, IJwtToken, WorkerTokenData } from 'multirpc-sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { IWalletMeta } from '@ankr.com/provider';
import { clearCookie, getCookieByName, setCookie } from './cookie';

const WORKER_TOKEN_DATA_KEY = 'WORKER_TOKEN_DATA_KEY';
let WORKER_TOKEN_DATA: IAuthSlice['workerTokenData'];

export interface IAuthSlice {
  address?: string;
  authorizationToken?: string;
  credentials?: IJwtToken;
  email?: string;
  encryptionPublicKey?: string;
  ethAddressType?: EthAddressType;
  hasOauthLogin?: boolean;
  hasOauthUserDepositTransaction?: boolean;
  hasWeb3Connection?: boolean;
  isCardPayment?: boolean;
  trackingWalletName?: string;
  walletMeta?: IWalletMeta;
  workerTokenData?: WorkerTokenData;
}

const initialState: IAuthSlice = {};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<IAuthSlice>) => {
      const {
        address,
        authorizationToken,
        credentials,
        email,
        encryptionPublicKey,
        ethAddressType,
        hasOauthLogin,
        hasOauthUserDepositTransaction,
        hasWeb3Connection,
        isCardPayment,
        trackingWalletName,
        walletMeta,
        workerTokenData,
      } = action.payload;

      if (credentials) {
        state.credentials = credentials || undefined;
      }

      if (workerTokenData) {
        setCookie(WORKER_TOKEN_DATA_KEY, workerTokenData);
        WORKER_TOKEN_DATA = workerTokenData;
      }

      if (address) {
        state.address = address;
      }

      if (authorizationToken) {
        state.authorizationToken = authorizationToken;
      }

      if (encryptionPublicKey) {
        state.encryptionPublicKey = encryptionPublicKey;
      }

      if (walletMeta) {
        state.walletMeta = walletMeta;
      }

      if (hasWeb3Connection) {
        state.hasWeb3Connection = hasWeb3Connection;
      }

      if (hasOauthLogin) {
        state.hasOauthLogin = hasOauthLogin;
      }

      if (email) {
        state.email = email;
      }

      if (ethAddressType) {
        state.ethAddressType = ethAddressType;
      }

      if (isCardPayment) {
        state.isCardPayment = isCardPayment;
      }

      if (hasOauthUserDepositTransaction) {
        state.hasOauthUserDepositTransaction = hasOauthUserDepositTransaction;
      }

      if (trackingWalletName) {
        state.trackingWalletName = trackingWalletName;
      }
    },

    resetAuthData: state => {
      state.credentials = undefined;
      state.workerTokenData = undefined;

      state.address = undefined;
      state.authorizationToken = undefined;
      state.encryptionPublicKey = undefined;
      state.walletMeta = undefined;
      state.hasWeb3Connection = undefined;
      state.hasOauthLogin = undefined;
      state.email = undefined;
      state.ethAddressType = undefined;
      state.isCardPayment = undefined;
      state.trackingWalletName = undefined;

      clearCookie(WORKER_TOKEN_DATA_KEY);
      WORKER_TOKEN_DATA = undefined;
      state.hasOauthUserDepositTransaction = undefined;
    },
  },
});

export const selectAuthData: (state: RootState) => IAuthSlice = (
  state: RootState,
): IAuthSlice => {
  if (state.auth) {
    if (WORKER_TOKEN_DATA === undefined) {
      WORKER_TOKEN_DATA = getCookieByName(WORKER_TOKEN_DATA_KEY);
    }

    return {
      ...state.auth,
      workerTokenData: WORKER_TOKEN_DATA,
    };
  }

  return {};
};

export const { setAuthData, resetAuthData } = authSlice.actions;
