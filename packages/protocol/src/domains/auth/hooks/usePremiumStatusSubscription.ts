import { useEffect } from 'react';

import { useAppSelector } from 'store/useAppSelector';
import { Options } from 'hooks/useQueryEndpoint';
import { useGuardUserGroup } from 'domains/userGroup/hooks/useGuardUserGroup';
import { BlockWithPermission } from 'domains/userGroup/constants/groups';
import { useGroupJwtToken } from 'domains/userGroup/hooks/useGroupJwtToken';

import { useLazyFetchPremiumStatusQuery } from '../actions/fetchPremiumStatus';
import { selectUserEndpointToken } from '../store';
import { useEnterpriseClientStatus } from './useEnterpriseClientStatus';

const options: Options['subscriptionOptions'] = {
  pollingInterval: 30_000,
};

export const usePremiumStatusSubscription = () => {
  const userEndpointToken = useAppSelector(selectUserEndpointToken);

  const { groupToken } = useGroupJwtToken();

  const [fetch, { isUninitialized }] = useLazyFetchPremiumStatusQuery(options);

  const hasAccess = useGuardUserGroup({
    blockName: BlockWithPermission.AccountStatus,
  });

  const { isEnterpriseClient, isEnterpriseStatusLoading } =
    useEnterpriseClientStatus();

  useEffect(() => {
    const token = groupToken?.jwtToken || userEndpointToken;

    if (!hasAccess || !token || isEnterpriseClient) {
      return () => {};
    }

    if (token && !isEnterpriseClient && !isEnterpriseStatusLoading) {
      const { unsubscribe } = fetch(token);

      return unsubscribe;
    }

    return () => {};
  }, [
    fetch,
    groupToken?.jwtToken,
    hasAccess,
    userEndpointToken,
    isEnterpriseClient,
    isEnterpriseStatusLoading,
  ]);

  return { isUninitialized };
};
