import { ReactChild } from 'react';
import { Container } from '@mui/material';

import { useAuth } from 'domains/auth/hooks/useAuth';
import { NoReactSnap } from 'uiKit/NoReactSnap';
import { usePublicChainsRoutes } from 'domains/chains/hooks/usePublicChainsRoutes';
import { Header } from '../Header';
import { MobileHeader } from '../MobileHeader';
import { SideBar } from '../SideBar';
import { useStyles } from './DefaultLayoutStyles';
import { Breadcrumbs } from '../Breadcrumbs';
import { ConnectWalletDialog } from '../ConnectWalletDialog';
import { StatusTransitionDialog } from '../StatusTransitionDialog';
import { useThemes } from 'uiKit/Theme/hook/useThemes';
import { TwoFADialog } from 'domains/userSettings/components/TwoFADialog';
import { NegativeBalanceTermsOfServicesDialog } from 'domains/userSettings/screens/Settings/components/GeneralSettings/components/NegativeBalanceTermsOfServicesDialog';

export const CONTENT_WIDTH = 1120;

export interface ILayoutProps {
  children?: ReactChild;
  disableGutters?: boolean;
  hasNoReactSnap?: boolean;
  hasError?: boolean;
  hasGradient?: boolean;
  isChainItemPage?: boolean;
}

export const DefaultLayout = ({
  children,
  disableGutters = false,
  hasNoReactSnap = false,
  hasError = false,
  hasGradient = false,
  isChainItemPage,
}: ILayoutProps) => {
  const { isLightTheme } = useThemes();

  const { classes } = useStyles({
    hasGradient: hasGradient || hasError,
    isLightTheme,
  });
  const { isLoggedIn, loading } = useAuth();
  const chainsRoutes = usePublicChainsRoutes();

  return (
    <div className={classes.root}>
      <SideBar
        chainsRoutes={chainsRoutes}
        className={classes.sidebar}
        isLoggedIn={isLoggedIn}
        loading={loading}
        hasLogo
      />
      <div className={classes.body}>
        {!hasError && (
          <Header
            className={classes.header}
            isChainItemPage={isChainItemPage}
          />
        )}
        <MobileHeader
          className={classes.mobileHeader}
          chainsRoutes={chainsRoutes}
          isLoggedIn={isLoggedIn}
          loading={loading}
        />
        <Container disableGutters={disableGutters} className={classes.main}>
          <div className={classes.mobileBreadcrumbs}>
            <Breadcrumbs />
          </div>
          {hasNoReactSnap ? <NoReactSnap>{children}</NoReactSnap> : children}
        </Container>
        <ConnectWalletDialog />
        <StatusTransitionDialog />
        <TwoFADialog />
        <NegativeBalanceTermsOfServicesDialog />
      </div>
    </div>
  );
};
