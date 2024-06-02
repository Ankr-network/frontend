import { EBlockchain } from 'multirpc-sdk';
import { OverlaySpinner } from '@ankr.com/ui';

import {
  ECryptoDepositStepStatus,
  ECurrency,
  IFeeDetails,
} from 'modules/payments/types';
import { defaultFeeDetails } from 'modules/payments/const';

import { FullAllowanceAttribute } from './components/FullAllowanceAttribute';
import { NoAllowanceAttribute } from './components/NoAllowanceAttribute';
import { PartialAllowanceAttribute } from './components/PartialAllowanceAttribute';
import { hasFullAllowance } from './utils/hasFullAllowance';
import { hasPartialAllowance } from './utils/hasPartialAllowance';

export interface IAllowanceAttributeProps {
  allowance: number;
  amount: number;
  currency: ECurrency;
  error?: string;
  feeDetails?: IFeeDetails;
  isAllowanceLoading: boolean;
  isAllowanceSent: boolean;
  isDepositPending: boolean;
  network: EBlockchain;
  status?: ECryptoDepositStepStatus;
}

export const AllowanceAttribute = ({
  allowance,
  amount,
  currency,
  error,
  feeDetails = defaultFeeDetails,
  isAllowanceLoading,
  isAllowanceSent,
  isDepositPending,
  network,
  status,
}: IAllowanceAttributeProps) => {
  if (isAllowanceLoading) {
    return <OverlaySpinner />;
  }

  if (hasFullAllowance({ amount, isAllowanceSent, allowance })) {
    return (
      <FullAllowanceAttribute
        allowance={allowance}
        currency={currency}
        shouldHideAlert={isDepositPending}
      />
    );
  }

  if (hasPartialAllowance({ amount, allowance })) {
    return (
      <PartialAllowanceAttribute
        allowance={allowance}
        amount={amount}
        currency={currency}
        error={error}
        feeCrypto={feeDetails.feeCrypto}
        feeUSD={feeDetails.feeUSD}
        network={network}
        shouldHideAlert={isDepositPending}
        status={status}
      />
    );
  }

  return (
    <NoAllowanceAttribute
      error={error}
      feeCrypto={feeDetails.feeCrypto}
      feeUSD={feeDetails.feeUSD}
      network={network}
      status={status}
    />
  );
};
