import { Box, ButtonBase, Grid, Typography } from '@mui/material';
import { Fragment } from 'react';
import { uid } from 'react-uid';

import { useConnectWalletsModalStyles } from './useConnectWalletsContentStyles';
import { ETH_COMPATIBLE_WALLETS } from './ConnectWalletsContentUtils';
import {
  IConnectWalletsModalProps,
  IOnWalletItemClickArgs,
} from './ConnectWalletsContentTypes';
import { t } from '@ankr.com/common';

export const ConnectWalletsContent = ({
  onConnect,
  onClose,
}: IConnectWalletsModalProps) => {
  const { classes } = useConnectWalletsModalStyles();

  const onWalletItemClick =
    ({ href, isInjected, walletId }: IOnWalletItemClickArgs) =>
    async () => {
      if (!isInjected) {
        window.open(href, '_blank', 'noopener, noreferrer');

        return;
      }

      onClose();

      await onConnect(walletId);
    };

  return (
    <Box width="100%">
      <Grid container spacing={4} sx={{ marginTop: 0, marginLeft: -2 }}>
        {ETH_COMPATIBLE_WALLETS.map(walletsGroup => (
          <Fragment key={uid(walletsGroup)}>
            {walletsGroup.map(walletItem => {
              const { href, icon, isHidden, isInjected, title, walletId } =
                walletItem;

              if (isHidden) {
                return null;
              }

              return (
                <Grid
                  sx={{ flexBasis: '100%' }}
                  key={uid(walletItem)}
                  padding={2}
                  item
                  sm={4}
                  xs={12}
                >
                  <ButtonBase
                    className={classes.walletItem}
                    onClick={onWalletItemClick({
                      href,
                      isInjected,

                      walletId,
                    })}
                  >
                    {icon}

                    <Typography
                      className={classes.walletItemTitle}
                      variant="h5"
                    >
                      {title}
                    </Typography>

                    {!isInjected && (
                      <Typography
                        className={classes.walletItemInstall}
                        variant="subtitle2"
                      >
                        {t('signup-modal.wallet-install')}
                      </Typography>
                    )}
                  </ButtonBase>
                </Grid>
              );
            })}
          </Fragment>
        ))}
      </Grid>
    </Box>
  );
};
