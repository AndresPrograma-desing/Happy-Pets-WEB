import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, setMonth, setYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, X, ChevronDown } from 'lucide-react';
import styles from './CustomDatePicker.module.css';
import MuiTextField from '@mui/material/TextField';

const CustomDatePicker = ({ label, name, value, onChange, required = false, disabled = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [showSelectors, setShowSelectors] = useState(false);
  const modalRef = useRef(null);
 
 let selectedDate = null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    selectedDate = value;
  } else if (typeof value === 'string' && value.trim() !== '') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      selectedDate = new Date(year, month - 1, day);
    } else {
      const fallbackDate = new Date(value);
      if (!Number.isNaN(fallbackDate.getTime())) {
        selectedDate = new Date(
          fallbackDate.getUTCFullYear(),
          fallbackDate.getUTCMonth(),
          fallbackDate.getUTCDate()
        );
      }
    }
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });

  const daysInterval = eachDayOfInterval({
    start: startDate,
    end: monthEnd,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowSelectors(false);
      }
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

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDateClick = (day) => {
    if (isSameMonth(day, monthStart)) {
      const yyyy = day.getFullYear();
      const mm = String(day.getMonth() + 1).padStart(2, '0');
      const dd = String(day.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      const event = {
        target: {
          name: name,
          value: formattedDate,
          type: 'date',
        },
      };
      if (typeof onChange === 'function') {
        onChange(event);
      }
      setIsOpen(false);
    }
  };

  const handleSetToday = () => {
    const today = new Date();
    setCurrentDate(today);
    handleDateClick(today);
  };

  const handleClear = () => {
    const event = {
      target: { name, value: '', type: 'date' },
    };
    if (typeof onChange === 'function') {
      onChange(event);
    }
    setIsOpen(false);
  };
 
  const handleMonthChange = (e) => {
    setCurrentDate(setMonth(currentDate, parseInt(e.target.value)));
  };

  const handleYearChange = (e) => {
    setCurrentDate(setYear(currentDate, parseInt(e.target.value)));
  };

  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
   
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 110 }, (_, i) => currentYear + 5 - i);
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className={styles.inputGroup} onClick={(e) => e.stopPropagation()}>
      <MuiTextField
        label={
          label ? (
            <span>
              {label}
              {required && <span style={{ color: 'red', marginLeft: '4px' }}>**</span>}
            </span>
          ) : undefined
        }
        value={selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}
        placeholder="dd/mm/aaaa"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        size="small"
        fullWidth
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <CalendarDays 
                size={16} 
                style={{ cursor: 'pointer', color: '#64748b' }}
                onClick={() => !disabled && setIsOpen(true)}
              />
            )
          }
        }}
        sx={{ m: 0, '& .MuiInputBase-root': { backgroundColor: '#fff' } }}
      />

      {isOpen && createPortal(
        <div className={styles.modalBackdrop} onClick={() => { setIsOpen(false); setShowSelectors(false); }}>
          <div className={styles.calendarModal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.header}>
              <div className={styles.headerTitleContainer} onClick={() => setShowSelectors(!showSelectors)}>
                <span className={styles.monthName}>
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </span>
                <ChevronDown size={14} className={`${styles.dropdownChevron} ${showSelectors ? styles.chevronChevronOpen : ''}`} />
              </div>

              <div className={styles.navigation}>
                {!showSelectors && (
                  <>
                    <button type="button" onClick={handlePrevMonth} className={styles.navButton}>
                      <ChevronLeft size={18} />
                    </button>
                    <button type="button" onClick={handleNextMonth} className={styles.navButton}>
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                <button type="button" onClick={() => { setIsOpen(false); setShowSelectors(false); }} className={styles.closeModalBtn}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {showSelectors ? (
              <div className={styles.selectorsPanel}>
                <div className={styles.selectorGroup}>
                  <label>Mes</label>
                  <select value={currentDate.getMonth()} onChange={handleMonthChange} className={styles.elegantSelect}>
                    {months.map((m, index) => (
                      <option key={m} value={index}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.selectorGroup}>
                  <label>Año</label>
                  <select value={currentDate.getFullYear()} onChange={handleYearChange} className={styles.elegantSelect}>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <button type="button" className={styles.applySelectorsBtn} onClick={() => setShowSelectors(false)}>
                  Confirmar Selección
                </button>
              </div>
            ) : (
              <>
                <div className={styles.weekDaysGrid}>
                  {dayNames.map(day => (
                    <div key={day} className={styles.weekDayName}>{day}</div>
                  ))}
                </div>

                <div className={styles.daysGrid}>
                  {daysInterval.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    let dayClassName = styles.dayCell;
                    if (!isCurrentMonth) dayClassName += ` ${styles.otherMonth}`;
                    if (isSelected) dayClassName += ` ${styles.selectedDay}`;
                    if (isToday && !isSelected) dayClassName += ` ${styles.todayDay}`;

                    return (
                      <div 
                        key={index} 
                        className={dayClassName}
                        onClick={() => isCurrentMonth && handleDateClick(day)}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className={styles.footer}>
              <button type="button" className={styles.clearButton} onClick={handleClear}>
                Borrar
              </button>
              <button type="button" className={styles.todayButton} onClick={handleSetToday}>
                Hoy
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomDatePicker;