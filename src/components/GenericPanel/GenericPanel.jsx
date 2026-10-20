import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Award, Download , IdCard} from 'lucide-react';
import Input from '../screens/components/Input/Index';
import StatusModal from '../common/statusWarning';
import { getUserId } from '../../context/LocalStorage';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import styles from './GenericPanel.module.css';
import AlertModal from '../AlertModal/AlertModal';
import Footer from '../Footer/Footer';
import { Link2, Users, BotIcon, Check, X, CircleUser, AlertCircle, LogOut, ShieldAlert } from 'lucide-react';
import { logout, getUserNameFromLoginSession, getUserEmailFromLoginSession } from '../../services/api';
import NotificationForm from '../NotificationForm/NotificationForm';
import WhatsAppStatusModal from '../WSMessage/components/WhatsAppStatusModal';
import DrawPanel from '../screens/components/DrawPanel';
import ToggleCard from '../screens/components/ToggleCard';
import MenuPopover from '../screens/components/Material-UI/Components/MenuPopover';
import Button from '../screens/components/Button';
import ModalTooltip from '../ModalTooltip/ModalTooltip';

import { Sidebar as ProSidebar } from 'anteriority-ui';
import { Badge } from 'anteriority-ui';

import { GENERIC_PANEL_TEXT } from '../../constants/TEXT';
import { getUserRole, getDisplayRoleName, getDefaultMenus, getUserPermissions, filterMenuByPermissions, resolveMenuFromCatalog } from './Routes';
import { syncStorageName, buildSidebarData, generateCertificatePdf, triggerFileDownload } from './utils';
import { fetchUserProfile, updateUserProfile } from '../../redux/slices/userSlice';
import { CustomerAndPetsForm } from '../../pages/DoctorSystem/CreateCustomerAndPets/CustomerAndPets';
import InputWithIcon from '../screens/components/Material-UI/Components/InputWithIcon/Index';
import EditProfileForm from '../EditProfile/EditProfile';
import CreatedUser from '../../pages/AdminSystem/CreatedUser';
import usePermissionsCatalog from '../../hooks/usePermissionsCatalog';
import Loading from '../screens/components/Loading/Index';
import UserAvatar from '../screens/components/Profile/Avatar/Index';
import Container from '../screens/components/Container';
import TopBar from '../TopBar/TopBar';

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
  paginationProps = {},
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  sidebarLoading = false
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationFormData, setNotificationFormData] = useState({});
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [currentUserName, setCurrentUserName] = useState(() => getUserNameFromLoginSession());
  const [globalApiError, setGlobalApiError] = useState(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFilename, setPdfFilename] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(() => {
    return localStorage.getItem('user_avatar_url') || '';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(!hasLoadedOnce);
  const [fadeOverlay, setFadeOverlay] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const { byKey: permissionsCatalog, loading: permissionsCatalogLoading } = usePermissionsCatalog();

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
    if (role === 'client') {
      hasLoadedOnce = true;
      setFadeOverlay(true);
      setShowOverlay(false);
      return;
    }
    (async () => {
      try {
        const data = await dispatch(fetchUserProfile()).unwrap();
        if (!mounted) return;
        if (data) {
          const fullName = data.name || data.nombre || null;
          if (fullName) {
            const firstName = String(fullName).trim().split(/\s+/)[0];
            setCurrentUserName(firstName);
            syncStorageName(firstName);
          }
          const avatarUrl = data.avatarUrl || data.avatar_url || data.avatar || null;
          if (avatarUrl) {
            setCurrentAvatar(avatarUrl);
            localStorage.setItem('user_avatar_url', avatarUrl);
          } else {
            setCurrentAvatar('');
            localStorage.removeItem('user_avatar_url');
          }
          if (data.permissions) {
            sessionStorage.setItem('user_permissions', JSON.stringify(data.permissions));
          } else {
            sessionStorage.removeItem('user_permissions');
          }
        }
      } catch (err) {
        console.error('Error cargando perfil inicial:', err);
      } finally {
        if (mounted) setProfileLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, [dispatch]);

  // El overlay no debe soltarse hasta que el perfil Y el catálogo de permisos estén
  // listos: si solo esperara al perfil, el contenido del módulo queda visible con el
  // sidebar todavía vacío mientras /Permissions sigue en vuelo.
  React.useEffect(() => {
    if (role === 'client' || !profileLoaded || permissionsCatalogLoading) return;
    let mounted = true;
    hasLoadedOnce = true;
    setFadeOverlay(true);
    const timeoutId = setTimeout(() => {
      if (mounted) setShowOverlay(false);
    }, 500);
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [role, profileLoaded, permissionsCatalogLoading]);

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
    if (role === 'client') return false;
    return !sessionStorage.getItem('welcomeShown');
  });

  const dismissWelcome = () => {
    sessionStorage.setItem('welcomeShown', 'true');
    setShowWelcome(false);
  };

  const actualRole = getUserRole() || role;
  const defaultMenus = getDefaultMenus({ setShowNotificationModal, setShowWhatsAppModal, setShowCreateClientModal, setShowCreateUserModal });

  const toggleMenu = (label) => {
    setExpandedMenus(prev => {
      const newState = { ...prev, [label]: !prev[label] };
      sessionStorage.setItem('expandedMenus', JSON.stringify(newState));
      return newState;
    });
  };

  const rawItems = menuItems || defaultMenus[actualRole] || defaultMenus.user;
  const permittedItems = filterMenuByPermissions(rawItems, getUserPermissions());
  const items = resolveMenuFromCatalog(permittedItems, permissionsCatalog);
  const { groups, activeId } = buildSidebarData({ items, searchValue, pathname: location.pathname });

  const userEmail = getUserEmailFromLoginSession();
  const userObj = role !== 'client' && userEmail ? { email: userEmail, avatarUrl: currentAvatar } : null;
  const userMenuItems = [
    {
      id: 'logout-btn',
      label: 'Cerrar sesión',
      icon: LogOut,
      variant: 'danger',
      onClick: () => setShowLogoutModal(true)
    }
  ];

  const handleAvatarUpdateSuccess = (newName, newAvatarUrl) => {
    if (newName) {
      setCurrentUserName(newName);
      syncStorageName(newName);
      dispatch(updateUserProfile({ name: newName, nombre: newName }));
    }
    if (newAvatarUrl) {
      setCurrentAvatar(newAvatarUrl);
      localStorage.setItem('user_avatar_url', newAvatarUrl);
      dispatch(updateUserProfile({ avatarUrl: newAvatarUrl }));
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

  const generateCertificate = () => {
    setGeneratingPdf(true);
    setPdfError(null);

    const id = getUserId();
    if (!id) {
      setPdfError('ID de usuario no encontrado en la sesión.');
      setGeneratingPdf(false);
      return;
    }

    generateCertificatePdf(id)
      .then(({ url, filename }) => {
        setPdfUrl(url);
        setPdfFilename(filename);
      })
      .catch((err) => {
        console.error(err);
        setPdfError(err?.message || 'Error al generar el certificado.');
      })
      .finally(() => {
        setGeneratingPdf(false);
      });
  };

  const handleDownloadPdf = () => {
    setIsPdfModalOpen(true);
    setPdfUrl(null);
    setPdfFilename('');
    setGeneratingPdf(true);
    setPdfError(null);
    generateCertificate();
  };

  const downloadPdfFile = () => {
    if (!pdfUrl) return;
    triggerFileDownload(pdfUrl, pdfFilename || `certificado_${getUserId() || 'usuario'}.pdf`);
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setPdfFilename('');
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

      {globalApiError && role !== 'client' && (
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
        <ProSidebar
          groups={groups}
          activeId={activeId}
          onSelect={handleNavigate}
          collapsible={true}
          loading={sidebarLoading || showOverlay}
          headerContent={<div className={styles.brandText}>{menuTitle}</div>}
          user={userObj}
          userMenuItems={userMenuItems}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className={styles.mainWrapper}>

          <TopBar
            styles={styles}
            currentAvatar={currentAvatar}
            currentUserName={currentUserName}
            displayRoleName={getDisplayRoleName(actualRole)}
            onEditProfileClick={() => setShowEditProfileModal(true)}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            role={role}
          />

          <main className={styles.contentArea}>
            <Container
              showPagination={showPagination}
              paginationCount={paginationCount}
              paginationPage={paginationPage}
              onPaginationChange={onPaginationChange}
              paginationProps={paginationProps}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={onPageSizeChange}
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
                  <div className={styles.dashboardAvatarWrap} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <UserAvatar 
                      src={currentAvatar} 
                      name={currentUserName} 
                      size={140} 
                    />
                    <Button
                      size={Button.SIZES.SMALL}
                      variant={Button.VARIANTS.OUTLINE}
                      onClick={handleDownloadPdf}
                      icon={IdCard}
                      style={{ marginTop: '4px' }}
                    >
                      Descargar Certificado
                    </Button>
                  </div>
                )}
              </div>
              <div className={styles.extraContent}>{children}</div>
            </Container>
            <Footer />
          </main>
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
          showActions={true}
          formId="notification-form"
          confirmText="Crear Notificación"
          cancelText="Cancelar"
          showCountdown={true}
          progressMode="form"
          formData={notificationFormData}
          requiredFields={['title', 'message', 'type', 'priority', 'origin', 'destination']}
          loading={notificationLoading}
        >
          <NotificationForm
            onSuccess={() => setShowNotificationModal(false)}
            onClose={() => setShowNotificationModal(false)}
            onLoading={setNotificationLoading}
            onFormChange={setNotificationFormData}
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

        <AlertModal
          open={isPdfModalOpen}
          title="Certificado Profesional"
          onClose={handleClosePdfModal}
          onConfirm={pdfUrl ? downloadPdfFile : generateCertificate}
          confirmText={pdfUrl ? "Descargar" : "Reintentar"}
          cancelText={pdfUrl ? "Cerrar" : "Cancelar"}
          hideActions={generatingPdf}
          showWarningIcon={false}
        >
          {generatingPdf && (
            <div style={{ padding: '20px 0' }}>
              <Loading text="Generando certificado, por favor espere..." />
            </div>
          )}
          {pdfError && (
            <p style={{ color: 'var(--red-primary, #dc2626)', textAlign: 'center', margin: '20px 0' }}>
              {pdfError}
            </p>
          )}
          {pdfUrl && (
            <iframe 
              src={pdfUrl} 
              title="Certificado" 
              width="100%" 
              height="450px" 
              style={{ border: 'none', borderRadius: '4px', marginTop: '10px' }} 
            />
          )}
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

        <DrawPanel
          isOpen={showCreateClientModal}
          onClose={() => setShowCreateClientModal(false)}
          title="Crear cliente y mascota"
          width="500px"
          showActions={false}
          dynamicFooter
        >
          <CustomerAndPetsForm
            onCreated={() => {
              setShowCreateClientModal(false);
            }}
            onCancel={() => setShowCreateClientModal(false)}
          />
        </DrawPanel>

        <DrawPanel
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          title="Crear usuario"
          width="420px"
          showActions={false}
          dynamicFooter
        >
          <CreatedUser
            isOpen={showCreateUserModal}
            onClose={() => setShowCreateUserModal(false)}
          />
        </DrawPanel>
      </div>
    </>
  );
}

export default GenericPanel;