import { makeStyles } from 'tss-react/mui';

export const useRevokeInvitationDialogStyles = makeStyles()(theme => ({
  root: {
    width: 600,
  },
  description: {
    marginBottom: theme.spacing(8),
  },
  removeButton: {
    marginBottom: theme.spacing(3),
  },
}));
