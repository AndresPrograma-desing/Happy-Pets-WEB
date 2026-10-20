import React from 'react';
import { createPortal } from 'react-dom';
import styles from './index.module.css';

// Shared floating-panel shell for TopBar action dropdowns (notifications, messages, etc.).
// Positions `children` under the action button that opened it and portals them to <body>.
export default function AnchoredDropdown({ isOpen, anchorStyle, panelRef, className = '', children }) {
  if (!isOpen || !anchorStyle) return null;

  return createPortal(
    <div ref={panelRef} className={`${styles.anchoredFrame} ${className}`} style={{ top: anchorStyle.top, right: anchorStyle.right }}>
      {children}
    </div>,
    document.body
  );
}
