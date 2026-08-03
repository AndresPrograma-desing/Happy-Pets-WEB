import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isSameMonth, isSameDay } from 'date-fns';
import { TEXTS } from '../../constants';
import DayCell from '../DayCell/Index';
import styles from './Index.module.css';

export default function CalendarGrid({
  currentDate,
  selectedDate,
  calendarDays = [],
  onPrevMonth,
  onNextMonth,
  onSetToday,
  onSelectDate,
  onOpenCitaDetails
}) {
  const currentYear = currentDate.getFullYear();
  const currentMonthName = TEXTS.MONTHS[currentDate.getMonth()];

  return (
    <div className={styles.calendarCard}>
      {/* Header Navegación */}
      <div className={styles.header}>
        <h2 className={styles.monthTitle}>
          {currentMonthName} <span>{currentYear}</span>
        </h2>

        <div className={styles.navControls}>
          <button
            type="button"
            className={styles.navButton}
            onClick={onPrevMonth}
            title="Mes Anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className={styles.btnToday}
            onClick={onSetToday}
          >
            {TEXTS.BUTTON_TODAY}
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={onNextMonth}
            title="Siguiente Mes"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className={styles.gridWeekdays}>
        {TEXTS.WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Cuadrícula de Días */}
      <div className={styles.gridDays}>
        {calendarDays.map((dayObj, idx) => {
          const dateStr = dayObj.date || dayObj.Date || '';
          let dayDate = new Date();
          
          if (dateStr) {
            // Primero intentamos parsear dd-MM-yyyy (o dd/MM/yyyy)
            const matchDMY = dateStr.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/);
            if (matchDMY) {
              const dateNum = parseInt(matchDMY[1], 10);
              const month = parseInt(matchDMY[2], 10) - 1;
              const year = parseInt(matchDMY[3], 10);
              dayDate = new Date(year, month, dateNum);
            } else {
              // Luego intentamos yyyy-MM-dd
              const matchYMD = dateStr.match(/^(\d{4})[/-](\d{2})[/-](\d{2})/);
              if (matchYMD) {
                const year = parseInt(matchYMD[1], 10);
                const month = parseInt(matchYMD[2], 10) - 1;
                const dateNum = parseInt(matchYMD[3], 10);
                dayDate = new Date(year, month, dateNum);
              } else {
                const parsed = new Date(dateStr);
                if (!isNaN(parsed.getTime())) {
                  dayDate = parsed;
                }
              }
            }
          }

          const isCurrentMonth = dayObj.is_current_month ?? dayObj.isCurrentMonth ?? false;
          const isToday = isSameDay(dayDate, new Date());
          const isSelected = isSameDay(dayDate, selectedDate);

          // Extraer las citas de los slots ocupados del día e inyectar la hora del slot
          const slots = dayObj.slots || dayObj.Slots || [];
          const dayAppointments = slots
            .filter((s) => {
              const hasCita = !!(s.cita || s.Cita);
              const statusVal = String(s.status || s.Status || '').toLowerCase().trim();
              return hasCita || statusVal === 'ocupado';
            })
            .map((s) => {
              const cita = s.cita || s.Cita;
              if (cita) {
                return {
                  ...cita,
                  hora_cita: s.hour || s.Hour || '',
                  estado: cita.estado || cita.Estado || ''
                };
              }
              // Si no tiene cita asociada pero está ocupado, es una indisponibilidad manual/bloqueo
              return {
                id: `blocked-${s.hour || s.Hour || ''}`,
                paciente_nombre: 'Indisponible',
                cliente_nombre: '',
                motivo: 'Horario no disponible / Bloqueado',
                estado: 'bloqueado',
                hora_cita: s.hour || s.Hour || '',
                isBlocked: true
              };
            })
            .filter(Boolean);

          return (
            <DayCell
              key={idx}
              day={dayDate}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isSelected={isSelected}
              dayAppointments={dayAppointments}
              onClick={() => onSelectDate(dayDate)}
              onOpenCitaDetails={onOpenCitaDetails}
            />
          );
        })}
      </div>
    </div>
  );
}