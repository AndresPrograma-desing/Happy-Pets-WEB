import React, { useState } from 'react';
import styles from './MenuHamburguesa.module.css';
import { Navigate } from 'react-router-dom';
import AlertModal from '../AlertModal/AlertModal';
import cuStyles from '../GeneralStyles/ButtonsMenu.module.css';
import { logout } from '../../services/api';

function MenuHamburguesa({ children, menuTitle = "Menú" }) {
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
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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
                        const messagesUrl = `${window.location.origin}/panel-menssage`;
                        window.open(messagesUrl, '_blank', 'noopener,noreferrer');
                      }}
                      >
                      Mensajes
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.menuFooter}>
              <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
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