import React from 'react';
import Barnner from '../../../screens/components/Barnner';
import { getAppointmentStatusBadgeType, formatAppointmentStatusLabel } from '../../utils';
import styles from './index.module.css';

const StatusBreakdown = (props) => {
  const { breakdown = [], emptyMessage } = props;

  if (breakdown.length === 0) {
    return <p className={styles.emptyMessage}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.grid}>
      {breakdown.map((item) => (
        <div key={item.status} className={styles.item}>
          <Barnner type={getAppointmentStatusBadgeType(item.status)}>
            {formatAppointmentStatusLabel(item.status)}
          </Barnner>
          <span className={styles.count}>{item.count}</span>
        </div>
      ))}
    </div>
  );
};

export default StatusBreakdown;
