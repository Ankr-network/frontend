import { useLayoutEffect } from 'react';

import { useLazyChainsFetchPrivateChainsInfoQuery } from 'domains/chains/actions/private/fetchPrivateChainsInfo';
import { useUserEndpointToken } from 'domains/chains/hooks/useUserEndpointToken';

const defaultData = {
  chains: [],
  allChains: [],
};

export const usePrivateChainsInfo = () => {
  const userEndpointToken = useUserEndpointToken();

  const [
    fetchPrivateChainsInfo,
    {
      data: { chains, allChains } = defaultData,
      isLoading,
      isFetching,
      isUninitialized,
    },
  ] = useLazyChainsFetchPrivateChainsInfoQuery();

  useLayoutEffect(() => {
    if (userEndpointToken) {
      fetchPrivateChainsInfo({
        userEndpointToken,
      });
    }
  }, [fetchPrivateChainsInfo, userEndpointToken]);

  return { chains, allChains, isLoading, isFetching, isUninitialized };
};
