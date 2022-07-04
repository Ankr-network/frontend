import React from 'react';

import { ChainItemDetails } from '../ChainItemDetails';
import { ChainRequestsOverview } from '../ChainRequestsOverview';
import { MethodsRating } from '../MethodsRating';
import { QueryError } from 'modules/common/components/QueryError/QueryError';
import { RequestsMap } from '../RequestsMap';
import { UsageSummary } from '../UsageSummary';
import { useStyles } from './DataUsageContentStyles';
import { useUsageData } from './hooks/useUsageData';

interface IDataUsageContentProps {
  chainId: string;
}

export const DataUsageContent = ({ chainId }: IDataUsageContentProps) => {
  const classes = useStyles();

  const {
    countries,
    error,
    isWalletConnected,
    loading,
    methodRequests,
    pristine,
    setTimeframe,
    switchTimeframe,
    timeframe,
    totalCached,
    totalRequests,
    totalRequestsHistory,
  } = useUsageData(chainId);

  return (
    <>
      {error ? (
        <div className={classes.error}>
          <QueryError error={error} />
        </div>
      ) : (
        <>
          {isWalletConnected && (
            <UsageSummary className={classes.usageSummary} chainId={chainId} />
          )}
          <ChainRequestsOverview
            className={classes.chainRequestsOverview}
            loading={loading}
            onClick={setTimeframe}
            pristine={pristine}
            timeframe={timeframe}
            totalRequestsHistory={totalRequestsHistory}
          >
            <ChainItemDetails
              className={classes.chainItemDetails}
              isWalletConnected={isWalletConnected}
              loading={loading}
              timeframe={timeframe}
              totalCached={totalCached}
              totalRequests={totalRequests}
            />
          </ChainRequestsOverview>
          {countries && Object.keys(countries).length !== 0 && (
            <RequestsMap countries={countries} />
          )}
          {isWalletConnected && methodRequests.length > 0 && (
            <MethodsRating
              methodRequests={methodRequests}
              switchTimeframe={switchTimeframe}
              timeframe={timeframe}
            />
          )}
        </>
      )}
    </>
  );
};
