import { ReactElement } from 'react';
import { SvgIconProps } from '@mui/material';

import { IsActive } from 'modules/layout/components/MainNavigation/MainNavigationUtils';

export interface NavigationItem {
  ActiveIcon?: (props: SvgIconProps) => ReactElement | null;
  StartIcon: (props: SvgIconProps) => ReactElement | null;
  href?: string;
  isActive?: IsActive;
  isDisabled?: boolean;
  label: string;
  onClick?: () => void;
}

export interface NavigationProps {
  items: NavigationItem[];
  loading?: boolean;
}
