import { useMemo } from 'react';

import { ChainID } from 'domains/chains/types';
import { ConnectionSnippet } from './components/ConnectionSnippet';
import { EndpointGroup } from 'modules/endpoints/types';
import { MultiChainBenefits } from './components/MultichainBenefits';
import { RequestComposer } from 'domains/requestComposer/components/composers';
import { UpgradeBanner } from './components/UpgradeBanner';
import { isGroupEvmBased } from 'modules/endpoints/utils/isGroupEvmBased';
import { useGetStartedSectionStyles } from './GetStartedSectionStyles';
import { removeWsUrlIfUserIsNotPremium } from './GetStartedSectionUtils';
import { useChainProtocolContext } from '../../hooks/useChainProtocolContext';

export interface GetStartedSectionProps {
  chainId: string;
  group: EndpointGroup;
  hasUpgradeBanner: boolean;
  publicUrl: string;
  hasPremium: boolean;
  hasRequestComposer: boolean;
}

export const GetStartedSection = ({
  chainId,
  group,
  hasUpgradeBanner,
  publicUrl,
  hasPremium,
  hasRequestComposer,
}: GetStartedSectionProps) => {
  const isMultiChain = chainId === ChainID.MULTICHAIN;
  const { isChainProtocolSwitchEnabled } = useChainProtocolContext();

  const { classes } = useGetStartedSectionStyles();

  const isEvmBased = useMemo(() => isGroupEvmBased(group), [group]);
  const codeSnippetGroup = useMemo(
    () => removeWsUrlIfUserIsNotPremium(group, hasPremium),
    [group, hasPremium],
  );

  return (
    <div className={classes.getStartedSection}>
      {isMultiChain && <MultiChainBenefits />}
      {hasUpgradeBanner && !isMultiChain && <UpgradeBanner />}

      {!isChainProtocolSwitchEnabled && isEvmBased && (
        <ConnectionSnippet group={codeSnippetGroup} />
      )}
      {!isChainProtocolSwitchEnabled && hasRequestComposer && (
        <RequestComposer
          group={group}
          publicUrl={publicUrl}
          chainId={chainId}
          className={classes.requestComposer}
        />
      )}
    </div>
  );
};
