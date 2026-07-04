import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import styles from './index.module.css';

import Button from '../Button/index';

const DrawPanel = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  width = '400px'
}) => {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const onAnimationEnd = (e) => {
    // Solo atrapar el evento de la animación del contenedor principal (el overlay)
    // o verificar si no está abierto para desmontar
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  return (
    <div 
      className={`${styles.overlay} ${isOpen ? styles.fadeIn : styles.fadeOut}`} 
      onClick={onClose}
      onAnimationEnd={onAnimationEnd}
    >
      <div 
        className={`${styles.panel} ${isOpen ? styles.slideIn : styles.slideOut}`}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <Button variant={Button.VARIANTS.DANGER} 
            color={Button.COLORS.TRANSPARENT} 
            onClick={onClose} 
            circle
            aria-label="Cerrar panel">
              <X size={20} color={Button.COLORS.BLACK} />
            </Button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DrawPanel;
