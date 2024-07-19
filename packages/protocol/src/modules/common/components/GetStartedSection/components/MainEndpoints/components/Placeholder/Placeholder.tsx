import { ReactNode } from 'react';
import { t } from '@ankr.com/common';

import { PlansDialog } from 'modules/common/components/PlansDialog';
import { useDialog } from 'modules/common/hooks/useDialog';

import { EndpointPlaceholder } from '../../../EndpointPlaceholder';

export interface PlaceholderProps {
  title: ReactNode;
}

export const Placeholder = ({ title }: PlaceholderProps) => {
  const {
    isOpened: isPromoDialogOpened,
    onClose: onPromoDialogClose,
    onOpen: onPromoDialogOpen,
  } = useDialog();

  return (
    <>
      <EndpointPlaceholder
        title={title}
        onClick={onPromoDialogOpen}
        lockedLabel={t('chain-item.get-started.endpoints.lockedLabelHttps')}
      />
      <PlansDialog open={isPromoDialogOpened} onClose={onPromoDialogClose} />
    </>
  );
};
