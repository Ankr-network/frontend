import { EEthereumNetworkId } from '@ankr.com/provider-core';
import { useDispatchRequest, useQuery } from '@redux-requests/react';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

import { t } from 'common';

import { watchAsset } from 'modules/bridge/actions/watchAsset';
import { AvailableBridgeTokens } from 'modules/bridge/types';
import {
  BSC_NETWORK_BY_ENV,
  SupportedChainIDS,
  ZERO,
} from 'modules/common/const';
import { fetchAMATICBBridgedBSC } from 'modules/dashboard/actions/fetchAMATICBBridgedBSC';
import { getUSDAmount } from 'modules/dashboard/utils/getUSDAmount';
import { getMetrics } from 'modules/stake/actions/getMetrics';
import { EMetricsServiceName } from 'modules/stake/api/metrics';

export interface IStakedMaticData {
  amount: BigNumber;
  chainId: EEthereumNetworkId;
  isBalancesLoading: boolean;
  network: string;
  usdAmount?: BigNumber;
  onAddTokenClick: () => void;
}

export const useBridgedMaticBondBSC = (): IStakedMaticData => {
  const dispatchRequest = useDispatchRequest();

  const { data: statsData, loading: isBalancesLoading } = useQuery({
    type: fetchAMATICBBridgedBSC,
  });

  const { data: metrics } = useQuery({
    type: getMetrics,
  });

  const network = t(`chain.${BSC_NETWORK_BY_ENV}`);
  const chainId = BSC_NETWORK_BY_ENV;

  const amount = statsData ?? ZERO;
  const usdAmount = useMemo(
    () =>
      getUSDAmount({
        amount,
        totalStaked: metrics?.[EMetricsServiceName.MATIC]?.totalStaked,
        totalStakedUsd: metrics?.[EMetricsServiceName.MATIC]?.totalStakedUsd,
      }),
    [amount, metrics],
  );

  const onAddTokenClick = () => {
    dispatchRequest(
      watchAsset({
        token: AvailableBridgeTokens.aMATICb,
        chainId: BSC_NETWORK_BY_ENV as unknown as SupportedChainIDS,
      }),
    );
  };

  return {
    amount,
    chainId,
    isBalancesLoading,
    network,
    usdAmount,
    onAddTokenClick,
  };
};
