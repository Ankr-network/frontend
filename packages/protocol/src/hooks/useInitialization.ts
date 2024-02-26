import { useAutoconnect } from 'hooks/useAutoconnect';
import { useBalance } from 'domains/account/hooks/useBalance';
import { useCheckChangedSignupUserSettingsAndUpdate } from 'hooks/useCheckChangedSignupUserSettingsAndUpdate';
import { useJwtManagerInitializer } from 'domains/jwtToken/hooks/useJwtManagerInitializer';
import { isReactSnap } from 'modules/common/utils/isReactSnap';
import { useMyBundles } from 'domains/account/hooks/useMyBundles';
import { usePremiumStatusSubscription } from 'domains/auth/hooks/usePremiumStatusSubscription';
import { BlockWithPermission } from 'domains/userGroup/constants/groups';
import { useGuardUserGroup } from 'domains/userGroup/hooks/useGuardUserGroup';
import { useEnterpriseStatusFetch } from 'domains/auth/hooks/useEnterpriseStatus';
import { useBlockchainsLoader } from 'hooks/useBlockchainsLoader';
import { useUserGroupFetchCreationAllowanceQuery } from 'domains/userGroup/actions/fetchGroupCreationAllowance';
import { useRedirectToTeamsSettings } from 'modules/groups/hooks/useRedirectToTeamsSettings';
import { useOnMount } from 'modules/common/hooks/useOnMount';
import { removeAvoidGuestTeamInvitationDialog } from 'domains/userSettings/screens/TeamInvitation/utils/teamInvitationUtils';

export const useInitialization = (isLoggedIn: boolean) => {
  const hasBillingRoleAccess = useGuardUserGroup({
    blockName: BlockWithPermission.Billing,
  });

  const hasJwtReadRoleAccess = useGuardUserGroup({
    blockName: BlockWithPermission.JwtManagerRead,
  });

  const shouldInitialize = !isReactSnap && isLoggedIn;

  const { isEnterpriseClient, isEnterpriseStatusLoading } =
    useEnterpriseStatusFetch(shouldInitialize);

  const skipFetchingBase =
    isReactSnap ||
    !isLoggedIn ||
    isEnterpriseClient ||
    isEnterpriseStatusLoading;

  const skipFetchingBilling = skipFetchingBase || !hasBillingRoleAccess;

  const skipFetchingJwt = skipFetchingBase || !hasJwtReadRoleAccess;

  useAutoconnect();

  useBalance({ skipFetching: skipFetchingBilling });
  useMyBundles({ skipFetching: skipFetchingBilling });

  useCheckChangedSignupUserSettingsAndUpdate();
  useJwtManagerInitializer({ skipFetching: skipFetchingJwt });

  usePremiumStatusSubscription();

  useBlockchainsLoader();

  useUserGroupFetchCreationAllowanceQuery(undefined, {
    skip: !shouldInitialize,
  });

  useRedirectToTeamsSettings();

  useOnMount(() => {
    removeAvoidGuestTeamInvitationDialog();
  });
};
