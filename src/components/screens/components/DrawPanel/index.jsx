import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight } from 'lucide-react'; // <-- Cambiado de X a ChevronRight
import styles from './index.module.css';

import Button from '../Button/index';
import CountdownBar from '../CountdownBar/index';
import { DrawPanelFooterContext } from './FooterContext';

const DrawPanel = ({
  isOpen, 
  onClose, 
  title, 
  description,
  descriptionPosition = 'top',
  children,
  width = '400px',
  showActions = false,
  dynamicFooter = false,
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
  progressMode,
  totalFields = 0,
  filledFields = 0,
  totalItems = [],
  selectedItems = [],
  formData,
  requiredFields = [],
  hasUnsavedChanges,
  closeConfirmMessage = 'Vuelve a hacer clic fuera para cerrar sin guardar'
}) => {
  const [render, setRender] = useState(isOpen);
  const [pendingClose, setPendingClose] = useState(false);
  const pendingCloseTimeoutRef = useRef(null);
  const [footerNode, setFooterNode] = useState(null);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (pendingCloseTimeoutRef.current) clearTimeout(pendingCloseTimeoutRef.current);
    };
  }, []);

  const onAnimationEnd = () => {
    if (!isOpen) {
      setRender(false);
      setPendingClose(false);
      if (pendingCloseTimeoutRef.current) {
        clearTimeout(pendingCloseTimeoutRef.current);
        pendingCloseTimeoutRef.current = null;
      }
    }
  };

  if (!render) return null;

  // Contenido "sucio": si hay datos cargados en el formulario, un solo clic fuera
  // no cierra el panel (para no perder lo que el usuario escribió); requiere un
  // segundo clic. Sin datos, el panel se cierra normalmente con un solo clic.
  const formHasValues = formData
    ? Object.values(formData).some((val) => val !== undefined && val !== null && String(val).trim() !== '')
    : false;
  const isDirty = hasUnsavedChanges ?? formHasValues;

  const handleOverlayClick = () => {
    if (!isDirty) {
      onClose();
      return;
    }
    if (pendingClose) {
      if (pendingCloseTimeoutRef.current) clearTimeout(pendingCloseTimeoutRef.current);
      setPendingClose(false);
      onClose();
      return;
    }
    setPendingClose(true);
    pendingCloseTimeoutRef.current = setTimeout(() => setPendingClose(false), 2500);
  };

  // Lógica Genérica de Cálculo de Progreso
  let calculatedProgress = countdownValue ?? 0;

  // Sin progressMode explícito, pasar formData + requiredFields alcanza para medir el formulario.
  const hasRequiredFields = Array.isArray(requiredFields) && requiredFields.length > 0;
  const effectiveMode = progressMode ?? (formData && hasRequiredFields ? 'form' : 'count');

  if (effectiveMode === 'selection') {
    const total = Array.isArray(totalItems) ? totalItems.length : Number(totalItems) || 0;
    const selected = Array.isArray(selectedItems) ? selectedItems.length : Number(selectedItems) || 0;
    calculatedProgress = total > 0 ? (selected / total) * 100 : 0;
  } else if (effectiveMode === 'form' && formData && hasRequiredFields) {
    const filledCount = requiredFields.filter(field => {
      const val = formData[field];
      return val !== undefined && val !== null && String(val).trim() !== '';
    }).length;
    calculatedProgress = (filledCount / requiredFields.length) * 100;
  } else if (effectiveMode === 'count' && totalFields > 0) {
    calculatedProgress = Math.min(100, Math.max(0, (filledFields / totalFields) * 100));
  }

  return createPortal(
    <div
      className={`${styles.overlay} ${isOpen ? styles.fadeIn : styles.fadeOut}`}
      onClick={handleOverlayClick}
      onAnimationEnd={onAnimationEnd}
    >
      <div
        className={`${styles.panel} ${isOpen ? styles.slideIn : styles.slideOut} ${className}`}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {pendingClose && (
          <div className={styles.closeHint}>{closeConfirmMessage}</div>
        )}

        <div className={styles.header}>
          <div className={styles.headerTitleContainer}>
            <h3 className={styles.title}>{title}</h3>
            {description && descriptionPosition === 'top' && (
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
          <DrawPanelFooterContext.Provider value={footerNode}>
            {children}
          </DrawPanelFooterContext.Provider>
          {description && descriptionPosition === 'bottom' && (
            <div className={styles.descriptionBottom}>
              <h4 className={styles.descriptionBottomTitle}>Descripción de Tarea</h4>
              <p className={styles.descriptionBottomText}>{description}</p>
            </div>
          )}
        </div>

        {dynamicFooter && <div ref={setFooterNode} className={styles.footer} />}

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