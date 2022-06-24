import BigNumber from 'bignumber.js';
import flatten from 'lodash/flatten';
import { BlockTransactionObject } from 'web3-eth';
import { Contract, EventData } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { ProviderManagerSingleton } from '@ankr.com/staking-sdk';
import {
  EEthereumNetworkId,
  IWeb3SendResult,
  TWeb3BatchCallback,
  Web3KeyReadProvider,
  Web3KeyWriteProvider,
} from 'provider';

import {
  ETH_SCALE_FACTOR,
  isMainnet,
  MAX_UINT256,
  ZERO,
  configFromEnv,
  ZERO_EVENT_HASH,
} from '../common';
import {
  ABI_ERC20,
  ABI_ABNBB,
  ABI_ABNBC,
  ABI_BINANCE_POOL,
} from '../contracts';
import {
  ITxEventsHistoryData,
  IGetPastEvents,
  IPendingData,
  ITxEventsHistoryGroupItem,
  IEventsBatch,
  IStakable,
} from '../stake';
import { IFetchTxData, IShareArgs, ISwitcher } from '../switcher';
import { convertNumberToHex } from '../utils';

import {
  BINANCE_HISTORY_BLOCK_OFFSET,
  BINANCE_READ_PROVIDER_ID,
  BNB_MAX_BLOCK_RANGE,
  BNB_SAFE_PRECISION,
  CERT_STAKING_LOG_HASH,
  ESTIMATE_GAS_MULTIPLIER,
} from './const';
import {
  TBnbSyntToken,
  IBinanceSDKProviders,
  IGetTxReceipt,
  EBinancePoolEvents,
  EBinancePoolEventsMap,
  EErrorCodes,
} from './types';

export class BinanceSDK implements ISwitcher, IStakable {
  private static instance?: BinanceSDK;

  private readonly writeProvider: Web3KeyWriteProvider;

  private readonly readProvider: Web3KeyReadProvider;

  private currentAccount: string;

  private stakeGasFee?: BigNumber;

  private constructor({ readProvider, writeProvider }: IBinanceSDKProviders) {
    BinanceSDK.instance = this;

    this.currentAccount = writeProvider.currentAccount;
    this.readProvider = readProvider;
    this.writeProvider = writeProvider;
  }

  public static async getInstance(): Promise<BinanceSDK> {
    const providerManager = ProviderManagerSingleton.getInstance();
    const [writeProvider, readProvider] = await Promise.all([
      providerManager.getETHWriteProvider(),
      providerManager.getETHReadProvider(BINANCE_READ_PROVIDER_ID),
    ]);

    const addrHasNotBeenUpdated =
      BinanceSDK.instance?.currentAccount === writeProvider.currentAccount;
    const hasNewProvider =
      BinanceSDK.instance?.writeProvider === writeProvider &&
      BinanceSDK.instance?.readProvider === readProvider;

    if (BinanceSDK.instance && addrHasNotBeenUpdated && hasNewProvider) {
      return BinanceSDK.instance;
    }

    const instance = new BinanceSDK({ writeProvider, readProvider });
    const isBinanceChain = await instance.isBinanceNetwork(writeProvider);

    if (isBinanceChain && !writeProvider.isConnected()) {
      await writeProvider.connect();
    }

    return instance;
  }

  private async getProvider(
    isForceRead = false,
  ): Promise<Web3KeyWriteProvider | Web3KeyReadProvider> {
    if (isForceRead) {
      return this.readProvider;
    }

    const isBinanceChain = await this.isBinanceNetwork(this.writeProvider);

    if (isBinanceChain && !this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    if (isBinanceChain) {
      return this.writeProvider;
    }

    return this.readProvider;
  }

  private async isBinanceNetwork(
    provider: Web3KeyWriteProvider,
  ): Promise<boolean> {
    const web3 = provider.getWeb3();
    const chainId = await web3.eth.getChainId();

    return [
      EEthereumNetworkId.smartchain,
      EEthereumNetworkId.smartchainTestnet,
    ].includes(chainId);
  }

  private async getPastEvents({
    contract,
    eventName,
    startBlock,
    rangeStep,
    filter,
    latestBlockNumber,
  }: IGetPastEvents): Promise<EventData[]> {
    const eventsPromises: Promise<EventData[]>[] = [];

    for (let i = startBlock; i < latestBlockNumber; i += rangeStep) {
      const fromBlock = i;
      const toBlock = fromBlock + rangeStep;

      eventsPromises.push(
        contract.getPastEvents(eventName, { fromBlock, toBlock, filter }),
      );
    }

    const pastEvents = await Promise.all(eventsPromises);

    return flatten(pastEvents);
  }

  private convertFromWei(amount: string): BigNumber {
    return new BigNumber(this.readProvider.getWeb3().utils.fromWei(amount));
  }

  private convertToHex(amount: BigNumber): string {
    return convertNumberToHex(amount, ETH_SCALE_FACTOR);
  }

  // TODO: reuse it form stake/api/getTxEventsHistoryGroup
  private async getTxEventsHistoryGroup(
    rawEvents?: EventData[],
  ): Promise<ITxEventsHistoryGroupItem[]> {
    if (!Array.isArray(rawEvents) || !rawEvents.length) {
      return [];
    }

    const provider = await this.getProvider();
    const web3 = provider.getWeb3();

    const calls = rawEvents.map(
      event => (callback: TWeb3BatchCallback<BlockTransactionObject>) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore https://github.com/ChainSafe/web3.js/issues/4655
        web3.eth.getBlock.request(event.blockHash, false, callback),
    );

    const blocks = await provider.executeBatchCalls<BlockTransactionObject>(
      calls,
    );

    const rawData = blocks.map((block, index) => ({
      ...rawEvents[index],
      timestamp: block.timestamp as number,
    }));

    return rawData
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(
        ({ event, returnValues: { amount }, timestamp, transactionHash }) => ({
          txAmount: this.convertFromWei(amount),
          txDate: new Date(timestamp * 1_000),
          txHash: transactionHash,
          txType: this.getTxType(event),
        }),
      );
  }

  private getTxType(rawTxType?: string): string | null {
    switch (rawTxType) {
      case EBinancePoolEvents.Staked:
        return EBinancePoolEventsMap.Staked;

      case EBinancePoolEvents.UnstakePending:
        return EBinancePoolEventsMap.UnstakePending;

      default:
        return null;
    }
  }

  private async getABNBBContract(isForceRead = false): Promise<Contract> {
    const { binanceConfig } = configFromEnv();
    const provider = await this.getProvider(isForceRead);
    const web3 = provider.getWeb3();

    return new web3.eth.Contract(
      ABI_ABNBB as AbiItem[],
      binanceConfig.aBNBbToken,
    );
  }

  private async getBinancePoolContract(isForceRead = false): Promise<Contract> {
    const { binanceConfig } = configFromEnv();
    const provider = await this.getProvider(isForceRead);
    const web3 = provider.getWeb3();

    return new web3.eth.Contract(
      ABI_BINANCE_POOL as AbiItem[],
      binanceConfig.binancePool,
    );
  }

  private async getWrappedBNBContract(isForceRead = false): Promise<Contract> {
    const { binanceConfig } = configFromEnv();
    const provider = await this.getProvider(isForceRead);
    const web3 = provider.getWeb3();

    return new web3.eth.Contract(
      ABI_ERC20 as AbiItem[],
      binanceConfig.WBNBContract,
    );
  }

  public async addTokenToWallet(token: TBnbSyntToken): Promise<boolean> {
    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    const { binanceConfig } = configFromEnv();
    const isAbnbb = token === 'aBNBb';

    const tokenContract = isAbnbb
      ? await this.getABNBBContract()
      : await this.getABNBCContract();

    const address = isAbnbb
      ? binanceConfig.aBNBbToken
      : binanceConfig.aBNBcToken;

    const [symbol, rawDecimals]: [string, string] = await Promise.all([
      tokenContract.methods.symbol().call(),
      tokenContract.methods.decimals().call(),
    ]);

    const decimals = Number.parseInt(rawDecimals, 10);

    const chainId: number = isMainnet
      ? EEthereumNetworkId.smartchain
      : EEthereumNetworkId.smartchainTestnet;

    return this.writeProvider.addTokenToWallet({
      address,
      symbol,
      decimals,
      chainId,
    });
  }

  public async getABBalance(): Promise<BigNumber> {
    const aBNBbTokenContract = await this.getABNBBContract();

    const balance = await aBNBbTokenContract.methods
      .balanceOf(this.currentAccount)
      .call();

    return this.convertFromWei(balance);
  }

  public async getBNBBalance(): Promise<BigNumber> {
    const provider = await this.getProvider();
    const web3 = provider.getWeb3();
    const contract = await this.getWrappedBNBContract();

    const [currBalance, decimals] = await Promise.all([
      web3.eth.getBalance(this.currentAccount),
      contract.methods.decimals().call(),
    ]);

    return this.readProvider.getFormattedBalance(currBalance, decimals);
  }

  public async getMinimumStake(): Promise<BigNumber> {
    const binancePoolContract = await this.getBinancePoolContract();

    const minStake = await binancePoolContract.methods.getMinimumStake().call();

    return this.convertFromWei(minStake);
  }

  private async getPoolEventsBatch(): Promise<IEventsBatch> {
    const binancePoolContract = await this.getBinancePoolContract(true);
    const provider = await this.getProvider();
    const web3 = provider.getWeb3();
    const latestBlockNumber = await web3.eth.getBlockNumber();

    const [unstakeRawEvents, rebasingEvents, ratio] = await Promise.all([
      this.getPastEvents({
        provider: this.readProvider,
        contract: binancePoolContract,
        eventName: EBinancePoolEvents.UnstakePending,
        startBlock: latestBlockNumber - BINANCE_HISTORY_BLOCK_OFFSET,
        latestBlockNumber,
        rangeStep: BNB_MAX_BLOCK_RANGE,
        filter: { claimer: this.currentAccount },
      }),
      this.getPastEvents({
        provider: this.readProvider,
        contract: binancePoolContract,
        eventName: EBinancePoolEvents.IsRebasing,
        startBlock: latestBlockNumber - BINANCE_HISTORY_BLOCK_OFFSET,
        latestBlockNumber,
        rangeStep: BNB_MAX_BLOCK_RANGE,
      }),
      this.getACRatio(),
    ]);

    return {
      stakeRawEvents: [],
      unstakeRawEvents,
      rebasingEvents,
      ratio,
    };
  }

  public async getPendingData(): Promise<IPendingData> {
    const {
      unstakeRawEvents,
      rebasingEvents: isRebasingEvents,
      ratio,
    } = await this.getPoolEventsBatch();
    let pendingUnstakes = await this.getPendingClaim();
    let pendingRawEvents: EventData[] = [];

    if (pendingUnstakes.isGreaterThan(0)) {
      const unstakePendingReverse = unstakeRawEvents.reverse();

      for (
        let i = 0;
        i < unstakePendingReverse.length && !pendingUnstakes.isZero();
        i += 1
      ) {
        const unstakeEventItem = unstakePendingReverse[i];
        const itemAmount = this.convertFromWei(
          unstakeEventItem.returnValues.amount,
        );
        pendingUnstakes = pendingUnstakes.minus(itemAmount);

        pendingRawEvents = [...pendingRawEvents, unstakeEventItem];
      }
    }

    const abnbcHashSet = new Set<string>(
      isRebasingEvents
        .filter(x => x.raw.data === ZERO_EVENT_HASH)
        .map(y => y.transactionHash),
    );

    const pendingUnstakesABNBB = pendingRawEvents.filter(
      x => !abnbcHashSet.has(x.transactionHash),
    );
    const pendingUnstakesABNBC = pendingRawEvents.filter(x =>
      abnbcHashSet.has(x.transactionHash),
    );

    return {
      pendingBond: pendingUnstakesABNBB.reduce(
        (sum, item) => sum.plus(this.convertFromWei(item.returnValues.amount)),
        ZERO,
      ),
      pendingCertificate: pendingUnstakesABNBC.reduce(
        (sum, item) =>
          sum.plus(
            this.convertFromWei(item.returnValues.amount).multipliedBy(ratio),
          ),
        ZERO,
      ),
    };
  }

  public async getPendingClaim(): Promise<BigNumber> {
    const binancePoolContract = await this.getBinancePoolContract();

    const pending = await binancePoolContract.methods
      .pendingUnstakesOf(this.currentAccount)
      .call();

    return this.convertFromWei(pending);
  }

  public async getRelayerFee(): Promise<BigNumber> {
    const binancePoolContract = await this.getBinancePoolContract();

    const relayerFee = await binancePoolContract.methods.getRelayerFee().call();

    return this.convertFromWei(relayerFee);
  }

  public async getStakeGasFee(
    amount: BigNumber,
    token: TBnbSyntToken,
  ): Promise<BigNumber> {
    const provider = await this.getProvider();
    const binancePoolContract = await this.getBinancePoolContract();

    const bnbSpecificAmount = new BigNumber(
      amount.toPrecision(BNB_SAFE_PRECISION, BigNumber.ROUND_DOWN),
    );

    const contractStake =
      binancePoolContract.methods[this.getStakeMethodName(token)];

    const estimatedGas: number = await contractStake().estimateGas({
      from: this.currentAccount,
      value: this.convertToHex(bnbSpecificAmount),
    });

    const increasedGasLimit = this.getIncreasedGasLimit(estimatedGas);

    const stakeGasFee = await provider.getContractMethodFee(increasedGasLimit);

    this.stakeGasFee = stakeGasFee;

    return stakeGasFee;
  }

  private getStakeMethodName(token: TBnbSyntToken) {
    switch (token) {
      case 'aBNBc':
        return 'stakeAndClaimCerts';

      default:
        return 'stakeAndClaimBonds';
    }
  }

  private getIncreasedGasLimit(gasLimit: number) {
    return Math.round(gasLimit * ESTIMATE_GAS_MULTIPLIER);
  }

  public async getTxEventsHistory(): Promise<ITxEventsHistoryData> {
    const binancePoolContract = await this.getBinancePoolContract(true);
    const provider = await this.getProvider();
    const web3 = provider.getWeb3();
    const latestBlockNumber = await web3.eth.getBlockNumber();

    const { unstakeRawEvents, rebasingEvents, ratio } =
      await this.getPoolEventsBatch();

    const stakeRawEvents = await this.getPastEvents({
      provider: this.readProvider,
      contract: binancePoolContract,
      eventName: EBinancePoolEvents.Staked,
      startBlock: latestBlockNumber - BINANCE_HISTORY_BLOCK_OFFSET,
      latestBlockNumber,
      rangeStep: BNB_MAX_BLOCK_RANGE,
      filter: { delegator: this.currentAccount },
    });

    const abnbcHashSet = new Set<string>(
      rebasingEvents
        .filter(x => x.raw.data === ZERO_EVENT_HASH)
        .map(y => y.transactionHash),
    );

    let pendingUnstakes = await this.getPendingClaim();
    let completedRawEvents: EventData[] = [];
    let pendingRawEvents: EventData[] = [];

    if (pendingUnstakes.isGreaterThan(0)) {
      const unstakeRawEventsReverse = unstakeRawEvents.reverse();

      for (
        let i = 0;
        i < unstakeRawEventsReverse.length && !pendingUnstakes.isZero();
        i += 1
      ) {
        const unstakeRawEventItem = unstakeRawEventsReverse[i];
        const itemAmount = this.convertFromWei(
          unstakeRawEventItem.returnValues.amount,
        );
        pendingUnstakes = pendingUnstakes.minus(itemAmount);

        pendingRawEvents = [...pendingRawEvents, unstakeRawEventItem];
      }

      completedRawEvents = [
        ...stakeRawEvents,
        ...unstakeRawEventsReverse.slice(pendingRawEvents.length),
      ];
    } else {
      completedRawEvents = [...stakeRawEvents, ...unstakeRawEvents];
    }

    const completedABNBBEvents = completedRawEvents.filter(
      x => !abnbcHashSet.has(x.transactionHash),
    );
    const completedABNBCEvents = completedRawEvents.filter(x =>
      abnbcHashSet.has(x.transactionHash),
    );

    const pendingABNBBEvents = pendingRawEvents.filter(
      x => !abnbcHashSet.has(x.transactionHash),
    );
    const pendingABNBCEvents = pendingRawEvents.filter(x =>
      abnbcHashSet.has(x.transactionHash),
    );

    const [
      completedBond,
      completedCertificate,
      pendingBond,
      pendingCertificate,
    ] = await Promise.all([
      this.getTxEventsHistoryGroup(completedABNBBEvents),
      this.getTxEventsHistoryGroup(completedABNBCEvents),
      this.getTxEventsHistoryGroup(pendingABNBBEvents),
      this.getTxEventsHistoryGroup(pendingABNBCEvents),
    ]);

    return {
      completedBond,
      completedCertificate: completedCertificate.map(x => ({
        ...x,
        txAmount: x.txAmount.multipliedBy(ratio),
      })),
      pendingBond,
      pendingCertificate: pendingCertificate.map(x => ({
        ...x,
        txAmount: x.txAmount.multipliedBy(ratio),
      })),
    };
  }

  public async fetchTxData(txHash: string): Promise<IFetchTxData> {
    const provider = await this.getProvider();

    const web3 = provider.getWeb3();

    const tx = await web3.eth.getTransaction(txHash);

    const { 0: amount } =
      tx.value === '0'
        ? web3.eth.abi.decodeParameters(['uint256'], tx.input.slice(10))
        : { 0: tx.value };

    return {
      amount: this.convertFromWei(amount),
      destinationAddress: tx.from as string | undefined,
      isPending: tx.transactionIndex === null,
    };
  }

  public async fetchTxReceipt(txHash: string): Promise<IGetTxReceipt | null> {
    const provider = await this.getProvider();
    const web3 = provider.getWeb3();

    const receipt = await web3.eth.getTransactionReceipt(txHash);

    const certUnlockedLog = receipt?.logs.find(log =>
      log.topics.includes(CERT_STAKING_LOG_HASH),
    );

    if (certUnlockedLog) {
      const certDecodedLog = web3.eth.abi.decodeLog(
        [{ type: 'uint256', name: 'amount' }],
        certUnlockedLog.data,
        certUnlockedLog.topics,
      );

      return {
        ...receipt,
        certAmount: web3.utils.fromWei(certDecodedLog.amount),
      } as IGetTxReceipt | null;
    }

    return receipt as IGetTxReceipt | null;
  }

  public async stake(
    amount: BigNumber,
    token: string,
  ): Promise<{ txHash: string }> {
    if (amount.isLessThanOrEqualTo(ZERO)) {
      throw new Error(EErrorCodes.ZERO_AMOUNT);
    }

    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    let gasFee = this.stakeGasFee;
    if (!gasFee) {
      gasFee = await this.getStakeGasFee(amount, token as TBnbSyntToken);
    }

    const balance = await this.getBNBBalance();
    const maxAmount = balance.minus(gasFee);
    const stakeAmount = amount.isGreaterThan(maxAmount) ? maxAmount : amount;
    const binancePoolContract = await this.getBinancePoolContract();

    const bnbSpecificAmount = new BigNumber(
      stakeAmount.toPrecision(BNB_SAFE_PRECISION, BigNumber.ROUND_DOWN),
    );

    const contractStake =
      binancePoolContract.methods[
        this.getStakeMethodName(token as TBnbSyntToken)
      ];

    const gasLimit: number = await contractStake().estimateGas({
      from: this.currentAccount,
      value: this.convertToHex(bnbSpecificAmount),
    });

    const tx = await contractStake().send({
      from: this.currentAccount,
      value: this.convertToHex(bnbSpecificAmount),
      gas: this.getIncreasedGasLimit(gasLimit),
    });

    return { txHash: tx.transactionHash };
  }

  public async unstake(amount: BigNumber, token: string): Promise<void> {
    if (amount.isLessThanOrEqualTo(ZERO)) {
      throw new Error(EErrorCodes.ZERO_AMOUNT);
    }

    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    const binancePoolContract = await this.getBinancePoolContract();
    const hexAmount = this.convertToHex(amount);

    const contractUnstake =
      binancePoolContract.methods[
        this.getUnstakeMethodName(token as TBnbSyntToken)
      ];

    await contractUnstake(hexAmount).send({
      from: this.currentAccount,
    });
  }

  private getUnstakeMethodName(token: TBnbSyntToken) {
    switch (token) {
      case 'aBNBc':
        return 'unstakeCerts';

      default:
        return 'unstakeBonds';
    }
  }

  public async getACRatio(): Promise<BigNumber> {
    const provider = await this.getProvider();
    const aBNBcContract = await this.getABNBCContract();
    const web3 = provider.getWeb3();

    const rawRatio = await aBNBcContract.methods.ratio().call();
    const ratio = web3.utils.fromWei(rawRatio);

    return new BigNumber(ratio);
  }

  private async getABNBCContract(isForceRead = false): Promise<Contract> {
    const { binanceConfig } = configFromEnv();
    const provider = await this.getProvider(isForceRead);

    return provider.createContract(ABI_ABNBC, binanceConfig.aBNBcToken);
  }

  public async getACBalance(): Promise<BigNumber> {
    const aBNBcContract = await this.getABNBCContract();

    const rawBalance = await aBNBcContract.methods
      .balanceOf(this.currentAccount)
      .call();

    return this.convertFromWei(rawBalance);
  }

  public async approveACForAB(
    amount = MAX_UINT256,
    scale = 1,
  ): Promise<IWeb3SendResult | undefined> {
    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    const hexAmount = convertNumberToHex(amount, scale);
    const isAllowed = await this.checkAllowance(hexAmount);

    if (isAllowed) {
      return undefined;
    }

    const { binanceConfig } = configFromEnv();

    const aBNBcContract = await this.getABNBCContract();

    const data = aBNBcContract.methods
      .approve(binanceConfig.aBNBbToken, hexAmount)
      .encodeABI();

    return this.writeProvider.sendTransactionAsync(
      this.currentAccount,
      binanceConfig.aBNBcToken,
      { data, estimate: true },
    );
  }

  public async checkAllowance(hexAmount: string): Promise<boolean> {
    const allowance = await this.getACAllowance();

    return allowance.isGreaterThanOrEqualTo(hexAmount);
  }

  public async getACAllowance(spender?: string): Promise<BigNumber> {
    const aBNBcContract = await this.getABNBCContract();
    const { binanceConfig } = configFromEnv();

    const allowance = await aBNBcContract.methods
      .allowance(
        this.writeProvider.currentAccount,
        spender || binanceConfig.aBNBbToken,
      )
      .call();

    return new BigNumber(allowance);
  }

  public async lockShares({
    amount,
    scale = ETH_SCALE_FACTOR,
  }: IShareArgs): Promise<IWeb3SendResult> {
    if (amount.isLessThanOrEqualTo(ZERO)) {
      throw new Error(EErrorCodes.ZERO_AMOUNT);
    }

    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    const aBNBbContract = await this.getABNBBContract();
    const { binanceConfig } = configFromEnv();

    const data = aBNBbContract.methods
      .lockShares(convertNumberToHex(amount, scale))
      .encodeABI();

    return this.writeProvider.sendTransactionAsync(
      this.currentAccount,
      binanceConfig.aBNBbToken,
      { data, estimate: true },
    );
  }

  public async unlockShares({
    amount,
    scale = ETH_SCALE_FACTOR,
  }: IShareArgs): Promise<IWeb3SendResult> {
    if (amount.isLessThanOrEqualTo(ZERO)) {
      throw new Error(EErrorCodes.ZERO_AMOUNT);
    }

    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    const aBNBbContract = await this.getABNBBContract();
    const { binanceConfig } = configFromEnv();

    const data = aBNBbContract.methods
      .unlockShares(convertNumberToHex(amount, scale))
      .encodeABI();

    return this.writeProvider.sendTransactionAsync(
      this.currentAccount,
      binanceConfig.aBNBbToken,
      { data, estimate: true },
    );
  }
}
