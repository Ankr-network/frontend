import { t } from '@ankr.com/common';
import { useMemo } from 'react';

import { Alert } from 'modules/billing/components/CryptoPaymentDepositDialog/components/PaymentDetails/components/Alert';
import {
  ECryptoDepositStepStatus,
  ECurrency,
  ENetwork,
} from 'modules/billing/types';
import { FeeAmount } from 'modules/billing/components/FeeAmount';
import { Label } from 'modules/billing/components/CryptoPaymentDepositDialog/components/PaymentDetails/components/Label';
import { TxAttribute } from 'modules/billing/components/TxAttribute';
import { renderCryptoAmount } from 'modules/billing/utils/renderCryptoAmount';

import { getAlertProps } from './utils/getAlertProps';
import { usePartialApprovalAttributeStyles } from './usePartialApprovalAttributeStyles';

export interface IPartialApprovalAttributeProps {
  amount: number;
  approvedAmount?: number;
  currency: ECurrency;
  error?: string;
  feeCrypto: number;
  feeUSD: number;
  network: ENetwork;
  status?: ECryptoDepositStepStatus;
}

const labelKey = 'account.payment-flow.steps.approval.title';

export const PartialApprovalAttribute = ({
  amount,
  approvedAmount = 0,
  currency,
  error,
  feeCrypto,
  feeUSD,
  network,
  status,
}: IPartialApprovalAttributeProps) => {
  const { classes } = usePartialApprovalAttributeStyles();

  const amountToApprove = renderCryptoAmount({
    amount: amount - approvedAmount,
    currency,
  });

  const alertProps = useMemo(
    () =>
      getAlertProps({
        amountToApprove,
        approvedAmount: approvedAmount.toString(),
        error,
        status,
      }),
    [amountToApprove, approvedAmount, error, status],
  );

  return (
    <TxAttribute
      classes={classes}
      label={<Label status={status} text={t(labelKey)} />}
      extraContent={<Alert {...alertProps} />}
    >
      <FeeAmount
        feeCrypto={feeCrypto}
        feeUSD={feeUSD}
        isApproximate
        network={network}
      />
    </TxAttribute>
  );
};
