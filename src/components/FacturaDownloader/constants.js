import { getIcon } from '../../assets/icons/ExportIcon/Index';

export const TEXT_FACTURAS = {
  title: 'Gestión de Recibos',
  menuTitle: 'Panel de la Secretaria',
  stats: {
    total: 'Total',
    pendientes: 'Pendientes',
    completadas: 'Completadas',
  },
  searchPlaceholder: 'Buscar por cliente, mascota o doctor...',
  filterLabel: 'Estado de cita',
  refreshBtn: 'Refrescar',
  refreshingBtn: 'Actualizando...',
  emptyMessage: 'No se encontraron recibos o citas.',
  tooltips: {
    generate: 'Generar Factura',
    download: 'Descargar Factura',
    view: 'Ver Factura'
  },
  statusOptions: [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'programada', label: 'Programada' },
    { value: 'completada', label: 'Completada' },
    { value: 'no_asistida', label: 'No Asistida' },
    { value: 'cancelada', label: 'Cancelada' }
  ]
};
