import { ECurrency } from 'modules/billing/types';
import {
  MAX_CRYPTO_DECIMALS,
  MAX_CRYPTO_DIGITS,
  MAX_USD_DECIMALS,
  MAX_USD_DIGITS,
} from 'modules/billing/const';
import { cutNonNumericSymbols } from 'modules/billing/utils/cutNonNumericSymbols';
import { cutNumber } from 'modules/billing/utils/cutNumber';
import { replaceCommaByDot } from 'modules/billing/utils/replaceCommaByDot';

export interface IFormatAmountRawValueParams {
  amount: string;
  currency: ECurrency;
}

const decimalsMap: Record<ECurrency, number> = {
  [ECurrency.ANKR]: MAX_CRYPTO_DECIMALS,
  [ECurrency.USDC]: MAX_CRYPTO_DECIMALS,
  [ECurrency.USDT]: MAX_CRYPTO_DECIMALS,
  [ECurrency.USD]: MAX_USD_DECIMALS,
};

const digitsMap: Record<ECurrency, number> = {
  [ECurrency.ANKR]: MAX_CRYPTO_DIGITS,
  [ECurrency.USDC]: MAX_CRYPTO_DIGITS,
  [ECurrency.USDT]: MAX_CRYPTO_DIGITS,
  [ECurrency.USD]: MAX_USD_DIGITS,
};

export const formatAmountRawValue = ({
  amount,
  currency,
}: IFormatAmountRawValueParams) => {
  const formattedAmount = cutNumber({
    number: cutNonNumericSymbols(replaceCommaByDot(amount)),
    decimals: decimalsMap[currency],
    digits: digitsMap[currency],
  });

  return formattedAmount;
};
