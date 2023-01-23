import { useMemo } from 'react';

import { ChainType, Timeframe } from 'domains/chains/types';
import { EndpointGroup } from 'modules/endpoints/types';
import { IApiChain } from 'domains/chains/api/queryChains';
import { PrimaryTab } from '../../PrimaryTab';
import { SectionID } from '../types';
import { Tab } from 'modules/common/hooks/useTabs';
import { TabSelectHandlerGetter } from './useTabSelectHandlerGetter';
import { UsageDataSection } from '../../UsageDataSection';
import { t } from '@ankr.com/common';

export interface UsageDataSectionParams {
  chain: IApiChain;
  chainType: ChainType;
  getSelectHandler: TabSelectHandlerGetter;
  group: EndpointGroup;
  timeframe: Timeframe;
  timeframeTabs: Tab<Timeframe>[];
}

const label = t('chain-item.tabs.usage-data');

export const useUsageDataSection = ({
  chain,
  chainType,
  getSelectHandler,
  group,
  timeframe,
  timeframeTabs,
}: UsageDataSectionParams) => {
  return useMemo(
    (): Tab<SectionID> => ({
      id: SectionID.UsageData,
      content: (
        <UsageDataSection
          chain={chain}
          chainType={chainType}
          group={group}
          timeframe={timeframe}
          timeframeTabs={timeframeTabs}
        />
      ),
      onSelect: getSelectHandler(SectionID.UsageData),
      title: (isSelected: boolean) => (
        <PrimaryTab isSelected={isSelected} label={label} />
      ),
    }),
    [chain, chainType, getSelectHandler, group, timeframe, timeframeTabs],
  );
};
