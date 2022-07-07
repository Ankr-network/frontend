import {
  useDispatchRequest,
  useMutation,
  useQuery,
} from '@redux-requests/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { ONE_ETH, ZERO } from 'modules/common/const';

import { useStakedABNBBData } from '../useStakedABNBBData';

jest.mock('@redux-requests/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useDispatchRequest: jest.fn(),
}));

jest.mock('modules/auth/common/hooks/useConnectedData', () => ({
  useConnectedData: () => ({ chainId: 1 }),
}));

jest.mock('modules/stake-bnb/Routes', () => ({
  RoutesConfig: {
    stake: { generatePath: () => '/stake' },
    unstake: { generatePath: () => '/unstake' },
  },
}));

jest.mock('modules/boost/Routes', () => ({
  RoutesConfig: { tradingCockpit: { generatePath: () => '/trade' } },
}));

jest.mock('modules/stake-bnb/actions/addBNBTokenToWallet', () => ({
  addBNBTokenToWallet: jest.fn(),
}));

jest.mock('modules/stake-bnb/actions/fetchPendingValues', () => ({
  fetchPendingValues: jest.fn(),
}));

jest.mock('modules/stake-bnb/actions/fetchStats', () => ({
  fetchStats: jest.fn(),
}));

jest.mock('modules/stake-bnb/actions/stake', () => ({
  stake: jest.fn(),
}));

jest.mock('modules/stake-bnb/actions/unstake', () => ({
  unstake: jest.fn(),
}));

jest.mock('modules/stake/actions/getMetrics', () => ({
  getMetrics: jest.fn(),
}));

describe('modules/dashboard/screens/Dashboard/components/StakedABNBB/useStakedABNBBData', () => {
  const defaultStatsData = {
    data: { aBNBbBalance: ONE_ETH, pendingValue: ZERO },
    loading: false,
  };

  const defaultMutationData = {
    loading: false,
  };

  beforeEach(() => {
    (useQuery as jest.Mock).mockReturnValue(defaultStatsData);

    (useMutation as jest.Mock).mockReturnValue(defaultMutationData);

    (useDispatchRequest as jest.Mock).mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should return amount and pending value', () => {
    const { result } = renderHook(() => useStakedABNBBData());

    expect(result.current.amount).toStrictEqual(ONE_ETH);
    expect(result.current.pendingValue).toStrictEqual(ZERO);
    expect(result.current.isBalancesLoading).toBe(false);
    expect(result.current.isStakeLoading).toBe(false);
    expect(result.current.isUnstakeLoading).toBe(false);
  });

  test('should return links and types', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
    });

    const { result } = renderHook(() => useStakedABNBBData());

    expect(result.current.stakeLink).toBe('/stake');
    expect(result.current.unstakeLink).toBe('/unstake');
    expect(result.current.tradeLink).toBe('/trade');
  });

  test('should handle add token to metamask', () => {
    const mockDispatch = jest.fn();
    (useDispatchRequest as jest.Mock).mockReturnValue(mockDispatch);

    const { result } = renderHook(() => useStakedABNBBData());

    act(() => {
      result.current.handleAddTokenToWallet();
    });

    expect(mockDispatch).toBeCalledTimes(1);
  });
});
