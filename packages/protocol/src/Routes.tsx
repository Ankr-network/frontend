import { Route, Switch } from 'react-router-dom';

import { GuardCardPaymentSuccessAuthRoute } from 'domains/auth/components/GuardAuthRoute/GuardCardPaymentSuccessAuthRoute';
import { GuardPricingRoute } from 'domains/auth/components/GuardAuthRoute/GuardPricingRoute';
import { GuardAuthProviderRoute } from 'domains/infrastructure/components/GuardAuthProviderRoute';
import { MMChainsRoutes, MMChainsRoutesConfig } from 'domains/mmChains/routes';
import { PricingRoutes, PricingRoutesConfig } from 'domains/pricing/Routes';
import { CenterContainer } from 'domains/userSettings/components/CenterContainer';
import { ConnectWalletCard } from 'domains/userSettings/components/ConnectWalletCard';
import { GuardAuthUserSettingsRoute } from 'domains/userSettings/components/GuardAuthUserSettingsRoute';
import { UserSettingsRoutesConfig } from 'domains/userSettings/Routes';
import { AccountRoutes, AccountRoutesConfig } from './domains/account/Routes';
import {
  GuardAuthRoute,
  GuardPremiumEndpointRoute,
} from './domains/auth/components/GuardAuthRoute';
import { useAuth } from './domains/auth/hooks/useAuth';
import {
  ChainDetailsRoutes,
  ChainPrivateRoutes,
  ChainsRoutes,
  ChainsRoutesConfig,
} from './domains/chains/routes';
import {
  AdvancedApiRoutes,
  AdvancedApiRoutesConfig,
} from './domains/advancedApi/routes';
import { DefaultLayout } from './modules/layout/components/DefautLayout';
import { PageNotFound } from './modules/router/components/PageNotFound';
import { OauthRoutes, OauthRoutesConfig } from 'domains/oauth/routes';
import { useAutoconnect } from './useAutoconnect';
import { GuardPremiumRoute } from 'domains/auth/components/GuardAuthRoute/GuardPremiumRoute';
import { useWeb3ThemeSwitcher } from './useWeb3ThemeSwitcher';

export const Routes = () => {
  const { hasPremium, isUserEthAddressType, authorizationToken } = useAuth();

  const hasAuthData = Boolean(authorizationToken);

  useAutoconnect();
  useWeb3ThemeSwitcher();

  return (
    <Switch>
      <GuardPricingRoute
        exact
        path={[PricingRoutesConfig.pricing.path]}
        hasPremium={hasPremium}
        render={() => (
          <DefaultLayout
            hasGradient
            hasNoReactSnap
            disableGutters
            hasPaddingBottom={false}
          >
            <PricingRoutes />
          </DefaultLayout>
        )}
      />
      <GuardAuthRoute
        exact
        path={[
          AccountRoutesConfig.topUp.path,
          AccountRoutesConfig.cardPaymentFailure.path,
        ]}
        hasAuthData={hasAuthData}
        hasPremium={hasPremium}
        render={() => (
          <DefaultLayout>
            <AccountRoutes />
          </DefaultLayout>
        )}
      />
      <GuardPremiumRoute
        exact
        path={AccountRoutesConfig.accountDetails.path}
        hasAuthData={hasAuthData}
        hasPremium={hasPremium}
        render={() => (
          <DefaultLayout>
            <AccountRoutes />
          </DefaultLayout>
        )}
      />
      <GuardCardPaymentSuccessAuthRoute
        exact
        path={AccountRoutesConfig.cardPaymentSuccess.path}
        isUserEthAddressType={isUserEthAddressType}
        hasAuthData={hasAuthData}
        hasPremium={hasPremium}
        render={() => (
          <DefaultLayout>
            <AccountRoutes />
          </DefaultLayout>
        )}
      />
      <GuardAuthUserSettingsRoute
        exact
        path={[
          UserSettingsRoutesConfig.settings.path,
          UserSettingsRoutesConfig.confirmation.path,
        ]}
        hasAuthData={hasAuthData}
        render={() => (
          <DefaultLayout>
            <CenterContainer>
              <ConnectWalletCard />
            </CenterContainer>
          </DefaultLayout>
        )}
      />
      <Route
        exact
        path={OauthRoutesConfig.oauth.path}
        render={() => (
          <DefaultLayout hasNoReactSnap>
            <OauthRoutes />
          </DefaultLayout>
        )}
      />
      <Route
        exact
        path={ChainsRoutesConfig.chains.path}
        render={() => (
          <DefaultLayout>
            <ChainsRoutes />
          </DefaultLayout>
        )}
      />
      <Route
        exact
        path={[MMChainsRoutesConfig.mmChains.path]}
        render={() => (
          <DefaultLayout>
            <MMChainsRoutes />
          </DefaultLayout>
        )}
      />

      <Route
        exact
        path={AdvancedApiRoutesConfig.advancedApi.path}
        render={() => (
          <DefaultLayout>
            <AdvancedApiRoutes />
          </DefaultLayout>
        )}
      />

      {/* We should keep routes with dynamic `:chainId` after static routes */}
      <GuardAuthProviderRoute
        exact
        path={[ChainsRoutesConfig.addEndpoint.path]}
        render={() => (
          <DefaultLayout>
            <ChainPrivateRoutes />
          </DefaultLayout>
        )}
      />

      <GuardPremiumEndpointRoute
        exact
        path={[ChainsRoutesConfig.chainDetails.path]}
        render={() => (
          <DefaultLayout isChainItemPage>
            <ChainDetailsRoutes />
          </DefaultLayout>
        )}
      />
      <Route
        render={() => (
          <DefaultLayout>
            <PageNotFound />
          </DefaultLayout>
        )}
      />
    </Switch>
  );
};
