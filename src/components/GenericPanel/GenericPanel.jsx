import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import StatusModal from '../common/statusWarning';
import { getUserId } from '../../context/LocalStorage';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import styles from './GenericPanel.module.css';
import AlertModal from '../AlertModal/AlertModal';
import Footer from '../Footer/Footer';
import { BellPlus, Link2, Users, BotIcon, Mail } from 'lucide-react';
import { logout, getUserNameFromLoginSession } from '../../services/api';
import { getText } from '../../constants';
import NotificationForm from '../NotificationForm/NotificationForm';
import WhatsAppStatusModal from '../WSMessage/components/WhatsAppStatusModal';
import { renderIcon } from '../hook/RenderIcon';
import ToggleCard from '../screens/components/ToggleCard';
import { GENERIC_PANEL_TEXT } from '../../constants/TEXT';

function GenericPanel({ title, message, children, menuTitle = 'Panel', role = 'user', menuItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [userName] = useState(() => getUserNameFromLoginSession());
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

  const defaultMenus = {
    user: [
      { label: getText("userInterface.menuItemDashboard"), path: '/', icon: 'house' },
      { label: 'Proyectos', path: '/projects', icon: 'service' },
      { label: 'Mensajes', path: '/panel-menssage', icon: 'message' },
    ],
    admin: [
      { label: getText("generalPanelTexts.titleA"), path: '/AdminSystem', icon: 'adminRole' },
      { label: getText("adminInterface.menuItemDashboard"), path: '/AdminSystem/dashboard', icon: 'dashboard' },
      { label: getText("adminInterface.menuItemUsers"), path: '/AdminSystem/users', icon: 'user' },
      { 
        label: getText("adminInterface.menuItemProducts"), icon: 'box',
        subItems: [
          { label: 'Ver productos', path: '/AdminSystem/products', state: { view: 'list' } },
          { label: 'Administrar productos', path: '/AdminSystem/products', state: { view: 'manage' } }
        ]
      },
      { label: getText("generalPanelTexts.optionsNavegations.whatsapp"), icon: <Link2 style={{ stroke: '#ffffff' }} />, onClick: () => setShowWhatsAppModal(true) },
      { label: getText("adminInterface.menuItemMessages"), path: '/panel-menssage', icon: 'message' },
      { label: getText("adminInterface.genericPanelFacturas"), path: '/facturas', icon: 'fileCheck' },
      { label: getText("generalPanelTexts.optionsNavegations.notificationCreated"), icon: <BellPlus style={{ stroke: '#ffffff' }} />, onClick: () => setShowNotificationModal(true) },
      { label: getText("generalPanelTexts.optionsNavegations.clientList"), path: '/clients', icon: <Users style={{ stroke: '#ffffff' }} /> },
      { label: 'Plantillas Emails', path: '/AdminSystem/emails', icon: <Mail style={{ stroke: '#ffffff' }} /> },
      { label: getText("adminInterface.menuItemSettings"), path: '/AdminSystem/settings', icon: 'engranaje' },
    ],
    secretaria: [
      { label: 'Panel', path: '/SecretariaSystem', icon: 'secretariaRole' },
      {
        label: 'Citas', icon: 'calendario',
        subItems: [
          { label: 'Lista de Citas', path: '/citas', state: { role: 'secretaria' } },
          { label: 'Nueva Cita', path: '/citas/crear', state: { role: 'secretaria' } },
          { label: 'Nuevo Usuario', path: '/clientes/crear' }
        ]
      },
      { label: 'Gestion de Recibos', path: '/factura-manager', icon: 'fileText' },
      { label: 'Mensajes', path: '/panel-menssage', icon: 'message' },
      { label: 'Ver Facturas', path: '/facturas', icon: 'fileCheck' },
      { label: 'Generar Reportes', path: '/doctor/recetas', icon: 'clipboardPlus' },
      { label: 'Crear Alerta', icon: <BellPlus style={{ stroke: '#ffffff' }} />, onClick: () => setShowNotificationModal(true) },
    ],
    doctor: [
      { label: 'Panel Médico', path: '/doctor', icon: 'userCita' },
      { label: 'Mis Citas', path: '/citas', icon: 'calendario' },
      { label: 'Historias Clínicas', path: '/doctor/pacientes', icon: 'fileText' },
      { label: 'Generar Receta', path: '/doctor/recetas', icon: 'clipboardPlus' },
      { label: 'Mensajes', path: '/panel-menssage', icon: 'message' },
      { label: 'Ver Facturas', path: '/facturas', icon: 'fileCheck' },
      { label: 'Asistente Virtual', path: '/asistente-virtual', icon: <BotIcon style={{ stroke: '#ffffff' }} />, newTab: true },
      { label: 'Crear Alerta', icon: <BellPlus style={{ stroke: '#ffffff' }} />, onClick: () => setShowNotificationModal(true) },
    ],
  };

  const toggleMenu = (label) => {
    setExpandedMenus(prev => {
      const newState = { ...prev, [label]: !prev[label] };
      sessionStorage.setItem('expandedMenus', JSON.stringify(newState));
      return newState;
    });
  };

  const items = menuItems || defaultMenus[role] || defaultMenus.user;

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
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: '90%',
          maxWidth: '500px',
          animation: 'fadeInDown 0.5s ease-out'
        }}>
          <style>{`
            @keyframes fadeInDown {
              from { opacity: 0; transform: translate(-50%, -20px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
          <div style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', borderRadius: '12px', background: 'white' }}>
            <ToggleCard
              title={`¡Bienvenido, ${userName || (role === 'admin' ? 'Administrador' : role === 'doctor' ? 'Doctor' : role === 'secretaria' ? 'Secretaria' : 'Usuario')}!`}
              description={GENERIC_PANEL_TEXT.welcomeCard.description}
              icon={Users}
              onClose={dismissWelcome}
            />
          </div>
        </div>
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
                  <button
                    className={styles.navItem}
                    onClick={() => {
                      if (hasSubItems) {
                        toggleMenu(it.label);
                      } else {
                        handleNavigate(it);
                      }
                    }}
                  >
                    {renderIcon(it.icon, styles.icon)}
                    <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>
                    {hasSubItems && (
                      <span style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'flex', alignItems: 'center' }}>
                        <ChevronDown size={16} />
                      </span>
                    )}
                  </button>

                  {hasSubItems && isExpanded && (
                    <div className={styles.subMenu}>
                      {it.subItems.map(subIt => (
                        <button
                          key={subIt.label}
                          className={styles.subNavItem}
                          onClick={() => handleNavigate(subIt)}
                        >
                          <span style={{ marginLeft: '1.5rem' }}>{subIt.label}</span>
                        </button>
                      ))}
                    </div>
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
            <div className={styles.userBadge}>
              {userName || (role === 'admin' ? 'Administrador' : role === 'doctor' ? 'Doctor' : role === 'secretaria' ? 'Secretaria' : 'Usuario')}
            </div>
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

        <AlertModal
          open={showNotificationModal}
          title="Nuevo Ticket de Control"
          onClose={() => setShowNotificationModal(false)}
          hideActions={true}
        >
          <NotificationForm
            onSuccess={() => setShowNotificationModal(false)}
            onClose={() => setShowNotificationModal(false)}
          />
        </AlertModal>

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