import { Contract, EventData } from 'web3-eth-contract';
import { Web3KeyReadProvider } from '@ankr.com/provider';
import { TBlockchain } from '@ankr.com/advanced-api/src/api/getLogs/types';

import { PrefixedHex, Web3Address } from '../common';
import { IAnkrPAYGContractManagerConfig } from './types';
import ABI_ANKR_TOKEN from './abi/AnkrToken.json';
import ABI_PAY_AS_YOU_GO from './abi/PayAsYouGo.json';
import { IPayAsYouGoEvents } from './abi/IPayAsYouGo';
import { getPastEventsBlockchain } from './utils/getPastEventsBlockchain';

export class PAYGReadContractManager {
  protected readonly ankrTokenReadContract: Contract;

  protected readonly payAsYouGoReadContract: Contract;

  constructor(
    protected readonly keyReadProvider: Web3KeyReadProvider,
    protected readonly config: IAnkrPAYGContractManagerConfig,
  ) {
    this.ankrTokenReadContract = keyReadProvider.createContract(
      ABI_ANKR_TOKEN,
      config.payAsYouGoAnkrTokenContractAddress,
    );

    this.payAsYouGoReadContract = keyReadProvider.createContract(
      ABI_PAY_AS_YOU_GO,
      config.payAsYouGoContractAddress,
    );
  }

  private async getLatestUserEventLogs(
    event: IPayAsYouGoEvents,
    user: Web3Address,
    blockchain: TBlockchain
  ) {
    const contract = this.payAsYouGoReadContract;
    const startBlock = this.config.payAsYouGoContractCreationBlockNumber;

    const latestBlockNumber = await this.keyReadProvider
      .getWeb3()
      .eth.getBlockNumber();

    return getPastEventsBlockchain({
      web3: this.keyReadProvider.getWeb3(),
      blockchain,
      contract,
      eventName: event,
      filter: {
        sender: user,
      },
      startBlock,
      latestBlockNumber,
      apiUrl: this.config.advancedApiUrl,
    });
  }

  public async getAllLatestUserTierAssignedEventLogHashes(
    user: Web3Address,
    blockchain: TBlockchain
  ): Promise<string[] | false> {
    const tierAssignedEvents = await this.getLatestUserEventLogs(
      'TierAssigned',
      user,
      blockchain,
    );

    if (!tierAssignedEvents.length) return false;

    return tierAssignedEvents.map(item => item.transactionHash);
  }

  public async getLatestUserTierAssignedEventLogHash(
    user: Web3Address,
    blockchain: TBlockchain
  ): Promise<PrefixedHex | false> {
    const tierAssignedEvents = await this.getLatestUserEventLogs(
      'TierAssigned',
      user,
      blockchain
    );

    if (!tierAssignedEvents.length) return false;

    return tierAssignedEvents[tierAssignedEvents.length - 1].transactionHash;
  }

  public async getLatestLockedFundsEvents(
    user: Web3Address,
    blockchain: TBlockchain
  ): Promise<EventData[]> {
    return this.getLatestUserEventLogs(
      'FundsLocked',
      user,
      blockchain,
    );
  }

  public async getLatestAllowanceEvents(
    user: Web3Address,
  ): Promise<EventData[]> {
    const events = await this.ankrTokenReadContract.getPastEvents('Approval', {
      filter: {
        owner: user,
      },
      fromBlock: 'earliest',
      toBlock: 'latest',
    });

    const allowanceEvents = events
      .filter(event => event.returnValues.owner === user)
      .sort((a, b) => a.blockNumber - b.blockNumber);

    return allowanceEvents;
  }
}
