import React, { useState, useEffect, useRef } from 'react';
import styles from './CustomSelect.module.css';

const CustomSelect = ({ options, value, onChange, placeholder = "Seleccionar...", label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionId) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => String(opt.id) === String(value));

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.mainLabel}>{label}</label>}
      <div className={styles.selectContainer} ref={containerRef}>
        <div 
          className={`${styles.selectHeader} ${isOpen ? styles.open : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? styles.selectedText : styles.placeholder}>
            {selectedOption ? (selectedOption.name || selectedOption.nombre) : placeholder}
          </span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
        </div>

        {isOpen && (
          <ul className={styles.optionsList}>
            {options.length > 0 ? (
              options.map((opt) => (
                <li 
                  key={opt.id} 
                  className={`${styles.optionItem} ${String(value) === String(opt.id) ? styles.active : ''}`}
                  onClick={() => handleSelect(opt.id)}
                >
                  {opt.name || opt.nombre}
                </li>
              ))
            ) : (
              <li className={styles.noOptions}>No hay opciones</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;