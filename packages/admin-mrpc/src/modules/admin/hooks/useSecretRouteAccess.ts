import { useMemo } from 'react';

import { useGetAdminRolesQuery } from '../actions/getAdminRoles';
import { AdminRoles } from '../types';

export const useSecretRouteAccess = () => {
  const { data: adminRoles, isLoading: isLoadingAdminRoles } =
    useGetAdminRolesQuery();

  const hasSecretRouteAccess = useMemo(() => {
    return adminRoles?.some(
      role => role === AdminRoles.USER_ROLE_PRODUCT_MANAGER,
    );
  }, [adminRoles]);

  const hasTestDriveTokenCreationAccess = useMemo(() => {
    return adminRoles?.some(
      role => role === AdminRoles.USER_ROLE_TEST_DRIVE_TOKEN_CREATOR,
    );
  }, [adminRoles]);

  return {
    adminRoles,
    hasTestDriveTokenCreationAccess,
    hasSecretRouteAccess,
    isLoadingAdminRoles,
  };
};
