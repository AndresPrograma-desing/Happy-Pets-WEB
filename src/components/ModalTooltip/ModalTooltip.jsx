import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalTooltip.module.css";
import { getIcon } from "../../assets/icons/ExportIcon/Index";

const ModalTooltip = ({ text, children, position = "top" }) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const left = rect.left + window.scrollX + rect.width / 2;
      
      const top = position === "bottom"
        ? rect.bottom + window.scrollY + 12 
        : rect.top + window.scrollY - 12;   

      setPos({ top, left });
    }
  }, [visible, position]);

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
          className={`${styles.modalTooltip} ${position === "bottom" ? styles.modalTooltipBottom : styles.modalTooltipTop}`}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            transform: position === "bottom" ? 'translate(-50%, 0)' : 'translate(-50%, -100%)', 
            zIndex: 99999,
            width: 'max-content',
            maxWidth: 400,
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