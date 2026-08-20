import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Award, Download , IdCard} from 'lucide-react';
import Input from '../screens/components/Input/Index';
import StatusModal from '../common/statusWarning';
import { getUserId } from '../../context/LocalStorage';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import styles from './GenericPanel.module.css';
import AlertModal from '../AlertModal/AlertModal';
import Footer from '../Footer/Footer';
import { Link2, Users, BotIcon, Check, X, CircleUser, AlertCircle, LogOut, ShieldAlert } from 'lucide-react';
import { logout, getUserNameFromLoginSession } from '../../services/api';
import { getCredencialPdf } from '../../services/api/pdf';
import { getText } from '../../constants';
import NotificationForm from '../NotificationForm/NotificationForm';
import WhatsAppStatusModal from '../WSMessage/components/WhatsAppStatusModal';
import DrawPanel from '../screens/components/DrawPanel';
import { renderIcon } from '../hook/RenderIcon';
import ToggleCard from '../screens/components/ToggleCard';
import MenuPopover from '../screens/components/Material-UI/Components/MenuPopover';
import Button from '../screens/components/Button';
import ModalTooltip from '../ModalTooltip/ModalTooltip';

import { GENERIC_PANEL_TEXT } from '../../constants/TEXT';
import { getUserRole, getDisplayRoleName, getDefaultMenus, getUserPermissions, filterMenuByPermissions } from './Routes';
import { syncStorageName, fetchProfileName } from './utils';
import { CustomerAndPetsForm } from '../../pages/DoctorSystem/CreateCustomerAndPets/CustomerAndPets';
import InputWithIcon from '../screens/components/Material-UI/Components/InputWithIcon/Index';
import EditProfileForm from '../EditProfile/EditProfile';
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [searchValue, setSearchValue] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
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
    if (role === 'client') {
      hasLoadedOnce = true;
      setFadeOverlay(true);
      setShowOverlay(false);
      return;
    }
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
          if (profile.permissions) {
            sessionStorage.setItem('user_permissions', JSON.stringify(profile.permissions));
          } else {
            sessionStorage.removeItem('user_permissions');
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
    if (role === 'client') return false;
    return !sessionStorage.getItem('welcomeShown');
  });

  const dismissWelcome = () => {
    sessionStorage.setItem('welcomeShown', 'true');
    setShowWelcome(false);
  };

  const actualRole = getUserRole() || role;
  const defaultMenus = getDefaultMenus({ setShowNotificationModal, setShowWhatsAppModal, setShowCreateClientModal });

  const toggleMenu = (label) => {
    setExpandedMenus(prev => {
      const newState = { ...prev, [label]: !prev[label] };
      sessionStorage.setItem('expandedMenus', JSON.stringify(newState));
      return newState;
    });
  };

  const rawItems = menuItems || defaultMenus[actualRole] || defaultMenus.user;
  const items = filterMenuByPermissions(rawItems, getUserPermissions());
  const filteredItems = items.filter(it =>
    it.label?.toLowerCase().includes(searchValue.toLowerCase()) ||
    (it.subItems && it.subItems.some(sub => sub.label?.toLowerCase().includes(searchValue.toLowerCase())))
  );

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

  const generateCertificate = () => {
    setGeneratingPdf(true);
    setPdfError(null);
    
    const id = getUserId();
    if (!id) {
      setPdfError('ID de usuario no encontrado en la sesión.');
      setGeneratingPdf(false);
      return;
    }
    
    getCredencialPdf(id)
      .then((res) => {
        const { blob, filename } = res || {};
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setPdfFilename(filename || '');
        } else {
          throw new Error('No se pudo obtener el archivo de certificado.');
        }
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
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfFilename || `certificado_${getUserId() || 'usuario'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
          <div className={styles.sidebarHeader}>
            {!isCollapsed && <div className={styles.brandText}>{menuTitle}</div>}
            <Button
              circle
              size="small"
              variant={Button.VARIANTS.GHOST}
              className={styles.toggleBtn}
              onClick={() => {
                setIsCollapsed(prev => {
                  const next = !prev;
                  localStorage.setItem('sidebar_collapsed', String(next));
                  return next;
                });
              }}
              color="transparent"
              style={{ minWidth: '0 !important' }}
            >
              <ModalTooltip 
                key={isCollapsed}
                text={isCollapsed ? 'Abrir' : 'Cerrar'} 
                position="bottom"
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </ModalTooltip>
            </Button>
          </div>

          {sidebarLoading || showOverlay ? (
            <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
              <Loading size="medium" text={isCollapsed ? "" : "Cargando"} />
            </div>
          ) : (
            <nav className={styles.sidebarNav}>
              {items.length === 0 ? (
                <div className={styles.noPermissionsMessage}>
                  <ShieldAlert size={24} className={styles.noPermissionsIcon} />
                  <span>{isCollapsed ? "Sin permisos" : "Sin permisos asignados"}</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className={styles.noResultsMessage}>
                  {isCollapsed ? "No hay" : "No se encontraron resultados"}
                </div>
              ) : (
                filteredItems.map((it) => {
                  const hasSubItems = it.subItems && it.subItems.length > 0;

                  return (
                    <div key={it.label} style={{ width: '100%' }}>
                      {hasSubItems ? (
                        <MenuPopover 
                          item={it} 
                          styles={styles} 
                          renderIcon={renderIcon} 
                          onNavigate={handleNavigate} 
                          isCollapsed={isCollapsed}
                        />
                      ) : (
                        <Button
                          variant={Button.VARIANTS.GHOST}
                          color="inherit"
                          className={`${styles.navItem} ${location.pathname === it.path ? styles.activeNavItem : ''}`}
                          onClick={() => handleNavigate(it)}
                          style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', textTransform: 'none' }}
                          title={isCollapsed ? it.label : undefined}
                        >
                          {renderIcon(it.icon, styles.icon)}
                          {!isCollapsed && <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>}
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </nav>
          )}

          {role !== 'client' && (
            <div className={styles.sidebarFooter}>
              <Button
                color={Button.COLORS.RED}
                size={Button.SIZES.MEDIUM}
                variant={Button.VARIANTS.OUTLINE}
                onClick={() => setShowLogoutModal(true)}
                icon={LogOut}
                fullWidth={!isCollapsed}
                circle={isCollapsed}
                title={isCollapsed ? "Cerrar sesión" : undefined}
                style={isCollapsed ? { margin: '0 auto', display: 'flex' } : {}}
              >
                {!isCollapsed && "Cerrar sesión"}
              </Button>
            </div>
          )}
        </aside>

        <div className={styles.mainWrapper}>
          
          <TopBar 
            styles={styles}
            currentAvatar={currentAvatar}
            currentUserName={currentUserName}
            displayRoleName={getDisplayRoleName(actualRole)}
            onEditProfileClick={() => setShowEditProfileModal(true)}
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
        >
          <CustomerAndPetsForm
            onCreated={() => {
              setShowCreateClientModal(false);
            }}
            onCancel={() => setShowCreateClientModal(false)}
          />
        </DrawPanel>
      </div>
    </>
  );
}

export default GenericPanel;