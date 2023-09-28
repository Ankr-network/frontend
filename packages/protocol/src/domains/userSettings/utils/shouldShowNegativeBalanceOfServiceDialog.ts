interface ShouldShowNegativeBalanceOfServiceDialogArguments {
  isLoggedIn: boolean;
  authLoading: boolean;
  isLoadingTosAcceptStatus: boolean;
  isFetchingTosAcceptStatus: boolean;
  isUninitializedTosAcceptStatus: boolean;
  shouldShowUserGroupDialog: boolean;
  tosAccepted: boolean;
  hasPremium: boolean;
  hasGroupAccess: boolean;
  isErrorTosAcceptStatus: boolean;
  isEnterpriseClient: boolean;
  isLoadingEnterpriseStatus: boolean;
  isLoadingGroups: boolean;
}

export const shouldShowNegativeBalanceOfServiceDialog = ({
  isLoggedIn,
  authLoading,
  isLoadingTosAcceptStatus,
  isFetchingTosAcceptStatus,
  isUninitializedTosAcceptStatus,
  shouldShowUserGroupDialog,
  tosAccepted,
  hasPremium,
  hasGroupAccess,
  isErrorTosAcceptStatus,
  isEnterpriseClient,
  isLoadingEnterpriseStatus,
  isLoadingGroups,
}: ShouldShowNegativeBalanceOfServiceDialogArguments) => {
  if (!isLoggedIn) return false;

  if (
    authLoading ||
    isLoadingTosAcceptStatus ||
    isFetchingTosAcceptStatus ||
    isUninitializedTosAcceptStatus ||
    isLoadingEnterpriseStatus ||
    isLoadingGroups
  )
    return false;

  if (isErrorTosAcceptStatus) return false;

  if (shouldShowUserGroupDialog) return false;

  if (tosAccepted) return false;

  if (isEnterpriseClient) return false;

  if (!hasGroupAccess) return false;

  return hasPremium;
};
