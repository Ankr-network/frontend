import { t } from '@ankr.com/common';
import { Box, Typography } from '@material-ui/core';
import {
  abortRequests,
  resetRequests as resetReduxRequests,
} from '@redux-requests/core';
import BigNumber from 'bignumber.js';
import React, { useCallback, useState } from 'react';

import { useProviderEffect } from 'modules/auth/common/hooks/useProviderEffect';
import { Token } from 'modules/common/types/token';
import { fetchPendingValues } from 'modules/stake-bnb/actions/fetchPendingValues';
import { getUnstakeDate } from 'modules/stake/actions/getUnstakeDate';
import { FlashUnstake } from 'modules/stake/components/FlashUnstake/FlashUnstake';
import { UnstakeDialog } from 'modules/stake/components/UnstakeDialog';
import { useUnstakePendingTimestamp } from 'modules/stake/hooks/useUnstakePendingTimestamp';
import { useAppDispatch } from 'store/useAppDispatch';
import { Container } from 'uiKit/Container';

import { approveABNBCUnstake } from '../../actions/approveABNBCUnstake';
import { fetchStats } from '../../actions/fetchStats';

import { useUnstakeBnb } from './hooks/useUnstakeBnb';
import { useUnstakeBinanceStyles } from './useUnstakeBinanceStyles';

const resetRequests = () =>
  resetReduxRequests([
    approveABNBCUnstake.toString(),
    fetchPendingValues.toString(),
    fetchStats.toString(),
    getUnstakeDate.toString(),
  ]);

export const UnstakeBinance = (): JSX.Element => {
  const classes = useUnstakeBinanceStyles();
  const dispatch = useAppDispatch();

  const {
    closeHref,
    isApproved,
    isApproveLoading,
    isFetchStatsLoading,
    isUnstakeLoading,
    isWithApprove,
    minAmount,
    selectedToken,
    syntTokenBalance,
    calcTotalRecieve,
    calcFlashTotalRecieve,
    onExtraValidation,
    onFlashExtraValidation,
    onUnstakeSubmit,
    onFlashUnstakeSubmit,
    instantFee,
    poolBalance,
  } = useUnstakeBnb();

  const isABNBc = selectedToken === Token.aBNBc;

  const [isFlash, setIsFlash] = useState(isABNBc);

  const onSubmit = useCallback(
    values => {
      if (isFlash) {
        onFlashUnstakeSubmit(values);
      } else {
        onUnstakeSubmit(values);
      }
    },
    [onFlashUnstakeSubmit, onUnstakeSubmit, isFlash],
  );

  const { label: unstakeLabel } = useUnstakePendingTimestamp({
    token: Token.BNB,
  });

  const instantUnstakeLabel = t('stake-bnb.unstake.instant');

  useProviderEffect(() => {
    dispatch(resetRequests());

    dispatch(fetchPendingValues());
    dispatch(fetchStats());
    dispatch(getUnstakeDate());

    return () => {
      dispatch(abortRequests());
      dispatch(resetRequests());
    };
  }, [dispatch]);

  const onRenderFormFooter = (amount: BigNumber): JSX.Element => {
    const value = amount;
    const isInvalidAmount =
      value.isNaN() ||
      (!isFlash && value.isLessThan(minAmount)) ||
      syntTokenBalance?.isLessThan(value);

    let totalRecieve = '0';
    if (!isInvalidAmount) {
      totalRecieve = isFlash
        ? calcFlashTotalRecieve(amount)
        : calcTotalRecieve(amount);
    }

    return (
      <>
        {isABNBc && (
          <FlashUnstake
            instantFee={instantFee}
            poolBalance={poolBalance}
            value={isFlash}
            onChange={setIsFlash}
          />
        )}

        <Box alignItems="center" display="flex" mt={2}>
          <Typography
            className={classes.infoLabel}
            color="textPrimary"
            variant="body2"
          >
            {t('stake.you-will-receive')}
          </Typography>

          <Box ml="auto" />

          <Typography
            className={classes.infoValue}
            color="textPrimary"
            variant="body2"
          >
            {t('unit.token-value', {
              value: totalRecieve,
              token: Token.BNB,
            })}
          </Typography>
        </Box>
      </>
    );
  };

  return (
    <Box component="section" py={{ xs: 6, sm: 10 }}>
      <Container>
        <UnstakeDialog
          balance={syntTokenBalance}
          closeHref={closeHref}
          endText={isFlash ? instantUnstakeLabel : unstakeLabel}
          extraValidation={isFlash ? onFlashExtraValidation : onExtraValidation}
          isApproved={isApproved}
          isApproveLoading={isApproveLoading}
          isBalanceLoading={isFetchStatsLoading}
          isDisabled={isApproveLoading || isUnstakeLoading}
          isExternalAllowed={!isFlash}
          isLoading={isUnstakeLoading}
          isWithApprove={isWithApprove}
          maxAmount={isFlash ? poolBalance : undefined}
          renderFormFooter={onRenderFormFooter}
          token={selectedToken}
          onSubmit={onSubmit}
        />
      </Container>
    </Box>
  );
};
