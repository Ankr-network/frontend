import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import { ACCOUNT_MAX_WIDTH } from 'domains/account/screens/AccountDetails/AccountDetailsStyles';

export const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    [theme.breakpoints.down('sm')]: {
      gap: 6,
    },
  },
  amount: {
    paddingTop: theme.spacing(15),
    marginTop: 'auto',
    marginBottom: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginTop: 'unset',
      marginBottom: 'unset',
    },
    [`@media (max-width:${ACCOUNT_MAX_WIDTH}px)`]: {
      paddingTop: 'unset',
    },
  },
  button: {
    width: '100%',

    '&:hover': {
      color: theme.palette.background.paper,
      backgroundColor: theme.palette.primary.dark,
    },
  },
  info: {
    color: theme.palette.text.primary,
    fontSize: 14,
  },
}));
