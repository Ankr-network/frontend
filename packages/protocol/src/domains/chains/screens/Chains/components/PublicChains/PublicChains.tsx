import { OverlaySpinner } from '@ankr.com/ui';

import { NoReactSnap } from 'uiKit/NoReactSnap';
import { ChainsSortSelect } from 'domains/chains/components/ChainsSortSelect';
import { ReactSnapChainsLinksGenerator } from 'domains/chains/components/ReactSnapChainsLinksGenerator';
import { BaseChains } from 'domains/chains/components/BaseChains';
import { usePublicChains } from './hooks/usePublicChains';
import { usePublicChainsData } from './hooks/usePublicChainsData';
import { PublicChainsList } from './components/PublicChainsList';
import { InfoBanner } from 'domains/chains/components/InfoBanner';

export const PublicChains = () => {
  const {
    isLoggedIn,
    chains,
    allChains,
    loading,
    setSortType,
    sortType,
    timeframe,
  } = usePublicChainsData();

  const { processedChains, chainsDictionary } = usePublicChains({
    allChains,
    chains,
    sortType,
    timeframe,
  });

  return (
    <BaseChains
      loading={loading}
      isShowReminderDialog={isLoggedIn}
      top={!loading && <InfoBanner />}
      select={<ChainsSortSelect sortType={sortType} onSelect={setSortType} />}
    >
      <NoReactSnap
        fallback={
          <>
            <ReactSnapChainsLinksGenerator chains={allChains} />
            <OverlaySpinner />
          </>
        }
      >
        <PublicChainsList
          timeframe={timeframe}
          chains={processedChains}
          chainsDictionary={chainsDictionary}
        />
      </NoReactSnap>
    </BaseChains>
  );
};
