import { BonusHistorySection } from './components/BonusHistorySection';
import { BonusPurposeSection } from './components/BonusPurposeSection';
import { FAQSection } from './components/FAQSection';
import { InviteWidgets } from './components/InviteWidgets';
import { SummaryWidgets } from './components/SummaryWidgets';
import { TopBanner } from './components/TopBanner';
import { useReferralPageStyles } from './useReferralPageStyles';

export const ReferralPage = () => {
  const { classes } = useReferralPageStyles();

  return (
    <div className={classes.referralPageRoot}>
      <TopBanner />
      <SummaryWidgets />
      <InviteWidgets />
      <BonusHistorySection />
      <BonusPurposeSection />
      <FAQSection />
    </div>
  );
};
