import { makeStyles } from 'tss-react/mui';

export const useAddNetworkButtonStyles = makeStyles()(theme => ({
  addNetworkChainSelector: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  addNetworkDialog: {
    minWidth: 400,
  },
  placeholder: {
    width: 38,

    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
}));
