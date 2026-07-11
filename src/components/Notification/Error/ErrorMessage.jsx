import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ message, title = "Atención", variant = "danger" }) => {
  if (!message) return null;

  return (
    <div className={`${styles.errorBanner} ${styles[variant] || ''}`}>
      {variant === 'success' ? (
        <CheckCircle size={18} className={styles.successIcon} />
      ) : (
        <AlertCircle size={18} className={styles.errorIcon} />
      )}
      <div className={styles.errorTextContent}>
        <strong className={styles.errorTitle}>{title}</strong>
        <span className={styles.errorText}>{message}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;