import { Chain } from 'domains/chains/screens/Chains/components/ChainsList/ChainsListTypes';
import { IApiChainURL } from 'domains/chains/api/queryChains';
import { IChainParams } from '../../actions/addNetwork';
import { flatNetworkURLs } from 'modules/auth/utils/flatNetworkURLs';

const toHex = (num: number): string => {
  return `0x${num.toString(16)}`;
};

// harmony
export const HARMONY_MAINNET_PARAMS = {
  chainId: 1666600000,
  chainName: 'Harmony by Ankr Protocol',
  nativeCurrency: {
    name: 'Harmony',
    symbol: 'ONE',
    decimals: 18,
  },
  blockExplorerUrls: ['https://explorer.harmony.one/'],
};
// avalanche
export const AVALANCHE_MAINNET_PARAMS = {
  chainId: 43114,
  chainName: 'Avalanche by Ankr Protocol',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  blockExplorerUrls: ['https://cchain.explorer.avax.network/'],
};
// fantom
const FANTOM_NETWORK_PARAMS = {
  chainId: 250,
  chainName: 'Fantom by Ankr Protocol',
  nativeCurrency: {
    name: 'Fantom',
    symbol: 'FTM',
    decimals: 18,
  },
  blockExplorerUrls: ['https://ftmscan.com/'],
};
// eth
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ETHEREUM_MAINNET_PARAMS = {
  chainId: 1,
  chainName: 'Ethereum by Ankr Protocol',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://etherscan.io'],
};
// polygon
const POLYGON_NETWORK_PARAMS = {
  chainId: 137,
  chainName: 'Polygon by Ankr Protocol',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  blockExplorerUrls: ['https://polygonscan.com/'],
};
// solana
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SOLANA_NETWORK_PARAMS = {
  chainId: 245022934, // wrong network id
  chainName: 'Neon by Ankr Protocol',
  nativeCurrency: {
    name: 'Neon',
    symbol: 'NEON',
    decimals: 18,
  },
  blockExplorerUrls: ['https://neon-labs.org/'],
};
// xdai
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const XDAI_NETWORK_PARAMS = {
  chainId: 100,
  chainName: 'xDAI by Ankr Protocol',
  nativeCurrency: {
    name: 'xDAI',
    symbol: 'xDAI',
    decimals: 18,
  },
  blockExplorerUrls: ['https://blockscout.com/poa/xdai'],
};

// celo
const CELO_NETWORK_PARAMS = {
  chainId: 42220,
  chainName: 'Celo by Ankr Protocol',
  nativeCurrency: {
    name: 'Celo (Mainnet)',
    symbol: 'CELO',
    decimals: 18,
  },
  blockExplorerUrls: ['https://explorer.celo.org'],
};

// Arbitrum
const ARBITRUM_NETWORK_PARAMS = {
  chainId: 42161,
  chainName: 'Arbitrum by Ankr Protocol',
  nativeCurrency: {
    name: 'Arbitrum One',
    symbol: 'AETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://arbiscan.io'],
};

// bsc
const BSC_NETWORK_PARAMS = {
  chainId: 56,
  chainName: 'BSC by Ankr Protocol',
  nativeCurrency: {
    name: 'Smart Chain',
    symbol: 'BNB',
    decimals: 18,
  },
  blockExplorerUrls: ['https://bscscan.com'],
};

// iotex
const IOTEX_NETWORK_PARAMS = {
  chainId: 4689,
  chainName: 'IoTeX by Ankr Protocol',
  nativeCurrency: {
    name: 'IoTeX Mainnet',
    symbol: 'IOTX',
    decimals: 18,
  },
  blockExplorerUrls: ['https://iotexscan.io/'],
};

// nervos https://docs.godwoken.io/#godwoken-public-networks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NERVOS_ETH_NETWORK_PARAMS = {
  chainId: 71394,
  chainName: 'Nervos Mainnet by Ankr Protocol',
  nativeCurrency: {
    name: 'Nervos Mainnet',
    symbol: 'CKB',
    decimals: 18,
  },
  blockExplorerUrls: ['https://explorer.nervos.org/'],
};

// nervos https://docs.godwoken.io/#godwoken-public-networks
const GODWOKEN_POLYJUICE_NETWORK_PARAMS = {
  chainId: 71394,
  chainName: 'Godwoken Polyjuice Mainnet by Ankr Protocol',
  nativeCurrency: {
    name: 'Godwoken Mainnet',
    symbol: 'CKB',
    decimals: 18,
  },
  blockExplorerUrls: ['https://www.layerview.io/'],
};

const mapParams = (
  chain: Chain,
  networkData: typeof AVALANCHE_MAINNET_PARAMS,
): IChainParams => {
  return {
    ...networkData,
    chainId: toHex(networkData.chainId),
    rpcUrls: flatNetworkURLs<IApiChainURL, Chain>(chain).mainnetURLs.map(
      ({ rpc }) => rpc,
    ),
  };
};

/* map network data for using addNetwork action */
export const getMappedNetwork = (chain: Chain): IChainParams | undefined => {
  switch (chain.id) {
    case 'harmony':
      return mapParams(chain, HARMONY_MAINNET_PARAMS);
    case 'avalanche':
      return mapParams(chain, AVALANCHE_MAINNET_PARAMS);
    /* adding ethereum network got error: MetaMask - RPC Error: May not specify default MetaMask chain. */
    case 'eth':
      return undefined;
    case 'fantom':
      return mapParams(chain, FANTOM_NETWORK_PARAMS);
    case 'polygon':
      return mapParams(chain, POLYGON_NETWORK_PARAMS);
    /* adding solana network returns error: Request for method 'eth_chainId on https://proxy.mainnet.neonlabs.org/solana failed */
    case 'solana':
      return undefined;
    case 'xdai':
      return undefined;
    case 'celo':
      return mapParams(chain, CELO_NETWORK_PARAMS);
    case 'arbitrum':
      return mapParams(chain, ARBITRUM_NETWORK_PARAMS);
    case 'bsc':
      return mapParams(chain, BSC_NETWORK_PARAMS);
    case 'iotex':
      return mapParams(chain, IOTEX_NETWORK_PARAMS);
    case 'nervos':
      return mapParams(chain, GODWOKEN_POLYJUICE_NETWORK_PARAMS);
    default:
      return undefined;
  }
};
