import { Typography } from '@mui/material';
import { t } from '@ankr.com/common';

import { BalanceTooltip } from 'domains/account/components/BalanceTooltip';

import { intlRoot } from '../../const';
import { useBalanceStyles } from './BalanceStyles';

export interface BalanceProps {
  className?: string;
  creditBalance?: number;
  usdBalance: number;
  balanceInRequests: number;
}

const creditIntlKey = `${intlRoot}.credit-balance`;
const requestsIntlKey = `${intlRoot}.requests-balance`;
const usdIntlKey = `${intlRoot}.usd-balance`;
const reqIntlKey = `${intlRoot}.req-balance`;

export const Balance = ({
  className,
  creditBalance,
  usdBalance,
  balanceInRequests,
}: BalanceProps) => {
  const { classes, cx } = useBalanceStyles();

  return (
    <BalanceTooltip balance={creditBalance || balanceInRequests}>
      <div className={cx(classes.root, className)}>
        <Typography className={classes.creditBalance} variant="h6">
          {creditBalance
            ? t(creditIntlKey, { balance: creditBalance })
            : t(requestsIntlKey, { balance: balanceInRequests })}
        </Typography>
        <Typography className={classes.usdBalance} variant="body2">
          {t(usdIntlKey, { balance: usdBalance })}
        </Typography>
        {Boolean(creditBalance) && (
          <Typography className={classes.usdBalance} variant="body2">
            {t(reqIntlKey, { balance: balanceInRequests })}
          </Typography>
        )}
      </div>
    </BalanceTooltip>
  );
};
