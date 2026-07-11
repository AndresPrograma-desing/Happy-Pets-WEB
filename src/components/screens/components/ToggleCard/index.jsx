import React from 'react';
import styles from './index.module.css';

const ToggleCard = ({
  title,
  description,
  icon: Icon,
  action,
  children,
  onClose,
  closeText = "Cerrar",
  variant = "default" // "floating" or "default"
}) => {
  const containerClass = `${styles.toggleContainer} ${variant === 'floating' ? styles.floatingVariant : ''}`;

  return (
    <div className={containerClass}>
      <div className={styles.content}>
        <div className={styles.textBlock}>
          <div className={styles.headerLine}>
            {Icon && <Icon size={18} className={styles.icon} />}
            <span className={styles.label}>{title}</span>
          </div>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.actionSection}>
          {action}
          {onClose && (
            <button onClick={onClose} className={styles.closeBtn}>
              {closeText}
            </button>
          )}
        </div>
      </div>
      {children && <div className={styles.childrenWrapper}>{children}</div>}
    </div>
  );
};

export default ToggleCard;
