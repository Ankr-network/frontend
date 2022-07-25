import {
  IAggregatedPaymentHistoryReponse,
  IAggregatedPaymentHistoryRequest,
  IBalance,
  IDailyChargingParams,
  IDailyChargingReponse,
  IPaymentHistoryReponse,
  IPaymentHistoryRequest,
  IRequestsRequest,
  IRequestsResponse,
  IWithdrawalStatusResponse,
  PrivateStats,
  PrivateStatsInterval,
} from './types';

export interface IAccountGateway {
  addToken(token: string): void;

  removeToken(): void;

  getAnkrBalance(): Promise<IBalance>;

  getRequests(params: IRequestsRequest): Promise<IRequestsResponse>;

  getDailyCharging(
    params: IDailyChargingParams,
  ): Promise<IDailyChargingReponse>;

  getPaymentHistory(
    params: IPaymentHistoryRequest,
  ): Promise<IPaymentHistoryReponse>;

  getAggregatedPaymentHistory(
    params: IAggregatedPaymentHistoryRequest,
  ): Promise<IAggregatedPaymentHistoryReponse>;

  getBalanceEndTime(blockchains?: string[]): Promise<number>;

  getPrivateStats(intervalType: PrivateStatsInterval): Promise<PrivateStats>;
  
  getWithdrawalStatus(
    transactionHash: string,
  ): Promise<IWithdrawalStatusResponse>;
}
