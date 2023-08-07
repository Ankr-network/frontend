import { makeStyles } from 'tss-react/mui';

export const useBlockchainIconStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: theme.spacing(3.5),
  },
  icon: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    marginLeft: theme.spacing(-2),
  },
  more: {
    color: theme.palette.text.secondary,
    display: 'inline-flex',
    marginLeft: theme.spacing(2),
  },
}));
