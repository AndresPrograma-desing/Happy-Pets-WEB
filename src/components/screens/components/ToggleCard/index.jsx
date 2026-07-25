import React from 'react';
import styles from './index.module.css';
import { formatHighlightedText } from '../GreenHighlight/utils.jsx';

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

  const formattedTitle = typeof title === 'string' ? formatHighlightedText(title) : title;
  const formattedDescription = typeof description === 'string' ? formatHighlightedText(description) : description;

  return (
    <div className={containerClass}>
      <div className={styles.content}>
        <div className={styles.textBlock}>
          <div className={styles.headerLine}>
            {Icon && <Icon size={18} className={styles.icon} />}
            <span className={styles.label}>{formattedTitle}</span>
          </div>
          {description && <p className={styles.description}>{formattedDescription}</p>}
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
