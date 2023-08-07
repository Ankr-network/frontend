import { Timestamp } from '@ankr.com/utils/dist';
import { Address } from '@ankr.com/provider';
import {
  EmailConfirmationStatus,
  Web3Address,
  BlockchainID,
  Timeframe,
} from '../common';

export interface IApiUserGroupParams {
  group?: Web3Address;
  totp?: string;
}

export interface AccountError {
  code: AccountErrorCode;
  message: string;
}

export enum AccountErrorCode {
  Aborted = 'aborted',
  AlreadyExists = 'already_exists',
  DatabaseError = 'database_error',
  FailedPrecondition = 'failed_precondition',
  InternalError = 'internal_error',
  InvalidArgument = 'invalid_argument',
  NotFound = 'not_found',
  NothingTodo = 'nothing_todo',
  Unavailable = 'unavailable',
  WrongFormat = 'wrong_format',
  WrongState = 'wrong_state',
  TwoFARequired = '2fa_required',
  TwoFAWrong = '2fa_wrong',
}

export interface AccountErrorResponse {
  error: AccountError;
}

export enum PermissionErrorCode {
  Permission = 'permission',
}

export interface PermissionError {
  code: PermissionErrorCode;
  message: string;
}

export interface PermissionErrorResponse {
  error: PermissionError;
}

export type IPaymentHistoryEntityType =
  | 'TRANSACTION_TYPE_UNKNOWN'
  | 'TRANSACTION_TYPE_DEPOSIT'
  | 'TRANSACTION_TYPE_DEDUCTION'
  | 'TRANSACTION_TYPE_WITHDRAW'
  | 'TRANSACTION_TYPE_BONUS'
  | 'TRANSACTION_TYPE_COMPENSATION'
  | 'TRANSACTION_TYPE_VOUCHER_TOPUP'
  | 'TRANSACTION_TYPE_VOUCHER_ADJUST'
  | 'TRANSACTION_TYPE_WITHDRAW_INIT'
  | 'TRANSACTION_TYPE_WITHDRAW_ADJUST';

export interface IPaymentHistoryEntity {
  timestamp: string;
  type: IPaymentHistoryEntityType;
  amountUsd: string;
  amountAnkr: string;
  amount: string;
  creditAnkrAmount: string;
  creditUsdAmount: string;
  creditVoucherAmount: string;
}

export interface IPaymentHistoryRequest extends IApiUserGroupParams {
  cursor?: number;
  from?: number;
  limit: number;
  order_by?: keyof IPaymentHistoryEntity;
  order?: 'asc' | 'desc';
  to?: number;
  type?: IPaymentHistoryEntityType[];
}

export interface IPaymentHistoryResponse {
  transactions?: IPaymentHistoryEntity[];
  cursor: string;
}

export interface IBalance {
  // total balance (including voucher) in credits
  balance: string;
  // total balance in ankrs
  balance_ankr: string;
  // total ankr top up in credits
  balance_credit_ankr: string;
  // total usd top up in credits
  balance_credit_usd: string;
  balance_level: BalanceLevel;
  // total balance in usd
  balance_usd: string;
  // voucher balance
  balance_voucher: string;
}

export enum BalanceLevel {
  CRITICAL = 'CRITICAL',
  GREEN = 'GREEN',
  RED = 'RED',
  TOO_LOW = 'TOO_LOW',
  // balance has never been topped up
  UNKNOWN = 'UNKNOWN',
  YELLOW = 'YELLOW',
  ZERO = 'ZERO',
}

export interface IDailyChargingParams extends IApiUserGroupParams {
  day_offset: number;
}

export type IDailyChargingResponse = string;

export interface IAggregatedPaymentHistoryRequest extends IApiUserGroupParams {
  blockchains?: string[];
  cursor?: number;
  from?: number;
  limit?: number;
  time_group: AggregatedPaymentHistoryTimeGroup;
  to?: number;
  types?: IPaymentHistoryEntityType[];
}

export enum AggregatedPaymentHistoryTimeGroup {
  DAY = 'DAY',
  HOUR = 'HOUR',
  TOTAL = 'TOTAL',
}

export interface IAggregatedPaymentHistoryResponse {
  transactions: IPaymentHistoryEntity[];
  cursor: string;
}

export interface ISubscriptionsResponse {
  items: ISubscriptionsItem[];
}

export interface ISubscriptionsItem {
  amount: string;
  currency: string;
  currentPeriodEnd: string;
  customerId: string;
  id: string;
  productId: string;
  productPriceId: string;
  recurringInterval: RecurrentInterval;
  recurringIntervalCount: string;
  status: string;
  subscriptionId: string;
  type: string;
}

export enum RecurrentInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export interface IApiCancelSubscriptionRequestParams {
  subscription_id: string;
}

type ChartDate = string;
export type PrivateStatTopRequestsData = Record<string, number | ChartDate>;

export type PrivateStatOthersInfo = {
  request_count?: number;
  type_count?: number;
  total_cost?: number;
};

export interface PrivateTotalRequestsInfo {
  count: number;
  others_info: PrivateStatOthersInfo;
  top_requests: PrivateStatTopRequests[];
  topRequests: PrivateStatTopRequests[];
  total_cost?: number;
  totalCost?: number;
}

export interface PrivatStatTopCountry {
  country: string;
  count: number;
  total_cost: number;
}

export interface PrivateStatCountriesCount {
  others_info: PrivateStatOthersInfo;
  top_countries: PrivatStatTopCountry[];
}

export interface IpDetails {
  ip: string;
  count: number;
  total_cost: number;
}

export interface PrivateStatIPsCount {
  others_info?: PrivateStatOthersInfo;
  top_ips?: IpDetails[];
}

export interface PrivateStat {
  blockchain: string;
  countries_count: PrivateStatCountriesCount;
  counts?: PrivateStatCounts;
  ips_count: PrivateStatIPsCount;
  total: PrivateTotalRequestsInfo;
  total_requests: number;
  totalRequests: number;
}

// in ms
export type PrivateStatTimestamp = string;
export type PrivateStatCounts = Record<PrivateStatTimestamp, PrivateStatCount>;
export interface PrivateStatCount {
  count: number;
  top_requests: PrivateStatTopRequests[];
  others_info: PrivateStatOthersInfo;
}

export type RPCRequestName = string;
export interface PrivateStatTopRequests {
  method: RPCRequestName;
  count: number;
  total_cost: number;
  totalCost?: string; // used in backoffice stats response
}

export interface IApiPrivateStats {
  stats?: PrivateStatsInternal;
  total_requests?: number;
}

export interface PrivateStats {
  error?: string;
  stats?: PrivateStatsInternal;
  total_requests?: number;
  totalRequests?: number;
}

export interface Top10StatsParams extends IApiUserGroupParams {
  /* backend does not support h1 and h24 interval for this endpoint */
  intervalType: PrivateStatsInterval.WEEK | PrivateStatsInterval.MONTH;
  blockchain?: string;
}

export interface Top10StatItem {
  key: string;
  value: number;
}

export interface Top10StatsResponse {
  ips: Top10StatItem[];
  countries: Top10StatItem[];
}

export type UserRequest = Record<string, number>;
export type UserRequestsResponse = Record<string, UserRequest>;

export type IApiGetUserRequestsParams = IApiUserGroupParams & {
  timeframe: Timeframe;
  userToken: string;
};

export type PrivateStatsInternal = Partial<Record<BlockchainID, PrivateStat>>;

export enum PrivateStatsInterval {
  HOUR = 'h1',
  DAY = 'h24',
  WEEK = 'd7',
  MONTH = 'd30',
}

export enum PublicStatsInterval {
  HOUR = '1h',
  DAY = '24h',
  WEEK = '7d',
  MONTH = '30d',
}

export interface IGetActiveEmailBindingResponse {
  address: string;
  email: string;
}

export interface IGetEmailBindingsResponse {
  bindings: IEmailResponse[];
}

export enum EmailErrorMessage {
  ADDRESS_PENDING_OTHER_EMAIL_BINDING = "binding with provided address and 'pending' status already exists: data exists already",
  ALREADY_CONFIRMED = 'binding with provided email already exists and confirmed: data exists already',
  CHANGE_INEXISTENT = "binding with provided address in 'pending' status not found: not found",
  CHANGE_WITH_SAME_EMAIL = 'trying to change binding with the same email: nothing todo',
  CODE_ALREADY_USED = 'confirmation code has already been used: wrong state',
  CONFIRMATION_CODE_NOT_FOUND = 'confirmation code not found: not found',
  EMAIL_BINDING_NOT_FOUND = 'not found',
  LINK_EXPIRED = 'confirmation code has already expired: wrong state',
  TOO_MANY_CHANGE_EMAIL_REQUESTS = 'sending confirmation codes too often: wrong state',
  TOO_MANY_RESEND_CONFIRMATION_REQUESTS = 'too many confirmation codes created: wrong state',
}

export interface IEmailResponseError {
  code: 'already_exists' | 'failed_precondition' | 'not_found' | string;
  message: EmailErrorMessage;
  params?: {
    resendableInMs?: number;
  };
}

export interface IEmailResponse {
  address: Web3Address;
  email: string;
  status: EmailConfirmationStatus;
  expiresAt: string;
  error?: IEmailResponseError;
}

interface ICreditThreshold {
  value: number;
}

export interface INotificationsSettings {
  deposit?: boolean;
  withdraw?: boolean;
  voucher?: boolean;
  low_balance?: boolean;
  marketing?: boolean;
  credit_info?: boolean;
  credit_warn?: boolean;
  credit_alarm?: boolean;
  credit_info_threshold?: ICreditThreshold;
  credit_warn_threshold?: ICreditThreshold;
  credit_alarm_threshold?: ICreditThreshold;
}

export interface ICanPayByCardResponse {
  isEligible: boolean;
}

export interface IGetLinkForCardPaymentRequest {
  amount: string;
  publicKey?: string;
  reason?: string;
}

export interface IGetLinkForRecurrentCardPaymentRequest {
  currency: string;
  product_price_id: string;
  public_key?: string;
}

export interface IGetLinkForCardPaymentResponse {
  url: string;
}

export interface ProductPrice {
  id: string;
  amount: string;
  currency: string;
  interval: string;
  intervalCount: string;
  type: string;
}

export interface IGetSubscriptionPricesResponse {
  productPrices: ProductPrice[];
}

export interface IGetLatestRequestsRequest {
  from_ms?: number;
  to_ms?: number;
  cursor?: number;
  group?: Web3Address;
  limit: number;
}

export interface LatestRequest {
  blockchain: string;
  premium_id: string;
  payload: string;
  ts: number;
  ip: string;
  country: string;
}

export interface StatsByRangeRequest extends IApiUserGroupParams {
  from?: Timestamp;
  to?: Timestamp;
  monthly?: boolean;
  token?: string;
}

export type StatsByRangeResponse = Record<string, number>;

export interface IGetLatestRequestsResponse {
  user_requests: LatestRequest[];
}

export interface ICheckInstantJwtParticipantResponse {
  is_participant: boolean;
}

export interface IGetOrCreateInstantJwt {
  jwt_data: string;
  is_encrypted: boolean;
}

export interface IGetGroupJwtRequestParams {
  group: Web3Address;
}

export interface IGetGroupJwtResponse {
  jwt_data: string;
}

export enum GroupUserRole {
  dev = 'GROUP_ROLE_DEV',
  finance = 'GROUP_ROLE_FINANCE',
  owner = 'GROUP_ROLE_OWNER',
}

export interface UserGroup {
  groupAddress: string;
  groupName: string;
  userRole: GroupUserRole;
}

export interface IUserGroupsResponse {
  groups: UserGroup[];
}

export interface InitTwoFAResponse {
  passcode: string;
  qr_code: string;
  issuer: string;
  account: string;
}

export enum TwoFAStatus {
  None = 'none',
  Pending = 'pending',
  Enabled = 'enabled',
}

interface TOTP {
  type: 'TOTP';
  status: TwoFAStatus;
}

export interface TwoFAStatusResponse {
  '2FAs': TOTP[];
}

export interface ConfirmTwoFARequestParams {
  totp: string;
}

export type ConfirmTwoFAResponse = Record<string, unknown>;

export type DisableTwoFAResponse = Record<string, unknown>;

export interface EmailBindingParams {
  email: string;
  totp?: string;
}

export interface TotalStatsResponse {
  blockchains_info: TotalStatsBlockchainsInfo;
}

export interface TotalStatsBlockchainsInfo {
  blockchains: TotalStatsBlockchains;
  premium_tokens: TotalStatsPremiumTokens;
  started_ms: number;
  total_cost: number;
  total_count: number;
}

export type TotalStatsBlockchains = Record<BlockchainID, TotalStatsBlockchain>;

export type UserEndpointToken = string;

export type TotalStatsPremiumTokens = Record<
  UserEndpointToken,
  TotalStatsPremiumToken
>;

export type TotalStatsPremiumToken = Omit<
  TotalStatsBlockchainsInfo,
  'premium_tokens'
>;

export interface TotalStatsBlockchain {
  total_cost: number;
  total_count: number;
}

export interface NegativeBalanceTermsOfServicesStatusParams {
  group: Web3Address;
}

export interface NegativeBalanceTermsOfServicesStatusResponse {
  tosAccepted: boolean;
}

export interface IJwtTokenResponse {
  index: number;
  jwt_data: string;
  is_encrypted: boolean;
}

export interface IJwtTokenRequestParams extends IApiUserGroupParams {
  index: number;
  totp?: string;
}

export interface IJwtTokenLimitResponse {
  jwtLimit: number;
}

type UserEndpointTokenMode = 'ip' | 'referer' | 'address' | 'all';

export interface IUpdateWhitelistModeParams extends IApiUserGroupParams {
  token: string; // endpointToken
  type: UserEndpointTokenMode;
}

export interface IUpdateWhitelistModeRequestParams {
  whitelist: boolean;
  prohibit_by_default: boolean;
}

export interface IUpdateWhitelistModeResponse
  extends IUpdateWhitelistModeRequestParams {}

export interface IUpdateWhitelistParams extends IUpdateWhitelistModeParams {
  blockchain: string;
}

export interface ListItem {
  type: UserEndpointTokenMode;
  list: string[];
}

export interface IUpdateWhitelistParamsResponse
  extends IUpdateWhitelistModeRequestParams {
  lists: ListItem[];
}

export interface IGetWhitelistParams extends IUpdateWhitelistModeParams {
  group?: Address;
}

export interface WhitelistItem extends ListItem {
  blockchain: string;
}

export interface IGetWhitelistParamsResponse
  extends IUpdateWhitelistModeRequestParams {
  lists: WhitelistItem[];
}
export interface BundlePaymentPlan {
  bundle: BundlePlan;
  price: ProductPrice;
}

export interface BundlePlan {
  active: boolean;
  bundle_id: string;
  created_at: number;
  duration: number;
  limits: BundleLimit[];
  name: string;
  price_id: string;
  product_id: string;
  updated_at: number;
}

export interface BundleLimit {
  blockchain_paths: string;
  limit?: number;
  type: BundleLimitType;
}

export enum BundleLimitType {
  UNKNOWN = 'UNKNOWN',
  QTY = 'QTY',
  COST = 'COST',
}

export interface GetLinkForBundlePaymentRequest {
  product_id: string;
  product_price_id: string;
}

export interface GetMyBundlesStatusResponse {
  bundles: MyBundleStatus[];
}

export interface MyBundleStatus {
  bundleId: string;
  counters: MyBundleStatusCounter[];
  expires: string;
  paymentId: string;
}

export interface MyBundleStatusCounter {
  blockchainPaths: string;
  count: string;
  type: BundleCounter;
}

export enum BundleCounter {
  // total number of requests a user can send, no matter which method
  BUNDLE_COUNTER_TYPE_QTY = 'BUNDLE_COUNTER_TYPE_QTY',
  // a user can send requests for different methods, but each one has its own cost
  BUNDLE_COUNTER_TYPE_COST = 'BUNDLE_COUNTER_TYPE_COST',
  BUNDLE_COUNTER_TYPE_UNKNOWN = 'BUNDLE_COUNTER_TYPE_UNKNOWN',
}
