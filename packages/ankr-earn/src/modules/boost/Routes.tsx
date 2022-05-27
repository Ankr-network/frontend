import { generatePath, Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import { PageNotFound } from 'modules/common/components/PageNotFound';
import { STAKING_PATH, featuresConfig } from 'modules/common/const';
import { Token } from 'modules/common/types/token';
import { loadComponent } from 'modules/common/utils/loadComponent';
import { DefaultLayout } from 'modules/layout/components/DefautLayout';
import { useQueryParams } from 'modules/router/hooks/useQueryParams';
import { createRouteConfig } from 'modules/router/utils/createRouteConfig';

const ROOT = `${STAKING_PATH}defi/`;
const TRADING_COCKPIT_PATH = `${ROOT}trade/`;
const TRADING_COCKPIT_SPECIFIC_PATH = `${TRADING_COCKPIT_PATH}?from=:fromToken?&to=:toToken?`;
const LIQUIDITY_MINING_PATH = `${ROOT}liquidity-mining/`;

export const RoutesConfig = createRouteConfig(
  {
    tradingCockpit: {
      path: TRADING_COCKPIT_PATH,
      generatePath: (
        fromToken: string = Token.ETH,
        toToken: string = Token.aETHb,
      ) =>
        generatePath(TRADING_COCKPIT_SPECIFIC_PATH, {
          fromToken,
          toToken,
        }),
      useParams: () => {
        const query = useQueryParams();
        return {
          fromToken: query.get('from') ?? undefined,
          toToken: query.get('to') ?? undefined,
        };
      },
    },
    liquidityMining: {
      path: LIQUIDITY_MINING_PATH,
      generatePath: () => generatePath(LIQUIDITY_MINING_PATH),
    },
  },
  ROOT,
);

const TradingCockpit = loadComponent(() =>
  import('./screens/TradingCockpit').then(module => module.TradingCockpit),
);

const LiquidityMining = featuresConfig.liquidityMining
  ? loadComponent(() =>
      import('./screens/LiquidityMining').then(
        module => module.LiquidityMining,
      ),
    )
  : 'span';

export function getRoutes(): JSX.Element {
  return (
    <Route path={RoutesConfig.root}>
      <Switch>
        <Route exact path={RoutesConfig.tradingCockpit.path}>
          <DefaultLayout>
            <TradingCockpit />
          </DefaultLayout>
        </Route>

        {featuresConfig.liquidityMining && (
          <Route exact path={RoutesConfig.liquidityMining.path}>
            <DefaultLayout>
              <LiquidityMining />
            </DefaultLayout>
          </Route>
        )}

        <Route exact path={RoutesConfig.root}>
          <Redirect to={RoutesConfig.tradingCockpit.path} />
        </Route>

        <Route>
          <DefaultLayout>
            <PageNotFound />
          </DefaultLayout>
        </Route>
      </Switch>
    </Route>
  );
}
