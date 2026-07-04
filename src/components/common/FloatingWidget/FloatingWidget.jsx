import React, { useState } from 'react';
import styles from './FloatingWidget.module.css';

export function FloatingWidget({ 
  icon: Icon, 
  title,
  position = 'bottom-right',
  children,
  buttonTitle = "Open widget"
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Position classes
  const containerClass = 
    position === 'bottom-left' ? styles.containerBottomLeft : 
    position === 'bottom-right' ? styles.containerBottomRight : 
    position === 'top-left' ? styles.containerTopLeft : 
    styles.containerTopRight;
    
  const menuClass = 
    position === 'bottom-left' ? `${styles.menuLeft} ${styles.menuBottom}` : 
    position === 'bottom-right' ? `${styles.menuRight} ${styles.menuBottom}` : 
    position === 'top-left' ? `${styles.menuLeft} ${styles.menuTop}` : 
    `${styles.menuRight} ${styles.menuTop}`;

  return (
    <div className={containerClass}>
      {isOpen && <div className={styles.dropdownOverlay} onClick={closeMenu} />}
      
      <button 
        className={styles.widgetButton} 
        onClick={toggleMenu}
        title={buttonTitle}
      >
        <Icon size={24} />
      </button>

      {isOpen && (
        <div className={`${styles.dropdownMenu} ${menuClass}`}>
          {title && (
            <div className={styles.modalHeader}>
              <div className={styles.headerIcon}>
                <Icon size={24} />
              </div>
              <h3 className={styles.modalTitle}>{title}</h3>
            </div>
          )}
          
          <div className={styles.menuContent}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
