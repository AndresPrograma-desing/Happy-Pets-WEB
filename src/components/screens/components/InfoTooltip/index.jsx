import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import styles from './index.module.css';

const InfoTooltip = ({ 
  content, 
  title, 
  icon: Icon = HelpCircle, 
  iconSize = 18, 
  iconColor = "#94a3b8",
  width = "280px" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button 
        type="button" 
        className={styles.triggerButton}
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        aria-label={title || "Información"}
      >
        <Icon size={iconSize} color={iconColor} className={styles.icon} />
      </button>

      {isOpen && (
        <div className={styles.popover} style={{ width }}>
          <div className={styles.popoverContent}>
            {title && <h4 className={styles.popoverTitle}>{title}</h4>}
            <div className={styles.popoverBody}>
              {Array.isArray(content) 
                ? content.map((p, i) => (
                    <p key={i} style={{ marginBottom: i < content.length - 1 ? '0.5rem' : 0 }}>
                      {p}
                    </p>
                  ))
                : content}
            </div>
          </div>
          <div className={styles.arrow}></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
