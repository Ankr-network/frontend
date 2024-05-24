import { EBlockchain, Web3Address } from 'multirpc-sdk';

export enum ECurrency {
  ANKR = 'ANKR',
  USD = 'USD',
  USDT = 'USDT',
  USDC = 'USDC',
}

export interface ICryptoTransactionKey {
  accountAddress: Web3Address; // auth address or group address
  amount: number;
  currency: ECurrency;
  network: EBlockchain;
}

export interface IFeeDetails {
  feeCrypto: number;
  feeUSD: number;
}

export interface ICryptoTransaction extends ICryptoTransactionKey {
  allowanceAmount?: number;
  allowanceError?: string;
  allowanceFeeDetailsEstimated?: IFeeDetails;
  allowanceFeeDetailsPaid?: IFeeDetails;
  allowanceTxHash?: string;
  depositError?: string;
  depositFeeDetailsEstimated?: IFeeDetails;
  depositFeeDetailsPaid?: IFeeDetails;
  depositTxHash?: string;
  from: Web3Address;
  hadAllowance: boolean;
  id: string;
  isAllowanceConfirming: boolean;
  isApproved: boolean;
  isApproving?: boolean;
  isConfirmed?: boolean;
  isDepositConfirming: boolean;
  isDepositing?: boolean;
  network: EBlockchain;
  to: Web3Address; // PAYG contract address
  tokenContractAddress: string;
  tokenDecimals: number;
}

export interface IFiatTransaction {
  amount: number;
  txOrigin: string;
}

export interface IPaymentsSlice {
  cryptoTransactions: ICryptoTransaction[];
  fiatTransaction?: IFiatTransaction;
}

export interface ICreateCryptoTxPayload
  extends Omit<ICryptoTransaction, 'id' | 'isApproved'> {}

export interface ICreateFiatTxPayload extends IFiatTransaction {}

export interface IUpdateCryptoTxPayload {
  id: string;
}

type TCryptoTxField<Field extends keyof ICryptoTransaction> = Pick<
  Required<ICryptoTransaction>,
  Field
>;

export interface ISetAllowanceAmountPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'allowanceAmount'> {}

export interface ISetAllowanceErrorPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'allowanceError'> {}

export interface ISetAllowanceFeeDetailsPaidPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'allowanceFeeDetailsPaid'> {}

export interface ISetAllowanceFeeDetailsEstimatedPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'allowanceFeeDetailsEstimated'> {}

export interface ISetAllowanceTxHashPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'allowanceTxHash'> {}

export interface ISetDepositErrorPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'depositError'> {}

export interface ISetDepositFeeDetailsPaidPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'depositFeeDetailsPaid'> {}

export interface ISetDepositFeeDetailsEstimatedPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'depositFeeDetailsEstimated'> {}

export interface ISetDepositTxHashPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'depositTxHash'> {}

export interface ISetIsAllowanceConfirmingPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'isAllowanceConfirming'> {}

export interface ISetIsApprovedPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'isApproved'> {}

export interface ISetIsApprovingPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'isApproving'> {}

export interface ISetIsConfirmedPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'isConfirmed'> {}

export interface ISetIsDepositConfirmingPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'isDepositConfirming'> {}

export interface ISetIsDepositingPayload
  extends IUpdateCryptoTxPayload,
    TCryptoTxField<'isDepositing'> {}
