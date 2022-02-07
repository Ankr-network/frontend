import BigNumber from 'bignumber.js';
import { configFromEnv, IStkrConfig } from 'modules/api/config';
import ABI_ERC20 from 'modules/api/contract/IERC20.json';
import { ApiGateway } from 'modules/api/gateway';
import { ProviderManagerSingleton } from 'modules/api/ProviderManagerSingleton';
import { ProviderManager, Web3KeyProvider } from 'provider';
import Web3 from 'web3';
import { Contract, EventData, Filter } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { BINANCE_PROVIDER_ID } from '../const';
import ABI_ABNBB from './contracts/aBNBb.json';
import ABI_BINANCE_POOL from './contracts/BinancePool.json';

type TPastEventsData = Array<EventData | void>;

export type TTxEventsHistoryGroupData = Array<ITxEventsHistoryGroupItem | void>;

enum EBinancePoolEvents {
  ClaimPending = 'ClaimPending',
  RatioUpdate = 'RatioUpdate',
  StakePending = 'StakePending',
}

export enum EBinancePoolEventsMap {
  ClaimPending = 'STAKE_ACTION_UNSTAKED',
  StakePending = 'STAKE_ACTION_STAKED',
}

interface ITxHistoryEventData extends EventData {
  timestamp: number;
}

export interface ITxEventsHistoryGroupItem {
  txAmount: BigNumber;
  txDate: Date;
  txHash: string;
  txType: string | null;
}

export interface ITxEventsHistoryData {
  completed: TTxEventsHistoryGroupData;
  pending: TTxEventsHistoryGroupData;
}

// Note: ~4h
const MAX_BINANCE_BLOCK_RANGE: number = 5_000;

// Note: ~1d * 3 = 3d
const MAX_EVENTS_BLOCK_RANGE: number = MAX_BINANCE_BLOCK_RANGE * 6 * 3;

export class BinanceSDK {
  private readonly aBNBbTokenContract: Contract;
  private readonly ankrTokenContract: Contract;
  private readonly apiGateWay: ApiGateway;
  private readonly binancePoolContract: Contract;
  private readonly WBNBContract: Contract;

  private static instance?: BinanceSDK;

  private constructor(private web3: Web3, private currentAccount: string) {
    BinanceSDK.instance = this;

    const config: IStkrConfig = configFromEnv();
    const { Contract } = this.web3.eth;

    this.aBNBbTokenContract = new Contract(
      ABI_ABNBB as AbiItem[],
      config.binanceConfig.aBNBbToken,
    );

    this.binancePoolContract = new Contract(
      ABI_BINANCE_POOL as AbiItem[],
      config.binanceConfig.binancePool,
    );

    this.WBNBContract = new Contract(
      ABI_ERC20 as AbiItem[],
      config.binanceConfig.WBNBContract,
    );

    this.ankrTokenContract = new Contract(
      ABI_ERC20 as AbiItem[],
      config.contractConfig.ankrContract,
    );

    this.apiGateWay = new ApiGateway(config.gatewayConfig);
  }

  private async getPastEvents(
    provider: Web3KeyProvider,
    contract: Contract,
    eventName: string,
    filter?: Filter,
  ): Promise<TPastEventsData> {
    const latestBlockNumber: number = await provider
      .getWeb3()
      .eth.getBlockNumber();
    const rawStartLoopBlockNumber: number =
      latestBlockNumber - MAX_EVENTS_BLOCK_RANGE;
    const startLoopBlockNumber: number =
      rawStartLoopBlockNumber < 0 ? 0 : rawStartLoopBlockNumber;

    let resultData: TPastEventsData = [];

    for (
      let i = startLoopBlockNumber;
      i < latestBlockNumber;
      i += MAX_BINANCE_BLOCK_RANGE
    ) {
      const fromBlock: number = i;
      const toBlock: number = i + MAX_BINANCE_BLOCK_RANGE;

      const rawEventData: TPastEventsData = await contract.getPastEvents(
        eventName,
        {
          fromBlock,
          toBlock,
          filter,
        },
      );

      resultData = [...resultData, ...rawEventData];
    }

    return resultData;
  }

  private getTxAmount(amount: string): BigNumber {
    return new BigNumber(this.web3.utils.fromWei(amount));
  }

  private async getTxEventsHistoryGroup(
    rawEvents?: TPastEventsData,
  ): Promise<TTxEventsHistoryGroupData> {
    if (!Array.isArray(rawEvents) || !rawEvents.length) {
      return [];
    }

    const rawData: Array<ITxHistoryEventData> = [];

    for (let i = 0, rawEvent: EventData; i < rawEvents.length; i++) {
      rawEvent = rawEvents[i] as EventData;

      rawData[i] = {
        ...rawEvent,
        timestamp: (await this.web3.eth.getBlock(rawEvent.blockHash, false))
          .timestamp as number,
      };
    }

    return rawData
      .sort(
        (a: ITxHistoryEventData, b: ITxHistoryEventData): number =>
          b.timestamp - a.timestamp,
      )
      .map(
        ({
          event,
          returnValues: { amount },
          timestamp,
          transactionHash,
        }: ITxHistoryEventData): ITxEventsHistoryGroupItem => ({
          txAmount: this.getTxAmount(amount),
          txDate: new Date(timestamp * 1_000),
          txHash: transactionHash,
          txType: this.getTxType(event),
        }),
      );
  }

  private getTxType(rawTxType?: string): string | null {
    switch (rawTxType) {
      case EBinancePoolEvents.ClaimPending:
        return EBinancePoolEventsMap.ClaimPending;

      case EBinancePoolEvents.StakePending:
        return EBinancePoolEventsMap.StakePending;

      default:
        return null;
    }
  }

  public async addABNBBToWallet(): Promise<void> {
    const providerManager: ProviderManager =
      ProviderManagerSingleton.getInstance();
    const provider: Web3KeyProvider = await providerManager.getProvider(
      BINANCE_PROVIDER_ID,
    );
    const aBNBbContract: string = configFromEnv().binanceConfig.aBNBbToken;

    const [symbol, rawDecimals] = await Promise.all([
      this.aBNBbTokenContract.methods.symbol().call(),
      this.aBNBbTokenContract.methods.decimals().call(),
    ]);

    const decimals: number = parseInt(rawDecimals, 10);

    await provider.addTokenToWallet({
      address: aBNBbContract,
      symbol,
      decimals,
    });
  }

  public async getaBNBbBalance(): Promise<BigNumber> {
    return new BigNumber(
      this.web3.utils.fromWei(
        await this.aBNBbTokenContract.methods
          .balanceOf(this.currentAccount)
          .call(),
      ),
    );
  }

  public async getaBNBbAPY(): Promise<BigNumber> {
    const providerManager: ProviderManager =
      ProviderManagerSingleton.getInstance();
    const provider: Web3KeyProvider = await providerManager.getProvider(
      BINANCE_PROVIDER_ID,
    );

    const secOneYear: BigNumber = new BigNumber(31_536_000);
    const initRatio: BigNumber = new BigNumber(1e18);
    const defaultState: BigNumber = new BigNumber(0);

    const rawEvents: TPastEventsData = await this.getPastEvents(
      provider,
      this.aBNBbTokenContract,
      EBinancePoolEvents.RatioUpdate,
      {
        newRatio: await this.aBNBbTokenContract.methods.ratio().call(),
      },
    );

    const [firstRawEvent, seventhRawEvent]: [
      EventData | void,
      EventData | void,
    ] = [rawEvents[rawEvents.length - 1], rawEvents[rawEvents.length - 7]];

    if (
      typeof firstRawEvent === 'undefined' ||
      typeof seventhRawEvent === 'undefined'
    ) {
      return defaultState;
    }

    const [firstRawEventBlock, seventhRawEventBlock] = await Promise.all([
      this.web3.eth.getBlock(firstRawEvent.blockHash, false),
      this.web3.eth.getBlock(seventhRawEvent.blockHash, false),
    ]);

    const [firstRawData, seventhRawData]: [
      ITxHistoryEventData,
      ITxHistoryEventData,
    ] = [
      {
        ...firstRawEvent,
        timestamp: firstRawEventBlock.timestamp as number,
      },
      {
        ...seventhRawEvent,
        timestamp: seventhRawEventBlock.timestamp as number,
      },
    ];

    if (
      typeof firstRawData.timestamp === 'undefined' ||
      typeof seventhRawData.timestamp === 'undefined'
    ) {
      return defaultState;
    }

    const ratio1: BigNumber = new BigNumber(
      firstRawData.returnValues?.newRatio ?? 0,
    );
    const ratio2: BigNumber = new BigNumber(
      seventhRawData.returnValues?.newRatio ?? 0,
    );

    const timeStamp1: BigNumber = new BigNumber(firstRawData.timestamp);
    const timeStamp2: BigNumber = new BigNumber(seventhRawData.timestamp);

    // Note: ((Math.abs(ratio1 - ratio2) / Math.abs(timeStamp1 - timeStamp2)) * 'seconds in one year') / 'init ratio'
    const apyVal: BigNumber = ratio1
      .minus(ratio2)
      .abs()
      .div(timeStamp1.minus(timeStamp2).abs())
      .multipliedBy(secOneYear)
      .div(initRatio);

    return apyVal.isNaN() ? defaultState : apyVal;
  }

  public async getBNBBalance(): Promise<BigNumber> {
    const providerManager: ProviderManager =
      ProviderManagerSingleton.getInstance();
    const provider: Web3KeyProvider = await providerManager.getProvider(
      BINANCE_PROVIDER_ID,
    );

    const [currBalance, decimals] = await Promise.all([
      this.web3.eth.getBalance(this.currentAccount),
      this.WBNBContract.methods.decimals().call(),
    ]);

    return provider.getFormattedBalance(currBalance, decimals);
  }

  public static async getInstance(): Promise<BinanceSDK> {
    const providerManager: ProviderManager =
      ProviderManagerSingleton.getInstance();
    const provider: Web3KeyProvider = await providerManager.getProvider(
      BINANCE_PROVIDER_ID,
    );
    const web3: Web3 = provider.getWeb3();
    const currentAccount: string = provider.currentAccount;
    const addrHasNotBeenUpdated: boolean =
      BinanceSDK.instance?.currentAccount === provider.currentAccount;
    const hasWeb3: boolean = BinanceSDK.instance?.web3 === web3;

    if (BinanceSDK.instance && addrHasNotBeenUpdated && hasWeb3) {
      return BinanceSDK.instance;
    }

    return new BinanceSDK(web3, currentAccount);
  }

  public async getMinimumStake(): Promise<BigNumber> {
    return new BigNumber(
      this.web3.utils.fromWei(
        await this.binancePoolContract.methods.getMinimumStake().call(),
      ),
    );
  }

  public async getPendingClaim(): Promise<BigNumber> {
    return new BigNumber(
      this.web3.utils.fromWei(
        await this.binancePoolContract.methods
          .pendingBnbClaimsOf(this.currentAccount)
          .call(),
      ),
    );
  }

  public async getRelayerFee(): Promise<BigNumber> {
    return new BigNumber(
      this.web3.utils.fromWei(
        await this.binancePoolContract.methods.getRelayerFee().call(),
      ),
    );
  }

  public async getTxEventsHistory(): Promise<ITxEventsHistoryData> {
    const providerManager: ProviderManager =
      ProviderManagerSingleton.getInstance();
    const provider: Web3KeyProvider = await providerManager.getProvider(
      BINANCE_PROVIDER_ID,
    );

    const [stakeRawEvents, unstakeRawEvents]: [
      TPastEventsData,
      TPastEventsData,
    ] = await Promise.all([
      this.getPastEvents(
        provider,
        this.binancePoolContract,
        EBinancePoolEvents.StakePending,
        {
          staker: this.currentAccount,
        },
      ),
      this.getPastEvents(
        provider,
        this.binancePoolContract,
        EBinancePoolEvents.ClaimPending,
        {
          claimer: this.currentAccount,
        },
      ),
    ]);

    let pendingClaim: BigNumber = await this.getPendingClaim(),
      pendingRawEvents: TPastEventsData = [],
      completedRawEvents: TPastEventsData;

    if (pendingClaim.isGreaterThan(0)) {
      const unstakeRawEventsReverse: TPastEventsData =
        unstakeRawEvents.reverse();

      for (
        let i = 0, unstakeRawEventItem: EventData, itemAmount: BigNumber;
        i < unstakeRawEventsReverse.length;
        i++
      ) {
        unstakeRawEventItem = unstakeRawEventsReverse[i] as EventData;
        itemAmount = this.getTxAmount(unstakeRawEventItem.returnValues.amount);
        pendingClaim = pendingClaim.minus(itemAmount);

        pendingRawEvents = [...pendingRawEvents, unstakeRawEventItem];

        if (pendingClaim.isZero()) {
          break;
        }
      }

      completedRawEvents = [
        ...stakeRawEvents,
        ...unstakeRawEventsReverse.slice(pendingRawEvents.length),
      ];
    } else {
      completedRawEvents = [...stakeRawEvents, ...unstakeRawEvents];
    }

    return {
      completed: await this.getTxEventsHistoryGroup(completedRawEvents),
      pending: await this.getTxEventsHistoryGroup(pendingRawEvents),
    };
  }

  public async getUnstakeFee() {
    const data = {
      unstakeFee: '0',
      useBeforeBlock: 0,
      signature: '',
    };

    return {
      unstakeFee: data.unstakeFee,
      useBeforeBlock: data.useBeforeBlock,
      signature: data.signature,
    };
  }

  public getWeb3(): Web3 {
    return this.web3;
  }

  public async stake(amount: BigNumber) {
    return {
      txHash: '',
    };
  }

  public async unstake(amount: BigNumber) {}
}
