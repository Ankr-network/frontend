import classNames from 'classnames';
import { Typography } from '@material-ui/core';

import { useStyles } from './CopyButtonsStyles';
import { CopyToClipButton } from 'uiKit/CopyToClipButton';
import { AddNetworkButton } from 'modules/auth/components/AddNetwork';
import { t } from 'modules/i18n/utils/intl';
import { CopyToClipIcon } from 'uiKit/CopyToClipIcon';
import { Chain } from '../ChainItemHeader/ChainItemHeaderTypes';
import { isAddNetworkSupported } from 'modules/common/utils/browserDetect';
import { ChainId } from 'domains/chains/api/chain';
import { useIsMDDown } from 'ui';
import { IS_REACT_SNAP } from 'uiKit/NoReactSnap';

interface INervosButtonsProps {
  chainId: ChainId;
  onCopy: () => void;
  isXSDown: boolean;
  netLink: string;
  chain: Chain | null;
}

export const NervosButtons = ({
  chainId,
  onCopy,
  isXSDown,
  netLink,
  chain,
}: INervosButtonsProps) => {
  const classes = useStyles();
  const isMDDown = useIsMDDown();

  const shouldShowCopyIcon = isXSDown && !IS_REACT_SNAP;
  const nervosText = netLink ? `${netLink}/nervos` : '';
  const nervosGwText = netLink ? `${netLink}/nervos_gw` : '';

  return (
    <div data-test-id="copy-button">
      <div className={classes.top}>
        <div className={classes.link}>
          {shouldShowCopyIcon ? (
            <CopyToClipIcon
              text={nervosText}
              message={t('common.copy-message')}
              size="l"
              textColor="textPrimary"
              onCopy={onCopy}
              chainId={chainId}
            />
          ) : (
            <CopyToClipButton
              buttonText={t('chain-item.copy-button.button-text')}
              text={nervosText}
              textMessage={t('common.copy-message')}
              className={classes.copyButton}
              onCopy={onCopy}
              chainId={chainId}
            />
          )}
          {chain && (
            <AddNetworkButton
              chain={chain}
              className={classNames(classes.addNetworkButton, chainId)}
            />
          )}
        </div>
        <Typography
          variant="subtitle1"
          className={classes.label}
          color="textPrimary"
        >
          {t('chain-item.nervos.eth-based')}
        </Typography>
      </div>
      <div
        className={classNames(
          classes.top,
          chain && isAddNetworkSupported(isMDDown) ? chainId : '',
        )}
      >
        <div className={classes.link}>
          {shouldShowCopyIcon ? (
            <CopyToClipIcon
              text={nervosGwText}
              message={t('common.copy-message')}
              size="l"
              textColor="textPrimary"
              onCopy={onCopy}
              chainId={chainId}
            />
          ) : (
            <CopyToClipButton
              buttonText={t('chain-item.copy-button.button-text')}
              text={nervosGwText}
              textMessage={t('common.copy-message')}
              className={classes.copyButton}
              onCopy={onCopy}
              chainId={chainId}
            />
          )}
        </div>
        <Typography
          variant="subtitle1"
          className={classes.label}
          color="textPrimary"
        >
          {t('chain-item.nervos.godwoken-based')}
        </Typography>
      </div>
    </div>
  );
};
