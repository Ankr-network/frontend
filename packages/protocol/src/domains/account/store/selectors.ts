import BigNumber from 'bignumber.js';
import {
  BundleType,
  BundlePaymentPlan,
  ISubscriptionsItem,
  MyBundleStatusCounter,
  MyBundleStatus,
  Web3Address,
} from 'multirpc-sdk';
import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { ZERO } from 'modules/common/constants/const';
import {
  EChargingModel,
  ECurrency,
  IAmount,
  IChargingModelData,
  IPAYGChargingModelData,
} from 'modules/billing/types';
import { DEFAULT_SELECTED_RECURRING_USD_AMOUNT } from 'modules/billing/const';
import { fetchANKRAllowanceFee } from 'domains/account/actions/fetchANKRAllowanceFee';
import { fetchANKRDepositFee } from 'domains/account/actions/fetchANKRDepositFee';
import { fetchBalance } from 'domains/account/actions/balance/fetchBalance';
import { fetchBundlePaymentPlans } from 'domains/account/actions/bundles/fetchBundlePaymentPlans';
import { fetchMyBundles } from 'domains/account/actions/bundles/fetchMyBundles';
import { fetchMyBundlesStatus } from 'domains/account/actions/bundles/fetchMyBundlesStatus';
import { fetchMySubscriptions } from 'domains/account/actions/subscriptions/fetchMySubscriptions';
import { fetchNativeTokenPrice } from 'domains/account/actions/fetchNativeTokenPrice';
import { fetchRates } from 'domains/account/actions/rate/fetchRates';
import { fetchTokenPrice } from 'domains/account/actions/fetchTokenPrice';
import { fetchUSDSubscriptionPrices } from 'domains/account/actions/usdTopUp/fetchUSDSubscriptionPrices';
import { getDateFromUnixSeconds } from 'modules/common/utils/getDateFromUnixSeconds';
import { getAggregatedDealChargingModelData } from 'domains/account/utils/getDealChargingModelData';
import { getAggregatedPackageModelsData } from 'domains/account/utils/getPackageChargingModelData';
import { isDealPlan } from 'domains/account/utils/isDealPlan';
import { isPackagePlan } from 'domains/account/utils/isPackagePlan';

import {
  ALL_BLOCKCHAINS_PATH,
  ANKR_TO_CREDITS_RATE,
  CREDITS_TO_REQUESTS_RATE,
  DEFAULT_BALANCE,
  ZERO_STRING,
} from './const';
import { ITransaction } from './types';
import { fetchMyAllowance } from '../actions/fetchMyAllowance';
import { fetchTxData } from '../actions/fetchTxData';
import { fetchTxReceipt } from '../actions/fetchTxReceipt';
import { fetchGasPrice } from '../actions/fetchGasPrice';

export const selectTopUpOrigin = (state: RootState) =>
  state.accountTopUp.topUpOrigin;

export const selectTransaction = (
  state: RootState,
  currentAccount: string,
): ITransaction | undefined => state.accountTopUp[currentAccount.toLowerCase()];

export const selectBundlePaymentPlansState = createSelector(
  fetchBundlePaymentPlans.select(),
  state => state,
);

export const selectBundlePaymentPlans = createSelector(
  selectBundlePaymentPlansState,
  ({ data = [] }) =>
    data.map<BundlePaymentPlan>(bundle => ({
      ...bundle,
      price: {
        ...bundle.price,
        amount: (Number(bundle.price.amount) ?? 0).toString(),
      },
    })),
);

export const selectDealPaymentPlans = createSelector(
  selectBundlePaymentPlans,
  plans => plans.filter(isDealPlan),
);

export const selectFirstBundlePaymentPlan = createSelector(
  selectBundlePaymentPlans,
  ([bundle]): BundlePaymentPlan | undefined => bundle,
);

export const selectFirstDealPaymentPlan = createSelector(
  selectDealPaymentPlans,
  ([plan]): BundlePaymentPlan | undefined => plan,
);

export const selectBundlePaymentPlansLoading = createSelector(
  selectBundlePaymentPlansState,
  ({ isLoading }) => isLoading,
);

export const selectBundlePaymentPlansFetching = createSelector(
  selectBundlePaymentPlansState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectBundlePaymentPlansInitLoading = createSelector(
  selectBundlePaymentPlansState,
  ({ data, isLoading }) => isLoading && typeof data === 'undefined',
);

export const selectBundlePaymentPlanByBundleId = createSelector(
  selectBundlePaymentPlans,
  (_state: RootState, bundleId?: string) => bundleId,
  (bundles, bundleId) =>
    bundles.find(({ bundle }) => bundle.bundle_id === bundleId),
);

export const selectBundlePaymentPlanByPriceId = createSelector(
  selectBundlePaymentPlans,
  (_state: RootState, priceId?: string) => priceId,
  (bundles, priceId) =>
    bundles.find(({ bundle }) => bundle.price_id === priceId),
);

export const selectMyBundlesState = createSelector(
  fetchMyBundles.select({ group: undefined }),
  state => state,
);

export const selectMyBundles = createSelector(
  selectMyBundlesState,
  ({ data }) => data || [],
);

export const selectHasMyBundles = createSelector(
  selectMyBundles,
  bundles => bundles.length > 0,
);

export const selectMyCurrentBundle = createSelector(
  selectMyBundles,
  (bundles): ISubscriptionsItem | undefined => bundles[0],
);

export const selectMyCurrentBundlePlan = createSelector(
  (state: RootState) => state,
  selectMyCurrentBundle,
  (state, myBundle) =>
    selectBundlePaymentPlanByPriceId(state, myBundle?.productPriceId),
);

export const selectMyBundlesLoading = createSelector(
  selectMyBundlesState,
  ({ isLoading }) => isLoading,
);

export const selectMyBundlesFetching = createSelector(
  selectMyBundlesState,
  ({ isLoading, data }) => isLoading && typeof data !== 'undefined',
);

export const selectMyBundlesInitLoading = createSelector(
  selectMyBundlesState,
  ({ isLoading, data }) => isLoading && typeof data === 'undefined',
);

export const selectMyBundlesLoaded = createSelector(
  selectMyBundlesState,
  ({ isUninitialized, isLoading }) => !isUninitialized && !isLoading,
);

export const selectIsMyBundleBySubscriptionId = createSelector(
  selectMyBundles,
  (_state: RootState, subsribtionId?: string) => subsribtionId,
  (bundles, subscriptionId) =>
    bundles.some(bundle => bundle.subscriptionId === subscriptionId),
);

export const selectBalanceState = createSelector(
  fetchBalance.select({}),
  state => state,
);

export const selectBalanceLoading = createSelector(
  selectBalanceState,
  ({ isLoading }) => isLoading,
);

export const selectIsBalanceUninitialized = createSelector(
  selectBalanceState,
  ({ isUninitialized }) => isUninitialized,
);

export const selectBalanceFetching = createSelector(
  selectBalanceState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectBalanceData = createSelector(
  selectBalanceState,
  ({ data = DEFAULT_BALANCE }) => data,
);

export const selectAnkrBalance = createSelector(
  selectBalanceData,
  ({ balance_ankr }) => balance_ankr,
);

export const selectTotalBalance = createSelector(
  selectBalanceData,
  ({ balance }) => balance,
);

export const selectUSDBalance = createSelector(
  selectBalanceData,
  ({ balance_usd }) => balance_usd,
);

export const selectVoucherBalance = createSelector(
  selectBalanceData,
  ({ balance_voucher }) => balance_voucher,
);

export const selectAnkrBalanceWithoutVouchers = createSelector(
  selectTotalBalance,
  selectVoucherBalance,
  (total, vouchers) =>
    new BigNumber(total)
      .minus(vouchers)
      .dividedToIntegerBy(ANKR_TO_CREDITS_RATE)
      .toString(),
);

export const selectBalanceLevel = createSelector(
  selectBalanceData,
  ({ balance_level }) => balance_level,
);

export const selectHasZeroBalance = createSelector(
  selectTotalBalance,
  balance => new BigNumber(balance).isZero() ?? true,
);

export const selectMySubscriptionsState = createSelector(
  fetchMySubscriptions.select({}),
  state => state,
);

export const selectMySubscriptionsLoading = createSelector(
  selectMySubscriptionsState,
  ({ isLoading }) => isLoading,
);

export const selectMySubscriptionsFetching = createSelector(
  selectMySubscriptionsState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectMySubscriptionsInitLoading = createSelector(
  selectMySubscriptionsState,
  ({ data, isLoading }) => isLoading && typeof data === 'undefined',
);

export const selectMySubscriptions = createSelector(
  selectMySubscriptionsState,
  ({ data }) => data?.items ?? [],
);

export const selectHasMySubscriptions = createSelector(
  selectMySubscriptions,
  subscriptions => subscriptions.length > 0,
);

export const selectAllMySubcriptionsAmount = createSelector(
  selectMySubscriptions,
  subscriptions =>
    subscriptions
      .reduce((amount, subscription) => amount.plus(subscription.amount), ZERO)
      .toString(),
);

export const selectMyBundlesStatusState = createSelector(
  fetchMyBundlesStatus.select({ group: undefined }),
  state => state,
);

export const selectMyBundlesStatus = createSelector(
  selectMyBundlesStatusState,
  ({ data = [] }) => data,
);

export const selectMyBundleStatusesByBundleId = createSelector(
  selectMyBundlesStatus,
  (_state: RootState, bundleId?: string) => bundleId,
  (statuses, bundleId) =>
    statuses.filter(status => status.bundleId === bundleId),
);

export const selectMyBundlesStatusLoading = createSelector(
  selectMyBundlesStatusState,
  ({ isLoading }) => isLoading,
);

export const selectMyBundlesStatusFetching = createSelector(
  selectMyBundlesStatusState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectMyBundlesStatusInitLoading = createSelector(
  selectMyBundlesStatusState,
  ({ data, isLoading }) => isLoading && typeof data === 'undefined',
);

export const selectMyCurrentBundleStatuses = createSelector(
  (state: RootState) => state,
  selectMyCurrentBundlePlan,
  (state, plan) =>
    selectMyBundleStatusesByBundleId(state, plan?.bundle.bundle_id),
);

export const selectMyCurrentBundleAllBlockChainsLimit = createSelector(
  selectMyCurrentBundlePlan,
  plan => {
    const limits = plan?.bundle.limits ?? [];
    const limit = limits.find(
      ({ blockchain_paths }) => blockchain_paths === ALL_BLOCKCHAINS_PATH,
    )?.limit;

    return Number(limit) || 0;
  },
);

export const selectMyCurrentBundleRequestsUsed = createSelector(
  selectMyCurrentBundleStatuses,
  selectMyCurrentBundleAllBlockChainsLimit,
  (statuses, limit) => {
    const counters = statuses
      .reduce<MyBundleStatusCounter[]>(
        (result, status) => [...result, ...status.counters],
        [],
      )
      .filter(
        ({ blockchainPaths }) => blockchainPaths === ALL_BLOCKCHAINS_PATH,
      );

    const requestsLeft = counters.reduce(
      (result, { count }) => result + Number(count) ?? 0,
      0,
    );

    const requestsLimit = limit * counters.length;

    return requestsLimit ? (requestsLimit - requestsLeft) / requestsLimit : 0;
  },
);

export const selectMyRecurringPayments = createSelector(
  selectMyBundles,
  selectMySubscriptions,
  selectBundlePaymentPlans,
  (bundles, subscriptions, bundlePaymentPlans) =>
    [...subscriptions, ...bundles].sort((a, b) => {
      const currentPlan = bundlePaymentPlans.find(plan => {
        return plan.bundle.price_id === a.productPriceId;
      });

      const isPackageBundlePlan = isPackagePlan(currentPlan);

      if (isPackageBundlePlan) {
        return 1;
      }

      return +a.currentPeriodEnd - +b.currentPeriodEnd;
    }),
);

export const selectMyRecurringPaymentsWithoutPackage = createSelector(
  selectMyRecurringPayments,
  selectBundlePaymentPlans,
  (payments, bundlePaymentPlans) => {
    return payments.filter(payment => {
      const currentPlan = bundlePaymentPlans.find(plan => {
        return plan.bundle.price_id === payment.productPriceId;
      });

      return !isPackagePlan(currentPlan);
    });
  },
);

export const selectAllRecurringPaymentsAmount = createSelector(
  selectMyRecurringPayments,
  payments =>
    payments
      .reduce((amount, payment) => amount.plus(payment.amount), ZERO)
      .toString(),
);

export const selectHasRecurringPayments = createSelector(
  selectMyRecurringPayments,
  payments => payments.length > 0,
);

export const selectFullPAYGBalance = createSelector(
  selectBalanceLevel,
  selectAnkrBalance,
  selectTotalBalance,
  selectUSDBalance,
  selectVoucherBalance,
  selectAnkrBalanceWithoutVouchers,
  (
    balancePaygLevel,
    balancePaygAnkr,
    balancePaygTotal,
    balancePaygUsd,
    balancePaygVoucher,
    balancePaygWithoutVouchers,
    // eslint-disable-next-line max-params
  ) => {
    const balanceInRequests =
      Number(balancePaygTotal) / CREDITS_TO_REQUESTS_RATE;

    return {
      balanceLevel: balancePaygLevel,
      balanceAnkr: Number(balancePaygAnkr),
      balanceTotal: Number(balancePaygTotal),
      balanceApiCredits: Number(balancePaygTotal),
      balanceUsd: Number(balancePaygUsd),
      balanceVoucher: Number(balancePaygVoucher),
      balanceWithoutVouchers: Number(balancePaygWithoutVouchers),
      balanceInRequests,
    };
  },
);

export const selectPAYGChargingModelData = createSelector(
  selectFullPAYGBalance,
  fullPAYGBalance => {
    const chargingModelPayg: IPAYGChargingModelData = {
      type: EChargingModel.PAYG,
      balance: fullPAYGBalance,
    };

    return chargingModelPayg;
  },
);

export const selectDealChargingModelData = createSelector(
  selectMyBundlesStatusState,
  selectBundlePaymentPlans,
  (myByndlesStatus, bundlePaymentPlans) => {
    /* Deal charging model data */
    if (myByndlesStatus.data) {
      const dealChargingModels = myByndlesStatus.data.filter(bundle => {
        return bundle.counters.find(
          counter => counter.type === BundleType.COST,
        );
      });

      if (dealChargingModels?.length > 0) {
        return getAggregatedDealChargingModelData({
          dealChargingModels,
          bundlePaymentPlans,
        });
      }
    }

    return undefined;
  },
);

export const selectHasActiveDeal = createSelector(
  selectMyBundles,
  selectBundlePaymentPlans,
  (myBundles, bundlePaymentPlans) => {
    const activeDeals = myBundles.filter(bundle => {
      const currentPlan = bundlePaymentPlans.find(plan => {
        return plan.bundle.price_id === bundle.productPriceId;
      });

      return isDealPlan(currentPlan);
    });

    return activeDeals.length > 0;
  },
);

export const selectPackageChargingModelData = createSelector(
  selectMyBundlesStatusState,
  selectBundlePaymentPlans,
  (myByndlesStatus, bundlePaymentPlans) => {
    /* Package charging model data (will be deprecated soon) */
    const packageChargingModels: MyBundleStatus[] | undefined =
      myByndlesStatus?.data?.filter(bundle => {
        const hasQtyCounter = bundle.counters.find(
          counter => counter.type === BundleType.QTY,
        );

        const hasCostCounter = bundle.counters.find(
          counter => counter.type === BundleType.COST,
        );

        return hasQtyCounter && !hasCostCounter;
      });

    if (!packageChargingModels?.length) {
      return undefined;
    }

    return getAggregatedPackageModelsData({
      packageChargingModels,
      bundlePaymentPlans,
    });
  },
);

export const selectAccountChargingModels = createSelector(
  selectPAYGChargingModelData,
  selectDealChargingModelData,
  selectPackageChargingModelData,
  (
    paygChargingModelData,
    dealChargingModelData,
    packageChargingModelData,
  ): IChargingModelData[] => {
    const chargingModels: IChargingModelData[] = [paygChargingModelData];

    if (dealChargingModelData) {
      const isExpired =
        new Date() > getDateFromUnixSeconds(dealChargingModelData.expires);

      const isUsed = dealChargingModelData.progressValue >= 100;

      if (isExpired || isUsed) {
        chargingModels.push(dealChargingModelData);
      } else {
        // if user has actual deal model, it should be shown first
        chargingModels.unshift(dealChargingModelData);
      }
    }

    if (packageChargingModelData) {
      const isUsed = packageChargingModelData.progressValue >= 100;

      if (packageChargingModelData.isExpired || isUsed) {
        chargingModels.push(packageChargingModelData);
      } else {
        // if user has actual package model, it should be shown first and have higher priority then deal model
        chargingModels.unshift(packageChargingModelData);
      }
    }

    return chargingModels;
  },
);

export const selectActiveChargingModel = createSelector(
  selectAccountChargingModels,
  chargingModels => chargingModels[0],
);

export const selectUSDSubscriptionPricesState = createSelector(
  fetchUSDSubscriptionPrices.select(undefined as unknown as never),
  state => state,
);

export const selectUSDSubscriptionPricesFetching = createSelector(
  selectUSDSubscriptionPricesState,
  ({ isLoading, data }) => isLoading && typeof data !== 'undefined',
);

export const selectUSDSubscruptionPricesLoading = createSelector(
  selectUSDSubscriptionPricesState,
  ({ isLoading }) => isLoading,
);

export const selectUSDSubscruptionPrices = createSelector(
  selectUSDSubscriptionPricesState,
  ({ data = [] }) =>
    [...data].sort((a, b) => Number(a.amount) - Number(b.amount)),
);

export const selectUSDSubscriptionAmounts = createSelector(
  selectUSDSubscruptionPrices,
  prices =>
    prices
      // Filtering unnecessary price to fit the design.
      // Presented on stage environment only.
      .filter(price => price.amount !== '12.00')
      .map<IAmount>(price => ({
        id: price.id,
        value: Number(price.amount),
        currency: ECurrency.USD,
      })),
);

export const selectDefaultUSDSubscriptionAmountID = createSelector(
  selectUSDSubscriptionAmounts,
  amounts =>
    amounts.find(
      amount => amount.value === DEFAULT_SELECTED_RECURRING_USD_AMOUNT,
    )?.id,
);

export const selectRatesState = createSelector(
  fetchRates.select(undefined as unknown as never),
  state => state,
);

export const selectRatesFetching = createSelector(
  selectRatesState,
  ({ isLoading, data }) => isLoading && typeof data !== 'undefined',
);

export const selectRatesLoading = createSelector(
  selectRatesState,
  ({ isLoading }) => isLoading,
);

export const selectRates = createSelector(
  selectRatesState,
  ({ data = [] }) => data,
);

export const selectANKRAllowanceFeeState = createSelector(
  fetchANKRAllowanceFee.select(undefined as never),
  state => state,
);

export const selectANKRAllowanceFee = createSelector(
  selectANKRAllowanceFeeState,
  ({ data = 0 }) => data,
);

export const selectANKRAllowanceFeeFetching = createSelector(
  selectANKRAllowanceFeeState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectANKRAllowanceFeeLoading = createSelector(
  selectANKRAllowanceFeeState,
  ({ isLoading }) => isLoading,
);

export const selectTokenPriceState = createSelector(
  fetchTokenPrice.select(undefined as never),
  state => state,
);

export const selectTokenPrice = createSelector(
  selectTokenPriceState,
  ({ data = ZERO_STRING }) => data,
);

export const selectTokenPriceFetching = createSelector(
  selectTokenPriceState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectTokenPriceLoading = createSelector(
  selectTokenPriceState,
  ({ isLoading }) => isLoading,
);

export const selectNativeTokenPriceState = createSelector(
  fetchNativeTokenPrice.select(undefined as never),
  state => state,
);

export const selectNativeTokenPrice = createSelector(
  selectNativeTokenPriceState,
  ({ data = ZERO_STRING }) => data,
);

export const selectNativeTokenPriceFetching = createSelector(
  selectNativeTokenPriceState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectNativeTokenPriceLoading = createSelector(
  selectNativeTokenPriceState,
  ({ isLoading }) => isLoading,
);

export const selectANKRDepositFeeState = createSelector(
  fetchANKRDepositFee.select(undefined as never),
  state => state,
);

export const selectANKRDepositFee = createSelector(
  selectANKRDepositFeeState,
  ({ data = 0 }) => data,
);

export const selectANKRDepositFeeFetching = createSelector(
  selectANKRDepositFeeState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectANKRDepositFeeLoading = createSelector(
  selectANKRDepositFeeState,
  ({ isLoading }) => isLoading,
);

export const selectHasProcessingTransaction = createSelector(
  (state: RootState, address?: Web3Address) =>
    address ? selectTransaction(state, address) : undefined,
  transaction => Boolean(transaction && transaction.isProcessing),
);

export const selectMyAllowanceState = createSelector(
  fetchMyAllowance.select(undefined as never),
  state => state,
);

export const selectMyAllowanceLoading = createSelector(
  selectMyAllowanceState,
  ({ isLoading }) => isLoading,
);

export const selectMyAllowanceValue = createSelector(
  selectMyAllowanceState,
  ({ data = ZERO_STRING }) => data,
);

export const selectIsEnoughAllowance = createSelector(
  selectMyAllowanceValue,
  selectTransaction,
  (allowance, transaction) =>
    Number(allowance) >= Number(transaction?.amountToDeposit),
);

export const selectTxDataState = createSelector(
  (state: RootState, txHash: string) => fetchTxData.select({ txHash })(state),
  state => state,
);

export const selectTxData = createSelector(
  selectTxDataState,
  ({ data }) => data,
);

export const selectTxDataFetching = createSelector(
  selectTxDataState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectTxDataLoading = createSelector(
  selectTxDataState,
  ({ isLoading }) => isLoading,
);

export const selectTxReceiptState = createSelector(
  (state: RootState, txHash: string) =>
    fetchTxReceipt.select({ txHash })(state),
  state => state,
);

export const selectTxReceipt = createSelector(
  selectTxReceiptState,
  ({ data }) => data,
);

export const selectTxReceiptFetching = createSelector(
  selectTxReceiptState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectTxReceiptLoading = createSelector(
  selectTxReceiptState,
  ({ isLoading }) => isLoading,
);

export const selectGasPriceState = createSelector(
  fetchGasPrice.select(),
  state => state,
);

export const selectGasPrice = createSelector(
  selectGasPriceState,
  ({ data = ZERO_STRING }) => data,
);

export const selectGasPriceFetching = createSelector(
  selectGasPriceState,
  ({ data, isLoading }) => isLoading && typeof data !== 'undefined',
);

export const selectGasPriceLoading = createSelector(
  selectGasPriceState,
  ({ isLoading }) => isLoading,
);
