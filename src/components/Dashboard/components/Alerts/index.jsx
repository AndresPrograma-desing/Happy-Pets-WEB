import React from 'react';
import { formatAlertDate } from '../../utils';
import styles from './index.module.css';

const Alerts = (props) => {
  const { alerts = [], emptyMessage } = props;

  if (alerts.length === 0) {
    return <p className={styles.emptyMessage}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.list}>
      {alerts.map((alert) => (
        <div key={alert.id} className={styles.item}>
          <div className={styles.itemHeader}>
            <span className={styles.title}>{alert.titulo}</span>
            <span className={styles.date}>{formatAlertDate(alert.fecha)}</span>
          </div>
          <p className={styles.message}>{alert.mensaje}</p>
        </div>
      ))}
    </div>
  );
};

export default Alerts;
