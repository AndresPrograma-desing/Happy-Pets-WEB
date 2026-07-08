import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalTooltip.module.css";
import { getIcon } from "../../assets/icons/ExportIcon/Index";

/**
 * ModalTooltip: Muestra un pequeño modal encima del elemento hijo al hacer hover.
 * @param {string|React.ReactNode} text - Texto o contenido del modal.
 * @param {React.ReactNode} children - Elemento sobre el que se activa el modal.
 */
const ModalTooltip = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Calculamos el punto central superior del icono
      const top = rect.top + window.scrollY - 12; // 12px de separación para dejar espacio a la flechita
      const left = rect.left + window.scrollX + rect.width / 2;
      setPos({ top, left });
    }
  }, [visible]);

  return (
    <span
      ref={triggerRef}
      className={styles.container}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', height: 'fit-content' }}
    >
      {children}
      {visible && typeof document !== 'undefined' && createPortal(
        <div
          className={styles.modalTooltip}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            transform: 'translate(-50%, -100%)', // Centra horizontalmente y ajusta la altura automáticamente
            zIndex: 99999,
            width: 'max-content', // Se adapta al texto
            maxWidth: 400, // Permite que sea más ancho si el texto es largo, pero con un límite razonable
            background: 'rgba(24, 24, 27, 0.95)',
            backdropFilter: 'blur(4px)',
            color: '#fafafa',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>,
        document.body
      )}
    </span>
  );
};

export default ModalTooltip;
