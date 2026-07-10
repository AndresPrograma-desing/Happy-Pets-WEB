import React, { useState, useEffect } from 'react';
import styles from './Index.module.css';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import { SWITCH_TEXTS } from './constants';  

const Switch = ({ 
  value = false, 
  onChange, 
  disabled = false, 
  activeColor = '#088d4f',
  inactiveColor = '#919191',
  thumbColor = '#ffffff',
  className = '', 
  style = {} 
}) => {
  const [active, setActive] = useState(value);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    setActive(value);
  }, [value]);

  const handleClick = (e) => {
    if (disabled) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);

    const newActive = !active;
    setActive(newActive);
    
    if (onChange) {
      onChange(newActive);
    }
  };

  const statusClass = active ? styles.active : styles.inactive;

  const dynamicStyle = {
    ...style,
    backgroundColor: active ? activeColor : inactiveColor,
  };
  const tooltipText = active ? SWITCH_TEXTS.enabled : SWITCH_TEXTS.disabled;

  return (
    <ModalTooltip text={tooltipText}>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        disabled={disabled}
        className={`${styles.switchButton} ${statusClass} ${className}`}
        style={dynamicStyle}
        onClick={handleClick}
      >
        <div className={styles.thumb} style={{ backgroundColor: thumbColor }} />
        
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className={styles.ripple}
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size
            }}
          />
        ))}
      </button>
    </ModalTooltip>
  );
};

export default Switch;
