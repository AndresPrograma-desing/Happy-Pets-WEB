import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import StatusModal from '../common/statusWarning';
import { getUserId } from '../../context/LocalStorage';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import styles from './GenericPanel.module.css';
import AlertModal from '../AlertModal/AlertModal';
import Footer from '../Footer/Footer';
import { BellPlus, Link2, Users, BotIcon, Mail, Pencil, Check, X, CircleUser, AlertCircle } from 'lucide-react';
import { logout, getUserNameFromLoginSession } from '../../services/api';
import { getText } from '../../constants';
import NotificationForm from '../NotificationForm/NotificationForm';
import WhatsAppStatusModal from '../WSMessage/components/WhatsAppStatusModal';
import DrawPanel from '../screens/components/DrawPanel';
import { renderIcon } from '../hook/RenderIcon';
import ToggleCard from '../screens/components/ToggleCard';
import MenuPopover from '../screens/components/Material-UI/Components/MenuPopover';
import UserEditPopover from '../screens/components/UserEditPopover';
import { GENERIC_PANEL_TEXT } from '../../constants/TEXT';
import { getUserRole, getDisplayRoleName, getDefaultMenus } from './Routes';
import { syncStorageName, fetchProfileName } from './utils';
import InputWithIcon from '../screens/components/Material-UI/Components/InputWithIcon/Index';

function GenericPanel({ title, message, children, menuTitle = 'Panel', role = 'user', menuItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [currentUserName, setCurrentUserName] = useState(() => getUserNameFromLoginSession());
  const [globalApiError, setGlobalApiError] = useState(null);

  React.useEffect(() => {
    const handleApiError = (event) => {
      setGlobalApiError(event.detail?.message || 'Hubo un error en la solicitud');
      setTimeout(() => setGlobalApiError(null), 8000);
    };
    window.addEventListener('api-error', handleApiError);
    return () => window.removeEventListener('api-error', handleApiError);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const actualName = await fetchProfileName();
      if (!mounted) return;
      if (actualName) {
        setCurrentUserName(actualName);
        syncStorageName(actualName);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const isEditingName = Boolean(anchorElUser);
  const [tempUserName, setTempUserName] = useState('');
  const overlayRef = useRef(null);
  const [expandedMenus, setExpandedMenus] = useState(() => {
    try {
      const saved = sessionStorage.getItem('expandedMenus');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem('welcomeShown');
  });

  const dismissWelcome = () => {
    sessionStorage.setItem('welcomeShown', 'true');
    setShowWelcome(false);
  };

  const actualRole = getUserRole() || role;
  const defaultMenus = getDefaultMenus({ setShowNotificationModal, setShowWhatsAppModal });

  const toggleMenu = (label) => {
    setExpandedMenus(prev => {
      const newState = { ...prev, [label]: !prev[label] };
      sessionStorage.setItem('expandedMenus', JSON.stringify(newState));
      return newState;
    });
  };

  const items = menuItems || defaultMenus[actualRole] || defaultMenus.user;

  const handleConfirmEditName = (newName) => {
    syncStorageName(newName);
    setCurrentUserName(newName);
    setAnchorElUser(null);
  };

  const handleNavigate = (item) => {
    if (!item) return;
    if (item.onClick) return item.onClick();
    if (item.newTab) return window.open(`${window.location.origin}${item.path}`, '_blank', 'noopener,noreferrer');
    if (item.path) {
      // Allow navigation if the path is different OR if the state is different
      const currentState = JSON.stringify(location.state || {});
      const targetState = JSON.stringify(item.state || {});
      if (location.pathname === item.path && currentState === targetState) return;
      return navigate(item.path, { state: item.state });
    }
  };

  const confirmLogout = () => {
    logout();
    setLoggedOut(true);
  };

  if (loggedOut) return <Navigate to="/login" replace />;

  const userId = getUserId();
  return (
    <>
      <StatusModal userId={userId} />

      {showWelcome && (
        <ToggleCard
          title={`¡Bienvenido, ${currentUserName || getDisplayRoleName(actualRole)}!`}
          description={GENERIC_PANEL_TEXT.welcomeCard.description}
          icon={Users}
          onClose={dismissWelcome}
          variant="floating"
        />
      )}

      {globalApiError && (
        <ToggleCard
          title="Atención"
          description={globalApiError}
          icon={AlertCircle}
          iconColorVariant="red"
          onClose={() => setGlobalApiError(null)}
          variant="floating"
        />
      )}

      <div className={styles.layoutContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.brandText}>{menuTitle}</div>
          </div>
          <nav
            className={styles.sidebarNav}
            style={{
              overflowY: 'auto',
              flex: 1,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <style>{`
              nav::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {items.map((it) => {
              const hasSubItems = it.subItems && it.subItems.length > 0;
              const isExpanded = expandedMenus[it.label];

              return (
                <div key={it.label} style={{ width: '100%' }}>
                  {hasSubItems ? (
                    <MenuPopover 
                      item={it} 
                      styles={styles} 
                      renderIcon={renderIcon} 
                      onNavigate={handleNavigate} 
                    />
                  ) : (
                    <button
                      className={styles.navItem}
                      onClick={() => handleNavigate(it)}
                    >
                      {renderIcon(it.icon, styles.icon)}
                      <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
              {renderIcon('exit', styles.icon)}
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        <div className={styles.mainWrapper}>
          <header className={styles.topBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={styles.userBadge}>
                  {currentUserName || getDisplayRoleName(actualRole)}
                </div>
                <button 
                  onClick={(e) => {
                    setTempUserName(currentUserName || '');
                    setAnchorElUser(e.currentTarget);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#ffffff' }}
                  aria-label="Editar nombre"
                >
                  <Pencil size={14} />
                </button>
              </div>

              <UserEditPopover
                open={isEditingName}
                anchorEl={anchorElUser}
                onClose={() => setAnchorElUser(null)}
                currentName={currentUserName}
                onSuccess={handleConfirmEditName}
              />
          </header>

          <main className={styles.contentArea}>
            <div className={styles.card}>
              {title && <h1 className={styles.mainTitle}>{title}</h1>}
              {message && <p className={styles.mainMessage}>{message}</p>}
              <div className={styles.extraContent}>{children}</div>
            </div>
          </main>

          <Footer />
        </div>

        <AlertModal
          open={showLogoutModal}
          title="¿Cerrar sesión?"
          message="¿Estás seguro de que deseas salir del sistema?"
          onClose={() => setShowLogoutModal(false)}
          onConfirm={confirmLogout}
        />

        <DrawPanel
          isOpen={showNotificationModal}
          title="Nuevo Ticket de Control"
          onClose={() => setShowNotificationModal(false)}
          width="400px"
          showActions={true}
          formId="notification-form"
          confirmText="Crear Notificación"
          cancelText="Cancelar"
          loading={notificationLoading}
        >
          <NotificationForm
            onSuccess={() => setShowNotificationModal(false)}
            onClose={() => setShowNotificationModal(false)}
            onLoading={setNotificationLoading}
          />
        </DrawPanel>

        <AlertModal
          open={showWhatsAppModal}
          title="Vinculación de WhatsApp"
          onClose={() => setShowWhatsAppModal(false)}
          hideActions={true}
        >
          <WhatsAppStatusModal />
        </AlertModal>
      </div>
    </>
  );
}

export default GenericPanel;