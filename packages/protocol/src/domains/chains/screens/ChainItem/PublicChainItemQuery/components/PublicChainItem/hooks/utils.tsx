import { useMemo } from 'react';

import { Chain, ChainType } from 'domains/chains/types';
import { GroupedEndpoints as Endpoints } from 'modules/endpoints/types';
import { Tab } from 'modules/common/hooks/useTabs';
import { SecondaryTab } from 'domains/chains/screens/ChainItem/components/SecondaryTab';
import { getChainTypeTabs } from 'domains/chains/screens/ChainItem/constants/chainTypeTabs';
import { chainTypeToEndpointsKeyMap } from 'domains/chains/screens/ChainItem/constants/chainTypeToEndpointsKeyMap';
import { LockedTab } from 'domains/chains/screens/ChainItem/components/LockedTab';

const isTestnetPremimumOnly = (chain: Chain) => {
  return chain.testnets && chain?.testnets?.length > 0
    ? chain.testnets[0].premiumOnly
    : false;
};

export const useIsTestnetPremimumOnly = (chain: Chain) => {
  return useMemo(() => isTestnetPremimumOnly(chain), [chain]);
};

interface GetPublicChainTypeTabsParams {
  endpoints: Endpoints;
  isBlockedTestnet: boolean;
  isBlockedMainnet?: boolean;
  onBlockedTabClick: () => void;
}

export const getPublicChainTypeTabs = ({
  endpoints,
  isBlockedTestnet,
  isBlockedMainnet,
  onBlockedTabClick,
}: GetPublicChainTypeTabsParams): Tab<ChainType>[] => {
  return getChainTypeTabs()
    .filter(({ id }) => endpoints[chainTypeToEndpointsKeyMap[id]]?.length > 0)
    .map<Tab<ChainType>>(({ id, title }, index, list) => {
      const blockedTestnet = isBlockedTestnet && id === ChainType.Testnet;
      const blockedMainnet = isBlockedMainnet && id === ChainType.Mainnet;
      const isBlocked = blockedTestnet || blockedMainnet;

      return {
        id,
        title: (isSelected: boolean) => {
          const label = isBlocked ? (
            <LockedTab title={title} />
          ) : (
            title?.toString() ?? ''
          );

          return (
            <SecondaryTab
              isLast={index === list.length - 1}
              isSelected={!isBlocked && isSelected}
              label={label}
              onClick={() => isBlocked && onBlockedTabClick()}
            />
          );
        },
        isDisabled: isBlocked,
      };
    });
};
