import { useMemo } from 'react';
import { Timeframe } from '@ankr.com/chains-list';

import { getChartDataByRequests } from 'domains/chains/utils/getChartDataByRequests';
import {
  selectAllTimeTotalRequestsNumber,
  selectTotalRequests,
  selectTotalRequestsNumber,
  selectTotalStatsLoading,
} from 'domains/dashboard/store/selectors/v1';
import { useAppSelector } from 'store/useAppSelector';

import { useTop10Stats } from './useTop10Stats';

export const useAllChainsData = (timeframe: Timeframe) => {
  const allTimeTotalRequestsNumber = useAppSelector(
    selectAllTimeTotalRequestsNumber,
  );
  const requests = useAppSelector(selectTotalRequests);
  const totalRequestsNumber = useAppSelector(selectTotalRequestsNumber);

  const requestsChartData = useMemo(
    () => getChartDataByRequests({ isLoggedIn: true, requests, timeframe }),
    [requests, timeframe],
  );

  const { countries, ipRequests } = useTop10Stats(timeframe);

  const isLoadingTotalStats = useAppSelector(selectTotalStatsLoading);

  return {
    allTimeTotalRequestsNumber,
    countries,
    ipRequests,
    requestsChartData,
    totalRequestsNumber,
    isLoadingTotalStats,
  };
};
