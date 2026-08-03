export const STANDARD_HOURS = [
  '08:00', '08:30',
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30'
];

export const formatDateToYYYYMMDD = (date) => {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const formatTimeTo12h = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const displayHours = String(hours).padStart(2, '0');
  return `${displayHours}:${minutes} ${period}`;
};

// Helper to parse HH:mm to minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
};

/**
 * Recibe los slots de la API para un día específico (ahora incluye toda la agenda generada por el backend)
 * y simplemente los ordena y formatea para la vista.
 */
export const getDayAgendaFromApiSlots = (slots = []) => {
  // Asegurarnos de usar una copia para no mutar el array original
  const agenda = [...slots];

  // Ordenar cronológicamente
  agenda.sort((a, b) => {
    const timeA = a.hour || a.Hour || '';
    const timeB = b.hour || b.Hour || '';
    return timeA.localeCompare(timeB);
  });

  return agenda.map(s => {
    const statusVal = String(s.status || s.Status || '').toLowerCase().trim();
    const cita = s.cita || s.Cita || null;
    const hour = s.hour || s.Hour || '';
    const displayHour = s.display_hour || s.displayHour || formatTimeTo12h(hour);

    return {
      hour,
      displayHour,
      cita,
      status: statusVal
    };
  });
};