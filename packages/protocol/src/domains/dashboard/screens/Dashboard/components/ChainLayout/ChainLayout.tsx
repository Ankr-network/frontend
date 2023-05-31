import { ChainLayoutProps } from './types';
import { EmptyLayoutGuard } from '../EmptyLayoutGuard';
import { LocationsWidget } from '../LocationsWidget';
import { MethodCallsWidget } from '../MethodCallsWidget';
import { RequestsByIpWidget } from '../RequestsByIpWidget';
import { RequestsWidget } from '../RequestsWidget';
import { TopCountriesWidget } from '../TopCountriesWidget';
import { useChainData } from './hooks/useChainData';
import { useChainLayoutStyles } from './ChainLayoutStyles';

export const ChainLayout = ({
  selectedChainId,
  statsChainId,
  detailsChainId,
  timeframe,
}: ChainLayoutProps) => {
  const {
    allTimeTotalRequestsNumber,
    areLocationsLoading,
    chainStats,
    countries,
    ipRequests,
    locations,
    requestsChartData,
    totalRequestsNumber,
    methodCalls,
  } = useChainData({ statsChainId, timeframe, selectedChainId });

  const { classes } = useChainLayoutStyles();

  return (
    <EmptyLayoutGuard data={requestsChartData}>
      <div className={classes.root}>
        <RequestsWidget
          allTimeRequestsNumber={allTimeTotalRequestsNumber}
          className={classes.requests}
          data={requestsChartData}
          timeframe={timeframe}
          totalRequestsNumber={totalRequestsNumber}
        />
        <MethodCallsWidget
          className={classes.methods}
          total={chainStats?.total.count}
          requests={methodCalls}
          timeframe={timeframe}
          chainId={detailsChainId}
        />
        <RequestsByIpWidget className={classes.ipRequests} data={ipRequests} />
        <LocationsWidget
          className={classes.locations}
          isLoading={areLocationsLoading}
          locations={locations}
        />
        <TopCountriesWidget className={classes.countries} data={countries} />
      </div>
    </EmptyLayoutGuard>
  );
};
