import { t, tHTML } from '@ankr.com/common';
import { Box, ButtonBase } from '@material-ui/core';
import { resetRequests } from '@redux-requests/core';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { BNB_STAKING_MAX_DECIMALS_LEN } from '@ankr.com/staking-sdk';

import { useProviderEffect } from 'modules/auth/common/hooks/useProviderEffect';
import { AuditInfo, AuditInfoItem } from 'modules/common/components/AuditInfo';
import { CodeInput } from 'modules/common/components/CodeField';
import { ErrorMessage } from 'modules/common/components/ErrorMessage';
import { Faq } from 'modules/common/components/Faq';
import {
  AUDIT_LINKS,
  DECIMAL_PLACES,
  DEFAULT_FIXED,
  DUNE_ANALYTICS_LINK,
  featuresConfig,
} from 'modules/common/const';
import { Token } from 'modules/common/types/token';
import { getIsStakerExists } from 'modules/referrals/actions/getIsStakerExists';
import { fetchPendingValues } from 'modules/stake-bnb/actions/fetchPendingValues';
import { getStakeGasFee } from 'modules/stake-bnb/actions/getStakeGasFee';
import { getFAQ } from 'modules/stake/actions/getFAQ';
import { getMetrics } from 'modules/stake/actions/getMetrics';
import { getStakeTradeInfoData } from 'modules/stake/actions/getStakeTradeInfoData';
import { EMetricsServiceName } from 'modules/stake/api/metrics';
import { StakeContainer } from 'modules/stake/components/StakeContainer';
import { StakeDescriptionAmount } from 'modules/stake/components/StakeDescriptionAmount';
import { StakeDescriptionContainer } from 'modules/stake/components/StakeDescriptionContainer';
import { StakeDescriptionName } from 'modules/stake/components/StakeDescriptionName';
import { StakeDescriptionSeparator } from 'modules/stake/components/StakeDescriptionSeparator';
import { StakeDescriptionValue } from 'modules/stake/components/StakeDescriptionValue';
import { StakeFeeInfo } from 'modules/stake/components/StakeFeeInfo';
import { FieldsNames, StakeForm } from 'modules/stake/components/StakeForm';
import { StakeStats } from 'modules/stake/components/StakeStats';
import { StakeTradeInfo } from 'modules/stake/components/StakeTradeInfo';
import { TokenVariant } from 'modules/stake/components/TokenVariant';
import { TokenVariantList } from 'modules/stake/components/TokenVariantList';
import { EOpenOceanNetworks, EOpenOceanTokens } from 'modules/stake/types';
import { Button } from 'uiKit/Button';
import { Checkbox } from 'uiKit/Checkbox';
import { ABNBBIcon } from 'uiKit/Icons/ABNBBIcon';
import { ABNBCIcon } from 'uiKit/Icons/ABNBCIcon';
import { QuestionIcon } from 'uiKit/Icons/QuestionIcon';
import { QuestionWithTooltip } from 'uiKit/QuestionWithTooltip';
import { Tooltip } from 'uiKit/Tooltip';

import { fetchStats } from '../../actions/fetchStats';

import { useErrorMessage } from './hooks/useErrorMessage';
import { useStakeForm } from './hooks/useStakeForm';
import { useStakeBinanceStyles } from './useStakeBinanceStyles';

export const StakeBinance = (): JSX.Element => {
  const classes = useStakeBinanceStyles();
  const dispatch = useDispatch();

  const { onErroMessageClick, hasError } = useErrorMessage();

  const {
    aBNBcRatio,
    address,
    amount,
    bnbBalance,
    certificateRatio,
    faqItems,
    haveCode,
    isFetchStatsLoading,
    isReferralUserExists,
    isStakeGasLoading,
    isStakeLoading,
    minimumStake,
    relayerFee,
    stakeGas,
    tokenIn,
    tokenOut,
    totalAmount,
    handleCodeChange,
    handleFormChange,
    handleHaveCodeClick,
    handleSubmit,
    onTokenSelect,
  } = useStakeForm();

  const renderFooter = useCallback(
    () => (
      <Tooltip arrow title={t('stake-bnb.tooltips.suspend')}>
        <Box width="100%">
          <Button disabled fullWidth color="primary" size="large">
            {t('stake.stake', { token: tokenOut })}
          </Button>
        </Box>
      </Tooltip>
    ),
    [tokenOut],
  );

  const onRenderStats = (): JSX.Element => {
    return (
      <>
        <TokenVariantList my={5}>
          <TokenVariant
            description={tHTML('stake-bnb.abnbb-descr')}
            iconSlot={<ABNBBIcon />}
            isActive={tokenOut === Token.aBNBb}
            isDisabled={isStakeLoading}
            title={t('unit.abnbb')}
            onClick={onTokenSelect(Token.aBNBb)}
          />

          <TokenVariant
            description={tHTML('stake-bnb.abnbc-descr', {
              rate: isFetchStatsLoading
                ? '...'
                : aBNBcRatio.decimalPlaces(DEFAULT_FIXED).toFormat(),
            })}
            iconSlot={<ABNBCIcon />}
            isActive={tokenOut === Token.aBNBc}
            isDisabled={isStakeLoading}
            title={t('unit.abnbc')}
            onClick={onTokenSelect(Token.aBNBc)}
          />
        </TokenVariantList>

        <StakeDescriptionContainer>
          <StakeDescriptionName>
            <span>{t('stake-bnb.relayer-fee')}</span>

            <Tooltip title={t('stake-bnb.tooltips.relayer-fee')}>
              <ButtonBase className={classes.questionBtn}>
                <QuestionIcon size="xs" />
              </ButtonBase>
            </Tooltip>
          </StakeDescriptionName>

          <StakeDescriptionValue isBold={false}>
            {t('unit.bnb-value', {
              value: relayerFee,
            })}
          </StakeDescriptionValue>
        </StakeDescriptionContainer>

        <StakeDescriptionSeparator />

        <StakeDescriptionContainer>
          <StakeDescriptionName>
            {t('stake.you-will-receive')}
          </StakeDescriptionName>

          <StakeDescriptionValue>
            <StakeDescriptionAmount
              isLoading={isStakeGasLoading}
              symbol={tokenOut}
              value={totalAmount.decimalPlaces(DECIMAL_PLACES).toFormat()}
            />
          </StakeDescriptionValue>
        </StakeDescriptionContainer>
      </>
    );
  };

  useProviderEffect(() => {
    dispatch(getIsStakerExists(address));
    dispatch(fetchPendingValues());
    dispatch(fetchStats());
    dispatch(getFAQ(Token.BNB));
    dispatch(getMetrics());

    return () => {
      dispatch(resetRequests([getFAQ.toString(), getStakeGasFee.toString()]));
    };
  }, [address, dispatch]);

  useProviderEffect(() => {
    if (!featuresConfig.isActiveStakeTradeInfo) {
      return;
    }

    dispatch(
      getStakeTradeInfoData({
        baseToken: EOpenOceanTokens.BNB,
        bondToken: EOpenOceanTokens.aBNBb,
        certificateRatio,
        certificateToken: EOpenOceanTokens.aBNBc,
        network: EOpenOceanNetworks.BSC,
      }),
    );
  }, [certificateRatio, dispatch]);

  const isDisabled = isStakeLoading || isFetchStatsLoading;

  return (
    <section className={classes.root}>
      <StakeContainer>
        {hasError && (
          <ErrorMessage title={t('error.some')} onClick={onErroMessageClick} />
        )}

        {featuresConfig.isActiveStakeTradeInfo && <StakeTradeInfo />}

        <StakeForm
          auditSlot={
            <AuditInfo>
              <AuditInfoItem link={AUDIT_LINKS.bnbBeosin} variant="beosin" />

              <AuditInfoItem
                link={AUDIT_LINKS.bnbPeckShield}
                variant="peckshield"
              />
            </AuditInfo>
          }
          balance={bnbBalance}
          feeSlot={
            <StakeFeeInfo
              isLoading={isStakeGasLoading}
              token={t('unit.bnb')}
              value={stakeGas}
            />
          }
          isBalanceLoading={hasError || isFetchStatsLoading}
          isDisabled={isDisabled}
          loading={hasError || isStakeLoading || isFetchStatsLoading}
          maxAmount={bnbBalance}
          maxAmountDecimals={BNB_STAKING_MAX_DECIMALS_LEN}
          minAmount={minimumStake}
          partnerCodeSlot={
            !isReferralUserExists && (
              <>
                <StakeDescriptionContainer>
                  <StakeDescriptionName
                    className={classes.partnerCode}
                    color="textSecondary"
                  >
                    <Checkbox
                      checked={haveCode}
                      disabled={isDisabled}
                      onChange={handleHaveCodeClick}
                    />

                    {t('stake.partner-code')}

                    <QuestionWithTooltip>
                      {t('stake.partner-code-tooltip')}
                    </QuestionWithTooltip>
                  </StakeDescriptionName>
                </StakeDescriptionContainer>

                {haveCode && (
                  <CodeInput disabled={isDisabled} name={FieldsNames.code} />
                )}
              </>
            )
          }
          renderFooter={
            featuresConfig.isBnbServiceDisabled ? renderFooter : undefined
          }
          renderStats={onRenderStats}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          onChange={handleFormChange}
          onCodeChange={handleCodeChange}
          onSubmit={handleSubmit}
        />

        <StakeStats
          amount={amount}
          analyticsLink={DUNE_ANALYTICS_LINK.bnb}
          metricsServiceName={EMetricsServiceName.BNB}
        />

        <Faq data={faqItems} />
      </StakeContainer>
    </section>
  );
};
