import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

export const useMyRewardsStyles = makeStyles<Theme>(theme => ({
  button: {
    position: 'relative',

    '& svg': {
      position: 'absolute',
    },
  },

  projectBox: {
    display: 'inline-flex',

    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },

  noCrowdloanArea: {
    padding: theme.spacing(19, 0, 8, 0),
  },
}));
