import { Route } from 'react-router-dom';
import loadable, { LoadableComponent } from '@loadable/component';
import { OverlaySpinner } from '@ankr.com/ui';
import { EnterpriseRoutesConfig } from './routesConfig';

const LoadableChainsContainer: LoadableComponent<any> = loadable(
  async () => import('../screens/Chains').then(module => module.Chains),
  {
    fallback: <OverlaySpinner />,
  },
);

export function EnterpriseRoutes() {
  return (
    <Route
      exact
      path={EnterpriseRoutesConfig.chains.path}
      component={LoadableChainsContainer}
    />
  );
}
