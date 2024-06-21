import {
  BlockchainFeature,
  BlockchainType,
  BlockchainUrls,
  ChainsConfig,
} from 'multirpc-sdk';

import {
  ChainID,
  GroupedBlockchainType,
  Chain,
  ChainURL,
} from 'modules/chains/types';
import { mappingChainName } from 'domains/auth/utils/mappingchainName';

import { isEvmExtension } from './isEvmExtension';

type ChainsResult = Record<string, Chain[]>;

const getExtensions = (chains: Chain[]) => {
  return chains.reduce<ChainsResult>((result, chain) => {
    const { chainExtends, type } = chain;

    if (type === BlockchainType.Extension && chainExtends) {
      result[chainExtends] = result[chainExtends]
        ? [...result[chainExtends], chain]
        : [chain];
    }

    return result;
  }, {});
};

export const getBeacons = (chains: Chain[]) => {
  return chains.reduce<ChainsResult>((result, chain) => {
    const { chainExtends, type } = chain;

    if (type === BlockchainType.Beacon && chainExtends) {
      result[chainExtends] = result[chainExtends]
        ? [...result[chainExtends], chain]
        : [chain];
    }

    return result;
  }, {});
};

export const getOpnodes = (chains: Chain[]) => {
  return chains.reduce<ChainsResult>((result, chain) => {
    const { chainExtends, type } = chain;

    if (type === BlockchainType.Opnode && chainExtends) {
      result[chainExtends] = result[chainExtends]
        ? [...result[chainExtends], chain]
        : [chain];
    }

    return result;
  }, {});
};

interface GetExtendedChainsArguments {
  chains: Chain[];
  extensions: GroupedBlockchainType;
  beacons: GroupedBlockchainType;
  opnodes: GroupedBlockchainType;
}

const getExtendedChains = ({
  beacons,
  chains,
  extensions,
  opnodes,
}: GetExtendedChainsArguments) => {
  return chains.reduce<Chain[]>((result, chain) => {
    const { id, type } = chain;

    if (
      type !== BlockchainType.Extension &&
      type !== BlockchainType.Beacon &&
      type !== BlockchainType.Opnode
    ) {
      const evmExtension = (extensions[id] || []).find(extension =>
        isEvmExtension(extension.id),
      );

      result.push({
        ...chain,
        extensions: evmExtension
          ? [
              evmExtension,
              ...extensions[id].filter(
                extension => !isEvmExtension(extension.id),
              ),
            ]
          : extensions[id],
        beacons: beacons[id],
        opnodes: opnodes[id],
      });
    }

    return result;
  }, []);
};

export const getTestnets = (extendedChains: Chain[]) => {
  return extendedChains.reduce<ChainsResult>((result, chain) => {
    const { chainExtends, type } = chain;

    if (type === BlockchainType.Testnet && chainExtends) {
      result[chainExtends] = result[chainExtends]
        ? [...result[chainExtends], chain]
        : [chain];
    }

    return result;
  }, {});
};

export const getDevnets = (extendedChains: Chain[]) => {
  return extendedChains.reduce<ChainsResult>((result, chain) => {
    const { chainExtends, type } = chain;

    if (type === BlockchainType.Devnet && chainExtends) {
      result[chainExtends] = result[chainExtends]
        ? [...result[chainExtends], chain]
        : [chain];
    }

    return result;
  }, {});
};

interface AddExtensionsArguments {
  extendedChains: Chain[];
  testnets: GroupedBlockchainType;
  devnets: GroupedBlockchainType;
  opnodes: GroupedBlockchainType;
}

const addExtensions = ({
  devnets,
  extendedChains,
  opnodes,
  testnets,
}: AddExtensionsArguments) => {
  return extendedChains.reduce<Chain[]>((result, chain) => {
    const { id, type } = chain;

    if (type !== BlockchainType.Testnet && type !== BlockchainType.Devnet) {
      result.push({
        ...chain,
        testnets: testnets[id],
        devnets: devnets[id],
        opnodes: opnodes[id],
      });
    }

    return result;
  }, []);
};

export const addExtenders = (chains: Chain[]) => {
  const extenders = chains.reduce<ChainsResult>((result, chain) => {
    const { chainExtends } = chain;

    if (chainExtends) {
      result[chainExtends] = result[chainExtends]
        ? [...result[chainExtends], chain]
        : [chain];
    }

    return result;
  }, {});

  return chains.reduce<Chain[]>((result, chain) => {
    const { chainExtends, id } = chain;

    if (!chainExtends) {
      result.push({
        ...chain,
        extenders: extenders[id],
      });
    }

    return result;
  }, []);
};

const addPremiumOnly = (chains: Chain[]) => {
  chains.forEach(item => {
    const isAllTestnetsForPremium =
      item.testnets?.every(el => el.premiumOnly) ?? true;
    const isAllDevnetsForPremium =
      item.devnets?.every(el => el.premiumOnly) ?? true;

    item.premiumOnly =
      item.isMainnetPremiumOnly &&
      isAllTestnetsForPremium &&
      isAllDevnetsForPremium;
  });

  return chains;
};

const getURLs = ({
  enterpriseURLs,
  enterpriseWsURLs,
  restURLs,
  rpcURLs,
  wsURLs,
}: BlockchainUrls) => {
  const template = new Array(Math.max(restURLs.length, rpcURLs.length)).fill(
    '',
  );

  return template.map<ChainURL>((_, index) => ({
    rpc: rpcURLs[index],
    ws: wsURLs[index],
    rest: restURLs[index],
    enterprise: enterpriseURLs[index],
    enterpriseWs: enterpriseWsURLs[index],
  }));
};

const getApiChains = (data: ChainsConfig, availableChainIds?: string[]) => {
  return Object.values(data).map(chain => {
    const { blockchain } = chain;
    const {
      coinName,
      extends: chainExtends,
      features,
      id,
      name,
      paths,
      premiumOnly,
      type,
    } = blockchain;

    const isComingSoon = features.includes(BlockchainFeature.ComingSoon);

    const hasEnterpriseFeature = availableChainIds?.includes(id);
    const hasWSFeature = features.includes(BlockchainFeature.WS);

    return {
      coinName,
      chainExtends,
      id: id as ChainID,
      name: mappingChainName(id as ChainID, name),
      type,
      premiumOnly,
      urls: getURLs(chain),
      hasRESTFeature: features.includes(BlockchainFeature.REST),
      hasRPCFeature:
        features.includes(BlockchainFeature.RPC) ||
        features.includes(BlockchainFeature.GRPC),
      hasWSFeature,
      hasEnterpriseFeature,
      isComingSoon,
      isMainnetComingSoon: type === BlockchainType.Mainnet && isComingSoon,
      isMainnetPremiumOnly: type === BlockchainType.Mainnet && premiumOnly,
      paths,
    } as Chain;
  });
};

export const formatChainsConfigToChains = (
  data: ChainsConfig = {},
  availableChainIds?: string[],
): Chain[] => {
  const chains = getApiChains(data, availableChainIds);

  const extensions = getExtensions(chains);
  const beacons = getBeacons(chains);
  const opnodes = getOpnodes(chains);
  const extendedChains = getExtendedChains({
    chains,
    extensions,
    beacons,
    opnodes,
  });
  const testnets = getTestnets(extendedChains);
  const devnets = getDevnets(extendedChains);
  const chainsWithExtensions = addExtensions({
    extendedChains,
    testnets,
    devnets,
    opnodes,
  });
  const chainsWithExtenders = addExtenders(chainsWithExtensions);
  const chainsWithPremiumOnly = addPremiumOnly(chainsWithExtenders);

  return chainsWithPremiumOnly;
};
