import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './MenuHamburguesa.module.css'; // Usaremos un nuevo CSS para el layout lateral
import cuStyles from '../GeneralStyles/ButtonsMenu.module.css';
import AlertModal from '../AlertModal/AlertModal';
import { logout } from '../../services/api';
import { getIcon } from '../../assets/icons/ExportIcon/Index';

function Sidebar({ children, menuTitle = "Menú" }) {
  const [loggedOut, setLoggedOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Mantengo tu efecto de mensajes
  useEffect(() => {
    const timer = setTimeout(() => setHasNewMessages(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handler de mensajes original
  const handleOpenMessages = () => {
    setHasNewMessages(false);
    const messagesUrl = `${window.location.origin}/panel-menssage`;
    window.open(messagesUrl, '_blank', 'noopener,noreferrer');
  };

  // Handler de logout original
  const confirmLogout = () => {
    logout();
    setLoggedOut(true);
    setShowLogoutModal(false);
  };

  if (loggedOut) return <Navigate to="/login" replace />;

  return (
    <aside className={styles.sidebarRoot}>
      <div className={styles.sidebarHeader}>
        <h3>{menuTitle}</h3>
      </div>

      <div className={styles.sidebarContent}>
        <section className={styles.menuSection}>
          <span className={styles.sectionTitle}>Opciones</span>
          <div className={styles.actionsContainer}>
            {children}
            
            <button
              type="button"
              className={`${cuStyles.menuItem} ${styles.msgBtn}`}
              onClick={handleOpenMessages}
            >
              <img
                src={getIcon('message')}
                alt=""
                className={`${styles.icon} ${hasNewMessages ? styles.vibrate : ''}`}
              />
              <span>Mensajes</span>
              {hasNewMessages && <div className={styles.notificationDot} />}
            </button>
          </div>
        </section>
      </div>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
          <img src={getIcon('exit')} alt="" className={styles.icon} />
          <span>Cerrar sesión</span>
        </button>
      </div>

      <AlertModal
        open={showLogoutModal}
        title="¿Cerrar sesión?"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        confirmText="Sí, cerrar sesión"
        cancelText="No, mantener sesión"
      />
    </aside>
  );
}

export default Sidebar;