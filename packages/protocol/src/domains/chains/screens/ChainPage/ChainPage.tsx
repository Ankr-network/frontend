import { tHTML } from '@ankr.com/common';
import { ChainID } from '@ankr.com/chains-list';

import { ChainsRoutesConfig } from 'domains/chains/routes';
import { NoReactSnap } from 'uiKit/NoReactSnap';
import { UpgradePlanBanner } from 'modules/common/components/UpgradePlanBanner';
import { useAuth } from 'domains/auth/hooks/useAuth';
import { useRedirectToEnterpriseOnGroupChange } from 'hooks/useRedirectToEnterpriseOnGroupChange';

import { ChainItemBanner } from './components/ChainItemBanner';
import { ChainItemSkeleton } from './components/ChainItemSkeleton';
import { PrivateChainItemWrapper } from './PrivateChainItemQuery';
import { PublicChainItemWrapper } from './PublicChainItemWrapper';

export const ChainPage = () => {
  const { chainId } = ChainsRoutesConfig.chainDetails.useParams();

  const { hasPremium, hasPrivateAccess, isLoggedIn, loading } = useAuth();

  useRedirectToEnterpriseOnGroupChange();

  const shouldShowBanner = !hasPremium && isLoggedIn;

  if (loading) {
    return <ChainItemSkeleton />;
  }

  return (
    <>
      {shouldShowBanner && <UpgradePlanBanner isPublicUser />}
      {chainId === ChainID.ZKSYNC_ERA && (
        <NoReactSnap>
          <ChainItemBanner message={tHTML('chain-item.banner-zksync_era')} />
        </NoReactSnap>
      )}
      {hasPrivateAccess ? (
        <PrivateChainItemWrapper chainId={chainId as ChainID} />
      ) : (
        <PublicChainItemWrapper
          chainId={chainId as ChainID}
          loading={loading}
        />
      )}
    </>
  );
};
