import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';
import { uid } from 'react-uid';

import { useAppSelector } from 'store/useAppSelector';
import {
  INotificationProps,
  notificationSlice,
} from '../../store/notificationSlice';
import { tHTML } from '@ankr.com/common';
import { useNotificationStyles } from './NotificationStyles';

interface IItemProps {
  data: INotificationProps;
  onClose: (key?: any) => void;
}

function Item({ data, onClose }: IItemProps) {
  const { key, severity, message, isHTML } = data;

  const { classes } = useNotificationStyles();

  const handleClose = useCallback(() => {
    onClose(key);
  }, [key, onClose]);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      open
      {...data}
    >
      <Alert severity={severity} onClose={handleClose} className={classes.root}>
        {isHTML ? tHTML(message as string) : message}
      </Alert>
    </Snackbar>
  );
}

export const Notifications = () => {
  const notifications = useAppSelector(state => state.notifications.queue);
  const dispatch = useDispatch();

  const handleClose = (id: string) => {
    dispatch(notificationSlice.actions.hideNotification(id));
  };

  return (
    <>
      {notifications.map(item => (
        <Item key={uid(item)} data={item} onClose={handleClose} />
      ))}
    </>
  );
};
