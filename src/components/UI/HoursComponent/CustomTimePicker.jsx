import React, { useState, useEffect, useRef } from 'react';
import { Clock, X, ChevronUp, ChevronDown } from 'lucide-react';
import styles from './CustomTimePicker.module.css';
import TextField from '../../screens/components/Material-UI/Components/TextField/Index';

const CustomTimePicker = ({ label, name, value, onChange, required = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Estados internos para controlar la hora dentro del modal
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState('AM');
  
  const modalRef = useRef(null);

  // Sincronizar el valor externo (HH:mm de 24h) con el formato de 12h del modal
  useEffect(() => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const h24 = value.getHours();
      const m = value.getMinutes();
      const p = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;

      setHours(h12);
      setMinutes(m);
      setPeriod(p);
      return;
    }

    if (typeof value === 'string') {
      const match = value.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return;
      const h24 = Number(match[1]);
      const m = Number(match[2]);
      if (Number.isNaN(h24) || Number.isNaN(m) || h24 < 0 || h24 > 23 || m < 0 || m > 59) return;

      const p = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;

      setHours(h12);
      setMinutes(m);
      setPeriod(p);
    }
  }, [value, isOpen]);

  // Bloquear scroll del body cuando el modal esté abierto
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Modificadores de tiempo con bucle (coinciden con las flechas del diseño)
  const incrementHours = () => setHours(prev => prev === 12 ? 1 : prev + 1);
  const decrementHours = () => setHours(prev => prev === 1 ? 12 : prev - 1);
  const incrementMinutes = () => setMinutes(prev => prev === 59 ? 0 : prev + 1);
  const decrementMinutes = () => setMinutes(prev => prev === 0 ? 59 : prev - 1);
  // Convertir a formato de 24h y guardar
  const handleConfirm = () => {
    let h24 = hours;
    if (period === 'PM' && hours !== 12) h24 += 12;
    if (period === 'AM' && hours === 12) h24 = 0;

    const formattedHours = String(h24).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const time24 = `${formattedHours}:${formattedMinutes}`;

    const event = {
      target: {
        name: name,
        value: time24,
        type: 'time'
      }
    };

    if (typeof onChange === 'function') {
      onChange(event);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    const event = {
      target: { name, value: '', type: 'time' }
    };
    if (typeof onChange === 'function') {
      onChange(event);
    }
    setIsOpen(false);
  };

  // Formatear texto visible del input (ej: "03:45 PM")
  const getDisplayValue = () => {
    if (!value) return '';
    const displayHours = String(hours).padStart(2, '0');
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  return (
    <div className={styles.inputGroup} onClick={(e) => e.stopPropagation()}>
      <TextField
        label={label}
        value={getDisplayValue()}
        readOnly
        placeholder="00:00 AM"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        required={required}
        slotProps={{
          input: {
            endAdornment: (
              <Clock 
                size={16} 
                style={{ cursor: 'pointer', color: '#64748b' }}
                onClick={() => !disabled && setIsOpen(true)}
              />
            )
          }
        }}
      />

      {isOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsOpen(false)}>
          <div className={styles.timeModal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.header}>
              <span className={styles.modalTitle}>Seleccionar Hora</span>
              <button type="button" onClick={() => setIsOpen(false)} className={styles.closeModalBtn}>
                <X size={18} />
              </button>
            </div>

            {/* INTERFAZ DEL SELECTOR DE TIEMPO */}
            <div className={styles.timeSelectorContainer}>
              
              {/* Columna Horas */}
              <div className={styles.timeColumn}>
                <button type="button" onClick={incrementHours} className={styles.arrowButton}>
                  <ChevronUp size={20} />
                </button>
                <span className={styles.timeValue}>{String(hours).padStart(2, '0')}</span>
                <button type="button" onClick={decrementHours} className={styles.arrowButton}>
                  <ChevronDown size={20} />
                </button>
              </div>

              <span className={styles.timeSeparator}>:</span>

              {/* Columna Minutos */}
              <div className={styles.timeColumn}>
                <button type="button" onClick={incrementMinutes} className={styles.arrowButton}>
                  <ChevronUp size={20} />
                </button>
                <span className={styles.timeValue}>{String(minutes).padStart(2, '0')}</span>
                <button type="button" onClick={decrementMinutes} className={styles.arrowButton}>
                  <ChevronDown size={20} />
                </button>
              </div>

              {/* Columna AM/PM */}
              <div className={styles.periodColumn}>
                <button 
                  type="button" 
                  className={`${styles.periodButton} ${period === 'AM' ? styles.periodActive : ''}`}
                  onClick={() => setPeriod('AM')}
                >
                  AM
                </button>
                <button 
                  type="button" 
                  className={`${styles.periodButton} ${period === 'PM' ? styles.periodActive : ''}`}
                  onClick={() => setPeriod('PM')}
                >
                  PM
                </button>
              </div>

            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.clearButton} onClick={handleClear}>
                Borrar
              </button>
              <button type="button" className={styles.confirmButton} onClick={handleConfirm}>
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;