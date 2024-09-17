import { useMemo } from 'react';
import { Chain } from '@ankr.com/chains-list';

import { useGroupedEndpoints } from 'modules/endpoints/hooks/useGrouppedEndpoints';
import { getChainName } from 'uiKit/utils/metatags';

import { useNetId } from './useNetId';

export interface ICommonChainItemParams {
  chain: Chain;
  shouldExpandFlareTestnets?: boolean;
}

export const useCommonChainItem = ({
  chain,
  shouldExpandFlareTestnets = false,
}: ICommonChainItemParams) => {
  const chainId = chain.id;
  const name = useMemo(() => getChainName(chainId), [chainId]);
  const endpoints = useGroupedEndpoints(chain, shouldExpandFlareTestnets);
  const netId = useNetId();
  const publicEndpoints = useGroupedEndpoints(chain, shouldExpandFlareTestnets);

  return {
    chain,
    name,
    endpoints,
    netId,
    publicEndpoints,
  };
};
