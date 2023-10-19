import loadable, { LoadableComponent } from '@loadable/component';
import { OverlaySpinner } from '@ankr.com/ui';
import { Route } from 'react-router-dom';

import { useAuth } from 'domains/auth/hooks/useAuth';
import { useRedirectForSmallDevices } from 'hooks/useRedirectForSmallDevices';
import { useEnterpriseClientStatus } from 'domains/auth/hooks/useEnterpriseClientStatus';

import { DashboardRoutesConfig } from './routesConfig';

const LoadableDashboardContainer: LoadableComponent<any> = loadable(
  async () => import('../screens/Dashboard').then(module => module.Dashboard),
  {
    fallback: <OverlaySpinner />,
  },
);

const LoadableDashboardPlaceholder: LoadableComponent<any> = loadable(
  async () =>
    import('../screens/Dashboard/components/DashboardPlaceholder').then(
      module => module.DashboardPlaceholder,
    ),
  {
    fallback: <OverlaySpinner />,
  },
);

export function DashboardRoutes() {
  const { hasPremium, loading } = useAuth();
  const { isEnterpriseClient } = useEnterpriseClientStatus();

  useRedirectForSmallDevices();

  if (loading) {
    return <OverlaySpinner />;
  }

  const Component =
    hasPremium || isEnterpriseClient
      ? LoadableDashboardContainer
      : LoadableDashboardPlaceholder;

  return (
    <Route
      component={Component}
      exact
      path={DashboardRoutesConfig.dashboard.path}
    />
  );
}
