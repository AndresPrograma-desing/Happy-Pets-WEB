export const CONFIG_PANEL_TEXTS = {
  workerCenterTitle: "Worker Center",
};

// Nombres y descripciones en español natural para cada tarea automática del sistema,
// pensados para usuarios que no conocen el nombre técnico de la clase (ej. "VaccinationReminderWorker").
// Compartido entre WorkerCenter (configuración) y WorkerProcessEvents (actividad/eventos)
// para que ambas pantallas muestren exactamente lo mismo por tarea.
export const WORKER_TASK_INFO = {
  AutoGenerateReportWorker: {
    name: "Generación de Reportes",
    description: "Genera automáticamente los reportes de actividad del sistema de forma periódica.",
  },
  DeleteReportWorker: {
    name: "Eliminación de Reportes",
    description: "Elimina automáticamente los reportes antiguos ya vencidos para liberar espacio.",
  },
  DeleteFacturaWorker: {
    name: "Eliminación de Facturas",
    description: "Elimina automáticamente los archivos de facturas antiguas ya vencidas.",
  },
  DeleteConsultaPdfWorker: {
    name: "Eliminación de PDFs de Consultas",
    description: "Elimina automáticamente los archivos PDF de consultas antiguas ya vencidas.",
  },
  VaccinationReminderWorker: {
    name: "Recordatorios de Vacunación",
    description: "Envía recordatorios por correo y notificaciones cuando una vacuna está por vencer.",
  },
  HistoriaClinicaSummaryWorker: {
    name: "Resúmenes Clínicos con IA",
    description: "Genera automáticamente el resumen clínico de las mascotas usando inteligencia artificial.",
  },
  BcvWorker: {
    name: "Tasa del Dólar (BCV)",
    description: "Actualiza automáticamente la tasa del dólar según el Banco Central de Venezuela.",
  },
  ClearNotificationsWorker: {
    name: "Limpieza de Notificaciones",
    description: "Elimina automáticamente las notificaciones ya leídas para mantener el sistema ordenado.",
  },
};

export function getWorkerTaskName(workerName) {
  return WORKER_TASK_INFO[workerName]?.name || workerName;
}

export function getWorkerTaskDescription(workerName) {
  return WORKER_TASK_INFO[workerName]?.description || "Tarea de servicio en segundo plano del sistema.";
}

export const WORKER_EVENTS_TEXTS = {
  panelTitle: "Actividad de Tareas Automáticas",
  panelDescription: "Consulta los errores y éxitos registrados por las tareas automáticas del sistema, con su cantidad de intentos y estado.",
  filterTypeLabel: "Tipo de evento",
  filterStatusLabel: "Estado",
  filterFromLabel: "Desde",
  filterToLabel: "Hasta",
  typeAll: "Todos",
  typeError: "Error",
  typeWarning: "Advertencia",
  typeSuccess: "Éxito",
  statusAll: "Todos",
  statusActive: "Activo",
  statusResolved: "Solucionado",
  columnEvent: "Tarea",
  columnType: "Tipo",
  columnIntents: "Intentos",
  columnStatus: "Estado",
  columnCreated: "Creado",
  columnResolvedAt: "Resuelto",
  statusActiveLabel: "Activo",
  statusResolvedLabel: "Solucionado",
  emptyMessage: "No hay eventos registrados.",
  errorLoading: "Error al obtener la actividad de las tareas automáticas.",
  rowsPerPage: "Filas por página",
  detailTitle: "Detalle del evento",
  detailVinculation: "Información del registro procesado",
  detailError: "Mensaje de error",
  noVinculation: "Sin registro vinculado.",
};
