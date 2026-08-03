import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button/index';
import styles from './index.module.css';
import { TEXTS } from './constants';
import { getBadgeClass } from './utils';

import ModalTooltip from '../../ModalTooltip/ModalTooltip';

export const ProSidebar = ({
  groups,
  activeId,
  onSelect,
  collapsible = true,
  className = '',
  headerContent,
  footerContent,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const renderLeftContent = (item) => {
    const Icon = item.icon;
    if (Icon) {
      // Si Icon es un componente React válido
      if (typeof Icon === 'function' || typeof Icon === 'object') {
        return <span className={styles.icon}><Icon size={20} /></span>;
      }
      // Si es un nodo ya renderizado
      return <span className={styles.icon}>{Icon}</span>;
    }
    return null;
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${className}`}> 
      {(headerContent || collapsible) && (
        <div className={styles.sidebarHeader}>
          {!isCollapsed && headerContent && (
            <div className={styles.headerContent}>{headerContent}</div>
          )}

          {collapsible && (
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
            >
              <ModalTooltip 
                key={isCollapsed}
                text={isCollapsed ? TEXTS.openMenu : TEXTS.closeMenu} 
                position="bottom"
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </ModalTooltip>
            </Button>
          )}
        </div>
      )}

      <div className={styles.navContainer}>
        {groups && groups.map((group, gIdx) => (
          <div key={gIdx} className={styles.menuGroup}>
            {group.title && !isCollapsed && (
              <span className={styles.groupTitle}>{group.title}</span>
            )}

            <div className={styles.buttonList}>
              {group.items && group.items.map((item) => {
                const isActive = activeId === item.id;

                return (
                  <Button
                    key={item.id}
                    fullWidth
                    color="transparent"
                    active={isActive}
                    onClick={() => onSelect && onSelect(item)}
                    className={`${styles.sidebarItemBtn} ${isActive ? styles.activeBtn : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={styles.btnLayout}>
                      <div className={styles.leftPart}>
                        {renderLeftContent(item)}
                        {!isCollapsed && <span className={styles.label}>{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className={`${styles.badge} ${getBadgeClass(styles, item.badgeType)}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {footerContent && !isCollapsed && (
        <div className={styles.footerContent}>{footerContent}</div>
      )}
    </aside>
  );
};

export default ProSidebar;
