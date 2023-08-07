import { ChainID } from 'domains/chains/types';

export const isChainHasSingleOptionToSelect = (chainId: ChainID) => {
  return chainId === ChainID.TENET;
};
