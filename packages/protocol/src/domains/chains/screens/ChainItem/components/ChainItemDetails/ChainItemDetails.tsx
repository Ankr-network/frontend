import React from 'react';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { Timeframe } from 'multirpc-sdk';

import { t } from 'modules/i18n/utils/intl';
import { DetailsBlock } from './DetailsBlock';
import { useStyles } from './ChainItemDetailsStyles';
import {
  formatNumber,
  getAvarageRequests,
  getCachedRequestPercent,
} from './ChainItemDetailsUtils';

interface ChainItemDetailsProps {
  totalRequests?: BigNumber;
  totalCached?: BigNumber;
  className?: string;
  timeframe: Timeframe;
  loading: boolean;
}

export const ChainItemDetails = ({
  totalRequests,
  totalCached,
  timeframe,
  className,
  loading,
}: ChainItemDetailsProps) => {
  const classes = useStyles();

  return (
    <div className={classNames(classes.root, className)}>
      <DetailsBlock
        hasDot
        title={t('chain-item.details.total-requests')}
        value={formatNumber(totalRequests)}
        className={classes.block}
        loading={loading}
      />
      <DetailsBlock
        title={t('chain-item.details.cached-requests')}
        value={getCachedRequestPercent(totalRequests, totalCached)}
        className={classes.block}
        loading={loading}
      />
      <DetailsBlock
        title={t('chain-item.details.average-requests')}
        value={getAvarageRequests(timeframe, totalRequests)}
        className={classes.block}
        loading={loading}
      />
    </div>
  );
};
