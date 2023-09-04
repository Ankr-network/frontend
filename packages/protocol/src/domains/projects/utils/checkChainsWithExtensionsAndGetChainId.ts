import { ChainID } from 'domains/chains/types';
import { checkPrivateChainsAndGetChainId } from 'domains/chains/screens/ChainItem/components/UsageDataSection/const';

/* this mapping helps to get the correct id for using in requests for some chains with extensions */
export const checkChainsWithExtensionsAndGetChainId = (chainId: ChainID) => {
  switch (chainId) {
    case ChainID.FLARE:
      return checkPrivateChainsAndGetChainId(ChainID.FLARE_EVM);
    case ChainID.TENET:
      return checkPrivateChainsAndGetChainId(ChainID.TENET_EVM);
    case ChainID.SCROLL:
      return checkPrivateChainsAndGetChainId(ChainID.SCROLL_TESTNET);
    case ChainID.HORIZEN:
      return checkPrivateChainsAndGetChainId(ChainID.HORIZEN_EVM);
    case ChainID.HORIZEN_TESTNET:
      return checkPrivateChainsAndGetChainId(ChainID.HORIZEN_TESTNET_EVM);
    case ChainID.BERACHAIN:
      return checkPrivateChainsAndGetChainId(
        ChainID.BERACHAIN_GUARDED_TESTNET_EVM,
      );
    default:
      return checkPrivateChainsAndGetChainId(chainId);
  }
};
