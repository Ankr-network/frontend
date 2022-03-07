import { Typography } from '@material-ui/core';
import classNames from 'classnames';
import React from 'react';

import { useNetworkSelectorStyles } from './useNetworkSelectorStyles';

interface INetworkSelectorItemProps {
  iconSlot: JSX.Element;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const NetworkSelectorItem = ({
  iconSlot,
  title,
  onClick,
  disabled,
}: INetworkSelectorItemProps): JSX.Element => {
  const classes = useNetworkSelectorStyles();

  return (
    <button
      className={classNames(classes.item, !disabled && classes.itemClickable)}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {iconSlot}

      <Typography className={classes.itemTitle} variant="body2">
        {title}
      </Typography>
    </button>
  );
};
