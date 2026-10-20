import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import styles from './ErrorMessage.module.css';

// Errores "crudos" del navegador/fetch (nunca pensados para mostrarse al
// usuario final) que se reemplazan por un mensaje genérico en español.
const RAW_ERROR_PATTERNS = [
  /failed to fetch/i,
  /networkerror/i,
  /load failed/i,
  /network request failed/i,
  /the operation was aborted/i,
  /err_connection/i,
];

const DEFAULT_FALLBACK_MESSAGE = 'Ocurrió un problema al procesar la solicitud. Intenta nuevamente en unos momentos.';

function resolveMessage(message, fallbackMessage) {
  if (typeof message !== 'string') return message;
  const isRawError = RAW_ERROR_PATTERNS.some((pattern) => pattern.test(message));
  return isRawError ? fallbackMessage : message;
}

const ErrorMessage = ({ message, title = "Atención", variant = "danger", fallbackMessage = DEFAULT_FALLBACK_MESSAGE }) => {
  if (!message) return null;

  const displayMessage = resolveMessage(message, fallbackMessage);

  return (
    <div className={`${styles.errorBanner} ${styles[variant] || ''}`}>
      {variant === 'success' ? (
        <CheckCircle size={18} className={styles.successIcon} />
      ) : (
        <AlertCircle size={18} className={styles.errorIcon} />
      )}
      <div className={styles.errorTextContent}>
        <strong className={styles.errorTitle}>{title}</strong>
        <span className={styles.errorText}>{displayMessage}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;