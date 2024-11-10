import { useCallback, useMemo } from 'react';
import { IGetNotificationsParams } from 'multirpc-sdk';

import { IUseQueryProps } from 'store/queries/types';
import { getQueryParams } from 'store/utils/getQueryParams';
import { useAppSelector } from 'store/useAppSelector';
import { useAutoupdatedRef } from 'modules/common/hooks/useAutoupdatedRef';

import {
  selectNotificationsLoading,
  selectNotifications,
  selectNotificationsState,
  useFetchNotificationsQuery,
  useLazyFetchNotificationsQuery,
} from '../actions/fetchNotifications';

export interface IUseNotificationsProps
  extends IUseQueryProps,
    IGetNotificationsParams {}

export const useNotifications = ({
  category,
  cursor,
  limit,
  older_than,
  only_unseen,
  pollingInterval,
  skipFetching,
  sort_direction,
}: IUseNotificationsProps) => {
  const params = useMemo(
    (): IGetNotificationsParams => ({
      category,
      cursor,
      limit,
      older_than,
      only_unseen,
      sort_direction,
    }),
    [category, cursor, limit, older_than, only_unseen, sort_direction],
  );
  const { refetch: handleRefetchNotifications } = useFetchNotificationsQuery(
    getQueryParams({ params, skipFetching }),
    { pollingInterval },
  );

  const [fetchLazy] = useLazyFetchNotificationsQuery();

  const handleFetchNotifications = useCallback(
    () => fetchLazy(params),
    [fetchLazy, params],
  );

  const fetchNotificationsRef = useAutoupdatedRef(handleFetchNotifications);

  const notifications = useAppSelector(state =>
    selectNotifications(state, params),
  );
  const isLoading = useAppSelector(state =>
    selectNotificationsLoading(state, params),
  );

  const { isError } = useAppSelector(state =>
    selectNotificationsState(state, params),
  );

  return {
    fetchNotificationsRef,
    handleFetchNotifications,
    handleRefetchNotifications,
    isLoading,
    isError,
    notificationsAmount: notifications?.notifications.length ?? 0,
    notifications,
  };
};
