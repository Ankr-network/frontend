import { makeStyles } from 'tss-react/mui';

export const useColumnsStyles = makeStyles()(theme => ({
  header: {
    height: theme.spacing(6),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  tooltip: {
    cursor: 'pointer',

    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
}));
