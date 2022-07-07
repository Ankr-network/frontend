import { useDispatchRequest, useQuery } from '@redux-requests/react';
import { renderHook } from '@testing-library/react-hooks';
import BigNumber from 'bignumber.js';
import { useParams } from 'react-router';

import { useConnectedData } from 'modules/auth/common/hooks/useConnectedData';
import { TxErrorCodes } from 'modules/common/components/ProgressStep';

import { useMainDataBSC } from '../useMainDataBSC';

jest.mock('react-router', () => ({
  useParams: jest.fn(),
}));

jest.mock('@redux-requests/react', () => ({
  useDispatchRequest: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock('@redux-requests/core', () => ({
  resetRequests: jest.fn(),
  stopPolling: jest.fn(),
}));

jest.mock('store/useAppDispatch', () => ({
  useAppDispatch: () => jest.fn(),
}));

jest.mock('modules/auth/common/hooks/useProviderEffect', () => ({
  useProviderEffect: jest.fn(),
}));

jest.mock('modules/auth/common/hooks/useConnectedData', () => ({
  useConnectedData: jest.fn(),
}));

jest.mock('modules/stake-bnb/actions/addBNBTokenToWallet', () => ({
  addBNBTokenToWallet: jest.fn(),
}));

jest.mock('modules/stake-bnb/actions/fetchStats', () => ({
  fetchStats: jest.fn(),
}));

jest.mock('modules/stake-bnb/actions/getTxData', () => ({
  getTxData: jest.fn(),
  getTxReceipt: jest.fn(),
}));

describe('modules/swap/screens/Main/useMainDataBSC.ts', () => {
  const defaultQueryAction = {
    loading: false,
    data: undefined,
    stopPolling: jest.fn(),
  };

  const defaultQueryTxData = {
    ...defaultQueryAction,
    data: {
      isPending: true,
      amount: new BigNumber('2'),
      destinationAddress: '0x3C9205b5d4B312cA7C4d28110C91Fe2c74718a94',
    },
  };

  const defaultQueryFetchStats = {
    ...defaultQueryAction,
    data: {
      aETHcRatio: new BigNumber(0.8),
      relayerFee: new BigNumber(0.1),
    },
  };

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({
      txHash:
        '0x6d371b345d14faf0600bd9d813f001d09feace3a4621ed201150f8fb2084d347',
      token: 'aETHc',
    });

    (useConnectedData as jest.Mock).mockReturnValue({
      chainId: 97,
      address: 'address',
    });

    (useDispatchRequest as jest.Mock).mockReturnValue(jest.fn());

    (useQuery as jest.Mock).mockReturnValue(defaultQueryAction);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should return initial data', async () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce(defaultQueryTxData)
      .mockReturnValueOnce(defaultQueryAction)
      .mockReturnValueOnce(defaultQueryFetchStats);

    const { result } = renderHook(() => useMainDataBSC());

    expect(result.current.transactionId).toBe(
      '0x6d371b345d14faf0600bd9d813f001d09feace3a4621ed201150f8fb2084d347',
    );
    expect(result.current.amount).toStrictEqual(new BigNumber('2'));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isPending).toBe(true);
    expect(result.current.destination).toBe(
      '0x3C9205b5d4B312cA7C4d28110C91Fe2c74718a94',
    );
    expect(result.current.error).toBeUndefined();
  });

  test('should return error if there is provider error', async () => {
    (useQuery as jest.Mock).mockReturnValue({ error: new Error('error') });

    const { result } = renderHook(() => useMainDataBSC());

    expect(result.current.error).toBeDefined();
  });

  test('should return error if there is transaction fail error', async () => {
    (useQuery as jest.Mock)
      .mockReturnValueOnce(defaultQueryTxData)
      .mockReturnValueOnce({
        loading: false,
        data: { status: false },
      })
      .mockReturnValueOnce(defaultQueryFetchStats);

    const { result } = renderHook(() => useMainDataBSC());

    expect(result.current.error?.message).toBe(TxErrorCodes.TX_FAILED);
  });
});
