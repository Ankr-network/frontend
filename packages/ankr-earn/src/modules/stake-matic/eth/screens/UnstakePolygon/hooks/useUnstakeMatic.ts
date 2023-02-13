import { tHTML } from '@ankr.com/common';
import BigNumber from 'bignumber.js';
import { useCallback } from 'react';

import { useProviderEffect } from 'modules/auth/common/hooks/useProviderEffect';
import {
  ACTION_CACHE_SEC,
  ANKR_1INCH_BUY_LINK,
  DECIMAL_PLACES,
  ZERO,
} from 'modules/common/const';
import { FormErrors } from 'modules/common/types/FormErrors';
import { Token } from 'modules/common/types/token';
import { RoutesConfig as DashboardRoutes } from 'modules/dashboard/Routes';
import { TMaticSyntToken } from 'modules/stake-matic/common/types';
import { getValidSelectedToken } from 'modules/stake-matic/common/utils/getValidSelectedToken';
import { useGetAnkrBalanceQuery } from 'modules/stake-matic/eth/actions/getAnkrBalance';
import { useGetMaticOnEthStakeStatsQuery } from 'modules/stake-matic/eth/actions/getMaticOnEthStakeStats';
import { useGetMaticOnEthStatsQuery } from 'modules/stake-matic/eth/actions/getMaticOnEthStats';
import { useUnstakeMaticOnEthMutation } from 'modules/stake-matic/eth/actions/unstakeMaticOnEth';
import { RoutesConfig } from 'modules/stake-matic/eth/Routes';
import { IUnstakeFormValues } from 'modules/stake/components/UnstakeDialog';

import { useUnstakeMaticAnalytics } from './useUnstakeMaticAnalytics';

interface IUseUnstakeMatic {
  syntTokenBalance?: BigNumber;
  minAmount: BigNumber;
  isFetchStatsLoading: boolean;
  isUnstakeLoading: boolean;
  isWithApprove: boolean;
  unstakeFee: BigNumber;
  closeHref: string;
  selectedToken: TMaticSyntToken;
  onExtraValidation: (
    values: Partial<IUnstakeFormValues>,
    errors: FormErrors<IUnstakeFormValues>,
  ) => FormErrors<IUnstakeFormValues>;
  onUnstakeSubmit: (values: IUnstakeFormValues) => void;
  calcTotalRecieve: (amount: BigNumber) => string;
}

export const useUnstakeMatic = (): IUseUnstakeMatic => {
  const { sendAnalytics } = useUnstakeMaticAnalytics();

  const { data: ankrBalance } = useGetAnkrBalanceQuery(undefined, {
    refetchOnMountOrArgChange: ACTION_CACHE_SEC,
  });

  const stakeParamsToken = RoutesConfig.unstake.useParams().token;
  const selectedToken = getValidSelectedToken(stakeParamsToken);

  const {
    data: statsData,
    isFetching: isStatsLoading,
    refetch: getMATICETHStatsRefetch,
  } = useGetMaticOnEthStatsQuery(undefined, {
    refetchOnMountOrArgChange: ACTION_CACHE_SEC,
  });
  const {
    data: stakeStatsData,
    isFetching: isStakeStatsLoading,
    refetch: getMATICETHStakeStatsRefetch,
  } = useGetMaticOnEthStakeStatsQuery(undefined, {
    refetchOnMountOrArgChange: ACTION_CACHE_SEC,
  });
  const [unstake, { isLoading: isUnstakeLoading }] =
    useUnstakeMaticOnEthMutation();

  const isBondToken = selectedToken === Token.aMATICb;
  const closeHref = DashboardRoutes.dashboard.generatePath();
  const syntTokenBalance = isBondToken
    ? statsData?.aMATICbBalance
    : statsData?.aMATICcBalance;

  const minAmaticbAmount = statsData?.aMATICbBalance ?? ZERO;
  const minAmaticcAmount = statsData?.aMATICcBalance ?? ZERO;
  const amaticcRatio = statsData?.aMATICcRatio ?? ZERO;
  const unstakeFee = stakeStatsData?.unstakeFee ?? ZERO;
  const minAmount = isBondToken ? minAmaticbAmount : minAmaticcAmount;

  const isWithApprove = !isBondToken;

  const handleSubmit = useCallback(
    (amount: BigNumber) => {
      const resultAmount = new BigNumber(amount);

      unstake({ amount: resultAmount, token: selectedToken })
        .unwrap()
        .then(() => {
          sendAnalytics(resultAmount, selectedToken);
        });
    },
    [selectedToken, sendAnalytics, unstake],
  );

  const onUnstakeSubmit = useCallback(
    ({ amount }: IUnstakeFormValues): void => {
      if (!amount) return;

      const value = new BigNumber(amount);

      handleSubmit(value);
    },
    [handleSubmit],
  );

  const calcTotalRecieve = useCallback(
    (amount: BigNumber = ZERO): string => {
      let total = amount;

      if (!isBondToken) {
        total = total.dividedBy(amaticcRatio ?? ZERO);
        total = total.isNaN() ? ZERO : total;
      }

      return total.decimalPlaces(DECIMAL_PLACES).toFormat();
    },
    [amaticcRatio, isBondToken],
  );

  const onExtraValidation = (
    _data: Partial<IUnstakeFormValues>,
    errors: FormErrors<IUnstakeFormValues>,
  ): FormErrors<IUnstakeFormValues> => {
    if (ankrBalance?.isLessThan(unstakeFee)) {
      errors.amount = tHTML(
        'stake-matic-dashboard.validation.is-not-enough-fee',
        {
          value: ankrBalance?.toFormat(),
          link: ANKR_1INCH_BUY_LINK,
        },
      );
    }

    return errors;
  };

  useProviderEffect(() => {
    getMATICETHStatsRefetch();
    getMATICETHStakeStatsRefetch();
  }, []);

  return {
    syntTokenBalance,
    selectedToken,
    minAmount,
    isFetchStatsLoading: isStatsLoading || isStakeStatsLoading,
    isUnstakeLoading,
    unstakeFee,
    closeHref,
    isWithApprove,
    onExtraValidation,
    onUnstakeSubmit,
    calcTotalRecieve,
  };
};
