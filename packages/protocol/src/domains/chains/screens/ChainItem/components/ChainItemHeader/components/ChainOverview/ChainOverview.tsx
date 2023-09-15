import { useMemo } from 'react';

import { AddNetworkButton } from 'domains/auth/components/AddNetwork';
import { Chain, ChainID, ChainSubType, ChainType } from 'domains/chains/types';
import { EndpointGroup } from 'modules/endpoints/types';
import { MetamaskButtonLabel } from 'domains/chains/components/MetamaskButtonLabel';
import { useChainProtocolContext } from 'domains/chains/screens/ChainItem/hooks/useChainProtocolContext';
import { TRON_RESET_API_GROUP_ID } from 'domains/auth/components/AddNetwork/const';

import { ChainDocsLink } from '../ChainDocsLink';
import { ChainLogo } from '../ChainLogo';
import { ChainSubtitle } from '../ChainSubtitle';
import { ChainTitle } from '../ChainTitle';
import { useChainOverviewStyles } from './ChainOverviewStyles';

export interface ChainOverviewProps {
  chain: Chain;
  chainType: ChainType;
  chainSubType?: ChainSubType;
  group: EndpointGroup;
  isChainArchived: boolean;
  isEnterprise: boolean;
  isMetamaskButtonHidden?: boolean;
}

export const ChainOverview = ({
  chain,
  chainType,
  chainSubType,
  group,
  isChainArchived,
  isEnterprise,
  isMetamaskButtonHidden,
}: ChainOverviewProps) => {
  const { classes } = useChainOverviewStyles();
  const { isChainProtocolSwitchEnabled } = useChainProtocolContext();

  const isTronRestApi = useMemo(
    () => chain.id === ChainID.TRON && group.id === TRON_RESET_API_GROUP_ID,
    [chain, group],
  );

  return (
    <div>
      <div className={classes.chainOverview}>
        <div className={classes.left}>
          <ChainLogo chain={chain} />
          <div className={classes.description}>
            <ChainTitle chain={chain} />
            <ChainSubtitle chain={chain} isChainArchived={isChainArchived} />
          </div>
        </div>
        <div className={classes.right}>
          <ChainDocsLink chain={chain} />
          {chain &&
            !isChainProtocolSwitchEnabled &&
            !isTronRestApi &&
            !isMetamaskButtonHidden && (
              <AddNetworkButton
                chainType={chainType}
                chainSubType={chainSubType}
                className={classes.addNetworkButton}
                group={group}
                label={<MetamaskButtonLabel />}
                chain={chain}
                isEnterprise={isEnterprise}
              />
            )}
        </div>
      </div>
    </div>
  );
};
