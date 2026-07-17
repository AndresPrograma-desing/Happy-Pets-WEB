import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import StatusModal from '../common/statusWarning';
import { getUserId } from '../../context/LocalStorage';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import styles from './GenericPanel.module.css';
import AlertModal from '../AlertModal/AlertModal';
import Footer from '../Footer/Footer';
import { BellPlus, Link2, Users, BotIcon, Mail, Pencil, Check, X, CircleUser, AlertCircle, LogOut } from 'lucide-react';
import { logout, getUserNameFromLoginSession } from '../../services/api';
import { getText } from '../../constants';
import NotificationForm from '../NotificationForm/NotificationForm';
import WhatsAppStatusModal from '../WSMessage/components/WhatsAppStatusModal';
import DrawPanel from '../screens/components/DrawPanel';
import { renderIcon } from '../hook/RenderIcon';
import ToggleCard from '../screens/components/ToggleCard';
import MenuPopover from '../screens/components/Material-UI/Components/MenuPopover';
import Button from '../screens/components/Button';

import { GENERIC_PANEL_TEXT } from '../../constants/TEXT';
import { getUserRole, getDisplayRoleName, getDefaultMenus } from './Routes';
import { syncStorageName, fetchProfileName } from './utils';
import InputWithIcon from '../screens/components/Material-UI/Components/InputWithIcon/Index';
import EditProfileForm from '../EditProfile/EditProfile';
import Loading from '../screens/components/Loading/Index';
import UserAvatar from '../screens/components/Profile/Avatar/Index';
import Container from '../screens/components/Container';

let hasLoadedOnce = false;

function GenericPanel({ 
  title, 
  message, 
  children, 
  menuTitle = 'Panel', 
  role = 'user', 
  menuItems,
  showDashboardAvatar = false,
  showPagination = false,
  paginationCount = 10,
  paginationPage = 1,
  onPaginationChange,
  paginationProps = {}
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [currentUserName, setCurrentUserName] = useState(() => getUserNameFromLoginSession());
  const [globalApiError, setGlobalApiError] = useState(null);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(() => {
    return localStorage.getItem('user_avatar_url') || '';
  });

  const [showOverlay, setShowOverlay] = useState(!hasLoadedOnce);
  const [fadeOverlay, setFadeOverlay] = useState(false);

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
      try {
        const profile = await fetchProfileName();
        if (!mounted) return;
        if (profile) {
          if (profile.name) {
            setCurrentUserName(profile.name);
            syncStorageName(profile.name);
          }
          if (profile.avatarUrl) {
            setCurrentAvatar(profile.avatarUrl);
            localStorage.setItem('user_avatar_url', profile.avatarUrl);
          } else {
            setCurrentAvatar('');
            localStorage.removeItem('user_avatar_url');
          }
        }
      } catch (err) {
        console.error('Error cargando perfil inicial:', err);
      } finally {
        if (mounted) {
          hasLoadedOnce = true;
          setFadeOverlay(true);
          setTimeout(() => {
            if (mounted) setShowOverlay(false);
          }, 500);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

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



  const handleAvatarUpdateSuccess = (newName, newAvatarUrl) => {
    if (newName) {
      setCurrentUserName(newName);
      syncStorageName(newName);
    }
    if (newAvatarUrl) {
      setCurrentAvatar(newAvatarUrl);
      localStorage.setItem('user_avatar_url', newAvatarUrl);
    }
    setShowEditProfileModal(false);
  };

  const handleNavigate = (item) => {
    if (!item) return;
    if (item.onClick) return item.onClick();
    if (item.newTab) return window.open(`${window.location.origin}${item.path}`, '_blank', 'noopener,noreferrer');
    if (item.path) {
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
                    <Button
                      variant={Button.VARIANTS.GHOST}
                      color="inherit"
                      className={styles.navItem}
                      onClick={() => handleNavigate(it)}
                      style={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {renderIcon(it.icon, styles.icon)}
                      <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </nav>

          <div className={styles.sidebarFooter}>
            <Button
              color={Button.COLORS.RED}
              size={Button.SIZES.MEDIUM}
              variant={Button.VARIANTS.OUTLINE}
              onClick={() => setShowLogoutModal(true)}
              icon={LogOut}
              fullWidth
            >
              Cerrar sesión
            </Button>
          </div>
        </aside>

        <div className={styles.mainWrapper}>
          <header className={styles.topBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserAvatar 
                  src={currentAvatar} 
                  name={currentUserName} 
                  size={32} 
                  viewable={true}
                />
                <div className={styles.userBadge}>
                  {currentUserName || getDisplayRoleName(actualRole)}
                </div>
                 <Button 
                   variant={Button.VARIANTS.GHOST}
                   onClick={() => setShowEditProfileModal(true)}
                   style={{ minWidth: 0, padding: '4px', color: '#ffffff' }}
                   aria-label="Editar perfil"
                 >
                   <Pencil size={14} />
                 </Button>
              </div>
          </header>

          <main className={styles.contentArea}>
            <Container
              showPagination={showPagination}
              paginationCount={paginationCount}
              paginationPage={paginationPage}
              onPaginationChange={onPaginationChange}
              paginationProps={paginationProps}
            >
              {showOverlay && (
                <div className={`${styles.globalLoaderOverlay} ${fadeOverlay ? styles.fadeOut : ''}`}>
                  <Loading size="giant" text="Cargando panel" />
                </div>
              )}
              <div className={styles.cardHeaderFlex}>
                <div className={styles.cardHeaderInfo}>
                  {title && <h1 className={styles.mainTitle}>{title}</h1>}
                  {message && <p className={styles.mainMessage}>{message}</p>}
                </div>
                {showDashboardAvatar && (
                  <div className={styles.dashboardAvatarWrap}>
                    <UserAvatar 
                      src={currentAvatar} 
                      name={currentUserName} 
                      size={140} 
                    />
                  </div>
                )}
              </div>
              <div className={styles.extraContent}>{children}</div>
            </Container>
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

        <DrawPanel
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          title="Editar Avatar"
          width="400px"
          showActions={true}
          confirmText="Guardar Cambios"
          cancelText="Cancelar"
          formId="editProfileForm"
        >
          <EditProfileForm
            formId="editProfileForm"
            currentName={currentUserName || getDisplayRoleName(actualRole)}
            currentAvatarUrl={currentAvatar}
            onSuccess={handleAvatarUpdateSuccess}
          />
        </DrawPanel>
      </div>
    </>
  );
}

export default GenericPanel;