import { AvailableWriteProviders } from '@ankr.com/provider-core';
import { useState, useCallback, useEffect } from 'react';

import { useAuth } from 'modules/auth/common/hooks/useAuth';

export interface IUnstakeSuccessHookData {
  isTxCopied: boolean;
  isAddressCopied: boolean;
  chainId: number;
  handleCopyDestinationAddress: () => void;
  handleCopyTxHash: () => void;
}

const TIMEOUT = 1_500;

export const useUnstakeSuccessHook = (): IUnstakeSuccessHookData => {
  const [isTxCopied, setIsTxCopied] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);

  const { chainId } = useAuth(AvailableWriteProviders.ethCompatible);

  const handleCopyTxHash = useCallback(() => {
    setIsTxCopied(isCopied => !isCopied);
  }, [setIsTxCopied]);

  const handleCopyDestinationAddress = useCallback(() => {
    setIsAddressCopied(isCopied => !isCopied);
  }, [setIsAddressCopied]);

  useEffect(() => {
    if (!isTxCopied) {
      return undefined;
    }

    const timeoutId = setTimeout(handleCopyTxHash, TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [isTxCopied, handleCopyTxHash]);

  useEffect(() => {
    if (!isAddressCopied) {
      return undefined;
    }

    const timeoutId = setTimeout(handleCopyDestinationAddress, TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [isAddressCopied, handleCopyDestinationAddress]);

  return {
    isTxCopied,
    isAddressCopied,
    chainId: (chainId as number) ?? 1,
    handleCopyDestinationAddress,
    handleCopyTxHash,
  };
};
