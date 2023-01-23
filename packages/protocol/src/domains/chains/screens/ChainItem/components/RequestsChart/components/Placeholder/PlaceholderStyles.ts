import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

export const usePlaceholderStyles = makeStyles()((theme: Theme) => ({
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    width: '100%',
    height: '100%',
  },
  title: {
    marginBottom: theme.spacing(2 * 2),

    color: theme.palette.text.primary,
    letterSpacing: '-0.01em',

    fontWeight: 700,
    fontSize: theme.spacing(2 * 3),
    lineHeight: theme.spacing(2 * 4),
  },
  subtitle: {
    maxWidth: theme.spacing(2 * 75),

    color: theme.palette.grey[600],
    textAlign: 'center',

    fontWeight: 400,
    fontSize: 16,
    lineHeight: theme.spacing(2 * 3),
  },
}));
