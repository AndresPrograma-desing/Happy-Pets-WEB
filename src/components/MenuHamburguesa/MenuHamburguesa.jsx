import React, { useState } from 'react';
import styles from './MenuHamburguesa.module.css';
import { Navigate } from 'react-router-dom';
import AlertModal from '../AlertModal/AlertModal';
import cuStyles from '../GeneralStyles/ButtonsMenu.module.css';
import { logout } from '../../services/api';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
function MenuHamburguesa({ children, menuTitle = "Menú" }) {
  // Simulación: reemplaza esto con tu lógica real de mensajes nuevos
  const [hasNewMessages, setHasNewMessages] = useState(false);
  // Ejemplo: para pruebas, activa la vibración después de 3 segundos
  React.useEffect(() => {
    const timer = setTimeout(() => setHasNewMessages(true), 3000);
    return () => clearTimeout(timer);
  }, []);
  const [open, setOpen] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    setLoggedOut(true);

    setShowLogoutModal(false);
    setOpen(false);


  };

  if (loggedOut) return <Navigate to="/login" replace />;

  return (
    <div className={styles.menuRoot}>
      <button
        aria-expanded={open}
        aria-label="Abrir menú"
        className={styles.hambtn}
        onClick={() => setOpen(v => !v)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 5h16" />
          <path d="M4 12h16" />
          <path d="M4 19h16" />
        </svg>
      </button>

      {open && (
        <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className={styles.panel} role="menu" onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.panelHeader}>
             
              <h3>{menuTitle}</h3>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <img src={getIcon('x')} alt="Cerrar" className={styles.closeIcon} />
              </button>
            </div>


            <div className={styles.menuSections}>
              <div className={styles.menuSection}>
                <div className={styles.menuSectionTitle}>Opciones</div>
                <div className={styles.sectionContent}>
                  {children}
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      aria-label="Ir a mensajes"
                      className={`${cuStyles.menuItem} ${styles.newChatBtn}`}
                      onClick={() => {
                        setOpen(false);
                        setHasNewMessages(false); // Marcar como leídos al abrir
                        const messagesUrl = `${window.location.origin}/panel-menssage`;
                        window.open(messagesUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <img
                        src={getIcon('message')}
                        alt="Mensajes"
                        className={
                          hasNewMessages
                            ? `${styles.messageIcon} ${styles.vibrate}`
                            : styles.messageIcon
                        }
                      />
                      Mensajes
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.menuFooter}>
              <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
                <img src={getIcon('exit')} alt="Cerrar sesión" className={styles.exitIcon} />
                Cerrar sesión
              </button>
            </div>

            <AlertModal
            open={showLogoutModal}
            title="¿Cerrar sesión?"
            message="¿Estás seguro de que deseas cerrar sesión?"
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleLogout}
            confirmText="Sí, cerrar sesión"
            cancelText="No, mantener sesión"

            />
          </div>
        </div>
      )}

    </div>

  );
}

export default MenuHamburguesa;