import { BuyAnkrLink } from 'modules/common/components/BuyAnkrLink';
import { Faq } from 'modules/common/components/Faq';
import { Section } from 'modules/delegate-stake/components/Section';
import { StakeForm } from 'modules/delegate-stake/components/StakeForm';
import { Stats } from 'modules/delegate-stake/components/Stats';
import { ANKR_STAKING_MAX_DECIMALS_LENGTH } from 'modules/stake-ankr/api/AnkrStakingSDK/const';
import { useFaq } from 'modules/stake-ankr/hooks/useFaq';
import { StakeContainer } from 'modules/stake/components/StakeContainer';

import { useStats } from '../../hooks/useStats';

import { useAnkrStake } from './hooks/useAnkrStake';

export const Stake = (): JSX.Element => {
  const {
    amount,
    balance,
    closeHref,
    initialAmount,
    initialProvider,
    isApproved,
    isApproveLoading,
    isBalanceLoading,
    isApyLoading,
    isDisabled,
    isStakeLoading,
    minStake,
    providerName,
    providerSelectHref,
    tokenIn,
    apy,
    quoteText,
    additionalText,
    additionalTooltip,
    additionalValue,
    onChange,
    onSubmit,
  } = useAnkrStake();

  const faqItems = useFaq();

  const {
    apyText,
    yearlyEarning,
    yearlyEarningUSD,
    totalStaked,
    totalStakedUSD,
    stakers,
    isLoading,
  } = useStats({
    amount,
    apy,
    isApyLoading,
  });

  return (
    <Section withContainer={false}>
      <StakeContainer>
        <StakeForm
          additionalText={additionalText}
          additionalTooltip={additionalTooltip}
          additionalValue={additionalValue}
          balance={balance}
          balanceLinkSlot={<BuyAnkrLink />}
          closeHref={closeHref}
          initialAmount={initialAmount}
          initialProvider={initialProvider}
          isApproved={isApproved}
          isApproveLoading={isApproveLoading}
          isBalanceLoading={isBalanceLoading}
          isDisabled={isDisabled}
          loading={isStakeLoading}
          maxAmountDecimals={ANKR_STAKING_MAX_DECIMALS_LENGTH}
          minAmount={minStake}
          providerName={providerName}
          providerSelectHref={providerSelectHref}
          quoteText={quoteText}
          tokenIn={tokenIn}
          onChange={onChange}
          onSubmit={onSubmit}
        />

        <Stats
          apyText={apyText}
          isLoading={isLoading}
          stakers={stakers}
          token={tokenIn}
          totalStaked={totalStaked}
          totalStakedUSD={totalStakedUSD}
          yearlyEarning={yearlyEarning}
          yearlyEarningUSD={yearlyEarningUSD}
        />

        <Faq data={faqItems} />
      </StakeContainer>
    </Section>
  );
};
