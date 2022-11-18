import { EWalletId, getWalletName } from '@ankr.com/provider';

export const getIsMetaMask = (walletName?: string): boolean => {
  return getWalletName(EWalletId.injected) === walletName;
};

export const getIsCoinbase = (walletName?: string): boolean => {
  return getWalletName(EWalletId.coinbase) === walletName;
};

export const getIsOKX = (walletName?: string): boolean => {
  return getWalletName(EWalletId.okxwallet) === walletName;
};

export const getIsCoin98 = (walletName?: string): boolean => {
  return getWalletName(EWalletId.coin98) === walletName;
};

export const getIsTrustWallet = (walletName?: string): boolean => {
  return getWalletName(EWalletId.trust) === walletName;
};

export const getIsInjectedWallet = (walletName?: string): boolean => {
  return (
    getIsMetaMask(walletName) ||
    getIsCoinbase(walletName) ||
    getIsCoin98(walletName) ||
    getIsTrustWallet(walletName) ||
    getIsOKX(walletName)
  );
};
