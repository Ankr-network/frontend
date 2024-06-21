import { useMemo } from 'react';

import { ChainID } from 'modules/chains/types';
import { EndpointGroup } from 'modules/endpoints/types';
import { RequestComposer } from 'domains/requestComposer/components/composers';
import { isGroupEvmBased } from 'modules/endpoints/utils/isGroupEvmBased';
import { useChainProtocolContext } from 'domains/chains/screens/ChainItem/hooks/useChainProtocolContext';

import {
  ConnectionSnippet,
  ConnectionSnippetProps,
} from './components/ConnectionSnippet';
import { MultiChainBenefits } from './components/MultichainBenefits';
import { UpgradeBanner } from './components/UpgradeBanner';
import { useGetStartedSectionStyles } from './GetStartedSectionStyles';

export interface GetStartedSectionProps extends ConnectionSnippetProps {
  chainId: string;
  group: EndpointGroup;
  hasUpgradeBanner: boolean;
  publicUrl: string;
  hasRequestComposer: boolean;
  hasWssAccess?: boolean;
}

export const GetStartedSection = ({
  chainId,
  group,
  hasRequestComposer,
  hasUpgradeBanner,
  hasWssAccess,
  httpCode,
  publicUrl,
  setTechnology,
  technology,
  wssCode,
}: GetStartedSectionProps) => {
  const isMultiChain = chainId === ChainID.MULTICHAIN;
  const { isChainProtocolSwitchEnabled } = useChainProtocolContext();

  const { classes } = useGetStartedSectionStyles();

  const isEvmBased = useMemo(() => isGroupEvmBased(group), [group]);

  return (
    <div className={classes.getStartedSection}>
      {isMultiChain && <MultiChainBenefits />}
      {hasUpgradeBanner && !isMultiChain && <UpgradeBanner />}

      {!isChainProtocolSwitchEnabled && isEvmBased && (
        <ConnectionSnippet
          technology={technology}
          setTechnology={setTechnology}
          httpCode={httpCode}
          wssCode={hasWssAccess ? wssCode : undefined}
        />
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
