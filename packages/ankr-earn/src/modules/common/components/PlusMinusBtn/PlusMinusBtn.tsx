import { IconButton, Tooltip } from '@material-ui/core';
import classNames from 'classnames';
import { useMemo } from 'react';
import { MinusIcon } from 'uiKit/Icons/MinusIcon';
import { PlusIcon } from 'uiKit/Icons/PlusIcon';
import { NavLink } from 'uiKit/NavLink';
import { Spinner } from 'uiKit/Spinner';
import { usePlusMinusBtnStyles } from './usePlusMinusBtnStyles';

const iconsMap = {
  plus: PlusIcon,
  minus: MinusIcon,
};

type IconNameType = keyof typeof iconsMap;

interface IPlusMinusBtnProps {
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
  tooltip?: string;
  icon?: IconNameType;
  disabled?: boolean;
  href?: string;
}

export const PlusMinusBtn = ({
  className,
  tooltip,
  onClick,
  icon = 'plus',
  isLoading = false,
  disabled = false,
  href = '',
}: IPlusMinusBtnProps) => {
  const classes = usePlusMinusBtnStyles();

  const Icon = iconsMap[icon];

  const button = useMemo(
    () =>
      href ? (
        <NavLink
          className={classNames(classes.root, className)}
          disabled={isLoading || disabled}
          href={href}
          color="secondary"
        >
          {isLoading ? <Spinner size={24} /> : <Icon size={20} />}
        </NavLink>
      ) : (
        <IconButton
          className={classNames(classes.root, className)}
          component="div"
          size="medium"
          color="secondary"
          disabled={isLoading || disabled}
          onClick={isLoading || disabled ? undefined : onClick}
        >
          {isLoading ? <Spinner size={24} /> : <Icon size={20} />}
        </IconButton>
      ),
    [Icon, className, classes.root, disabled, isLoading, onClick, href],
  );

  return tooltip ? (
    <Tooltip
      className={className}
      open={tooltip ? undefined : false}
      title={tooltip ?? false}
      arrow
    >
      {button}
    </Tooltip>
  ) : (
    button
  );
};
