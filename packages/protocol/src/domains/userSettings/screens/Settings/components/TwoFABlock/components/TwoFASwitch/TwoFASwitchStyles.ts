import { makeStyles } from 'tss-react/mui';

export const useTwoFASwitchStyles = makeStyles<void, 'switchTrack'>()(
  (theme, _params, classes) => ({
    root: {
      gap: theme.spacing(2),
    },
    switchChecked: {
      [`+ .${classes.switchTrack}`]: {
        backgroundColor: theme.palette.primary.main,
      },
    },
    switchTrack: {
      backgroundColor: theme.palette.background.default,
    },
    label: {
      letterSpacing: '-0.01em',
      color: theme.palette.text.primary,

      fontWeight: 700,
      fontSize: 16,
      lineHeight: '24px',
    },
  }),
);
