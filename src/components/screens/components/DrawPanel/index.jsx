import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight } from 'lucide-react'; // <-- Cambiado de X a ChevronRight
import styles from './index.module.css';

import Button from '../Button/index';
import CountdownBar from '../CountdownBar/index';

const DrawPanel = ({ 
  isOpen, 
  onClose, 
  title, 
  description,
  children,
  width = '400px',
  showActions = false,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  formId,
  loading = false,
  success = undefined,
  className = '',
  showCountdown = false,
  countdownActive = true,
  countdownDuration,
  countdownOnComplete,
  countdownExpiresAt,
  countdownTotalDuration,
  countdownValue,
  countdownHeight,
  countdownColors,
  countdownIncrement = true,
  progressMode = 'count',
  totalFields = 0,
  filledFields = 0,
  totalItems = [],
  selectedItems = [],
  formData,
  requiredFields = []
}) => {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const onAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  // Lógica Genérica de Cálculo de Progreso
  let calculatedProgress = countdownValue ?? 0;

  if (progressMode === 'selection') {
    const total = Array.isArray(totalItems) ? totalItems.length : Number(totalItems) || 0;
    const selected = Array.isArray(selectedItems) ? selectedItems.length : Number(selectedItems) || 0;
    calculatedProgress = total > 0 ? (selected / total) * 100 : 0;
  } else if (progressMode === 'form' && formData && Array.isArray(requiredFields) && requiredFields.length > 0) {
    const filledCount = requiredFields.filter(field => {
      const val = formData[field];
      return val !== undefined && val !== null && String(val).trim() !== '';
    }).length;
    calculatedProgress = (filledCount / requiredFields.length) * 100;
  } else if (progressMode === 'count' && totalFields > 0) {
    calculatedProgress = Math.min(100, Math.max(0, (filledFields / totalFields) * 100));
  }

  return createPortal(
    <div 
      className={`${styles.overlay} ${isOpen ? styles.fadeIn : styles.fadeOut}`} 
      onClick={onClose}
      onAnimationEnd={onAnimationEnd}
    >
      <div 
        className={`${styles.panel} ${isOpen ? styles.slideIn : styles.slideOut} ${className}`}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerTitleContainer}>
            <h3 className={styles.title}>{title}</h3>
            {description && (
              <p className={styles.description}>{description}</p>
            )}
          </div>
          <div className={styles.closeButtonWrapper}>
            <Button 
              variant={Button.VARIANTS.DANGER} 
              color={Button.COLORS.TRANSPARENT} 
              onClick={onClose} 
              circle
              aria-label="Cerrar panel"
            >
              <ChevronRight size={24} color="#374151" />
            </Button>
          </div>
        </div>

        {showCountdown && (
          <div style={{ padding: '0 1.5rem', width: '100%', boxSizing: 'border-box' }}>
            <CountdownBar
              active={countdownActive}
              duration={countdownDuration}
              onComplete={countdownOnComplete}
              expiresAt={countdownExpiresAt}
              totalDuration={countdownTotalDuration}
              value={calculatedProgress}
              height={countdownHeight}
              colors={countdownColors}
              width="100%"
              increment={countdownIncrement}
            />
          </div>
        )}

        <div className={styles.content}>
          {children}
        </div>

        {showActions && (
          <div className={styles.footer}>
            <Button 
              variant="" 
              onClick={onClose} 
              border={Button.COLORS.RED}
              disabled={loading} 
              fullWidth
            >
              {cancelText}
            </Button>
            <Button 
              type={formId ? 'submit' : 'button'} 
              form={formId} 
              variant="primary" 
              color={Button.COLORS.PRIMARY} 
              onClick={onConfirm} 
              loading={loading}
              success={success}
              fullWidth
            >
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default DrawPanel;