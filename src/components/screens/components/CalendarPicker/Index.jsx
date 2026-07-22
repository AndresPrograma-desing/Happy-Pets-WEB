import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, isSameDay, isSameMonth, setMonth, setYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, X, ChevronDown } from 'lucide-react';
import styles from './Index.module.css';
import TextField from '../Material-UI/Components/TextField/Index';
import Frame from '../Frame/Index';
import Button from '../Button/index';
import Selector from '../Material-UI/Components/Selector/Index';
import { MONTHS, WEEKDAYS, BUTTONS } from './Constants';
import { parseValueToDate, getDaysForMonth } from './utils';

const CalendarPicker = ({ label, name, value, onChange, required = false, disabled = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [showSelectors, setShowSelectors] = useState(false);

  let selectedDate = parseValueToDate(value);

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
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setCurrentDate(prev => setMonth(prev, val));
    }
  };

  const handleYearChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setCurrentDate(prev => setYear(prev, val));
    }
  };

  const safeDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) ? currentDate : new Date();

  const currentYear = safeDate.getFullYear();
  const years = Array.from({ length: 110 }, (_, i) => currentYear + 5 - i);

  const { monthStart, days } = getDaysForMonth(safeDate);

  const headerContent = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid #f8fafc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
      <div className={styles.headerTitleContainer} onClick={() => setShowSelectors(!showSelectors)}>
        <span className={styles.monthName}>
          {format(safeDate, 'MMMM yyyy', { locale: es })}
        </span>
        <ChevronDown size={14} className={`${styles.dropdownChevron} ${showSelectors ? styles.chevronChevronOpen : ''}`} />
      </div>

      <div className={styles.navigation}>
        {!showSelectors && (
          <>
            <Button
              variant="ghost"
              size="small"
              circle
              onClick={handlePrevMonth}
              icon={ChevronLeft}
              color="inherit"
            />
            <Button
              variant="ghost"
              size="small"
              circle
              onClick={handleNextMonth}
              icon={ChevronRight}
              color="inherit"
            />
          </>
        )}
        <Button
          variant="ghost"
          size="small"
          circle
          onClick={() => { setIsOpen(false); setShowSelectors(false); }}
          icon={X}
          color="var(--cancel-button)"
        />
      </div>
    </div>
  );

  return (
    <div className={styles.inputGroup} onClick={(e) => e.stopPropagation()}>
      <TextField
        label={label}
        value={selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}
        readOnly
        placeholder="dd/mm/aaaa"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        required={required}
        slotProps={{
          input: {
            endAdornment: (
              <CalendarDays 
                size={16} 
                style={{ cursor: 'pointer', color: '#64748b' }}
                onClick={() => !disabled && setIsOpen(true)}
              />
            )
          }
        }}
      />

      {isOpen && (
        <Frame
          isModal={true}
          onClose={() => { setIsOpen(false); setShowSelectors(false); }}
          className={styles.calendarFrame}
        >
          {headerContent}

          {showSelectors ? (
            <div className={styles.selectorsPanel}>
              <div className={styles.selectorGroup}>
                <Selector
                  label="Mes"
                  value={currentDate.getMonth()}
                  onChange={handleMonthChange}
                  options={MONTHS.map((m, index) => ({ value: index, label: m }))}
                />
              </div>
              <div className={styles.selectorGroup}>
                <Selector
                  label="Año"
                  value={currentDate.getFullYear()}
                  onChange={handleYearChange}
                  options={years.map(y => ({ value: y, label: String(y) }))}
                />
              </div>
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowSelectors(false)}
                color="#0f172a"
                style={{ marginTop: '0.5rem' }}
              >
                {BUTTONS.CONFIRM}
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.weekDaysGrid}>
                {WEEKDAYS.map(day => (
                  <div key={day} className={styles.weekDayName}>{day}</div>
                ))}
              </div>

              <div className={styles.daysGrid}>
                {days.map((day, index) => {
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
            <Button
              variant="ghost"
              size="small"
              onClick={handleClear}
              color="inherit"
            >
              {BUTTONS.CLEAR}
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={handleSetToday}
              color="green"
            >
              {BUTTONS.TODAY}
            </Button>
          </div>
        </Frame>
      )}
    </div>
  );
};

export default CalendarPicker;
