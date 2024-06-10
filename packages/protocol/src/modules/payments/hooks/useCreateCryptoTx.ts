import { EBlockchain } from 'multirpc-sdk';
import { useCallback, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { useAppDispatch } from 'store/useAppDispatch';
import { useWalletAddress } from 'domains/wallet/hooks/useWalletAddress';

import { ECurrency } from '../types';
import { createCryptoTx } from '../store/paymentsSlice';
import { useAccountAddress } from './useAccountAddress';
import { useEstimatedAllowanceFee } from './useEstimatedAllowanceFee';
import { useEstimatedDepositFee } from './useEstimatedDepositFee';
import { useFetchAllowance } from './useFetchAllowance';
import { useNativeTokenPrice } from './useNativeTokenPrice';
import { usePaygContractAddress } from './usePaygContractAddress';
import { useTxByTxId } from './useTxByTxId';

export interface IUseCryptoTxProps {
  amount: number;
  currency: ECurrency;
  network: EBlockchain;
}

const skipFetching = true;

export const useCryptoTx = ({
  amount,
  currency,
  network,
}: IUseCryptoTxProps) => {
  const [txId] = useState<string>(uuid());

  const { accountAddress } = useAccountAddress();
  const { paygContractAddress } = usePaygContractAddress({ currency, network });
  const { tx } = useTxByTxId({ txId });
  const { walletAddress } = useWalletAddress();

  const { fetchAllowanceRef, isLoading: isAllowanceFetching } =
    useFetchAllowance({
      address: walletAddress!,
      currency,
      network,
      skipFetching,
    });

  const { fetchNativeTokenPriceRef, isLoading: isNativeTokenPriceLoading } =
    useNativeTokenPrice({ network, skipFetching });

  const {
    fetchEstimatedAllowanceFeeRef,
    isEstimating: isAllowanceFeeEstimating,
  } = useEstimatedAllowanceFee({ currency, skipFetching, txId });

  const { fetchEstimatedDepositFeeRef, isEstimating: isDepositFeeEstimating } =
    useEstimatedDepositFee({ currency, skipFetching, txId });

  const dispatch = useAppDispatch();

  const handleCreateCryptoTx = useCallback(async () => {
    if (walletAddress && paygContractAddress) {
      const { data: allowanceAmount = 0 } = await fetchAllowanceRef.current();

      dispatch(
        createCryptoTx({
          accountAddress,
          allowanceAmount,
          amount,
          currency,
          from: walletAddress,
          hadAllowance: allowanceAmount >= amount,
          id: txId,
          network,
          to: paygContractAddress,
        }),
      );

      await fetchNativeTokenPriceRef.current();
      await fetchEstimatedAllowanceFeeRef.current();
      await fetchEstimatedDepositFeeRef.current();
    }
  }, [
    accountAddress,
    amount,
    currency,
    dispatch,
    fetchAllowanceRef,
    fetchEstimatedAllowanceFeeRef,
    fetchNativeTokenPriceRef,
    fetchEstimatedDepositFeeRef,
    network,
    paygContractAddress,
    txId,
    walletAddress,
  ]);

  const isCreating =
    isAllowanceFetching ||
    isNativeTokenPriceLoading ||
    isAllowanceFeeEstimating ||
    isDepositFeeEstimating;

  return { handleCreateCryptoTx, isCreating, tx };
};
