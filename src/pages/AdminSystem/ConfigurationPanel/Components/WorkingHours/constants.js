export const WORKING_HOURS_TEXTS = {
  panelTitle: 'Horario laboral',
  panelDesc: 'Define el horario en el que se pueden agendar citas. Fuera de este rango el sistema no permitirá guardarlas.',
  cardTitle: 'Horario de atención',
  rangeLabel: 'Hora de apertura y cierre',
  hint: 'Una cita dura 30 minutos, por lo que debe terminar antes o justo a la hora de cierre.',
  saveChanges: 'Guardar Cambios',
  cancel: 'Cancelar',
  successSave: 'Horario laboral actualizado con éxito.',
  errorLoad: 'No se pudo cargar el horario laboral.',
  errorSave: 'No se pudo guardar el horario laboral.',
  invalidRange: 'La hora de apertura debe ser menor que la hora de cierre.'
};

export const WORKING_HOURS_FORM_ID = 'working-hours-form';
export const DEFAULT_RANGE = { start: '08:00', end: '20:00' };
