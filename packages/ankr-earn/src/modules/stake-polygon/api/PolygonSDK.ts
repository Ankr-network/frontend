/* eslint-disable */ // TODO: temp disable eslint
import BigNumber from 'bignumber.js';
import { Web3KeyReadProvider } from 'provider/providerManager/Web3KeyReadProvider';
import Web3 from 'web3';
import { Contract, EventData } from 'web3-eth-contract';

import { configFromEnv } from 'modules/api/config';
import ABI_ERC20 from 'modules/api/contract/IERC20.json';
import { ApiGateway } from 'modules/api/gateway';
import { ProviderManagerSingleton } from 'modules/api/ProviderManagerSingleton';
import { Token } from 'modules/common/types/token';
import { getAPY } from 'modules/stake/api/getAPY';
import { POLYGON_PROVIDER_ID } from '../const';

import ABI_AMATICB from './contracts/aMATICb.json';
import ABI_POLYGON_POOL from './contracts/polygonPool.json';

export type TTxEventsHistoryGroupData = ITxEventsHistoryGroupItem[];

enum EPolygonPoolEvents {
  MaticClaimPending = 'MaticClaimPending',
  StakePending = 'StakePending',
}

export enum EPolygonPoolEventsMap {
  MaticClaimPending = 'STAKE_ACTION_UNSTAKED',
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

const ALLOWANCE_RATE = 5;

export class PolygonSDK {
  private static instance?: PolygonSDK;

  private readonly maticTokenContract: Contract;

  private readonly aMaticbTokenContract: Contract;

  private readonly polygonPoolContract: Contract;

  private readonly ankrTokenContract: Contract;

  private readonly apiGateWay: ApiGateway;

  private constructor(private web3: Web3, private currentAccount: string) {
    PolygonSDK.instance = this;

    const config = configFromEnv();
    const Contract = this.web3.eth.Contract as any;
    this.maticTokenContract = new Contract(
      ABI_ERC20 as any,
      config.contractConfig.maticToken,
    );

    this.aMaticbTokenContract = new Contract(
      ABI_AMATICB as any,
      config.contractConfig.aMaticbToken,
    );

    this.polygonPoolContract = new Contract(
      ABI_POLYGON_POOL as any,
      config.contractConfig.polygonPool,
    );

    this.ankrTokenContract = new Contract(
      ABI_ERC20 as any,
      config.contractConfig.ankrContract,
    );

    this.apiGateWay = new ApiGateway(config.gatewayConfig);
  }

  private getTxType(rawTxType?: string): string | null {
    switch (rawTxType) {
      case EPolygonPoolEvents.MaticClaimPending:
        return EPolygonPoolEventsMap.MaticClaimPending;

      case EPolygonPoolEvents.StakePending:
        return EPolygonPoolEventsMap.StakePending;

      default:
        return null;
    }
  }

  private getTxAmount(amount: string): BigNumber {
    return new BigNumber(this.web3.utils.fromWei(amount));
  }

  // todo: reuse it form stake/api/getTxEventsHistoryGroup
  private async getTxEventsHistoryGroup(
    rawEvents?: Array<EventData | void>,
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

  public static async getInstance() {
    const providerManager = ProviderManagerSingleton.getInstance();
    const provider = await providerManager.getProvider(POLYGON_PROVIDER_ID);
    const web3 = provider.getWeb3();
    const { currentAccount } = provider;
    const addrHasNotBeenUpdated =
      PolygonSDK.instance?.currentAccount === provider.currentAccount;
    const hasWeb3 = PolygonSDK.instance?.web3 === web3;

    if (PolygonSDK.instance && addrHasNotBeenUpdated && hasWeb3) {
      return PolygonSDK.instance;
    }

    return new PolygonSDK(web3, currentAccount);
  }

  public getWeb3() {
    return this.web3;
  }

  public async getMaticBalance(): Promise<BigNumber> {
    return new BigNumber(
      this.web3.utils.fromWei(
        await this.maticTokenContract?.methods
          .balanceOf(this.currentAccount)
          .call(),
      ),
    );
  }

  public async getaMaticbBalance() {
    return new BigNumber(
      this.web3.utils.fromWei(
        await this.aMaticbTokenContract?.methods
          .balanceOf(this.currentAccount)
          .call(),
      ),
    );
  }

  public static async getaMaticbAPY(
    provider: Web3KeyReadProvider,
  ): Promise<BigNumber> {
    const config = configFromEnv();

    const web3 = provider.getWeb3();

    const aMaticbTokenContract = new web3.eth.Contract(
      ABI_AMATICB as any,
      config.contractConfig.aMaticbToken,
    );

    return getAPY({
      tokenContract: aMaticbTokenContract,
      web3: provider.getWeb3(),
      batchSize: 12,
      blocksDeep: 3000,
    });
  }

  public async getPendingClaim(): Promise<BigNumber> {
    return new BigNumber(
      this.web3.utils.fromWei(
        await this.polygonPoolContract.methods
          .pendingMaticClaimsOf(this.currentAccount)
          .call(),
      ),
    );
  }

  public async getMinimumStake(): Promise<BigNumber> {
    return new BigNumber(
      this.web3.utils.fromWei(
        await this.polygonPoolContract.methods.getMinimumStake().call(),
      ),
    );
  }

  public async getTxEventsHistory(): Promise<ITxEventsHistoryData> {
    const [stakeRawEvents, unstakeRawEvents]: [
      Array<EventData | void>,
      Array<EventData | void>,
    ] = await Promise.all([
      this.polygonPoolContract.getPastEvents(EPolygonPoolEvents.StakePending, {
        fromBlock: 0,
        toBlock: 'latest',
        filter: {
          staker: this.currentAccount,
        },
      }),
      this.polygonPoolContract.getPastEvents(
        EPolygonPoolEvents.MaticClaimPending,
        {
          fromBlock: 0,
          toBlock: 'latest',
          filter: {
            claimer: this.currentAccount,
          },
        },
      ),
    ]);

    let pendingClaim: BigNumber = await this.getPendingClaim();
    let pendingRawEvents: Array<EventData | void> = [];
    let completedRawEvents: Array<EventData | void>;

    if (pendingClaim.isGreaterThan(0)) {
      const unstakeRawEventsReverse: Array<EventData | void> =
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

  public async stake(amount: BigNumber) {
    const polygonPoolAddress = configFromEnv().contractConfig.polygonPool;
    const providerManager = ProviderManagerSingleton.getInstance();
    const provider = await providerManager.getProvider(POLYGON_PROVIDER_ID);

    if (!provider.isConnected()) {
      await provider.connect();
    }
    const web3 = provider.getWeb3();
    const { polygonPoolContract } = this;
    const { maticTokenContract } = this;
    const { currentAccount } = this;
    const rawAmount = amount.multipliedBy(1e18);
    // 0. Check current allowance
    const allowance = new BigNumber(
      await maticTokenContract.methods
        .allowance(currentAccount, polygonPoolAddress)
        .call(),
    );
    // 1. Approve MATIC token transfer to our PolygonPool contract
    if (allowance.isLessThan(rawAmount)) {
      await maticTokenContract.methods
        .approve(
          polygonPoolAddress,
          web3.utils.numberToHex(rawAmount.toString(10)),
        )
        .send({
          from: currentAccount,
        });
    }
    // 2. Do staking
    const tx2 = await polygonPoolContract.methods
      .stake(web3.utils.numberToHex(rawAmount.toString(10)))
      .send({
        from: currentAccount,
      });
    const txHash = tx2.transactionHash;

    return { txHash };
  }

  public async getUnstakeFee() {
    const providerManager = ProviderManagerSingleton.getInstance();
    const provider = await providerManager.getProvider(POLYGON_PROVIDER_ID);
    if (!provider.isConnected()) {
      await provider.connect();
    }

    const { status, data, statusText } = await this.apiGateWay.api.get<{
      unstakeFee: string;
      useBeforeBlock: number;
      signature: string;
    }>(`/v1alpha/polygon/unstakeFee?address=${this.currentAccount}`);

    if (status !== 200)
      throw new Error(`Unable to fetch ethereum balance: ${statusText}`);

    return {
      unstakeFee: data.unstakeFee,
      useBeforeBlock: data.useBeforeBlock,
      signature: data.signature,
    };
  }

  public async unstake(amount: BigNumber) {
    const polygonPoolAddress = configFromEnv().contractConfig.polygonPool;
    const providerManager = ProviderManagerSingleton.getInstance();
    const provider = await providerManager.getProvider(POLYGON_PROVIDER_ID);
    if (!provider.isConnected()) {
      await provider.connect();
    }
    const web3 = provider.getWeb3();
    const polygonPoolContract = new web3.eth.Contract(
      ABI_POLYGON_POOL as any,
      polygonPoolAddress,
    );
    const { ankrTokenContract } = this;
    const [currentAccount] = await web3.eth.getAccounts();
    const rawAmount = amount.multipliedBy(1e18);
    // Do unstaking
    // 0. Check current allowance
    const allowance = new BigNumber(
      await ankrTokenContract.methods
        .allowance(currentAccount, polygonPoolAddress)
        .call(),
    );

    const { unstakeFee } = await this.getUnstakeFee();

    // 1. Approve payment in Ankr for unstake
    const fee = new BigNumber(unstakeFee);

    if (allowance.isLessThan(fee)) {
      await ankrTokenContract.methods
        .approve(
          polygonPoolAddress,
          web3.utils.numberToHex(fee.multipliedBy(ALLOWANCE_RATE).toString(10)),
        )
        .send({
          from: currentAccount,
        });
    }
    // 2. Call unstake method
    // Fetch fees here and make allowance one more time if required
    const { useBeforeBlock, signature } = await this.getUnstakeFee();

    await polygonPoolContract.methods
      .unstake(
        web3.utils.numberToHex(rawAmount.toString(10)),
        web3.utils.numberToHex(fee.toString(10)),
        web3.utils.numberToHex(useBeforeBlock),
        signature,
      )
      .send({
        from: currentAccount,
      });
  }

  public async addAmaticbToWallet() {
    const providerManager = ProviderManagerSingleton.getInstance();
    const provider = await providerManager.getProvider(POLYGON_PROVIDER_ID);
    const amaticbContract = configFromEnv().contractConfig.aMaticbToken;

    await provider.addTokenToWallet({
      address: amaticbContract,
      symbol: Token.aMATICb,
      decimals: 18,
    });
  }
}
