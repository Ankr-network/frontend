import { Chain } from '@ankr.com/chains-list';

import { flatChain } from 'modules/chains/utils/flatChain';

export const getChainIDs = (chain: Chain) => {
  const subchains = flatChain(chain);

  const ids = subchains.map(({ id }) => id);

  return [...new Set(ids)];
};
