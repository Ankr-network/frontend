import { IBlockchainEntity } from '@ankr.com/multirpc';
import { getTokenIcon } from '../../../uiKit/utils/getTokenIcon';
import { getTokenByChain } from '../../../modules/common/utils/getTokenByChain';
import { Chain } from '../../../modules/common/types/Chain';

export interface IFetchChainsResponseData {
  chains: Record<
    string,
    {
      blockchain: IBlockchainEntity;
      rpcUrl: string;
      wsUrl: string;
    }
  >;
}

export interface IApiChain {
  id: string;
  icon: string;
  name: string;
  rpcUrl: string;
  wsUrl: string;
  requests?: number;
}

export const mapChains = (data: IFetchChainsResponseData): IApiChain[] => {
  const { chains } = data;

  const chainsArray = Object.values(chains);

  return chainsArray.map(item => {
    const { blockchain, rpcUrl, wsUrl } = item;
    const { id, stats, name } = blockchain;

    const requests = stats?.reqs;

    return {
      id,
      icon: getTokenIcon(getTokenByChain(id as Chain)),
      name,
      rpcUrl,
      wsUrl,
      requests,
    };
  });
};
