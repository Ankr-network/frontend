import BigNumber from 'bignumber.js';

import { ZERO } from 'modules/common/const';
import { Token } from 'modules/common/types/token';
import { AvailableSwitcherToken } from 'modules/switcher/const';

import { getFromLabel, getToLabel } from '../labels';

describe('modules/switcher/screens/Main/utils/labels', () => {
  test('should return "from" label properly', () => {
    expect(getFromLabel({ token: Token.aETHb })).toBe('1 aETHb = 1 ETH');
    expect(getFromLabel({ token: Token.aETHc })).toBe('1 aETHb = 1 ETH');
    expect(getFromLabel({ token: Token.aMATICb })).toBe('1 aMATICb = 1 MATIC');
    expect(getFromLabel({ token: Token.aMATICc })).toBe('1 aMATICb = 1 MATIC');
    expect(getFromLabel({ token: Token.aFTMb })).toBe('1 aFTMb = 1 FTM');
    expect(getFromLabel({ token: Token.aFTMc })).toBe('1 aFTMb = 1 FTM');
  });

  test('should return empty "from" label for unknown token', () => {
    const result = getFromLabel({ token: 'unknown' as AvailableSwitcherToken });

    expect(result).toBe('');
  });

  test('should return "to" label properly', () => {
    const ratio = new BigNumber(0.64);

    expect(getToLabel({ token: Token.aETHb, ratio })).toBe(
      '1 ankrETH = 1.5625 ETH',
    );
    expect(getToLabel({ token: Token.aETHc, ratio })).toBe(
      '1 ankrETH = 1.5625 ETH',
    );
    expect(getToLabel({ token: Token.aMATICb, ratio })).toBe(
      '1 ankrMATIC = 1.5625 MATIC',
    );
    expect(getToLabel({ token: Token.aMATICc, ratio })).toBe(
      '1 ankrMATIC = 1.5625 MATIC',
    );
    expect(getToLabel({ token: Token.aFTMb, ratio })).toBe(
      '1 ankrFTM = 1.5625 FTM',
    );
    expect(getToLabel({ token: Token.aFTMc, ratio })).toBe(
      '1 ankrFTM = 1.5625 FTM',
    );
  });

  test('should return empty "to" label for unknown token', () => {
    const result = getToLabel({
      token: 'unknown' as AvailableSwitcherToken,
      ratio: new BigNumber(1),
    });

    expect(result).toBe('');
  });

  test('should return zero for "from" label if ration is zero', () => {
    const result = getToLabel({
      token: Token.aETHc,
      ratio: ZERO,
    });

    expect(result).toBe('1 ankrETH = 0 ETH');
  });
});
