import { Fragment } from 'react';
import { uid } from 'react-uid';
import { Box, ButtonBase, Grid, Tooltip, Typography } from '@mui/material';

import { useSignupDialogWeb3ContentStyles } from './useSignupDialogWeb3ContentStyles';
import { ETH_COMPATIBLE_WALLETS } from './SignupDialogWeb3ContentUtils';
import {
  IConnectWalletsModalProps,
  IOnWalletItemClickArgs,
} from './SignupDialogWeb3ContentTypes';
import { WalletItemContent } from './components/WalletItemContent';
import { t } from '@ankr.com/common';
import { isMobile } from 'web3modal';

export const SignupDialogWeb3Content = ({
  onConnect,
  onClose,
}: IConnectWalletsModalProps) => {
  const isMobileView = isMobile();
  const { cx, classes } = useSignupDialogWeb3ContentStyles(isMobileView);

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
              const {
                href,
                icon,
                isHidden,
                isInjected,
                title,
                walletId,
                isDisabled,
                getTooltipMessage,
                isFirstConnectWallet,
              } = walletItem;

              if (isHidden) {
                return null;
              }

              return (
                <Fragment key={walletId}>
                  {isFirstConnectWallet && (
                    <Typography className={classes.message}>
                      {t('signup-modal.web3.unconnect-meesage')}
                    </Typography>
                  )}
                  <Grid
                    sx={{ flexBasis: '100%' }}
                    key={uid(walletItem)}
                    padding={2}
                    item
                    sm={4}
                    xs={12}
                  >
                    {isDisabled && typeof getTooltipMessage === 'function' ? (
                      <Tooltip
                        title={getTooltipMessage()}
                        placement="top"
                        classes={{ tooltip: classes.tooltip }}
                      >
                        <div
                          className={cx(
                            classes.walletItem,
                            isDisabled && classes.walletItemDisabled,
                          )}
                        >
                          <WalletItemContent
                            icon={icon}
                            name={title}
                            isInjected={isInjected}
                          />
                        </div>
                      </Tooltip>
                    ) : (
                      <ButtonBase
                        className={cx(
                          classes.walletItem,
                          isDisabled && classes.walletItemDisabled,
                        )}
                        onClick={onWalletItemClick({
                          href,
                          isInjected,
                          walletId,
                        })}
                      >
                        <WalletItemContent
                          icon={icon}
                          name={title}
                          isInjected={isInjected}
                        />
                      </ButtonBase>
                    )}
                  </Grid>
                </Fragment>
              );
            })}
          </Fragment>
        ))}
      </Grid>
    </Box>
  );
};
