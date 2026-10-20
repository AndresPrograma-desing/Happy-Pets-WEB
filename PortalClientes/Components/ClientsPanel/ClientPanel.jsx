import React, { useState } from 'react';
import { LogOut, BellPlus, Camera } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../../src/components/GenericPanel/GenericPanel.module.css';
import topBarStyles from '../../../src/components/TopBar/Index.module.css';
import Footer from '../../../src/components/Footer/Footer';
import { Container, TopBar as AnteriorityTopBar, Sidebar } from 'anteriority-ui';
import useAnchoredPanel from '../../../src/hooks/useAnchoredPanel';
import ClientNotificationsBell from '../ClientNotificationsBell';

const formatBadge = (count) => (count > 0 ? (count > 99 ? '99+' : count) : undefined);

export default function ClientPanel({
  title,
  message,
  children,
  menuTitle = 'Portal Clientes',
  menuItems = [],
  activeTab,
  onTabChange,
  onLogout,
  notifications = [],
  onNotificationConfirm,
  onNotificationDecline,
  onNotificationDismiss,
  userName,
  userAvatarUrl,
  onChangeAvatarClick
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { openKey: openPanel, anchorStyle, panelRef, toggle: togglePanel, close: closePanel } = useAnchoredPanel();

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  const actions = [
    {
      key: 'notifications',
      icon: BellPlus,
      tooltip: 'Notificaciones',
      badge: formatBadge(unreadNotifications.length),
      onClick: togglePanel('notifications')
    }
  ];

  const user = { name: userName, avatarUrl: userAvatarUrl };
  const userMenuItems = onChangeAvatarClick
    ? [{ id: 'change-avatar', label: 'Cambiar foto de perfil', icon: Camera, onClick: onChangeAvatarClick }]
    : [];

  const handleNavigate = (item) => {
    if (!item) return;
    if (item.onClick) return item.onClick();
    if (onTabChange && item.id) {
      onTabChange(item.id);
    } else if (item.path) {
      if (location.pathname === item.path) return;
      navigate(item.path);
    }
  };

  const activeId = menuItems.find((it) => activeTab === it.id || location.pathname === it.path)?.id;

  const sidebarUserMenuItems = onLogout
    ? [{ id: 'logout', label: 'Salir del Portal', icon: LogOut, variant: 'danger', onClick: onLogout }]
    : [];

  return (
    <div className={styles.layoutContainer}>
      <Sidebar
        groups={[{ items: menuItems }]}
        activeId={activeId}
        onSelect={handleNavigate}
        collapsible={true}
        headerContent={<div className={styles.brandText}>{menuTitle}</div>}
        user={userName ? { email: userName } : null}
        userMenuItems={sidebarUserMenuItems}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Wrapper */}
      <div className={styles.mainWrapper}>
        <AnteriorityTopBar
          className={`${topBarStyles.stickyBar} glass-pink-green`}
          title="Portal de Clientes"
          actions={actions}
          user={user}
          userMenuItems={userMenuItems}
          actionBgColor="transparent"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <ClientNotificationsBell
          isOpen={openPanel === 'notifications'}
          anchorStyle={openPanel === 'notifications' ? anchorStyle : null}
          panelRef={panelRef}
          notifications={notifications}
          onConfirmClick={onNotificationConfirm}
          onDeclineClick={onNotificationDecline}
          onDismiss={onNotificationDismiss}
          onRequestClose={closePanel}
        />

        {/* Content Area */}
        <main className={styles.contentArea}>
          <Container
          showPagination={false}
          wattermark={false}
          >
            <div className={styles.cardHeaderFlex}>
              <div className={styles.cardHeaderInfo}>
                {title && <h1 className={styles.mainTitle}>{title}</h1>}
                {message && <p className={styles.mainMessage}>{message}</p>}
              </div>
            </div>
            <div className={styles.extraContent}>{children}</div>
          </Container>
          <Footer />
        </main>
      </div>
    </div>
  );
}
