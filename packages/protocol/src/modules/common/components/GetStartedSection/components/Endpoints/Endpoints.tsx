import { Box } from '@mui/material';
import { useMemo } from 'react';
import { t } from '@ankr.com/common';

import { Chain, ChainType } from 'modules/chains/types';
import { EndpointGroup } from 'modules/endpoints/types';
import { useAuth } from 'domains/auth/hooks/useAuth';
import { useCopyEndpointHandler } from 'domains/chains/hooks/useCopyEndpointHandler';
import { SignupDialog } from 'domains/auth/components/ConnectButton/UnconnectedButton/SignupDialog';
import { useDialog } from 'modules/common/hooks/useDialog';

import { Feature, MainEndpoints } from '../MainEndpoints';
import { root } from '../../const';
import { useEndpointsStyles } from './EndpointsStyles';
import { WsFeatureEndpoints } from '../WsFeatureEndpoints';
import { EndpointPlaceholder } from '../EndpointPlaceholder';
import { EndpointsHeader } from '../EndpointsHeader';
import { useWsFeatureEndpoints } from '../WsFeatureEndpoints/useWsFeatureEndpoints';

export interface EndpointsProps {
  publicChain: Chain;
  chainType: ChainType;
  group: EndpointGroup;
  placeholder?: string;
}

const checkComingSoonLabel = (publicChain: Chain, chainType: ChainType) => {
  switch (chainType) {
    case ChainType.Mainnet:
      return publicChain.isComingSoon;

    case ChainType.Testnet:
      return publicChain?.testnets?.[0]?.isComingSoon;

    case ChainType.Devnet:
      return publicChain?.devnets?.[0]?.isComingSoon;

    default:
      return false;
  }
};

export const Endpoints = ({
  chainType,
  group,
  placeholder,
  publicChain,
}: EndpointsProps) => {
  const { classes } = useEndpointsStyles();

  const { hasOauthLogin } = useAuth();

  const { hasConnectWalletMessage, hasPremium, hasPrivateAccess } = useAuth();

  const onCopyEndpoint = useCopyEndpointHandler(chainType);

  const hasComingSoonLabel = useMemo(
    () => checkComingSoonLabel(publicChain, chainType),
    [publicChain, chainType],
  );

  const { hasWSFeature, wss } = useWsFeatureEndpoints(group);

  const {
    isOpened: isLoginOpened,
    onClose: onCloseLogin,
    onOpen: onOpenLogin,
  } = useDialog();

  const renderContent = useMemo(() => {
    if (hasComingSoonLabel) {
      return (
        <EndpointPlaceholder
          label={t('chains.coming-soon')}
          title={
            <EndpointsHeader
              title={t(`${root}.endpoints.title`, {
                chainName: group.chainName,
                urls: 1,
              })}
            />
          }
        />
      );
    }

    // Multichain placeholder
    if (placeholder) {
      return (
        <EndpointPlaceholder
          onClick={onOpenLogin}
          lockedLabel={placeholder}
          title={
            <EndpointsHeader
              title={t('chain-item.get-started.endpoints.title-multichain')}
            />
          }
        />
      );
    }

    return (
      <>
        <MainEndpoints
          feature={Feature.RPC}
          group={group}
          hasConnectWalletMessage={hasConnectWalletMessage}
          hasPremium={hasPremium}
          hasPrivateAccess={hasPrivateAccess}
          onCopyEndpoint={onCopyEndpoint}
          publicChain={publicChain}
        />
        <MainEndpoints
          feature={Feature.REST}
          group={group}
          hasConnectWalletMessage={hasConnectWalletMessage}
          hasPremium={hasPremium}
          hasPrivateAccess={hasPrivateAccess}
          onCopyEndpoint={onCopyEndpoint}
          publicChain={publicChain}
        />
        <WsFeatureEndpoints
          title={t(`${root}.endpoints.websocket-title`)}
          hasPremium={hasPremium}
          hasConnectWalletMessage={hasConnectWalletMessage}
          onCopyEndpoint={onCopyEndpoint}
          hasWSFeature={hasWSFeature}
          wss={wss}
        />
      </>
    );
  }, [
    group,
    hasComingSoonLabel,
    hasConnectWalletMessage,
    hasPremium,
    hasPrivateAccess,
    hasWSFeature,
    onCopyEndpoint,
    onOpenLogin,
    placeholder,
    publicChain,
    wss,
  ]);

  return (
    <>
      <Box className={classes.endpointsList}>{renderContent}</Box>
      {isLoginOpened && (
        <SignupDialog
          onClose={onCloseLogin}
          isOpen={isLoginOpened}
          hasOauthLogin={hasOauthLogin}
        />
      )}
    </>
  );
};
