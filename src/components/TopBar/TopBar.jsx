import React from 'react';
import { TopBar as AnteriorityTopBar } from 'anteriority-ui';
import { BellPlus, Mail, Settings, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationsBell from './components/NotificationsBell';
import MessagesBell from './components/MessagesBell';
import useNotificationsContext from '../../hooks/useNotificationsContext';
import useUnreadMessagesCount from '../../hooks/useUnreadMessagesCount';
import useAnchoredPanel from '../../hooks/useAnchoredPanel';
import { getUserRole } from '../GenericPanel/Routes';
import { TOPBAR_TEXT } from './constants';
import styles from './Index.module.css';

const formatBadge = (count) => (count > 0 ? (count > 99 ? '99+' : count) : undefined);

const TopBar = ({
  currentAvatar,
  currentUserName,
  displayRoleName,
  onEditProfileClick,
  onMenuClick,
  extraActions = [],
  role
}) => {
  const navigate = useNavigate();
  const { notifications, loading: notificationsLoading, error: notificationsError } = useNotificationsContext();
  const unreadMessagesCount = useUnreadMessagesCount();
  const { openKey: openPanel, anchorStyle, panelRef, toggle: togglePanel, close: closePanel } = useAnchoredPanel();

  const userRole = role || getUserRole();
  const isAdmin = userRole === 'admin';
  const isClient = userRole === 'client';

  if (isClient) {
    return <AnteriorityTopBar className={`${styles.stickyBar} glass-pink-green`} title="Portal de Clientes" />;
  }

  const unreadNotifications = notifications?.filter((n) => !(n.is_read || n.leida || n.read || n.isRead || n.completada || n.completed)) || [];
  const notificationsCount = unreadNotifications.length > 0 ? unreadNotifications.length : (notifications?.length || 0);

  const actions = [
    {
      key: 'notifications',
      icon: BellPlus,
      tooltip: TOPBAR_TEXT.notifications.title,
      badge: formatBadge(notificationsCount),
      onClick: togglePanel('notifications')
    },
    {
      key: 'messages',
      icon: Mail,
      tooltip: TOPBAR_TEXT.messages.title,
      badge: formatBadge(unreadMessagesCount),
      onClick: togglePanel('messages')
    },
    ...extraActions.map((action) => ({
      key: action.id,
      icon: action.icon,
      tooltip: action.tooltip,
      badge: formatBadge(action.count),
      disabled: action.disabled,
      onClick: action.onClick
    })),
    ...(isAdmin ? [{
      key: 'settings',
      icon: Settings,
      tooltip: 'Ajustes del Sistema',
      onClick: () => navigate('/administracion/configuracion')
    }] : [])
  ];

  const user = { name: currentUserName || displayRoleName, avatarUrl: currentAvatar };
  const userMenuItems = [
    { id: 'edit-profile', label: 'Editar Perfil', icon: Pencil, onClick: onEditProfileClick }
  ];

  return (
    <>
      <AnteriorityTopBar
        className={`${styles.stickyBar} glass-pink-green`}
        actions={actions}
        user={user}
        userMenuItems={userMenuItems}
        actionBgColor="transparent"
        onMenuClick={onMenuClick}
      />

      <NotificationsBell
        isOpen={openPanel === 'notifications'}
        anchorStyle={openPanel === 'notifications' ? anchorStyle : null}
        panelRef={panelRef}
        notifications={notifications}
        loading={notificationsLoading}
        error={notificationsError}
      />
      <MessagesBell
        isOpen={openPanel === 'messages'}
        anchorStyle={openPanel === 'messages' ? anchorStyle : null}
        panelRef={panelRef}
        onRequestClose={closePanel}
      />
    </>
  );
};

export default TopBar;
