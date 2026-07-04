import React from 'react';
import styles from './index.module.css';

import Button from '../Button';

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
              <Button 
                key={item.id}
                variant={Button.VARIANTS.TAB}
                size={Button.SIZES.LARGE}
                active={isActive}
                onClick={() => onItemClick(item.id, item)}
              >
                {item.icon && <span className={styles.iconWrapper}>{item.icon}</span>}
                <span className={styles.label}>{item.label}</span>
              </Button>
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
