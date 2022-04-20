import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles<Theme>(theme => ({
  root: {
    background: theme.palette.background.paper,
    borderRadius: 18,
    padding: theme.spacing(2.5, 3.5),
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `2px solid ${theme.palette.background.default}`,
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: theme.spacing(2),
  },
  left: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing(2.5),
  },
  tooltip: {
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(2),
    },
  },
  text: {
    fontWeight: 600,
  },
  preloaderWrapper: {
    minHeight: 85,
    position: 'relative',
  },
  publicEndpoints: {
    paddingTop: theme.spacing(2),
    borderTop: `2px solid ${theme.palette.background.default}`,
  },
}));
