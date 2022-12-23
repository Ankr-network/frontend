import {
  useDispatchRequest,
  useMutation,
  useQuery,
} from '@redux-requests/react';
import { renderHook } from '@testing-library/react-hooks';
import BigNumber from 'bignumber.js';

import { useConnectedData } from 'modules/auth/common/hooks/useConnectedData';
import { ZERO } from 'modules/common/const';
import { Token } from 'modules/common/types/token';
import { useClaimETHMutation } from 'modules/stake-eth/actions/claim';
import { useGetETHClaimableDataQuery } from 'modules/stake-eth/actions/getClaimableData';
import { useGetETHCommonDataQuery } from 'modules/stake-eth/actions/getCommonData';

import { useClaimForm } from '../useClaimForm';

jest.mock('@redux-requests/react', () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
  useDispatchRequest: jest.fn(),
}));

jest.mock('modules/dashboard/Routes', () => ({
  RoutesConfig: {
    dashboard: { generatePath: () => '/dashboard' },
  },
}));

jest.mock('modules/stake-eth/actions/claim', () => ({
  claim: jest.fn(),
}));

jest.mock('modules/stake-eth/actions/getCommonData', () => ({
  getCommonData: jest.fn(),
}));

jest.mock('modules/stake-eth/actions/getClaimableData', () => ({
  getClaimableData: jest.fn(),
}));

jest.mock('modules/auth/common/hooks/useConnectedData', () => ({
  useConnectedData: jest.fn(),
}));

jest.mock('modules/stake-eth/actions/getClaimableData', () => ({
  useGetETHClaimableDataQuery: jest.fn(),
}));

jest.mock('modules/stake-eth/actions/claim', () => ({
  useClaimETHMutation: jest.fn(),
}));

jest.mock('modules/stake-eth/actions/getCommonData', () => ({
  useGetETHCommonDataQuery: jest.fn(),
}));

describe('modules/stake-eth/screens/ClaimEthereum/hooks/useClaimForm', () => {
  const defaultQueryData = {
    data: undefined,
    error: undefined,
    loading: false,
    isFetching: false,
  };

  const defaultCommonData = {
    ...defaultQueryData,
    data: {
      claimableAETHC: new BigNumber(1),
      claimableAETHB: new BigNumber(2),
      aETHcRatio: new BigNumber(0.8),
    },
    refetch: jest.fn(),
  };

  const defaultMutationData = {
    loading: false,
  };

  beforeEach(() => {
    (useQuery as jest.Mock).mockReturnValue(defaultCommonData);
    (useMutation as jest.Mock).mockReturnValue(defaultMutationData);
    (useDispatchRequest as jest.Mock).mockReturnValue(jest.fn());
    (useConnectedData as jest.Mock).mockReturnValue({ chainId: 1 });
    (useGetETHClaimableDataQuery as jest.Mock).mockReturnValue({
      isFetching: false,
      data: {
        claimableAETHC: new BigNumber(1),
        claimableAETHB: new BigNumber(2),
      },
      refetch: jest.fn(),
    });
    (useClaimETHMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      {
        isLoading: false,
      },
    ]);
    (useGetETHCommonDataQuery as jest.Mock).mockReturnValue({
      isFetching: false,
      data: {
        claimableAETHC: new BigNumber(1),
        claimableAETHB: new BigNumber(2),
        aETHcRatio: new BigNumber(0.8),
      },
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should return correct data', () => {
    const { result } = renderHook(() => useClaimForm());
    const { claimableAETHB } = defaultCommonData.data;

    expect(result.current.aETHcRatio).toStrictEqual(new BigNumber(1.25));
    expect(result.current.selectedToken).toBe(Token.aETHb);
    expect(result.current.balance).toStrictEqual(claimableAETHB);
    expect(result.current.totalAmount).toStrictEqual(claimableAETHB);
    expect(result.current.closeHref).toBe('/dashboard');
    expect(result.current.isLoading).toBe(defaultMutationData.loading);
    expect(result.current.isBalanceLoading).toBe(defaultCommonData.loading);
    expect(result.current.isDisabled).toBe(false);
    expect(result.current.onTokenSelect).toBeDefined();
    expect(result.current.onSubmit).toBeDefined();
  });

  test('should return disabled state when balance is zero', () => {
    (useGetETHClaimableDataQuery as jest.Mock).mockReturnValue({
      ...defaultCommonData,
      data: {
        ...defaultCommonData.data,
        claimableAETHB: ZERO,
      },
    });

    const { result } = renderHook(() => useClaimForm());

    expect(result.current.isDisabled).toBe(true);
  });

  test('should return disabled and loading when claim is pending', () => {
    (useClaimETHMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      {
        isLoading: true,
      },
    ]);

    const { result } = renderHook(() => useClaimForm());

    expect(result.current.isDisabled).toBe(true);
    expect(result.current.isLoading).toBe(true);
  });
});
