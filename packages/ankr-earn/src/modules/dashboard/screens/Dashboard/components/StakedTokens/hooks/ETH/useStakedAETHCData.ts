import {
  useDispatchRequest,
  useMutation,
  useQuery,
} from '@redux-requests/react';
import BigNumber from 'bignumber.js';
import { useCallback, useMemo } from 'react';

import {
  AvailableWriteProviders,
  EEthereumNetworkId,
} from '@ankr.com/provider';
import { t } from 'common';

import { useConnectedData } from 'modules/auth/common/hooks/useConnectedData';
import { RoutesConfig as BoostRoutes } from 'modules/boost/Routes';
import { ETH_NETWORK_BY_ENV, ZERO } from 'modules/common/const';
import { Token } from 'modules/common/types/token';
import { getTokenNativeAmount } from 'modules/dashboard/utils/getTokenNativeAmount';
import { getUSDAmount } from 'modules/dashboard/utils/getUSDAmount';
import { getCommonData } from 'modules/stake-eth/actions/getCommonData';
import { stake } from 'modules/stake-eth/actions/stake';
import { RoutesConfig } from 'modules/stake-eth/Routes';
import { getMetrics } from 'modules/stake/actions/getMetrics';
import { EMetricsServiceName } from 'modules/stake/api/metrics';
import { addSwitcherTokenToWallet } from 'modules/switcher/actions/wallet';

export interface IStakedAETHCData {
  address?: string;
  amount: BigNumber;
  chainId: EEthereumNetworkId;
  isBalancesLoading: boolean;
  isShowed: boolean;
  isStakeLoading: boolean;
  nativeAmount?: BigNumber;
  network: string;
  pendingValue: BigNumber;
  ratio: BigNumber;
  stakeLink?: string;
  tradeLink: string;
  usdAmount?: BigNumber;
  walletName?: string;
  handleAddTokenToWallet: () => void;
}

export const useStakedAETHCData = (): IStakedAETHCData => {
  const dispatchRequest = useDispatchRequest();

  const { address, walletName } = useConnectedData(
    AvailableWriteProviders.ethCompatible,
  );

  const { loading: isStakeLoading } = useMutation({ type: stake });

  const { data: statsData, loading: isBalancesLoading } = useQuery({
    type: getCommonData,
  });

  const { data: metrics } = useQuery({
    type: getMetrics,
  });

  const network = t(`chain.${ETH_NETWORK_BY_ENV}`);
  const chainId = ETH_NETWORK_BY_ENV;

  const amount = statsData?.aETHcBalance ?? ZERO;
  const pendingValue = ZERO;
  const usdAmount = useMemo(
    () =>
      getUSDAmount({
        amount,
        totalStaked: metrics?.[EMetricsServiceName.ETH]?.totalStaked,
        totalStakedUsd: metrics?.[EMetricsServiceName.ETH]?.totalStakedUsd,
        ratio: statsData?.aETHcRatio,
      }),
    [amount, metrics, statsData],
  );

  const isShowed =
    !amount.isZero() || !pendingValue.isZero() || isBalancesLoading;

  const nativeAmount = getTokenNativeAmount(amount, statsData?.aETHcRatio);

  const handleAddTokenToWallet = useCallback(() => {
    dispatchRequest(
      addSwitcherTokenToWallet({ chainId, swapOption: Token.aETHc }),
    );
  }, [chainId, dispatchRequest]);

  return {
    address,
    amount,
    chainId,
    isBalancesLoading,
    isShowed,
    isStakeLoading,
    nativeAmount,
    network,
    pendingValue,
    ratio: statsData?.aETHcRatio ?? ZERO,
    stakeLink: RoutesConfig.stake.generatePath(Token.aETHc),
    tradeLink: BoostRoutes.tradingCockpit.generatePath(Token.aETHc, Token.ETH),
    usdAmount,
    walletName,
    handleAddTokenToWallet,
  };
};
