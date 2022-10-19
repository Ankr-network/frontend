import { EEthereumNetworkId } from '@ankr.com/provider-core';
import {
  useDispatchRequest,
  useMutation,
  useQuery,
} from '@redux-requests/react';
import BigNumber from 'bignumber.js';
import { useCallback, useMemo } from 'react';

import { t } from 'common';

import { configFromEnv } from 'modules/api/config';
import { ETH_NETWORK_BY_ENV, ZERO } from 'modules/common/const';
import { Token } from 'modules/common/types/token';
import { getTokenNativeAmount } from 'modules/dashboard/utils/getTokenNativeAmount';
import { getUSDAmount } from 'modules/dashboard/utils/getUSDAmount';
import { addMATICTokenToWallet } from 'modules/stake-matic/eth/actions/addMATICTokenToWallet';
import { fetchStats as fetchStakePolygonStats } from 'modules/stake-matic/eth/actions/fetchStats';
import { stake as stakeMATIC } from 'modules/stake-matic/eth/actions/stake';
import { unstake } from 'modules/stake-matic/eth/actions/unstake';
import { RoutesConfig as StakeMaticEthRoutes } from 'modules/stake-matic/eth/Routes';
import { getMetrics } from 'modules/stake/actions/getMetrics';
import { EMetricsServiceName } from 'modules/stake/api/metrics';

const token = Token.aMATICc;

export interface IStakedAMATICCData {
  amount: BigNumber;
  chainId: EEthereumNetworkId;
  isLoading: boolean;
  isStakeLoading: boolean;
  isUnstakeLoading: boolean;
  nativeAmount?: BigNumber;
  network: string;
  pendingValue: BigNumber;
  ratio: BigNumber;
  stakeLink: string;
  token: Token;
  tokenAddress: string;
  unstakeLink: string;
  usdAmount?: BigNumber;
  onAddTokenToWallet: () => void;
}

export const useStakedAMATICCData = (): IStakedAMATICCData => {
  const dispatchRequest = useDispatchRequest();
  const { data: statsData, loading: isCommonDataLoading } = useQuery({
    type: fetchStakePolygonStats,
  });

  const { data: metrics } = useQuery({
    type: getMetrics,
  });

  const { loading: isStakeLoading } = useMutation({ type: stakeMATIC });
  const { loading: isUnstakeLoading } = useMutation({ type: unstake });

  const network = t(`chain.${ETH_NETWORK_BY_ENV}`);
  const chainId = ETH_NETWORK_BY_ENV;

  const amount = statsData?.aMATICcBalance ?? ZERO;

  const pendingValue = statsData?.pendingCertificate ?? ZERO;

  const usdAmount = useMemo(
    () =>
      getUSDAmount({
        amount,
        totalStaked: metrics?.[EMetricsServiceName.MATIC]?.totalStaked,
        totalStakedUsd: metrics?.[EMetricsServiceName.MATIC]?.totalStakedUsd,
        ratio: statsData?.aMATICcRatio,
      }),
    [amount, metrics, statsData],
  );

  const nativeAmount = getTokenNativeAmount(amount, statsData?.aMATICcRatio);

  const { polygonConfig } = configFromEnv();

  const onAddTokenToWallet = useCallback(() => {
    dispatchRequest(addMATICTokenToWallet(token));
  }, [dispatchRequest]);

  return {
    amount,
    chainId,
    isLoading: isCommonDataLoading,
    isStakeLoading,
    isUnstakeLoading,
    nativeAmount,
    network,
    pendingValue,
    ratio: statsData?.aMATICcRatio ?? ZERO,
    stakeLink: StakeMaticEthRoutes.stake.generatePath(Token.aMATICc),
    token,
    tokenAddress: polygonConfig.aMATICcToken,
    unstakeLink: StakeMaticEthRoutes.unstake.generatePath(Token.aMATICc),
    usdAmount,
    onAddTokenToWallet,
  };
};
