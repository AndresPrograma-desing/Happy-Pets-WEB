import React from 'react';
import styles from './index.module.css';

const Badge = ({ icon: Icon, label, value, iconColor = "#000000ff" }) => {
  return (
    <div className={styles.badgeContainer}>
      {Icon && <Icon size={18} color={iconColor} />}
      {label && <span className={styles.badgeLabel}>{label}:</span>}
      <span className={styles.badgeValue}>{value}</span>
    </div>
  );
};

export default Badge;
