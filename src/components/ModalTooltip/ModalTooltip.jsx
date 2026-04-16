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
      const tooltipWidth = 200;
      const top = rect.top + window.scrollY - 48;
      let left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
      if (left < 8) left = 8;
      setPos({ top, left });
    }
  }, [visible]);

  return (
    <span
      ref={triggerRef}
      className={styles.container}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {visible && typeof document !== 'undefined' && createPortal(
        <div
          className={styles.modalTooltip}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            zIndex: 99999,
            minWidth: 180,
            maxWidth: 240,
            background: '#333',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            pointerEvents: 'none',
          }}
        >

        <img src={getIcon("help")}
                    alt=""
                    className={styles.icon}
                    style={{ marginRight: 6, verticalAlign: 'middle' }}
                  />
                  {text}
        </div>,
        document.body
      )}
    </span>
  );
};

export default ModalTooltip;
