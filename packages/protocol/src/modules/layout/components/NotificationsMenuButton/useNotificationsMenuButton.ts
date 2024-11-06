import { useAuth } from 'domains/auth/hooks/useAuth';
import { useMenu } from 'modules/common/hooks/useMenu';
import { useNotifications } from 'modules/notifications/hooks/useNotifications';

export const useNotificationsMenuButton = () => {
  const { loading: isConnecting } = useAuth();

  const { anchorEl, handleClose, handleOpen, open: isMenuOpened } = useMenu();

  const { notifications: notificationsResponse } = useNotifications({
    skipFetching: true,
    only_unseen: true,
  });
  const notifications = notificationsResponse.notifications;

  return {
    amount: notifications.length,
    isLoading: isConnecting,
    anchorEl,
    handleClose,
    handleOpen,
    isMenuOpened,
  };
};
