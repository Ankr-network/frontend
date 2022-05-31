import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export const useMobileStyles = makeStyles<Theme>(theme => ({
  title: {
    fontSize: 24,
    marginBottom: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(2.5, 0),
  },
  plusIcon: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },
  plusBtn: {
    border: 'none',
  },
  list: {
    overflow: 'hidden',
    transition: 'max-height 375ms cubic-bezier(0, 1, 0, 1)',
    maxHeight: 0,
    paddingBottom: 0,
    '& > li': {
      alignItems: 'flex-start',

      '&:last-child': {
        paddingBottom: 0,
      },
    },
    '& $listIcon': {
      marginLeft: theme.spacing(1),
    },
  },
  listOpened: {
    maxHeight: 1000,
    transition: 'max-height 375ms ease-in-out',
  },
  listIcon: {},
  unblockBtn: {
    color: theme.palette.primary.main,
    marginTop: theme.spacing(1),
    padding: 0,
    background: 'none',
    '&:hover': {
      background: 'none',
      color: theme.palette.primary.main,
    },
    height: 'auto',
  },
  unblockBtnIcon: {
    lineHeight: 1,
    fontSize: '14px !important',
  },
  unlockBtnTitle: {
    fontSize: 19,

    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
    },
  },
}));
