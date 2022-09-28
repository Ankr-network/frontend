import { makeStyles } from '@material-ui/core';

export const useReferralsTableStyles = makeStyles(
  theme => ({
    thContent: {
      display: 'flex',
      alignItems: 'center',
    },

    simpleText: {
      fontSize: 14,
      fontWeight: 400,
    },

    icon: {
      width: 32,
      height: 32,
    },

    amount: {
      alignItems: 'flex-end',

      [theme.breakpoints.up('md')]: {
        alignItems: 'inherit',
      },
    },
  }),
  { index: 1 },
);
