import { getPastEvents } from '@ankr.com/advanced-api';
import BigNumber from 'bignumber.js';
import flatten from 'lodash/flatten';
import { TransactionReceipt } from 'web3-core';
import { Contract, EventData } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import {
  EEthereumNetworkId,
  IWeb3SendResult,
  Web3KeyReadProvider,
  Web3KeyWriteProvider,
} from '@ankr.com/provider';

import {
  advancedAPIConfig,
  configFromEnv,
  ETH_SCALE_FACTOR,
  GetBlocksManager,
  getIsSameReadProvider,
  isMainnet,
  MAX_UINT256,
  ProviderManagerSingleton,
  ZERO,
} from '../common';
import { AAVAXB_ABI, AAVAXC_ABI, AVALANCHE_POOL_ABI } from '../contracts';
import {
  getFilteredContractEvents,
  IEventsBatch,
  IGetPastEvents,
  IPendingData,
  IStakable,
  IStakeData,
  ITxEventsHistoryData,
  ITxHistory,
  ITxHistoryEventData,
  ITxHistoryItem,
} from '../stake';
import { IFetchTxData, IShareArgs, ISwitcher } from '../switcher';
import { batchEvents, convertNumberToHex } from '../utils';

import {
  AVALANCHE_READ_PROVIDER_ID,
  AVAX_DECIMALS,
  AVAX_ESTIMATE_GAS_MULTIPLIER,
  AVAX_HISTORY_2_WEEKS_OFFSET,
  AVAX_MAX_BLOCK_RANGE,
  AVAX_POOL_START_BLOCK,
  AVAX_SCALE_FACTOR,
  GAS_FEE_MULTIPLIER,
} from './const';
import {
  EAvalancheErrorCodes,
  EAvalanchePoolEvents,
  EAvalanchePoolEventsMap,
  IAvalancheSDKArgs,
} from './types';

/**
 * AvalancheSDK allows you to interact with Avalanche Liquid Staking smart contracts on Avalanche network: aAVAXb, aAVAXc, and AvalanchePool.
 *
 * For more information on Avalanche Liquid Staking from Ankr, refer to the [development details](https://www.ankr.com/docs/staking/liquid-staking/avax/staking-mechanics).
 *
 * @class
 */
export class AvalancheSDK
  extends GetBlocksManager
  implements ISwitcher, IStakable
{
  /**
   * apiUrl — URL of the advanced API.
   *
   * @type {string}
   * @readonly
   * @private
   */
  private readonly apiUrl?: string;

  /**
   * readProvider — provider which allows to read data without connecting the wallet.
   *
   * @type {Web3KeyReadProvider}
   * @readonly
   * @private
   */
  private readonly readProvider: Web3KeyReadProvider;

  /**
   * writeProvider — provider which has signer for signing transactions.
   *
   * @type {Web3KeyWriteProvider}
   * @readonly
   * @private
   */
  private readonly writeProvider: Web3KeyWriteProvider;

  /**
   * instance — SDK instance.
   *
   * @type {AvalancheSDK}
   * @static
   * @private
   */
  private static instance?: AvalancheSDK;

  /**
   * currentAccount — connected account.
   *
   * @type {string}
   * @private
   */
  private currentAccount: string;

  /**
   * stakeGasFee — cached stake gas fee.
   *
   * @type {BigNumber}
   * @private
   */
  private stakeGasFee?: BigNumber;

  /**
   * Private constructor. Instead, use `AvalancheSDK.getInstance`.
   *
   * @constructor
   * @private
   */
  private constructor({
    readProvider,
    writeProvider,
    apiUrl,
  }: IAvalancheSDKArgs) {
    super();
    AvalancheSDK.instance = this;

    this.apiUrl = apiUrl;
    this.currentAccount = writeProvider.currentAccount;
    this.readProvider = readProvider;
    this.writeProvider = writeProvider;
  }

  /**
   * Internal function to convert wei value to human readable format.
   *
   * @private
   * @param {string} amount - value in wei
   * @returns {BigNumber}
   */
  private convertFromWei(amount: string): BigNumber {
    return new BigNumber(this.readProvider.getWeb3().utils.fromWei(amount));
  }

  /**
   * Internal function to convert value to hex format.
   *
   * @private
   * @param {BigNumber} amount - value in human readable format
   * @returns {string}
   */
  private convertToHex(amount: BigNumber): string {
    return this.readProvider
      .getWeb3()
      .utils.numberToHex(amount.multipliedBy(AVAX_SCALE_FACTOR).toString(10));
  }

  /**
   * Internal function to get aAVAXb token contract.
   *
   * @private
   * @param {boolean} [isForceRead = false] - forces to use readProvider
   * @returns {Promise<Contract>}
   */
  private async getAAVAXBTokenContract(isForceRead = false): Promise<Contract> {
    const { avalancheConfig } = configFromEnv();
    const provider = await this.getProvider(isForceRead);
    const web3 = provider.getWeb3();

    return new web3.eth.Contract(
      AAVAXB_ABI as AbiItem[],
      avalancheConfig.aAVAXb,
    );
  }

  /**
   * Internal function to get aAVAXc token contract.
   *
   * @private
   * @param {boolean} [isForceRead = false] - forces to use readProvider
   * @returns {Promise<Contract>}
   */
  private async getAAVAXCTokenContract(isForceRead = false): Promise<Contract> {
    const { avalancheConfig } = configFromEnv();
    const provider = await this.getProvider(isForceRead);
    const web3 = provider.getWeb3();

    return new web3.eth.Contract(
      AAVAXC_ABI as AbiItem[],
      avalancheConfig.aAVAXc,
    );
  }

  /**
   * Internal function to get AvalanchePool contract.
   *
   * @private
   * @param {boolean} [isForceRead = false] - forces to use readProvider
   * @returns {Promise<Contract>}
   */
  private async getAvalanchePoolContract(
    isForceRead = false,
  ): Promise<Contract> {
    const { avalancheConfig } = configFromEnv();
    const provider = await this.getProvider(isForceRead);
    const web3 = provider.getWeb3();

    return new web3.eth.Contract(
      AVALANCHE_POOL_ABI as AbiItem[],
      avalancheConfig.avalanchePool,
    );
  }

  /**
   * An internal function for getting past events from the API or blockchain
   * according to the current environment.
   *
   * @private
   * @param options {IGetPastEvents}
   * @returns {Promise<EventData[]>}
   */
  private async getPastEvents(options: IGetPastEvents): Promise<EventData[]> {
    return advancedAPIConfig.isActiveForAvalanche
      ? this.getPastEventsAPI(options)
      : this.getPastEventsBlockchain(options);
  }

  /**
   * Internal function to get past events from indexed logs API.
   *
   * @private
   * @param {IGetPastEvents}
   * @returns {Promise<EventData[]>}
   */
  private async getPastEventsAPI({
    contract,
    eventName,
    startBlock,
    latestBlockNumber,
    filter,
  }: IGetPastEvents): Promise<EventData[]> {
    const provider = await this.getProvider();
    const web3 = provider.getWeb3();

    return getPastEvents({
      fromBlock: startBlock,
      toBlock: latestBlockNumber,
      blockchain: isMainnet ? 'avalanche' : 'avalanche_fuji',
      contract,
      web3,
      eventName,
      filter,
      apiUrl: this.apiUrl,
    });
  }

  /**
   * Internal function to get past events, using the defined range.
   *
   * @private
   * @param {IGetPastEvents}
   * @returns {Promise<EventData[]>}
   */
  private async getPastEventsBlockchain({
    contract,
    eventName,
    latestBlockNumber,
    startBlock,
    filter,
    rangeStep,
  }: IGetPastEvents): Promise<EventData[]> {
    return flatten(
      await batchEvents({
        contract,
        eventName,
        rangeStep,
        startBlock,
        filter,
        latestBlockNumber,
      }),
    );
  }

  /**
   * Internal function to choose the right provider for read or write purpose.
   *
   * @private
   * @param {boolean} [isForceRead = false] - forces to use read provider
   * @returns {Promise<Web3KeyWriteProvider | Web3KeyReadProvider>}
   */
  private async getProvider(
    isForceRead = false,
  ): Promise<Web3KeyWriteProvider | Web3KeyReadProvider> {
    if (isForceRead) {
      return this.readProvider;
    }

    const isAvalancheChain = await this.isAvalancheNetwork(this.writeProvider);

    if (isAvalancheChain && !this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    if (isAvalancheChain) {
      return this.writeProvider;
    }

    return this.readProvider;
  }

  /**
   * Internal function to return transaction history group from events.
   *
   * @private
   * @param {EventData[]} [rawEvents] - events
   * @returns {Promise<ITxHistoryItem[]>}
   */
  private async getTxEventsHistoryGroup(
    rawEvents?: EventData[],
  ): Promise<ITxHistoryItem[]> {
    if (!Array.isArray(rawEvents) || !rawEvents.length) {
      return [];
    }

    const provider = await this.getProvider();
    const web3 = provider.getWeb3();
    const blockNumbers = rawEvents.map(event => event.blockNumber);

    const blocks = await this.getBlocks(web3, blockNumbers);

    const rawData = blocks.map<ITxHistoryEventData>((block, index) => ({
      ...rawEvents[index],
      timestamp: +block.timestamp,
    }));

    return rawData
      .sort((a, b) => b.timestamp - a.timestamp)
      .map<ITxHistoryItem>(
        ({
          event,
          returnValues = { amount: '0' },
          timestamp,
          transactionHash,
        }) => ({
          txAmount: this.convertFromWei(returnValues.amount),
          txDate: new Date(timestamp * 1_000),
          txHash: transactionHash,
          txType: this.getTxType(event),
          isBond: returnValues.isRebasing,
        }),
      );
  }

  /**
   * Internal function to map event type to transaction type.
   *
   * @private
   * @param {string} [rawTxType] - transaction type
   * @returns {string | null}
   */
  private getTxType(rawTxType?: string): string | null {
    switch (rawTxType) {
      case EAvalanchePoolEvents.StakePending:
        return EAvalanchePoolEventsMap.StakePending;

      case EAvalanchePoolEvents.AvaxClaimPending:
        return EAvalanchePoolEventsMap.AvaxClaimPending;

      default:
        return null;
    }
  }

  /**
   * Internal function to check the current network.
   *
   * @private
   * @param {Web3KeyWriteProvider} provider - current selected provider
   * @returns {Promise<boolean>}
   */
  private async isAvalancheNetwork(
    provider: Web3KeyWriteProvider,
  ): Promise<boolean> {
    const web3 = provider.getWeb3();
    const chainId = await web3.eth.getChainId();

    return [
      EEthereumNetworkId.avalanche,
      EEthereumNetworkId.avalancheTestnet,
    ].includes(chainId);
  }

  /**
   * Initialization method for SDK.
   *
   * Auto-connects writeProvider if chains are the same.
   * Initializes readProvider to support multiple chains.
   *
   * @public
   * @static
   * @param {IAvalancheSDKArgs} [args] - user-defined providers and advanced API url.
   * @returns {Promise<AvalancheSDK>}
   */
  public static async getInstance(
    args?: Partial<IAvalancheSDKArgs>,
  ): Promise<AvalancheSDK> {
    const providerManager = ProviderManagerSingleton.getInstance();
    const [writeProvider, readProvider] = await Promise.all([
      args?.writeProvider ?? providerManager.getETHWriteProvider(),
      args?.readProvider ??
        providerManager.getETHReadProvider(AVALANCHE_READ_PROVIDER_ID),
    ]);

    const isAddrActual =
      AvalancheSDK.instance?.currentAccount === writeProvider.currentAccount;

    const isSameWriteProvider =
      AvalancheSDK.instance?.writeProvider === writeProvider;

    const isSameReadProvider = getIsSameReadProvider(
      AvalancheSDK.instance?.readProvider,
      readProvider,
    );

    const isInstanceActual =
      isAddrActual && isSameWriteProvider && isSameReadProvider;

    if (AvalancheSDK.instance && isInstanceActual) {
      return AvalancheSDK.instance;
    }

    if (readProvider === undefined) {
      throw new Error('Read provider not defined');
    }

    const instance = new AvalancheSDK({
      writeProvider,
      readProvider,
      apiUrl: args?.apiUrl,
    });
    const isAvalancheChain = await instance.isAvalancheNetwork(writeProvider);

    if (isAvalancheChain && !writeProvider.isConnected()) {
      await writeProvider.connect();
    }

    return instance;
  }

  /**
   * Add token to wallet.
   *
   * @public
   * @note Initiates connect if writeProvider isn't connected.
   * @param {string} token - token symbol (aAVAXb or aAVAXc)
   * @returns {Promise<boolean>}
   */
  public async addTokenToWallet(token: string): Promise<boolean> {
    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    const { avalancheConfig } = configFromEnv();

    const aAVAXbTokenContract = await this.getAAVAXBTokenContract();
    const aAVAXcTokenContract = await this.getAAVAXCTokenContract();
    const contract =
      token === 'aAVAXb' ? aAVAXbTokenContract : aAVAXcTokenContract;

    const [symbol, rawDecimals]: [string, string] = await Promise.all([
      contract.methods.symbol().call(),
      contract.methods.decimals().call(),
    ]);

    const decimals = Number.parseInt(rawDecimals, 10);

    return this.writeProvider.addTokenToWallet({
      address:
        token === 'aAVAXb' ? avalancheConfig.aAVAXb : avalancheConfig.aAVAXc,
      symbol,
      decimals,
      chainId: isMainnet
        ? EEthereumNetworkId.avalanche
        : EEthereumNetworkId.avalancheTestnet,
    });
  }

  /**
   * Return aAVAXb token balance.
   *
   * @public
   * @returns {Promise<BigNumber>} - human readable balance
   */
  public async getABBalance(): Promise<BigNumber> {
    const aAVAXbTokenContract = await this.getAAVAXBTokenContract(true);

    const balance = await aAVAXbTokenContract.methods
      .balanceOf(this.currentAccount)
      .call();

    return this.convertFromWei(balance);
  }

  /**
   * Return aAVAXc token balance.
   *
   * @public
   * @returns {Promise<BigNumber>} - human readable balance
   */
  public async getACBalance(): Promise<BigNumber> {
    const aAVAXcTokenContract = await this.getAAVAXCTokenContract(true);

    const balance = await aAVAXcTokenContract.methods
      .balanceOf(this.currentAccount)
      .call();

    return this.convertFromWei(balance);
  }

  /**
   * Return aAVAXc/AVAX ratio.
   *
   * @public
   * @note [Read about aAVAXc/AVAX ratio](https://www.ankr.com/docs/staking/liquid-staking/avax/staking-mechanics/#exchange-ratio).
   * @returns {Promise<BigNumber>} - human readable ratio
   */
  public async getACRatio(): Promise<BigNumber> {
    const aAVAXcTokenContract = await this.getAAVAXCTokenContract(true);
    const rawRatio = await aAVAXcTokenContract.methods.ratio().call();

    return this.convertFromWei(rawRatio);
  }

  /**
   * Checks if allowance is greater or equal to amount.
   *
   * @public
   * @note Allowance is the amount which spender is still allowed to withdraw from owner.
   * @param {string} [spender] - spender address (by default it is aAVAXb token address)
   * @returns {Promise<BigNumber>} - allowance in wei
   */
  public async getACAllowance(spender?: string): Promise<BigNumber> {
    const aAVAXcTokenContract = await this.getAAVAXCTokenContract(true);
    const { avalancheConfig } = configFromEnv();

    const allowance = await aAVAXcTokenContract.methods
      .allowance(this.currentAccount, spender || avalancheConfig.aAVAXb)
      .call();

    return new BigNumber(allowance);
  }

  /**
   * Fetch transaction data.
   *
   * @public
   * @note Parses first uint256 param from transaction input.
   * @param {string} txHash - transaction hash.
   * @returns {Promise<IFetchTxData>}
   */
  public async fetchTxData(txHash: string): Promise<IFetchTxData> {
    const provider = await this.getProvider(true);

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

  /**
   * Fetch transaction receipt.
   *
   * @public
   * @param {string} txHash - transaction hash.
   * @returns {Promise<TransactionReceipt | null>}
   */
  public async fetchTxReceipt(
    txHash: string,
  ): Promise<TransactionReceipt | null> {
    const provider = await this.getProvider(true);
    const web3 = provider.getWeb3();

    const receipt = await web3.eth.getTransactionReceipt(txHash);

    return receipt as TransactionReceipt | null;
  }

  /**
   * Approve aAVAXc for aAVAXb, i.e. allow aAVAXb smart contract to access and transfer aAVAXc tokens.
   *
   * @public
   * @note Initiates connect if writeProvider isn't connected.
   * @note [Read about Ankr Liquid Staking token types](https://www.ankr.com/docs/staking/liquid-staking/overview#types-of-liquid-staking-tokens).
   * @param {BigNumber} [amount] - amount to approve (by default it's MAX_UINT256)
   * @param {number} [scale = 1] - scale factor for amount
   * @returns {Promise<IWeb3SendResult | undefined>}
   */
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

    const { avalancheConfig } = configFromEnv();

    const aAVAXcTokenContract = await this.getAAVAXCTokenContract();

    const data = aAVAXcTokenContract.methods
      .approve(avalancheConfig.aAVAXb, hexAmount)
      .encodeABI();

    return this.writeProvider.sendTransactionAsync(
      this.currentAccount,
      avalancheConfig.aAVAXc,
      { data, estimate: true },
    );
  }

  /**
   * Checks if allowance is greater or equal to amount.
   *
   * @public
   * @note Allowance is the amount which spender is still allowed to withdraw from owner.
   * @param {string} [hexAmount] - amount in HEX
   * @returns {Promise<boolean>} - true if amount doesn't exceed allowance, false - otherwise.
   */
  public async checkAllowance(hexAmount: string): Promise<boolean> {
    const allowance = await this.getACAllowance();

    return allowance.isGreaterThanOrEqualTo(hexAmount);
  }

  /**
   * Switch aAVAXc to aAVAXb.
   *
   * @public
   * @note Initiates connect if writeProvider isn't connected.
   * @note [Read about Ankr Liquid Staking token types](https://www.ankr.com/docs/staking/liquid-staking/overview#types-of-liquid-staking-tokens).
   * @param {IShareArgs} args - object with amount to switch and scale
   * @returns {Promise<IWeb3SendResult>}
   */
  public async lockShares({ amount }: IShareArgs): Promise<IWeb3SendResult> {
    if (amount.isLessThanOrEqualTo(ZERO)) {
      throw new Error(EAvalancheErrorCodes.ZERO_AMOUNT);
    }

    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    const aAVAXbTokenContract = await this.getAAVAXBTokenContract();
    const { avalancheConfig } = configFromEnv();

    const data = aAVAXbTokenContract.methods
      .lockShares(convertNumberToHex(amount, ETH_SCALE_FACTOR))
      .encodeABI();

    return this.writeProvider.sendTransactionAsync(
      this.currentAccount,
      avalancheConfig.aAVAXb,
      { data, estimate: true },
    );
  }

  /**
   * Switch aAVAXb to aAVAXc.
   *
   * @public
   * @note Initiates connect if writeProvider isn't connected.
   * @note [Read about Ankr Liquid Staking token types](https://www.ankr.com/docs/staking/liquid-staking/overview#types-of-liquid-staking-tokens).
   * @param {IShareArgs} args - object with amount to switch and scale
   * @returns {Promise<IWeb3SendResult>}
   */
  public async unlockShares({ amount }: IShareArgs): Promise<IWeb3SendResult> {
    if (amount.isLessThanOrEqualTo(ZERO)) {
      throw new Error(EAvalancheErrorCodes.ZERO_AMOUNT);
    }

    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    const aAVAXbTokenContract = await this.getAAVAXBTokenContract();
    const { avalancheConfig } = configFromEnv();

    const data = aAVAXbTokenContract.methods
      .unlockShares(convertNumberToHex(amount, ETH_SCALE_FACTOR))
      .encodeABI();

    return this.writeProvider.sendTransactionAsync(
      this.currentAccount,
      avalancheConfig.aAVAXb,
      { data, estimate: true },
    );
  }

  /**
   * Return AVAX balance.
   *
   * @public
   * @returns {Promise<BigNumber>} - human-readable balance
   */
  public async getAVAXBalance(): Promise<BigNumber> {
    const provider = await this.getProvider(true);
    const web3 = provider.getWeb3();
    const currBalance = await web3.eth.getBalance(this.currentAccount);

    return this.readProvider.getFormattedBalance(currBalance, AVAX_DECIMALS);
  }

  /**
   * Get minimum stake amount.
   *
   * @public
   * @returns {Promise<BigNumber>}
   */
  public async getMinimumStake(): Promise<BigNumber> {
    const avalanchePoolContract = await this.getAvalanchePoolContract(true);

    const minStake = await avalanchePoolContract.methods
      .getMinimumStake()
      .call();

    return this.convertFromWei(minStake);
  }

  /**
   * Internal function to return raw pool events.
   *
   * @private
   * @note Currently returns raw pool events for block range.
   * @param {number} from - from block
   * @param {number} to - to block
   * @returns {Promise<IEventsBatch>}
   */
  private async getPoolEventsBatch(
    from: number,
    to: number,
  ): Promise<IEventsBatch> {
    const avalanchePoolContract = await this.getAvalanchePoolContract(true);

    const [stakeRawEvents, unstakeRawEvents, ratio] = await Promise.all([
      this.getPastEvents({
        provider: this.readProvider,
        contract: avalanchePoolContract,
        eventName: EAvalanchePoolEvents.StakePending,
        filter: { staker: this.currentAccount },
        startBlock: from,
        latestBlockNumber: to,
        rangeStep: AVAX_MAX_BLOCK_RANGE,
      }),
      this.getPastEvents({
        provider: this.readProvider,
        contract: avalanchePoolContract,
        eventName: EAvalanchePoolEvents.AvaxClaimPending,
        filter: { claimer: this.currentAccount },
        startBlock: from,
        latestBlockNumber: to,
        rangeStep: AVAX_MAX_BLOCK_RANGE,
      }),
      this.getACRatio(),
    ]);

    return {
      rebasingEvents: [],
      stakeRawEvents,
      unstakeRawEvents,
      ratio,
    };
  }

  /**
   * Get total pending unstake amount.
   *
   * @public
   * @returns {Promise<BigNumber>}
   */
  public async getPendingClaim(): Promise<BigNumber> {
    const avalanchePoolContract = await this.getAvalanchePoolContract(true);

    const pending = await avalanchePoolContract.methods
      .pendingAvaxClaimsOf(this.currentAccount)
      .call();

    return this.convertFromWei(pending);
  }

  /**
   * Get pending data for aAVAXb and aAVAXc.
   *
   * @public
   * @note [Read about Ankr Liquid Staking token types](https://www.ankr.com/docs/staking/liquid-staking/overview#types-of-liquid-staking-tokens).
   * @returns {Promise<IPendingData>}
   */
  public async getPendingData(): Promise<IPendingData> {
    const provider = await this.getProvider(true);
    const web3 = provider.getWeb3();
    const latestBlockNumber = await web3.eth.getBlockNumber();

    const { unstakeRawEvents, ratio } = await this.getPoolEventsBatch(
      latestBlockNumber - AVAX_HISTORY_2_WEEKS_OFFSET,
      latestBlockNumber,
    );
    let totalUnstakingValue = await this.getPendingClaim();

    let pendingBond: BigNumber = ZERO;
    let pendingCertificate: BigNumber = ZERO;

    if (totalUnstakingValue.isGreaterThan(ZERO)) {
      const unstakePendingReverse: EventData[] = unstakeRawEvents.reverse();

      for (
        let i = 0;
        i < unstakePendingReverse.length && !totalUnstakingValue.isZero();
        i += 1
      ) {
        const unstakeEventItem = unstakePendingReverse[i];

        const itemAmount = this.convertFromWei(
          unstakeEventItem.returnValues.amount,
        );

        totalUnstakingValue = totalUnstakingValue.minus(itemAmount);

        if (unstakeEventItem.returnValues.isRebasing) {
          pendingBond = pendingBond.plus(itemAmount);
        } else {
          pendingCertificate = pendingCertificate.plus(
            itemAmount.multipliedBy(ratio),
          );
        }
      }
    }

    return {
      pendingBond,
      pendingCertificate,
    };
  }

  /**
   * Get transaction history.
   *
   * @public
   * @deprecated Use `getFullTxHistory` instead. This method will be removed.
   * @note Currently returns data for the last 26 days.
   * @returns {Promise<ITxEventsHistoryData>}
   */
  public async getTxEventsHistory(): Promise<ITxEventsHistoryData> {
    const provider = await this.getProvider();
    const web3 = provider.getWeb3();
    const latestBlockNumber = await web3.eth.getBlockNumber();

    return this.getTxEventsHistoryRange(
      latestBlockNumber - AVAX_HISTORY_2_WEEKS_OFFSET,
      latestBlockNumber,
    );
  }

  /**
   * Get transaction history.
   *
   * @public
   * @deprecated Use `getTxHistoryRange` instead. This method will be removed.
   * @note Currently returns data for block range.
   * @param {number} from - from block
   * @param {number} to - to block
   * @returns {Promise<ITxEventsHistoryData>}
   */
  public async getTxEventsHistoryRange(
    from: number,
    to: number,
  ): Promise<ITxEventsHistoryData> {
    const { stakeRawEvents, unstakeRawEvents, ratio } =
      await this.getPoolEventsBatch(from, to);

    let totalPendingUnstakes = await this.getPendingClaim();
    let completedRawEvents: EventData[] = [];
    let pendingRawEvents: EventData[] = [];

    if (totalPendingUnstakes.isGreaterThan(0)) {
      const unstakeRawEventsReverse = unstakeRawEvents.reverse();

      for (
        let i = 0;
        i < unstakeRawEventsReverse.length && !totalPendingUnstakes.isZero();
        i += 1
      ) {
        const unstakeRawEventItem = unstakeRawEventsReverse[i];

        const itemAmount = this.convertFromWei(
          unstakeRawEventItem.returnValues.amount,
        );

        totalPendingUnstakes = totalPendingUnstakes.minus(itemAmount);

        pendingRawEvents = [...pendingRawEvents, unstakeRawEventItem];
      }

      completedRawEvents = [
        ...stakeRawEvents,
        ...unstakeRawEventsReverse.slice(pendingRawEvents.length),
      ];
    } else {
      completedRawEvents = [...stakeRawEvents, ...unstakeRawEvents];
    }

    const {
      bondEvents: completedAAVAXBEvents,
      certEvents: completedAAVAXCEvents,
    } = getFilteredContractEvents(completedRawEvents);

    const { bondEvents: pendingAAVAXBEvents, certEvents: pendingAAVAXCEvents } =
      getFilteredContractEvents(pendingRawEvents);

    const [
      stakeAndUnstakeBondEvents,
      stakeAndUnstakeCertEvents,
      pendingBond,
      pendingCertificate,
    ] = await Promise.all([
      this.getTxEventsHistoryGroup(completedAAVAXBEvents),
      this.getTxEventsHistoryGroup(completedAAVAXCEvents),
      this.getTxEventsHistoryGroup(pendingAAVAXBEvents),
      this.getTxEventsHistoryGroup(pendingAAVAXCEvents),
    ]);

    const eventType = {
      stake: 0,
      unstake: 1,
    } as const;

    const [stakeBondEvents, unstakeBondEvents] =
      stakeAndUnstakeBondEvents.reduce<ITxHistoryItem[][]>(
        (result, event) => {
          const isStakeEvent =
            event.txType === EAvalanchePoolEventsMap.StakePending;

          if (isStakeEvent) {
            result[eventType.stake].push(event);
          } else {
            result[eventType.unstake].push(event);
          }

          return result;
        },
        [[], []],
      );

    const [stakeCertEvents, unstakeCertEvents] =
      stakeAndUnstakeCertEvents.reduce<ITxHistoryItem[][]>(
        (result, event) => {
          const isStakeEvent =
            event.txType === EAvalanchePoolEventsMap.StakePending;

          const txAmount = event.txAmount.multipliedBy(ratio);

          if (isStakeEvent) {
            result[eventType.stake].push({
              ...event,
              txAmount,
            });
          } else {
            result[eventType.unstake].push({
              ...event,
              txAmount,
            });
          }

          return result;
        },
        [[], []],
      );

    return {
      completedBond: stakeBondEvents,
      completedCertificate: stakeCertEvents,
      pendingBond,
      pendingCertificate: pendingCertificate.map(x => ({
        ...x,
        txAmount: x.txAmount.multipliedBy(ratio),
      })),
      unstakeBond: unstakeBondEvents,
      unstakeCertificate: unstakeCertEvents,
    };
  }

  /**
   * Get transaction history for all period that starts from contract creation.
   *
   * @note Amount of certificate event is in AVAX. If you need ankrAVAX, multiply by ratio.
   * Pending status is not specified.
   *
   * @public
   * @return  {Promise<ITxHistory>} full transaction history.
   */
  public async getFullTxHistory(): Promise<ITxHistory> {
    const latestBlockNumber = await this.getLatestBlock();

    const { stakeHistory, unstakeHistory } = await this.getTxHistoryRange(
      AVAX_POOL_START_BLOCK,
      latestBlockNumber,
    );

    return {
      stakeHistory,
      unstakeHistory,
    };
  }

  /**
   * Get transaction history for block range.
   *
   * @note Amount of each event is in AVAX. If you need ankrAVAX, multiply by ratio.
   * Pending status is not specified.
   *
   * @param {number} from - from block number
   * @param {number} to - to block number
   * @returns {Promise<ITxHistory>} - transaction history
   */
  public async getTxHistoryRange(
    from: number,
    to: number,
  ): Promise<ITxHistory> {
    const avalanchePoolContract = await this.getAvalanchePoolContract(true);

    const getStakePastEventsArgs: IGetPastEvents = {
      latestBlockNumber: to,
      startBlock: from,
      contract: avalanchePoolContract,
      eventName: EAvalanchePoolEvents.StakePending,
      filter: { staker: this.currentAccount },
      provider: this.readProvider,
      rangeStep: AVAX_MAX_BLOCK_RANGE,
    };

    const [stakeRawEvents, unstakeRawEvents] = await Promise.all([
      this.getPastEvents(getStakePastEventsArgs),
      this.getPastEvents({
        ...getStakePastEventsArgs,
        eventName: EAvalanchePoolEvents.AvaxClaimPending,
      }),
    ]);

    const [stakeHistory, unstakeHistory] = await Promise.all([
      this.getTxEventsHistoryGroup(stakeRawEvents),
      this.getTxEventsHistoryGroup(unstakeRawEvents),
    ]);

    return {
      stakeHistory,
      unstakeHistory,
    };
  }

  /**
   * Get latest block number.
   *
   * @returns {Promise<number>}
   */
  public async getLatestBlock(): Promise<number> {
    const provider = await this.getProvider(true);
    const web3 = provider.getWeb3();

    return web3.eth.getBlockNumber();
  }

  /**
   * Internal function to return stake method by token symbol.
   *
   * @param {string} token - token symbol (aAVAXb or aAVAXc)
   * @private
   * @returns {string}
   */
  private getStakeMethodName(token: string): string {
    switch (token) {
      case 'aAVAXc':
        return 'stakeAndClaimCerts';

      default:
        return 'stakeAndClaimBonds';
    }
  }

  /**
   * Stake token.
   *
   * @public
   * @note Initiates two transactions and connect if writeProvider isn't connected.
   * @note Estimates gas and multiplies it by `GAS_FEE_MULTIPLIER` to prevent MetaMask issue with gas calculation.
   * @note [Read about Ankr Liquid Staking token types](https://www.ankr.com/docs/staking/liquid-staking/overview#types-of-liquid-staking-tokens).
   * @param {BigNumber} amount - amount of token
   * @param {string} token - choose which token to receive (aAVAXb or aAVAXc)
   * @returns {Promise<IStakeData>}
   */
  public async stake(amount: BigNumber, token: string): Promise<IStakeData> {
    if (amount.isLessThanOrEqualTo(ZERO)) {
      throw new Error(EAvalancheErrorCodes.ZERO_AMOUNT);
    }

    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    let gasFee = this.stakeGasFee;
    if (!gasFee) {
      gasFee = await this.getStakeGasFee(amount, token);
    }

    const balance = await this.getAVAXBalance();

    // multiplication needs to avoid problems with max amount
    // and fee calculation in the wallet
    const multipliedGasFee = gasFee.multipliedBy(GAS_FEE_MULTIPLIER);
    const maxAllowedAmount = balance.minus(multipliedGasFee);

    const stakeAmount = amount.isGreaterThan(maxAllowedAmount)
      ? maxAllowedAmount
      : amount;

    const value = convertNumberToHex(stakeAmount, AVAX_SCALE_FACTOR);

    const avalanchePoolContract = await this.getAvalanchePoolContract();

    const contractStake =
      avalanchePoolContract.methods[this.getStakeMethodName(token)];

    const tx = await contractStake().send({
      from: this.currentAccount,
      value,
    });

    return { txHash: tx.transactionHash };
  }

  /**
   * Get stake gas fee.
   *
   * @public
   * @note Caches computed gas fee value for future computations.
   * @param {BigNumber} amount - amount to stake
   * @param {string} token - token symbol (aAVAXb or aAVAXc)
   * @returns {Promise<BigNumber>}
   */
  public async getStakeGasFee(
    amount: BigNumber,
    token: string,
  ): Promise<BigNumber> {
    const provider = await this.getProvider(true);
    const avalanchePoolContract = await this.getAvalanchePoolContract(true);

    const contractStake =
      avalanchePoolContract.methods[this.getStakeMethodName(token)];

    const estimatedGas: number = await contractStake().estimateGas({
      from: this.currentAccount,
      value: convertNumberToHex(amount, AVAX_SCALE_FACTOR),
    });

    const increasedGasLimit = AvalancheSDK.getIncreasedGasLimit(estimatedGas);

    const stakeGasFee = await provider.getContractMethodFee(increasedGasLimit);

    this.stakeGasFee = stakeGasFee;

    return stakeGasFee;
  }

  /**
   * Internal function to return increased gas limit.
   *
   * @param {number} gasLimit - initial gas limit
   * @private
   * @static
   * @returns {number}
   */
  private static getIncreasedGasLimit(gasLimit: number): number {
    return Math.round(gasLimit * AVAX_ESTIMATE_GAS_MULTIPLIER);
  }

  /**
   * Internal function to return unstake method by token symbol.
   *
   * @private
   * @param {string} token - token symbol (aAVAXb or aAVAXc)
   * @private
   * @returns {string}
   */
  private getUnstakeMethodName(token: string): string {
    switch (token) {
      case 'aAVAXc':
        return 'claimCerts';

      default:
        return 'claimBonds';
    }
  }

  /**
   * Unstake token.
   *
   * @public
   * @note Initiates connect if writeProvider isn't connected.
   * @note [Read about Ankr Liquid Staking token types](https://www.ankr.com/docs/staking/liquid-staking/overview#types-of-liquid-staking-tokens).
   * @param {BigNumber} amount - amount to unstake
   * @param {string} token - choose which token to unstake (aAVAXb or aAVAXc)
   * @returns {Promise<IWeb3SendResult>}
   */
  public async unstake(
    amount: BigNumber,
    token: string,
  ): Promise<IWeb3SendResult> {
    const { avalancheConfig } = configFromEnv();

    if (amount.isLessThanOrEqualTo(ZERO)) {
      throw new Error(EAvalancheErrorCodes.ZERO_AMOUNT);
    }

    if (!this.writeProvider.isConnected()) {
      await this.writeProvider.connect();
    }

    const avalanchePoolContract = await this.getAvalanchePoolContract();
    const value = this.convertToHex(amount);

    const contractUnstake =
      avalanchePoolContract.methods[this.getUnstakeMethodName(token)];

    const txn = contractUnstake(value);

    const gasLimit: number = await txn.estimateGas({
      from: this.currentAccount,
    });

    return this.writeProvider.sendTransactionAsync(
      this.currentAccount,
      avalancheConfig.avalanchePool,
      {
        data: txn.encodeABI(),
        estimate: true,
        gasLimit: AvalancheSDK.getIncreasedGasLimit(gasLimit).toString(),
      },
    );
  }
}
