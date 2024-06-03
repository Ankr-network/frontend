import { EBlockchain } from 'multirpc-sdk';

import { MultiService } from 'modules/api/MultiService';
import { timeout } from 'modules/common/utils/timeout';
import { getWeb3Instance } from 'modules/api/utils/getWeb3Instance';

import { ETH_BLOCK_TIME } from './const';

const hasPendingTransaction = async (
  network: EBlockchain,
  address: string,
): Promise<boolean> => {
  const service = MultiService.getWeb3Service();

  if (service) {
    const web3 = getWeb3Instance(network);

    const latestTransactionCount = await web3.eth.getTransactionCount(
      address,
      'latest',
    );
    const pendingTransactionCount = await web3.eth.getTransactionCount(
      address,
      'pending',
    );

    const result = latestTransactionCount !== pendingTransactionCount;

    return result;
  }

  return false;
};

export const waitForPendingTransaction = async (
  network: EBlockchain,
  address: string,
) => {
  await timeout();

  let inProcess = true;

  while (inProcess) {
    // eslint-disable-next-line
    inProcess = await hasPendingTransaction(network, address);

    if (inProcess) {
      // eslint-disable-next-line
      await timeout(ETH_BLOCK_TIME);
    }
  }

  // because we need to wait other nodes
  await timeout(ETH_BLOCK_TIME * 2);
};
