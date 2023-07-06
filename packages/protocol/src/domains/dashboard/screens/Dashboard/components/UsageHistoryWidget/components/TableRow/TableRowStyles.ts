import { makeStyles } from 'tss-react/mui';

export interface UseTableRowStylesParams {
  isFirst: boolean;
  length: number;
  opacity: number;
}

export const useTableRowStyles = makeStyles<UseTableRowStylesParams>()(
  (theme, { isFirst, length, opacity }) => ({
    row: {
      borderBottom: `1px solid ${theme.palette.grey[100]}`,
      display: 'flex',

      '&:last-of-type': {
        [theme.breakpoints.up('xl')]: {
          borderBottom: 'none',
        },
      },
    },
    cell: {
      width: '33%',
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1, 0),
      color: isFirst ? theme.palette.primary.main : theme.palette.text.primary,
      fontWeight: isFirst ? 700 : 400,
      fontSize: 12,
    },
    line: {
      width: `${length}%`,
      height: 8,
      borderRadius: 8,
      backgroundColor: theme.palette.primary.main,
      opacity,
    },
  }),
);
