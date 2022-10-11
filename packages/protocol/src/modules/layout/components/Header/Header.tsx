import React from 'react';
import { Container } from '@material-ui/core';
import classNames from 'classnames';

import { AccountDetailsButton } from 'domains/account/components/AccountDetailsButton/AccountDetailsButton';
import { LocaleSwitcher } from 'modules/common/components/LocaleSwitcher';
import { ConnectButton } from 'domains/auth/components/ConnectButton';
import { Breadcrumbs } from '../Breadcrumbs';
import { useStyles } from './useStyles';
import { NoReactSnap } from 'uiKit/NoReactSnap';

export const IS_I18N_ENABLED = false;

interface HeaderProps {
  className?: string;
  hasAccountDetailsButton: boolean;
}

export const Header = ({
  hasAccountDetailsButton,
  className = '',
}: HeaderProps) => {
  const classes = useStyles();

  return (
    <header className={classNames(classes.root, className)}>
      <Container className={classes.container}>
        <Breadcrumbs />
        <div className={classes.right}>
          {IS_I18N_ENABLED && <LocaleSwitcher className={classes.switcher} />}
          <NoReactSnap>
            <div className={classes.buttons}>
              {hasAccountDetailsButton && <AccountDetailsButton />}
              <ConnectButton />
            </div>
          </NoReactSnap>
        </div>
      </Container>
    </header>
  );
};
