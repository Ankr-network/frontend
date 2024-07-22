import { useMemo } from 'react';

import { Chain, ChainID } from 'modules/chains/types';
import { ChainGroupID, EndpointGroup } from 'modules/endpoints/types';
import { TRON_RESET_API_GROUP_ID } from 'domains/auth/components/AddNetwork/const';
import { useChainProtocolContext } from 'domains/chains/screens/ChainItem/hooks/useChainProtocolContext';
import { getEndpointsGroup } from 'domains/chains/screens/ChainItem/utils/getEndpointsGroup';

import { useChainItemPlaceholder } from '../useChainItemPlaceholder';
import { hasGroupSelector as checkHasGroupSelector } from '../utils/hasGroupSelector';

interface IUseChainItemHeaderContentProps {
  chain: Chain;
  group: EndpointGroup;
  groupID: ChainGroupID;
  isMetamaskButtonHidden?: boolean;
  isMultiChain: boolean;
}

export const useChainItemHeaderContent = ({
  chain,
  group,
  groupID,
  isMetamaskButtonHidden,
  isMultiChain,
}: IUseChainItemHeaderContentProps) => {
  const { isChainProtocolSwitchEnabled } = useChainProtocolContext();

  const endpointsGroup = useMemo(
    () => getEndpointsGroup({ group, isChainProtocolSwitchEnabled }),
    [group, isChainProtocolSwitchEnabled],
  );

  const { placeholder } = useChainItemPlaceholder(isMultiChain);
  const hasGroupSelector = useMemo(
    () => checkHasGroupSelector(chain.id, groupID),
    [chain.id, groupID],
  );

  const isTronRestApi = useMemo(
    () => chain.id === ChainID.TRON && group.id === TRON_RESET_API_GROUP_ID,
    [chain, group],
  );

  const hasMetamaskButton =
    chain &&
    !isChainProtocolSwitchEnabled &&
    !isTronRestApi &&
    !isMetamaskButtonHidden;

  return {
    endpointsGroup,
    placeholder,
    hasGroupSelector,
    hasMetamaskButton,
  };
};
