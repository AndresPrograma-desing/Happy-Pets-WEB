import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./Hovercard.module.css";
import { getIcon } from "../../assets/icons/ExportIcon/Index";

const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  useEffect(() => {
    if (visible && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const tooltipWidth = 200; // ancho estimado
      const top = rect.top + window.scrollY - 40; // 40px arriba del icono
      let left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
      if (left < 8) left = 8;
      setPos({ top, left });
    }
  }, [visible]);

  return (
    <span
      className={styles.container}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={iconRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {visible && typeof document !== 'undefined' && createPortal(
        <div
          className={styles.tooltipBox}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            zIndex: 99999,
            minWidth: 180,
            maxWidth: 240,
            background: '#333',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 6,
            fontSize: 13,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
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

export default Tooltip;