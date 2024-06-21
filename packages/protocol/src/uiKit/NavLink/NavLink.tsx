import {
  MutableRefObject,
  ForwardedRef,
  createElement,
  forwardRef,
  MouseEvent,
  ComponentType,
} from 'react';
import { Button, ButtonProps } from '@mui/material';
import { OverlaySpinner } from '@ankr.com/ui';
import {
  Link as RouterLink,
  LinkProps as RouteLinkProps,
  useRouteMatch,
} from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({}));

type NavLinksVariant = 'contained' | 'outlined' | 'text';

export interface INavLinkProps {
  isRouterLink?: boolean;
  routerLinkProps?: Partial<RouteLinkProps>;
  component?: string | ComponentType;
  href: string;
  variant?: NavLinksVariant;
  activeClassName?: string;
  exactMatch?: boolean;
  isLoading?: boolean;
  loader?: JSX.Element;
  onClick?: (e: MouseEvent<Element, MouseEvent>) => void;
}

type Props = ButtonProps & INavLinkProps;

const getElement = (
  isLink: boolean,
  disabled?: boolean,
  component?: INavLinkProps['component'],
) => {
  if (isLink) {
    return 'a';
  }

  if (disabled) {
    if (typeof component === 'string') {
      return component;
    }

    return 'span';
  }

  return RouterLink;
};

export const NavLink = forwardRef(
  (
    {
      activeClassName,
      className,
      exactMatch = false,
      href,
      isLoading,
      isRouterLink,
      loader,
      onClick,
      routerLinkProps,
      variant = 'text',
      ...props
    }: Props,
    ref: ForwardedRef<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    const isLink =
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href.startsWith('tel');

    const { cx } = useStyles();

    const match = useRouteMatch({
      path: href,
      exact: exactMatch,
    });

    const endIcon = isLoading
      ? loader || <OverlaySpinner size={16} />
      : undefined;

    if (isRouterLink) {
      return createElement(
        getElement(isLink, props.disabled, props.component),
        {
          to: href,
          href,
          children: props.children,
          className,
          ref: ref as MutableRefObject<HTMLAnchorElement>,
          ...routerLinkProps,
        },
      );
    }

    if (isLink) {
      return (
        <Button
          ref={ref as MutableRefObject<HTMLAnchorElement>}
          className={className}
          component="a"
          endIcon={endIcon}
          href={href}
          rel="noopener noreferrer"
          role="link"
          target="_blank"
          variant={variant}
          onClick={onClick}
          {...(props as any)}
        />
      );
    }

    return (
      <Button
        ref={ref as MutableRefObject<HTMLAnchorElement>}
        className={cx(className, match && activeClassName)}
        component={RouterLink}
        endIcon={endIcon}
        to={href}
        variant={variant}
        onClick={onClick}
        {...(props as any)}
      />
    );
  },
);

NavLink.displayName = 'NavLink';
