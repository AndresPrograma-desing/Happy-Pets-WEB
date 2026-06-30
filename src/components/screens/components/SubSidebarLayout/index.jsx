import React from 'react';
import styles from './index.module.css';

export default function SubSidebarLayout({ 
  menuItems = [], 
  activeItemId, 
  onItemClick,
  children 
}) {
  return (
    <div className={styles.layoutWrapper}>
      <aside className={styles.subSidebar}>
        <div className={styles.menuList}>
          {menuItems.map(item => {
            const isActive = activeItemId === item.id;
            return (
              <button 
                key={item.id}
                className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                onClick={() => onItemClick(item.id, item)}
              >
                {item.icon && <span className={styles.iconWrapper}>{item.icon}</span>}
                <span className={styles.label}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </aside>
      <div className={styles.contentArea}>
        {children}
      </div>
    </div>
  );
}
