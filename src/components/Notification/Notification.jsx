import React, { useState, useEffect } from 'react';
import styles from '../GenericPanel/GenericPanel.module.css';
import { getIcon } from '../../assets/icons/ExportIcon/Index';

const Notification = ({ title = '¡Bienvenido!', message = 'Notificación rápida', duration = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className={styles.notificationModal} role="status" aria-live="polite">
      <div className={styles.notificationContent}>
        <img src={getIcon('fileCheck')} alt="Check" className={styles.modalIcon} />
        <div>
          <p className={styles.modalTitle}>{title}</p>
          <p className={styles.modalMessage}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Notification;
