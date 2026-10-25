export { getWorkerTaskName as getWorkerDisplayName } from '../../constants';

export function formatJsonData(dataString) {
  if (!dataString) return null;

  if (typeof dataString === 'object') {
    return JSON.stringify(dataString, null, 2);
  }

  try {
    const parsed = JSON.parse(dataString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return dataString;
  }
}

const FIELD_LABELS = {
  Id: 'ID de registro',
  MascotaId: 'ID de mascota',
  MascotaNombre: 'Mascota',
  VaccineId: 'ID de vacuna',
  VaccineName: 'Vacuna',
  NextDoseDate: 'Próxima dosis',
  ReminderSevenSentAt: 'Recordatorio enviado (7 días antes)',
  ReminderThreeSentAt: 'Recordatorio enviado (3 días antes)',
  ReminderDayBeforeSentAt: 'Recordatorio enviado (1 día antes)',
  ClienteId: 'ID de cliente',
  ClienteNombre: 'Cliente',
  ClienteEmail: 'Correo del cliente',
  Nombre: 'Nombre',
  ResumenIa: 'Resumen generado',
  AlertasRiesgoIa: 'Alertas de riesgo',
  SugerenciasIa: 'Sugerencias',
};

function humanizeFieldName(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

function formatFieldValue(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: value.length > 10 ? 'short' : undefined });
    }
  }
  return String(value);
}

/**
 * Convierte el snapshot JSON del registro vinculado en una lista Markdown legible
 * (clave: valor), con etiquetas amigables para los campos conocidos.
 */
export function buildVinculationSummary(dataString) {
  if (!dataString) return null;

  let parsed;
  if (typeof dataString === 'object') {
    parsed = dataString;
  } else {
    try {
      parsed = JSON.parse(dataString);
    } catch {
      return dataString;
    }
  }

  if (!parsed || typeof parsed !== 'object') return null;

  return Object.entries(parsed)
    .map(([key, value]) => `- **${FIELD_LABELS[key] || humanizeFieldName(key)}:** ${formatFieldValue(value)}`)
    .join('\n');
}

const TYPE_EVENT_LABELS = {
  Error: 'Error',
  Warning: 'Advertencia',
  Success: 'Éxito',
};

export function getTypeEventLabel(typeEvent) {
  return TYPE_EVENT_LABELS[typeEvent] || typeEvent;
}

export function getTypeEventBadgeVariant(typeEvent) {
  switch (typeEvent) {
    case 'Error':
      return 'danger';
    case 'Warning':
      return 'warning';
    case 'Success':
      return 'success';
    default:
      return 'default';
  }
}

export function getCalloutVariant(typeEvent) {
  switch (typeEvent) {
    case 'Error':
      return 'danger';
    case 'Warning':
      return 'warning';
    case 'Success':
      return 'success';
    default:
      return 'neutral';
  }
}
