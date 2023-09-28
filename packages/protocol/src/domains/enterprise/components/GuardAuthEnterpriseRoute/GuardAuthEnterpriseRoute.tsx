import { ReactNode, useEffect } from 'react';
import { useHistory } from 'react-router';

import { INDEX_PATH } from 'domains/chains/routes';
import { useEnterpriseClientStatus } from 'domains/auth/hooks/useEnterpriseClientStatus';
import { isReactSnap } from 'modules/common/utils/isReactSnap';

interface IGuardAuthEnterpriseRouteProps {
  children: ReactNode;
}

export const GuardAuthEnterpriseRoute = ({
  children,
}: IGuardAuthEnterpriseRouteProps): JSX.Element | null => {
  const { isEnterpriseClient, isLoadingEnterpriseStatus } =
    useEnterpriseClientStatus();

  const history = useHistory();

  useEffect(() => {
    if (!isLoadingEnterpriseStatus && !isEnterpriseClient && !isReactSnap) {
      history.replace(INDEX_PATH);
    }
  }, [history, isEnterpriseClient, isLoadingEnterpriseStatus]);

  return isEnterpriseClient || isReactSnap ? <>{children}</> : null;
};
