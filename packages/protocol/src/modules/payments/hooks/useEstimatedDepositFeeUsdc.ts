import { useCallback } from 'react';

import { IUseQueryProps } from 'store/queries/types';
import { getQueryParams } from 'store/utils/getQueryParams';
import { useAppSelector } from 'store/useAppSelector';

import {
  IEstimateDepositFeeUsdcParams,
  selectEstimatedDepositFeeUsdc,
  selectEstimatedDepositFeeUsdcLoading,
  useEstimateDepositFeeUsdcQuery,
  useLazyEstimateDepositFeeUsdcQuery,
} from '../actions/estimateDepositFeeUsdc';

export interface IUseEstimatedDepositFeeUsdcProps
  extends IUseQueryProps,
    IEstimateDepositFeeUsdcParams {}

export const useEstimatedDepositFeeUsdc = ({
  skipFetching,
  ...params
}: IUseEstimatedDepositFeeUsdcProps) => {
  const { refetch: handleRefetchEstimatedDepositFeeUsdc } =
    useEstimateDepositFeeUsdcQuery(getQueryParams({ params, skipFetching }));

  const [fetchLazy] = useLazyEstimateDepositFeeUsdcQuery();

  const handleFetchEstimatedDepositFeeUsdc = useCallback(
    () => fetchLazy(params),
    [fetchLazy, params],
  );

  const depositFeeUsdc = useAppSelector(state =>
    selectEstimatedDepositFeeUsdc(state, params),
  );

  const isLoading = useAppSelector(state =>
    selectEstimatedDepositFeeUsdcLoading(state, params),
  );

  return {
    depositFeeUsdc,
    handleFetchEstimatedDepositFeeUsdc,
    handleRefetchEstimatedDepositFeeUsdc,
    isLoading,
  };
};
