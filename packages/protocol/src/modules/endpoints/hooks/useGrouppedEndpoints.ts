import { useMemo } from 'react';

import { IApiChain } from 'domains/chains/api/queryChains';
import { chainGroups } from '../constants/groups';
import { GroupedEndpoints } from '../types';
import { getGroupedEndpoints } from '../utils/getGroupedEndpoints';

export const useGroupedEndpoints = (chain: IApiChain): GroupedEndpoints => {
  const endpoints = useMemo(
    () => getGroupedEndpoints(chain, chainGroups),
    [chain],
  );

  return endpoints;
};
