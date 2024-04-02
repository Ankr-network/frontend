import { Dialog } from 'uiKit/Dialog';
import { useWindowHeight } from 'hooks/useWindowHeight';
import { ECurrency } from 'modules/billing/types';

import { ContentType, UpgradePlanDialogType } from './types';
import { useUpgradePlanDialogState } from './hooks/useUpgradePlanDialogState';
import { useUpgradePlanDialogStyles } from './UpgradePlanDialogStyles';

export interface UpgradePlanDialogProps {
  currency?: ECurrency;
  defaultState?: ContentType;
  onClose: () => void;
  open: boolean;
  type?: UpgradePlanDialogType;
}

export const UpgradePlanDialog = ({
  currency,
  defaultState,
  onClose,
  open,
  type = UpgradePlanDialogType.Default,
}: UpgradePlanDialogProps) => {
  const { dialogProps, isContactSalesPopup } = useUpgradePlanDialogState({
    currency,
    defaultState,
    onClose,
    type,
  });

  const windowHeight = useWindowHeight();
  const { classes, cx } = useUpgradePlanDialogStyles({ windowHeight });

  return (
    <Dialog
      className={classes.root}
      maxPxWidth={620}
      classes={{
        container: classes.dialogContainer,
      }}
      open={open}
      paperClassName={cx(classes.paperRoot, {
        [classes.dialogContainerWhite]: isContactSalesPopup,
      })}
      titleClassName={cx(classes.title, {
        [classes.dialogTitleBlack]: isContactSalesPopup,
      })}
      {...dialogProps}
    />
  );
};
