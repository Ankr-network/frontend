import { makeStyles, Theme } from '@material-ui/core';
import checkboxChecked from './assets/checkbox-checked.svg';

// TODO: VP provide under theme
export const useStyles = makeStyles<Theme>(theme => ({
  labelActive: {
    fontSize: '14px',
    color: '#356DF3',
  },
  labelStandart: {
    fontSize: '14px',
    color: '#9AA1B0',
  },
  labelDisabled: {
    fontSize: '14px',
    color: '#BFC6D0',
  },
  checkbox: {
    '& input': {
      width: 22,
      height: 22,
    },
    '& input:checked + span': {
      border: '2px solid #356DF3',
    },
    '& input:disabled + span': {
      background: '#E2E8F3',
      border: '2px solid #E2E8F3',
    },
    '& input + span': {
      width: 22,
      height: 22,
      borderRadius: '6px',
      border: '2px solid #BFC6D0',
      '&:before': {
        width: 22,
        height: 22,
        top: '3px',
        left: '2px',
        backgroundImage: `url(${require('../Icons/CheckedIcon.svg').default})`,
      },
    },
  },
  icon: {
    borderRadius: 5,
    width: 16,
    height: 16,
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.primary.main}`,

    'input:hover ~ &': {
      border: `2px solid ${theme.palette.primary.dark}`,
    },
    'input:disabled ~ &': {
      borderColor: theme.palette.action.disabledBackground,
    },
  },
  checkedIcon: {
    backgroundColor: theme.palette.primary.main,

    '&:before': {
      display: 'block',
      width: 12,
      height: 10,
      backgroundImage: `url(${checkboxChecked})`,
      content: '""',

      position: 'relative',
      top: 1,
      backgroundRepeat: 'no-repeat',
    },
    'input:hover ~ &': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));
