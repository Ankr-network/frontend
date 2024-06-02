import { OverlaySpinner } from '@ankr.com/ui';

import { AMOUNTS_COLUMNS } from './const';
import { AmountChips, IAmountChipsProps } from '../AmountChips';
import { AmountHeader } from '../AmountHeader';
import { useRecurringAmountStyles } from './useRecurringAmountStyles';

export interface IRecurringAmountProps
  extends Omit<IAmountChipsProps, 'columns' | 'rows'> {
  className?: string;
  isLoading?: boolean;
}

export const RecurringAmount = ({
  amounts,
  className,
  isLoading,
  onAmountSelect,
  selectedAmountID,
}: IRecurringAmountProps) => {
  const { classes, cx } = useRecurringAmountStyles();

  return (
    <div className={cx(classes.recurringAmountRoot, className)}>
      <AmountHeader />
      {isLoading ? (
        <OverlaySpinner size={90} />
      ) : (
        <AmountChips
          amounts={amounts}
          columns={AMOUNTS_COLUMNS}
          onAmountSelect={onAmountSelect}
          selectedAmountID={selectedAmountID}
          shouldDisplayRequestsWhenSelected
        />
      )}
    </div>
  );
};
