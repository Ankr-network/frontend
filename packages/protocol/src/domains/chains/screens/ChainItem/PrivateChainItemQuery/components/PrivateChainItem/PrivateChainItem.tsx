import { Plus } from '@ankr.com/ui';
import { Button } from '@mui/material';

import { H1Tag } from 'uiKit/H1Tag';
import { PlansDialog } from 'modules/common/components/PlansDialog';
import { useDialog } from 'modules/common/hooks/useDialog';
import { useUpgradePlanDialog } from 'modules/common/components/UpgradePlanDialog';
import { isMultichain } from 'modules/chains/utils/isMultichain';
import { MultiChainBenefits } from 'modules/common/components/GetStartedSection/components/MultichainBenefits';
import { BlockWithPermission } from 'domains/userGroup/constants/groups';
import { GuardUserGroup } from 'domains/userGroup/components/GuardUserGroup';
import { IPrivateChainItemDetails } from 'domains/chains/actions/private/types';
import { ChainItemHeader } from 'domains/chains/screens/ChainItem/components/ChainItemHeader';
import { useChainItemBreadcrumbs } from 'domains/chains/screens/ChainItem/hooks/useChainItemBreadcrumbs';
import { useRedirectToAdvancedApi } from 'domains/chains/screens/ChainItem/hooks/useRedirectToAdvancedApi';
import { UsageDataSection } from 'domains/chains/screens/ChainItem/components/UsageDataSection';
import { AdvancedApiInfoTabs } from 'domains/chains/screens/ChainItem/components/ChainItemSections/components/AdvancedApiInfoTabs';
import { ChainProjectsSection } from 'domains/chains/screens/ChainItem/components/ChainProjectsSection';
import { ChainProjectsDialog } from 'domains/chains/screens/ChainItem/components/ChainProjectsDialog';
import { useTranslation } from 'modules/i18n/hooks/useTranslation';
import { GuardResolution } from 'modules/common/components/GuardResolution/GuardResolution';
import { useJwtTokenManager } from 'domains/jwtToken/hooks/useJwtTokenManager';

import { usePrivateChainItem } from './hooks/usePrivateChainItem';
import { privateChainItemTranslation } from './translation';

export interface ChainItemProps {
  data: IPrivateChainItemDetails;
}

export const PrivateChainItem = ({ data }: ChainItemProps) => {
  const {
    isLoading: isLoadingTokenManager,
    jwtTokens,
    shouldShowTokenManager,
  } = useJwtTokenManager();

  const {
    isOpened: isOpenedPlansDialog,
    onClose: onClosePlansDialog,
    onOpen: onOpenPlansDialog,
  } = useUpgradePlanDialog();

  const {
    isOpened: isOpenedAddToProjectsDialog,
    onClose: onCloseAddToProjectsDialog,
    onOpen: onOpenAddToProjectsDialog,
  } = useDialog();

  const { keys, t } = useTranslation(privateChainItemTranslation);

  const addToProjectButton = (
    <GuardResolution protectedResolution="smDown">
      <GuardUserGroup blockName={BlockWithPermission.JwtManagerRead}>
        <Button
          size="medium"
          variant="outlined"
          onClick={onOpenAddToProjectsDialog}
          startIcon={<Plus />}
          sx={{
            whiteSpace: 'nowrap',
          }}
        >
          {t(keys.addToProject)}
        </Button>
      </GuardUserGroup>
    </GuardResolution>
  );

  const { chain, headerContent, name } = usePrivateChainItem({
    ...data,
    shouldExpandFlareTestnets: false,
    onBlockedTabClick: onOpenPlansDialog,
    isGroupSelectorAutoWidth: true,
    shouldHideEndpoints: true,
    addToProjectButton,
    isCodeExampleHidden: true,
    isProtocolSwitcherHidden: false,
  });

  useRedirectToAdvancedApi();

  useChainItemBreadcrumbs(chain.name);

  return (
    <>
      <H1Tag title={t('meta.chain-item.h1-tag', { chainId: name })} />
      <ChainItemHeader headerContent={headerContent} />
      <GuardUserGroup blockName={BlockWithPermission.JwtManagerRead}>
        <ChainProjectsSection
          chain={chain}
          onOpenAddToProjectsDialog={onOpenAddToProjectsDialog}
          isLoadingTokenManager={isLoadingTokenManager}
          jwtTokens={jwtTokens}
          shouldShowTokenManager={shouldShowTokenManager}
        />
      </GuardUserGroup>
      {isMultichain(chain.id) && (
        <>
          <AdvancedApiInfoTabs />
          <MultiChainBenefits />
        </>
      )}
      <UsageDataSection chain={chain} />
      <PlansDialog open={isOpenedPlansDialog} onClose={onClosePlansDialog} />
      <ChainProjectsDialog
        chain={chain}
        isOpenedAddToProjectsDialog={isOpenedAddToProjectsDialog}
        onCloseAddToProjectsDialog={onCloseAddToProjectsDialog}
      />
    </>
  );
};
