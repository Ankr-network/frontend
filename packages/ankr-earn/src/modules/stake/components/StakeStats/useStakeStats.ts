import { useQuery } from '@redux-requests/react';
import BigNumber from 'bignumber.js';

import { DEFAULT_ROUNDING } from 'modules/common/const';
import { BigNumberish } from 'modules/common/utils/numbers/converters';
import { getMetrics } from 'modules/stake/actions/getMetrics';
import { EMetricsServiceName } from 'modules/stake/api/metrics/const';

interface IStatsProps {
  amount: BigNumberish;
  metricsServiceName: EMetricsServiceName;
}

interface IUseStakeStats {
  apy: string;
  yearlyEarning: string;
  yearlyEarningUSD?: string;
  totalStaked?: string;
  totalStakedUSD?: string;
  stakers?: string;
}

export const useStakeStats = ({
  amount,
  metricsServiceName,
}: IStatsProps): IUseStakeStats => {
  const { data: metricsData } = useQuery({ type: getMetrics });
  const metrics = metricsData ? metricsData[metricsServiceName] : undefined;

  const apy = metrics?.apy ?? '0';
  const yearlyEarning = calculateYearlyEarning(amount, apy);

  const totalStaked = metrics?.totalStaked;
  const totalStakedUsd = metrics?.totalStakedUsd;
  const stakers = metrics?.stakers;

  const usdRatio = totalStaked && totalStakedUsd?.div(totalStaked);

  const yearlyEarningUSD = usdRatio
    ? usdRatio
        .multipliedBy(yearlyEarning)
        .decimalPlaces(DEFAULT_ROUNDING)
        .toFormat()
    : undefined;

  return {
    apy,
    yearlyEarning: yearlyEarning.toFormat(),
    yearlyEarningUSD,
    totalStaked: totalStaked?.decimalPlaces(DEFAULT_ROUNDING).toFormat(),
    totalStakedUSD: totalStakedUsd?.toFormat(0),
    stakers,
  };
};

function calculateYearlyEarning(amount: BigNumberish, apy: string): BigNumber {
  return new BigNumber(amount).multipliedBy(apy).dividedBy(100);
}
