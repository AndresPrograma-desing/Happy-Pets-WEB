import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalTooltip.module.css";

const ModalTooltip = ({ 
  text, 
  children, 
  position = "top", 
  delay = 150, 
  style, 
  ...props 
}) => {
  const [visible, setVisible] = useState(false);
  const [activePos, setActivePos] = useState(position);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cálculo preciso de posición con prevención de colisiones con los bordes del viewport
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const gap = 8; // Distancia entre el trigger y el tooltip
    let currentPos = position;

    // Dimensiones reales del tooltip
    const tooltipWidth = tooltipRef.current ? tooltipRef.current.offsetWidth : 200;
    const tooltipHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 36;

    // Inversión automática si colisiona arriba/abajo
    if (position === "top" && triggerRect.top - tooltipHeight - gap < 0) {
      currentPos = "bottom";
    } else if (position === "bottom" && triggerRect.bottom + tooltipHeight + gap > window.innerHeight) {
      currentPos = "top";
    }

    setActivePos(currentPos);

    // Calcular Top
    let top = currentPos === "bottom" 
      ? triggerRect.bottom + window.scrollY + gap 
      : triggerRect.top + window.scrollY - gap;

    // Calcular Left con clamp para que nunca se salga horizontalmente
    let left = triggerRect.left + window.scrollX + triggerRect.width / 2;
    const minLeft = tooltipWidth / 2 + 10;
    const maxLeft = window.innerWidth - tooltipWidth / 2 - 10;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    setCoords({ top, left });
  }, [position]);

  // Listener global de scroll y resize cuando está visible
  useEffect(() => {
    if (!visible) return;

    updatePosition();

    const handleScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [visible, updatePosition]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <span
      ref={triggerRef}
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        ...style
      }}
      {...props}
    >
      {children}
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`${styles.tooltip} ${styles[activePos]}`}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
          >
            {text}
            <span className={styles.arrow} />
          </div>,
          document.body
        )}
    </span>
  );
};

export default ModalTooltip;