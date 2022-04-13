import { Token } from 'modules/common/types/token';

import { IBaseWaletData } from '../types';
import { trackAnalyticEvent } from '../utils/trackAnalyticEvent';

interface IEnterStakingFlowEvent extends IBaseWaletData {
  accessPoint: 'portfolio' | 'liquid_staking' | 'add_stake';
  tokenName?: Token;
}

export const trackEnterStakingFlow = (
  properties: IEnterStakingFlowEvent,
): void => {
  trackAnalyticEvent({ event: 'enter_staking_flow', properties });
};
