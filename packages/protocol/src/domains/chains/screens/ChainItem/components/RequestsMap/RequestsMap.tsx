import { useMemo, useState } from 'react';

import { useAuth } from 'domains/auth/hooks/useAuth';
import { t } from '@ankr.com/common';
import { NoData } from '../MethodCalls/components/NoData';
import { RequestsMapProps } from './RequestsMapTypes';
import { getMarkerPointsAndStats } from './RequestsMapUtils';
import { StatsMap } from './StatsMap';
import { StatsTable } from './StatsTable';

import { Timeframe } from 'domains/chains/types';
import { ItemHeader } from '../ItemHeader';
import { useRequestsMapStyles } from './useRequestsMapStyles';
import { OverlaySpinner } from '@ankr.com/ui';
import { useThemes } from 'uiKit/Theme/hook/useThemes';

export const RequestsMap = ({
  loading,
  countries,
  timeframe,
}: RequestsMapProps) => {
  const { classes } = useRequestsMapStyles();
  const [country, setCountry] = useState<string>('');
  const { isLightTheme } = useThemes();

  // TODO: remove when BE releases add all timeframe support for Premium
  const { hasPrivateAccess } = useAuth();

  const data = useMemo(
    () => getMarkerPointsAndStats(countries, isLightTheme),
    [countries, isLightTheme],
  );

  return (
    <div className={classes.root}>
      {/* Since request by ip only support 30d by backend, so hard code it first. When backend support all the timeframe should be remove it  */}
      <ItemHeader
        timeframe={hasPrivateAccess ? Timeframe.Month : timeframe}
        title={t('chain-item.map.header')}
      />
      {loading ? (
        <div className={classes.loading}>
          <OverlaySpinner />
        </div>
      ) : (
        <div className={classes.container}>
          {data.length ? (
            <>
              <StatsTable data={data} selectedCountry={country} />
              <div className={classes.mapContainer}>
                <StatsMap data={data} setCountry={setCountry} />
              </div>
            </>
          ) : (
            <div className={classes.noData}>
              <NoData />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
