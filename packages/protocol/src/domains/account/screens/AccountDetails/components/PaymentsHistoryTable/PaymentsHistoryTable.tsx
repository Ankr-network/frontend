import { useCallback } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useDispatchRequest, useQuery } from '@redux-requests/react';

import { t } from 'common';
import { fetchPaymentHistory } from 'domains/account/actions/fetchPaymentHistory';
import { useOnMount } from 'modules/common/hooks/useOnMount';
import { IPaymentHistoryReponse } from 'multirpc-sdk';
import { VirtualTable } from 'ui';
import {
  preparePaymentHistoryRequest,
  usePaymentHistoryTableColumns,
  useDownloadTransaction,
  PAYMENT_HISTORY_DEFAULT_PARAMS,
} from './PaymentsHistoryTableUtils';
import { useStyles } from './useStyles';
import { Filters } from './Filters';

export const PaymentsHistoryTable = () => {
  const classes = useStyles();
  const dispatchRequest = useDispatchRequest();

  const handleDownloadTransaction = useDownloadTransaction(dispatchRequest);

  const columns = usePaymentHistoryTableColumns(handleDownloadTransaction);

  const { data } = useQuery<IPaymentHistoryReponse>({
    type: fetchPaymentHistory,
  });

  useOnMount(() => {
    dispatchRequest(fetchPaymentHistory(PAYMENT_HISTORY_DEFAULT_PARAMS));
  });

  const handleFetchPaymentHistory = useCallback(
    (from, to, type) => {
      dispatchRequest(
        fetchPaymentHistory(preparePaymentHistoryRequest(from, to, type)),
      );
    },
    [dispatchRequest],
  );

  return (
    <Box display="flex" flexDirection="column">
      <Box mb={2} className={classes.top}>
        <Typography variant="h5" className={classes.title}>
          {t('account.payment-table.title')}
        </Typography>
        <Filters onFetchPaymentHistory={handleFetchPaymentHistory} />
      </Box>
      <VirtualTable
        cols={columns}
        minWidth={650}
        rows={data?.transactions || []}
        emptyMessage={t('account.payment-table.empty')}
      />
    </Box>
  );
};
