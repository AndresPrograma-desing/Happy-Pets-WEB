import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../../src/components/GenericPanel/GenericPanel.module.css';
import topBarStyles from '../../../src/components/TopBar/Index.module.css';
import Footer from '../../../src/components/Footer/Footer';
import Button from '../../../src/components/screens/components/Button';
import Container from '../../../src/components/screens/components/Container';
import ModalTooltip from '../../../src/components/ModalTooltip/ModalTooltip';

export default function ClientPanel({
  title,
  message,
  children,
  menuTitle = 'Portal Clientes',
  menuItems = [],
  activeTab,
  onTabChange,
  onLogout
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

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

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
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

        <nav className={styles.sidebarNav}>
          {menuItems.map((it) => (
            <div key={it.label} style={{ width: '100%' }}>
              <Button
                variant={Button.VARIANTS.GHOST}
                color="inherit"
                className={`${styles.navItem} ${(activeTab === it.id || location.pathname === it.path) ? styles.activeNavItem : ''}`}
                onClick={() => handleNavigate(it)}
                style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', textTransform: 'none' }}
                title={isCollapsed ? it.label : undefined}
              >
                {it.icon}
                {!isCollapsed && <span style={{ flex: 1, textAlign: 'left', marginLeft: '12px' }}>{it.label}</span>}
              </Button>
            </div>
          ))}
        </nav>

        {onLogout && (
          <div className={styles.sidebarFooter}>
            <Button
              color={Button.COLORS.RED}
              size={Button.SIZES.MEDIUM}
              variant={Button.VARIANTS.OUTLINE}
              onClick={onLogout}
              icon={LogOut}
              fullWidth={!isCollapsed}
              circle={isCollapsed}
              title={isCollapsed ? "Salir del Portal" : undefined}
              style={isCollapsed ? { margin: '0 auto', display: 'flex' } : {}}
            >
              {!isCollapsed && <span>Salir del Portal</span>}
            </Button>
          </div>
        )}
      </aside>

      {/* Main Wrapper */}
      <div className={styles.mainWrapper}>
        {/* Simple Top Bar (no admin hooks, no requests) */}
        <header className={topBarStyles.topBar}>
          <div className={topBarStyles.topBarContent} style={{ justifyContent: 'flex-end' }}>
            <div className={topBarStyles.userBadge} style={{ fontWeight: '600', color: '#ffffffff', fontSize: '0.95rem', marginRight: '1rem' }}>
              Portal de Clientes
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={styles.contentArea}>
          <Container showPagination={false}>
            <div className={styles.cardHeaderFlex}>
              <div className={styles.cardHeaderInfo}>
                {title && <h1 className={styles.mainTitle}>{title}</h1>}
                {message && <p className={styles.mainMessage}>{message}</p>}
              </div>
            </div>
            <div className={styles.extraContent}>{children}</div>
          </Container>
        </main>

        <Footer />
      </div>
    </div>
  );
}
