import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import styles from './index.module.css';

const DesplegablePanel = ({
  title,
  description,
  icon: Icon,
  iconColorVariant,
  isOpen = false,
  onToggle,
  action,
  children
}) => {
  const handleRowClick = () => {
    if (onToggle) onToggle();
  };

  return (
    <div className={styles.panelContainer}>
      <div 
        className={styles.settingRow} 
        onClick={handleRowClick}
      >
        <div className={styles.settingInfo}>
          {Icon && (
            <div className={`${styles.iconWrapper} ${styles[iconColorVariant] || ''}`}>
              <Icon size={20} />
            </div>
          )}
          <div className={styles.textContainer}>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
        </div>
        
        <div className={styles.rightSection}>
           {action ? action : (
              isOpen ? <ChevronDown size={20} className={styles.arrow} /> : <ChevronRight size={20} className={styles.arrow} />
           )}
        </div>
      </div>

      {isOpen && children && (
        <div className={styles.reportExpandableContent}>
          {children}
        </div>
      )}
    </div>
  );
};

export default DesplegablePanel;
