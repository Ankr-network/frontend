import { useCallback, useEffect, useState } from 'react';

import { ClientMapped } from '../../store/clientsSlice';
import { sortData } from './clientTableUtils';

const NUMERIC_KEYS: (keyof ClientMapped)[] = [
  'amount',
  'amountAnkr',
  'amountUsd',
  'creditVoucherAmount',
  'ttl',
];

export const useClientsTableSorting = ({
  clients,
}: {
  clients: ClientMapped[];
}) => {
  const [sortBy, setSortBy] = useState<keyof ClientMapped>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortedData, setSortedData] = useState<ClientMapped[]>(clients);

  const handleOrder = useCallback(
    (sortByValue: keyof ClientMapped) => {
      setSortBy(sortByValue);
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    },
    [sortOrder],
  );

  useEffect(() => {
    const compareType = NUMERIC_KEYS.some(el => sortBy?.includes(el))
      ? 'number'
      : 'string';

    setSortedData(sortData({ rows: clients, compareType, sortBy, sortOrder }));
  }, [clients, sortBy, sortOrder]);

  return {
    handleOrder,
    sortBy,
    sortOrder,
    sortedData,
  };
};
