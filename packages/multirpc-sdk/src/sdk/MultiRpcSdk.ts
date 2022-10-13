import { IWeb3SendResult, Web3KeyWriteProvider } from 'common';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-core';
import { EventData } from 'web3-eth-contract';
import { bytesToHex } from 'web3-utils';

import {
  AccountGateway,
  IAccountGateway,
  IAggregatedPaymentHistoryRequest,
  IAggregatedPaymentHistoryResponse,
  IBalance,
  IDailyChargingParams,
  IDailyChargingResponse,
  IPaymentHistoryRequest,
  IPaymentHistoryResponse,
  IWithdrawalStatusResponse,
  PrivateStats,
  PrivateStatsInterval,
} from '../account';
import {
  BackofficeGateway,
  IBackofficeGateway,
  IBlockchainEntity,
} from '../backoffice';
import {
  Base64,
  IConfig,
  IJwtToken,
  PrefixedHex,
  UUID,
  Web3Address,
} from '../common';
import { ConsensusGateway, IConsensusGateway } from '../consensus';
import { IPAYGContractManager, PAYGContractManager } from '../PAYGContract';
import {
  IPremiumPlanContractManager,
  PremiumPlanContractManager,
} from '../PremiumPlanContract';
import { IPublicGateway, PublicGateway } from '../public';
import { RpcGateway } from '../rpc/RpcGateway';
import {
  IPrivateEndpoint,
  IProvider,
  IWorkerEndpoint,
  IWorkerGateway,
  RestrictedDomains,
  RestrictedIps,
  WorkerGateway,
} from '../worker';
import { IMultiRpcSdk } from './interfaces';
import { FetchBlockchainUrlsResult, IIssueJwtTokenResult } from './types';
import {
  catchSignError,
  formatPrivateUrls,
  getFirstActiveToken,
} from './utils';

export class MultiRpcSdk implements IMultiRpcSdk {
  private premiumPlanContractManager?: IPremiumPlanContractManager;

  private PAYGContractManager?: IPAYGContractManager;

  private workerGateway?: IWorkerGateway;

  private consensusGateway?: IConsensusGateway;

  private rpcGateway?: RpcGateway;

  private accountGateway?: IAccountGateway;

  private backofficeGateway?: IBackofficeGateway;

  private publicGateway?: IPublicGateway;

  public constructor(
    private readonly keyProvider: Web3KeyWriteProvider,
    private readonly config: IConfig,
  ) {}

  getKeyProvider() {
    return this.keyProvider;
  }

  async loginWithIssuedToken(user: Web3Address) {
    const jwtTokensResponse = await this.getConsensusGateway().getJwtTokens(
      user,
    );

    if (!jwtTokensResponse || jwtTokensResponse?.[0].length === 0) {
      return false;
    }

    const firstActiveToken = getFirstActiveToken(jwtTokensResponse);

    if (!firstActiveToken) {
      return false;
    }

    const updatedJwtToken = await this.importJwtToken(firstActiveToken);

    return updatedJwtToken;
  }

  async loginAsUser(
    user: Web3Address,
    encryptionKey: Base64,
  ): Promise<IJwtToken | false> {
    const issuedToken = await this.loginWithIssuedToken(user);

    if (issuedToken) {
      return issuedToken;
    }

    const premiumToken = await this.loginAsPremium(user, encryptionKey);

    if (premiumToken) {
      return premiumToken;
    }

    const PAYGTransactionHash =
      await this.getPAYGContractManager().getLatestUserTierAssignedEventLogHash(
        user,
      );

    if (PAYGTransactionHash === false) {
      return false;
    }

    const [thresholdKeys] = await this.getConsensusGateway().getThresholdKeys(
      0,
      1,
      {
        name: 'MultiRPC',
      },
    );

    if (!thresholdKeys.length) throw new Error(`There is no threshold keys`);

    const token = await this.issueJwtToken(
      PAYGTransactionHash,
      thresholdKeys[0].id,
      encryptionKey,
    );

    return token;
  }

  async loginAsPremium(user: Web3Address, encryptionKey: Base64) {
    const transactionHash =
      await this.getPremiumPlanContractManager().getLatestUserEventLogHash(
        user,
      );

    if (transactionHash === false) {
      return false;
    }

    const [thresholdKeys] = await this.getConsensusGateway().getThresholdKeys(
      0,
      1,
      {
        name: 'MultiRPC',
      },
    );

    if (!thresholdKeys.length) return false;

    // send issue request to ankr protocol
    const jwtToken = await this.getConsensusGateway().requestJwtToken({
      public_key: encryptionKey,
      threshold_key: thresholdKeys[0].id,
      transaction_hash: transactionHash,
    });

    const expiresAt = Number(jwtToken.expires_at) * 1000000;

    if (expiresAt < Date.now()) {
      return false;
    }

    const updatedJwtToken = await this.importJwtToken(jwtToken);

    return updatedJwtToken;
  }

  async formatPrivateChains(
    blockchains: IBlockchainEntity[],
    jwtToken: IJwtToken,
  ): Promise<FetchBlockchainUrlsResult> {
    return formatPrivateUrls(blockchains, this.config, jwtToken.endpoint_token);
  }

  async depositAnkrToPAYG(
    amount: BigNumber | BigNumber.Value,
    publicKey: string,
  ): Promise<IWeb3SendResult> {
    return this.getPAYGContractManager().depositAnkr(
      new BigNumber(amount),
      publicKey,
    );
  }

  async sendAllowanceForPAYG(
    amount: BigNumber | BigNumber.Value,
  ): Promise<IWeb3SendResult> {
    return this.getPAYGContractManager().getAllowance(new BigNumber(amount));
  }

  async rejectAllowanceForPAYG(): Promise<IWeb3SendResult> {
    return this.getPAYGContractManager().rejectAllowance();
  }

  async hasAllowanceForPAYG(
    amount: BigNumber | BigNumber.Value,
  ): Promise<boolean> {
    return this.getPAYGContractManager().hasEnoughAllowance(
      new BigNumber(amount),
    );
  }

  // Will return null for pending transactions and an object if the transaction is successful.
  async getTransactionReceipt(
    transactionHash: PrefixedHex,
  ): Promise<TransactionReceipt> {
    const transactionReceipt = await this.keyProvider
      .getWeb3()
      .eth.getTransactionReceipt(transactionHash);

    return transactionReceipt;
  }

  async withdrawAnkr(
    amount: BigNumber | BigNumber.Value,
  ): Promise<IWeb3SendResult> {
    return this.getPAYGContractManager().withdrawAnkr(new BigNumber(amount));
  }

  async getLastLockedFundsEvent(
    user: Web3Address,
  ): Promise<EventData | undefined> {
    const events =
      await this.getPAYGContractManager().getLatestLockedFundsEvents(user);

    return events?.[events.length - 1];
  }

  async getLastProviderRequestEvent(
    user: Web3Address,
  ): Promise<EventData | undefined> {
    const events =
      await this.getPAYGContractManager().getLatestProviderRequestEvents(user);

    if (!events?.length) return undefined;

    return events[events.length - 1];
  }

  async getLatestAllowanceEvent(
    user: Web3Address,
  ): Promise<EventData | undefined> {
    const events = await this.getPAYGContractManager().getLatestAllowanceEvents(
      user,
    );

    if (!events?.length) return undefined;

    return events[events.length - 1];
  }

  async canIssueJwtToken(
    transactionHash: PrefixedHex,
  ): Promise<IIssueJwtTokenResult> {
    const latestKnownBlockNumber = await this.keyProvider
      .getWeb3()
      .eth.getBlockNumber();

    const transactionReceipt = await this.getTransactionReceipt(
      transactionHash,
    );

    if (!transactionReceipt) {
      return {
        remainingBlocks: this.config.confirmationBlocks,
        isReady: false,
      };
    }

    const passedBlocks =
      latestKnownBlockNumber - transactionReceipt?.blockNumber;

    if (passedBlocks < this.config.confirmationBlocks) {
      return {
        remainingBlocks: this.config.confirmationBlocks - passedBlocks,
        isReady: false,
      };
    }

    return { remainingBlocks: 0, isReady: true };
  }

  async requestUserEncryptionKey(): Promise<Base64> {
    const { currentAccount } = this.keyProvider;

    return this.getPremiumPlanContractManager().getEncryptionPublicKey(
      currentAccount,
    );
  }

  async issueJwtToken(
    transactionHash: PrefixedHex,
    thresholdKey: UUID,
    encryptionKey?: Base64,
  ): Promise<IJwtToken> {
    const { currentAccount } = this.keyProvider;

    // requests user's x25519 encryption key
    if (!encryptionKey) {
      encryptionKey =
        await this.getPremiumPlanContractManager().getEncryptionPublicKey(
          currentAccount,
        );
    }

    // send issue request to ankr protocol
    const jwtToken = await this.getConsensusGateway().requestJwtToken({
      public_key: encryptionKey,
      threshold_key: thresholdKey,
      transaction_hash: transactionHash,
    });

    const updatedJwtToken = await this.importJwtToken(jwtToken);

    return updatedJwtToken;
  }

  async importJwtToken(jwtToken: IJwtToken) {
    const metaMaskJsonData = Buffer.from(
      jwtToken.signed_token,
      'base64',
    ).toString('ascii');

    jwtToken.signed_token =
      await this.getPAYGContractManager().decryptMessageUsingPrivateKey(
        metaMaskJsonData,
      );

    try {
      const { token, tier } = await this.getWorkerGateway().importJwtToken(
        jwtToken.signed_token,
      );

      jwtToken.endpoint_token = token;
      jwtToken.tier = tier;
    } catch (error: any) {
      throw new Error('Failed to import jwt token');
    }

    return jwtToken;
  }

  /**
   * @internal for internal usage, try to avoid
   */
  getConsensusGateway(): IConsensusGateway {
    this.consensusGateway =
      this.consensusGateway ||
      new ConsensusGateway({
        baseURL: this.config.consensusUrl,
      });

    return this.consensusGateway;
  }

  getRpcGateway(): RpcGateway {
    this.rpcGateway =
      this.rpcGateway ||
      new RpcGateway({
        baseURL: this.config.publicRpcUrl,
      });

    return this.rpcGateway;
  }

  /**
   * @internal for internal usage, try to avoid
   */
  getPremiumPlanContractManager(): IPremiumPlanContractManager {
    this.premiumPlanContractManager =
      this.premiumPlanContractManager ||
      new PremiumPlanContractManager(this.keyProvider, this.config);

    return this.premiumPlanContractManager;
  }

  /**
   * @internal for internal usage, try to avoid
   */
  getPAYGContractManager(): IPAYGContractManager {
    this.PAYGContractManager =
      this.PAYGContractManager ||
      new PAYGContractManager(this.keyProvider, this.config);

    return this.PAYGContractManager;
  }

  /**
   * @internal for internal usage, try to avoid
   */
  getWorkerGateway(jwtToken?: IJwtToken): IWorkerGateway {
    this.workerGateway =
      this.workerGateway ||
      new WorkerGateway({
        baseURL: this.config.workerUrl,
      });

    if (jwtToken) {
      this.workerGateway.addJwtToken(jwtToken);
    }

    return this.workerGateway;
  }

  getPublicGateway(): IPublicGateway {
    this.publicGateway =
      this.publicGateway ||
      new PublicGateway({
        workerUrl: this.config.workerUrl,
        accountUrl: this.config.accountUrl,
      });

    return this.publicGateway;
  }

  /**
   * @internal for internal usage, try to avoid
   */
  getAccountGateway(): IAccountGateway {
    this.accountGateway =
      this.accountGateway ||
      new AccountGateway({
        baseURL: this.config.accountUrl,
      });

    return this.accountGateway;
  }

  /**
   * @internal for internal usage, try to avoid
   */
  getBackofficeGateway(): IBackofficeGateway {
    this.backofficeGateway =
      this.backofficeGateway ||
      new BackofficeGateway({
        baseURL: this.config.backofficeUrl,
      });

    return this.backofficeGateway;
  }

  async fetchProvider(jwtToken: IJwtToken): Promise<IProvider> {
    return this.getWorkerGateway(jwtToken).getProvider();
  }

  async fetchPrivateEndpoints(jwtToken: IJwtToken): Promise<IWorkerEndpoint> {
    return this.getWorkerGateway(jwtToken).getEndpoints();
  }

  async addPrivateEndpoint(
    jwtToken: IJwtToken,
    endpoint: IPrivateEndpoint,
  ): Promise<IWorkerEndpoint> {
    return this.getWorkerGateway(jwtToken).addPrivateEndpoint(endpoint);
  }

  async editPrivateEndpoint(
    jwtToken: IJwtToken,
    endpoint: IPrivateEndpoint,
  ): Promise<IWorkerEndpoint> {
    return this.getWorkerGateway(jwtToken).editPrivateEndpoint(endpoint);
  }

  async deletePrivateEndpoint(
    jwtToken: IJwtToken,
    endpointId: string,
  ): Promise<void> {
    return this.getWorkerGateway(jwtToken).deletePrivateEndpoint(endpointId);
  }

  async getChainRestrictedDomains(
    jwtToken: IJwtToken,
    chainId: string,
  ): Promise<RestrictedDomains> {
    return this.getWorkerGateway(jwtToken).getChainRestrictedDomains(chainId);
  }

  async getChainRestrictedIps(
    jwtToken: IJwtToken,
    chainId: string,
  ): Promise<RestrictedIps> {
    return this.getWorkerGateway(jwtToken).getChainRestrictedIps(chainId);
  }

  async editChainRestrictedDomains(
    jwtToken: IJwtToken,
    chainId: string,
    domains: string[],
  ): Promise<RestrictedDomains> {
    return this.getWorkerGateway(jwtToken).editChainRestrictedDomains(
      chainId,
      domains,
    );
  }

  async editChainRestrictedIps(
    jwtToken: IJwtToken,
    chainId: string,
    domains: string[],
  ): Promise<RestrictedIps> {
    return this.getWorkerGateway(jwtToken).editChainRestrictedIps(
      chainId,
      domains,
    );
  }

  async getPaymentHistory(
    params: IPaymentHistoryRequest,
  ): Promise<IPaymentHistoryResponse> {
    return this.getAccountGateway().getPaymentHistory(params);
  }

  async getAggregatedPaymentHistory(
    params: IAggregatedPaymentHistoryRequest,
  ): Promise<IAggregatedPaymentHistoryResponse> {
    return this.getAccountGateway().getAggregatedPaymentHistory(params);
  }

  async getDailyCharging(
    params: IDailyChargingParams,
  ): Promise<IDailyChargingResponse> {
    return this.getAccountGateway().getDailyCharging(params);
  }

  async getAnkrBalance(): Promise<IBalance> {
    return this.getAccountGateway().getAnkrBalance();
  }

  async sign(
    data: Buffer | string | Record<string, unknown>,
    address: string,
  ): Promise<string> {
    try {
      if (typeof data === 'object') {
        data = bytesToHex(data as any);
      }

      const token = await this.keyProvider
        .getWeb3()
        .eth.personal.sign(data, address, '');

      return token;
    } catch (error: any) {
      return catchSignError(error);
    }
  }

  async signLoginData(lifeTime: number, message: string): Promise<string> {
    const currentTime = Math.floor(new Date().getTime());
    const expiresAfter = currentTime + lifeTime;
    const data = `${message}\n${expiresAfter}`;
    const { currentAccount: address } = this.keyProvider;

    const signature = await this.sign(data, address);
    const formData = `signature=${signature}&address=${address}&expires=${expiresAfter}`;

    return Buffer.from(formData, 'utf8').toString('base64');
  }

  public async authorizeProvider(lifeTime: number): Promise<string> {
    if (!this.keyProvider) {
      throw new Error('Key provider must be connected');
    }

    const token = await this.signLoginData(lifeTime, 'Multirpc Login Message:');

    await this.getAccountGateway().addToken(token);

    return token;
  }

  public async authorizeBackoffice(lifeTime: number): Promise<string> {
    if (!this.keyProvider) {
      throw new Error('Key provider must be connected');
    }

    const token = await this.signLoginData(
      lifeTime,
      'Multirpc Backoffice Login Message:',
    );

    return token;
  }

  async getBalanceEndTime(blockchains?: string[]): Promise<number> {
    const time = await this.getAccountGateway().getBalanceEndTime(blockchains);

    return time;
  }

  async getPrivateStats(interval: PrivateStatsInterval): Promise<PrivateStats> {
    const stats = await this.getAccountGateway().getPrivateStats(interval);

    return stats;
  }

  async getWithdrawalStatus(
    transactionHash: string,
  ): Promise<IWithdrawalStatusResponse> {
    const withdrawalStatus = await this.getAccountGateway().getWithdrawalStatus(
      transactionHash,
    );

    return withdrawalStatus;
  }
}
