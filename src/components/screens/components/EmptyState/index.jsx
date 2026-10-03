import React from 'react';
import styles from './index.module.css';

const EmptyState = ({ icon: Icon, text, iconSize=32 }) => (
  <div className={styles.emptyState}>
    {Icon && <Icon size={iconSize} className={styles.icon} />}
    <p className={styles.text}>{text}</p>
  </div>
);

export default EmptyState;
