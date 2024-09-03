import { ChainItemHeader } from 'domains/chains/screens/ChainItem/components/ChainItemHeader';
import { ChainProtocolContext } from 'domains/chains/screens/ChainItem/constants/ChainProtocolContext';
import { IPublicChainItemDetails } from 'domains/chains/actions/public/fetchPublicChain';
import { useChainItemBreadcrumbs } from 'domains/chains/screens/ChainItem/hooks/useChainItemBreadcrumbs';
import { useRedirectToAdvancedApi } from 'domains/chains/screens/ChainItem/hooks/useRedirectToAdvancedApi';
import { useUpgradePlanDialog } from 'modules/common/components/UpgradePlanDialog';
import { PlansDialog } from 'modules/common/components/PlansDialog';
import { isMultichain } from 'modules/chains/utils/isMultichain';
import { MultiChainBenefits } from 'modules/common/components/GetStartedSection/components/MultichainBenefits';

import { usePublicChainItem } from './hooks/usePublicChainItem';
import { AdvancedApiInfoTabs } from '../../../components/ChainItemSections/components/AdvancedApiInfoTabs';
import { UsageDataSection } from '../../../components/UsageDataSection';

export interface ChainItemProps {
  data: IPublicChainItemDetails;
}

export const PublicChainItem = ({ data }: ChainItemProps) => {
  const { isOpened, onClose, onOpen } = useUpgradePlanDialog();

  const { chain, chainProtocolContext, headerContent } = usePublicChainItem({
    ...data,
    onBlockedTabClick: onOpen,
  });

  useRedirectToAdvancedApi();

  useChainItemBreadcrumbs(chain.name);

  return (
    <>
      <ChainProtocolContext.Provider value={chainProtocolContext}>
        <ChainItemHeader headerContent={headerContent} />
        {isMultichain(chain.id) && (
          <>
            <AdvancedApiInfoTabs />
            <MultiChainBenefits />
          </>
        )}
        <UsageDataSection chain={chain} />
        <PlansDialog open={isOpened} onClose={onClose} />
      </ChainProtocolContext.Provider>
    </>
  );
};
