import React from 'react';
import styles from './Index.module.css';

const Loading = ({ text = "", size = 'medium', className = '' }) => {
  return (
    <div className={`${styles.loadingContainer} ${styles[size]} ${className}`}>
      <div className={styles.spinner}></div>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};

export default Loading;
