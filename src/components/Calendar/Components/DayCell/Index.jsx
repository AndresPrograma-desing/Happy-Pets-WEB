import React, { useState } from 'react';
import Barnner from '../../../screens/components/Barnner';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import styles from './Index.module.css';

export default function DayCell({ 
  day, 
  isCurrentMonth, 
  isToday, 
  isSelected, 
  dayAppointments = [], 
  onClick,
  onOpenCitaDetails
}) {
  const [ripples, setRipples] = useState([]);

  const handleCellClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now() + Math.random() // Garantizar ID único rápido
    };

    setRipples((prev) => [...prev, newRipple]);

    if (onClick) {
      onClick(e);
    }
  };

  const handleAnimationEnd = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  const getBarnnerType = (status) => {
    const est = String(status || '').toLowerCase().trim();
    if (est === 'completada') return 'success';
    if (est === 'programada') return 'warning';
    if (est === 'en_curso') return 'default';
    if (est === 'cancelada') return 'danger';
    return 'default';
  };

  const maxRenderCount = 2;
  const renderList = dayAppointments.slice(0, maxRenderCount);
  const remainingCount = dayAppointments.length - maxRenderCount;

  let cellClass = styles.dayCell;
  if (!isCurrentMonth) cellClass += ` ${styles.otherMonth}`;
  if (isToday) cellClass += ` ${styles.todayDay}`;
  if (isSelected) cellClass += ` ${styles.selectedDay}`;

  return (
    <div className={cellClass} onClick={handleCellClick}>
      {/* Ondas de expansión (Ripples) */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className={styles.rippleWave}
          style={{
            top: r.y,
            left: r.x,
            width: r.size,
            height: r.size
          }}
          onAnimationEnd={() => handleAnimationEnd(r.id)}
        />
      ))}

      <div className={styles.dayHeader}>
        <span className={styles.dayNumber}>{day.getDate()}</span>
      </div>
      
      {dayAppointments.length > 0 && (
        <div className={styles.badgeContainer}>
          <span className={styles.appointmentCountBadge}>
            {dayAppointments.length} {dayAppointments.length === 1 ? 'cita' : 'citas'}
          </span>
        </div>
      )}
    </div>
  );
}