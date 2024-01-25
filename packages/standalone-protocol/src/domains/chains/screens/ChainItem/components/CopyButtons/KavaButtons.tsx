/* eslint-disable max-lines-per-function */
import classNames from 'classnames';
import { Typography } from '@material-ui/core';

import { CopyToClipButton } from 'uiKit/CopyToClipButton';
import { AddNetworkButton } from 'modules/auth/components/AddNetwork';
import { t } from 'modules/i18n/utils/intl';
import { CopyToClipIcon } from 'uiKit/CopyToClipIcon';
import { isAddNetworkSupported } from 'modules/common/utils/browserDetect';
import { ChainId } from 'domains/chains/api/chain';
import { useIsMDDown } from 'modules/themes/useTheme';
import { IS_REACT_SNAP } from 'uiKit/NoReactSnap';

import { Chain } from '../ChainItemHeader/ChainItemHeaderTypes';
import { useStyles } from './CopyButtonsStyles';

interface IKavaButtonsProps {
  chainId: ChainId;
  onCopy: () => void;
  isXSDown: boolean;
  chain: Chain | null;
}

export const KavaButtons = ({
  chainId,
  onCopy,
  isXSDown,
  chain,
}: IKavaButtonsProps) => {
  const classes = useStyles();
  const isMDDown = useIsMDDown();

  const shouldShowCopyIcon = isXSDown && !IS_REACT_SNAP;
  const [kavaEvmText, kavaHttpText, kavaRpcText, kavaHttpRpcText] = [
    'https://evm.kava-rpc.com',
    'https://api.kava-rpc.com',
    'https://rpc.kava-rpc.com',
    'wss://wevm.kava-rpc.com',
  ];

  const formattedChain = chain
    ? {
        ...chain,
        rpcLinks: [kavaEvmText],
      }
    : null;

  return (
    <div data-test-id="copy-button">
      <div
        className={classNames(
          classes.top,
          chain && isAddNetworkSupported(isMDDown) ? chainId : '',
        )}
      >
        <Typography
          variant="subtitle1"
          className={classNames(classes.label, chainId)}
          color="textPrimary"
        >
          {t('chain-item.kava.evm-json')}
        </Typography>
        <div className={classes.link}>
          {shouldShowCopyIcon ? (
            <CopyToClipIcon
              text={kavaEvmText}
              message={t('common.copy-message')}
              size="l"
              textColor="textPrimary"
              onCopy={onCopy}
              chainId={chainId}
            />
          ) : (
            <CopyToClipButton
              buttonText={t('chain-item.copy-button.button-text')}
              text={kavaEvmText}
              textMessage={t('common.copy-message')}
              className={classes.copyButton}
              onCopy={onCopy}
              chainId={chainId}
            />
          )}
          {formattedChain && (
            <AddNetworkButton
              chain={formattedChain}
              className={classNames(classes.addNetworkButton, chainId)}
            />
          )}
        </div>
      </div>

      <div
        className={classNames(
          classes.top,
          chain && isAddNetworkSupported(isMDDown) ? chainId : '',
        )}
      >
        <Typography
          variant="subtitle1"
          className={classNames(classes.label, chainId)}
          color="textPrimary"
        >
          {t('chain-item.kava.http')}
        </Typography>
        <div className={classes.link}>
          {shouldShowCopyIcon ? (
            <CopyToClipIcon
              text={kavaHttpText}
              message={t('common.copy-message')}
              size="l"
              textColor="textPrimary"
              onCopy={onCopy}
              chainId={chainId}
            />
          ) : (
            <CopyToClipButton
              buttonText={t('chain-item.copy-button.button-text')}
              text={kavaHttpText}
              textMessage={t('common.copy-message')}
              className={classes.copyButton}
              onCopy={onCopy}
              chainId={chainId}
            />
          )}
        </div>
      </div>

      <div
        className={classNames(
          classes.top,
          chain && isAddNetworkSupported(isMDDown) ? chainId : '',
        )}
      >
        <Typography
          variant="subtitle1"
          className={classNames(classes.label, chainId)}
          color="textPrimary"
        >
          {t('chain-item.kava.json-rpc')}
        </Typography>
        <div className={classes.link}>
          {shouldShowCopyIcon ? (
            <CopyToClipIcon
              text={kavaRpcText}
              message={t('common.copy-message')}
              size="l"
              textColor="textPrimary"
              onCopy={onCopy}
              chainId={chainId}
            />
          ) : (
            <CopyToClipButton
              buttonText={t('chain-item.copy-button.button-text')}
              text={kavaRpcText}
              textMessage={t('common.copy-message')}
              className={classes.copyButton}
              onCopy={onCopy}
              chainId={chainId}
            />
          )}
        </div>
      </div>

      <div
        className={classNames(
          classes.top,
          chain && isAddNetworkSupported(isMDDown) ? chainId : '',
        )}
      >
        <Typography
          variant="subtitle1"
          className={classNames(classes.label, chainId)}
          color="textPrimary"
        >
          {t('chain-item.kava.ws')}
        </Typography>
        <div className={classes.link}>
          {shouldShowCopyIcon ? (
            <CopyToClipIcon
              text={kavaHttpRpcText}
              message={t('common.copy-message')}
              size="l"
              textColor="textPrimary"
              onCopy={onCopy}
              chainId={chainId}
            />
          ) : (
            <CopyToClipButton
              buttonText={t('chain-item.copy-button.button-text')}
              text={kavaHttpRpcText}
              textMessage={t('common.copy-message')}
              className={classes.copyButton}
              onCopy={onCopy}
              chainId={chainId}
            />
          )}
        </div>
      </div>
    </div>
  );
};
