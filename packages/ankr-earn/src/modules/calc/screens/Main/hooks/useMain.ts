import { resetRequests } from '@redux-requests/core';
import { useDispatchRequest, useQuery } from '@redux-requests/react';
import BigNumber from 'bignumber.js';
import { ChangeEvent, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { useProviderEffect } from 'modules/auth/common/hooks/useProviderEffect';
import { getBalance } from 'modules/calc/actions/getBalance';
import { TCalcToken } from 'modules/calc/types';
import { DEFAULT_ROUNDING, ZERO } from 'modules/common/const';
import { Token } from 'modules/common/types/token';
import { getANKRPrice } from 'modules/stake-ankr/actions/getANKRPrice';
import { getMaxApy as getMaxAnkrApy } from 'modules/stake-ankr/actions/getMaxApy';
import { getMetrics } from 'modules/stake/actions/getMetrics';
import { EMetricsServiceName } from 'modules/stake/api/metrics';

import { SUPPORTED_TOKENS } from '../../../const';

import { TFormValues, useTokensValues } from './useTokensValues';
import {
  ITokenVisibility,
  IUseTokensVisibility,
  useTokensVisibility,
} from './useTokensVisibility';

const balanceRequests = SUPPORTED_TOKENS.map(token => ({
  requestType: getBalance.toString(),
  requestKey: token,
}));

interface IToken {
  apy: BigNumber;
  staked: BigNumber;
  balance: BigNumber;
  usdTokenPrice: BigNumber;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCloseClick: () => void;
}

type TDataByToken = Record<TCalcToken, IToken>;

interface IUseMain {
  avarageApy: BigNumber;
  dataByToken: TDataByToken;
  isLoading: boolean;
  totalYearlyYieldUsd: BigNumber;
  visibilityState: IUseTokensVisibility['state'];
  valuesState: TFormValues;
  visibleCount: number;
  handleAdd: IUseTokensVisibility['handleAdd'];
}

export const useMain = (): IUseMain => {
  const dispatchRequest = useDispatchRequest();
  const dispatch = useDispatch();

  const {
    state: valuesState,
    setTokenValue,
    updateState: updateValuesState,
    setDefaultState: setDefaultValuesState,
  } = useTokensValues();

  const {
    state: visibilityState,
    visibleCount,
    handleRemove,
    handleAdd,
    updateState: updateVisibilityState,
    setDefaultVisibilityState,
  } = useTokensVisibility();

  const { data: metricsData, loading: isMetricsLoading } = useQuery({
    type: getMetrics,
  });

  const { data: ankrApyData, loading: isAnkrApyLoading } = useQuery({
    type: getMaxAnkrApy,
  });

  const { data: ankrPriceData, loading: isAnkrPriceLoading } = useQuery({
    type: getANKRPrice,
  });

  const balanceQueries = SUPPORTED_TOKENS.map(token =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({ type: getBalance, requestKey: token }),
  );

  const { dataByToken, isAllBalancesLoading } = useMemo(
    () =>
      SUPPORTED_TOKENS.reduce(
        (acc, token, index) => {
          const { data: balanceData, loading: isBalanceloading } =
            balanceQueries[index];

          const tokenMetrics = (metricsData ?? {})[
            token.toLowerCase() as EMetricsServiceName
          ];

          const staked = balanceData ? balanceData.staked : ZERO;
          const balance = balanceData ? balanceData.balance : ZERO;

          const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
            setTokenValue(event.target.value, token);

          const handleCloseClick = () => {
            handleRemove(token);
            setTokenValue(
              balance.decimalPlaces(DEFAULT_ROUNDING).toString(),
              token,
            );
          };

          acc.dataByToken[token] = {
            balance,
            staked,
            apy: ZERO,
            usdTokenPrice: ZERO,
            handleChange,
            handleCloseClick,
          };

          if (tokenMetrics) {
            const { apy, totalStaked, totalStakedUsd } = tokenMetrics;
            const usdTokenPrice = totalStakedUsd.dividedBy(totalStaked);

            acc.dataByToken[token].apy = apy;
            acc.dataByToken[token].usdTokenPrice = usdTokenPrice;
          } else if (token === Token.ANKR) {
            acc.dataByToken[token].apy = ankrApyData ?? ZERO;
            acc.dataByToken[token].usdTokenPrice = ankrPriceData ?? ZERO;
          }

          acc.isAllBalancesLoading =
            acc.isAllBalancesLoading || isBalanceloading;
          return acc;
        },
        { dataByToken: {} as TDataByToken, isAllBalancesLoading: false },
      ),
    [
      ankrApyData,
      ankrPriceData,
      balanceQueries,
      metricsData,
      handleRemove,
      setTokenValue,
    ],
  );

  const { totalBalanceUsd, totalYearlyYieldUsd } = useMemo(
    () =>
      Object.keys(dataByToken).reduce(
        (acc, key) => {
          const token = key as TCalcToken;
          const isTokenActive = !!visibilityState.find(
            state => state.token === token,
          )?.visible;

          if (!isTokenActive) {
            return acc;
          }

          const { staked, apy, usdTokenPrice } = dataByToken[token];
          const value = valuesState[token];

          const totalTokenBalanceUsd = staked
            .plus(value || 0)
            .multipliedBy(usdTokenPrice);

          const yearlyTokenYieldUsd = totalTokenBalanceUsd.multipliedBy(
            apy.dividedBy(100),
          );

          acc.totalBalanceUsd = totalTokenBalanceUsd.plus(acc.totalBalanceUsd);
          acc.totalYearlyYieldUsd = yearlyTokenYieldUsd.plus(
            acc.totalYearlyYieldUsd,
          );

          return acc;
        },
        { totalBalanceUsd: ZERO, totalYearlyYieldUsd: ZERO },
      ),
    [dataByToken, valuesState, visibilityState],
  );

  const avarageApy = totalYearlyYieldUsd.isZero()
    ? ZERO
    : totalYearlyYieldUsd.dividedBy(totalBalanceUsd).multipliedBy(100);

  useProviderEffect(() => {
    dispatch(resetRequests(balanceRequests));

    SUPPORTED_TOKENS.forEach(token => {
      dispatchRequest(getBalance(token));
    });

    dispatchRequest(getMetrics());
    dispatchRequest(getMaxAnkrApy());
    dispatchRequest(getANKRPrice());

    return () => {
      dispatch(resetRequests(balanceRequests));
    };
  }, [dispatchRequest]);

  useEffect(() => {
    if (isAllBalancesLoading) {
      return;
    }

    const { newValuesState, newVisibilityState, isAtLeastOneVisible } =
      balanceQueries.reduce(
        (acc, balanceQuery, index) => {
          const token = SUPPORTED_TOKENS[index];
          const balance = balanceQuery.data?.balance ?? ZERO;
          const staked = balanceQuery.data?.staked ?? ZERO;

          const isVisible = !balance.isZero() || !staked.isZero();

          acc.newValuesState[token] = balance
            .decimalPlaces(DEFAULT_ROUNDING)
            .toString();

          acc.newVisibilityState.push({
            visible: isVisible,
            token,
          });

          acc.isAtLeastOneVisible = acc.isAtLeastOneVisible || isVisible;

          return acc;
        },
        {
          newValuesState: {} as TFormValues,
          newVisibilityState: [] as ITokenVisibility[],
          isAtLeastOneVisible: false,
        },
      );

    if (isAtLeastOneVisible) {
      updateValuesState(newValuesState);
      updateVisibilityState(newVisibilityState);
    } else {
      setDefaultValuesState();
      setDefaultVisibilityState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllBalancesLoading]);

  return {
    avarageApy,
    dataByToken,
    isLoading:
      isAllBalancesLoading ||
      isMetricsLoading ||
      isAnkrApyLoading ||
      isAnkrPriceLoading,
    totalYearlyYieldUsd,
    visibilityState,
    valuesState,
    visibleCount,
    handleAdd,
  };
};
