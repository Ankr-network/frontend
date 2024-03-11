import { CreditCard } from '@ankr.com/ui';
import { t } from '@ankr.com/common';
import { useMemo } from 'react';

import { useNextBillingDateStyles } from './NextBillingDateStyles';

export interface NextBillingDateProps {
  className?: string;
  date: string;
  isDeprecatedModel?: boolean;
}

export const NextBillingDate = ({
  className,
  date: outerDate,
  isDeprecatedModel = false,
}: NextBillingDateProps) => {
  const { classes, cx } = useNextBillingDateStyles();

  const date = useMemo(() => new Date(Number(outerDate)), [outerDate]);

  return (
    <div className={cx(classes.root, className)}>
      <CreditCard className={classes.icon} />
      {isDeprecatedModel
        ? t('account.account-details.deprecated-model')
        : t(`account.account-details.next-billing-date`, { date })}
    </div>
  );
};
