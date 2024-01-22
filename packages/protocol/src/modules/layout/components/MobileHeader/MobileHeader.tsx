import { Container } from '@mui/material';
import GlobalMenu, { LogoType } from '@ankr.com/global-menu';

import { Header } from 'modules/layout/const';

import { HeaderContent } from '../Header/components/HeaderContent';
import { MobileMenu } from '../MobileMenu';
import { useStyles } from './useStyles';

interface MobileHeaderProps {
  className?: string;
  chainsRoutes: string[];
  isLoggedIn: boolean;
  isEnterpriseClient: boolean;
  loading: boolean;
}

export const MobileHeader = ({
  className = '',
  chainsRoutes,
  isLoggedIn,
  isEnterpriseClient,
  loading,
}: MobileHeaderProps) => {
  const { classes, cx } = useStyles();

  return (
    <header className={cx(classes.root, className)}>
      <Container className={classes.container} maxWidth={false}>
        <GlobalMenu logoType={LogoType.RPC} hasSecondaryFont />
        <div className={classes.buttons}>
          <HeaderContent type={Header.Mobile} />
          <MobileMenu
            chainsRoutes={chainsRoutes}
            isLoggedIn={isLoggedIn}
            isEnterpriseClient={isEnterpriseClient}
            loading={loading}
            hasLogo={false}
          />
        </div>
      </Container>
    </header>
  );
};
