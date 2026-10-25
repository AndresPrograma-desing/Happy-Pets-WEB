import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('es-VE', { style: 'currency', currency }).format(value || 0);

export const getCurrencyCode = (moneyType) => (moneyType === 'VES' ? 'VES' : 'USD');

/**
 * The backend returns one bucket per period regardless of groupBy (day/week/month/year):
 * `mes` is only populated for month buckets, while `periodo` is always a human-readable
 * label (e.g. "Ago 2026" or "Semana del 24/08/2026"). We plot exactly the buckets returned
 * instead of assuming a fixed 12-month calendar.
 */
export const buildRevenueChartData = (periodsData) =>
  (periodsData || []).map((item) => ({
    label: (item.mes && item.mes.trim()) || item.periodo || '',
    value: item.ganancia ?? item.revenue ?? 0,
  }));

export const getAppointmentStatusBadgeType = (estado) => {
  const status = (estado || '').toLowerCase();
  if (status === 'completada') return 'success';
  if (status === 'programada' || status === 'en_curso') return 'warning';
  if (status === 'cancelada' || status === 'no_asistida') return 'danger';
  return 'default';
};

export const PERIODS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

export const APPOINTMENT_STATUSES = ['programada', 'en_curso', 'completada', 'cancelada', 'no_asistida'];

export const formatAppointmentStatusLabel = (estado) => (estado || '').replace('_', ' ').toUpperCase();

export const getStatusBreakdown = (citasPorEstado) =>
  APPOINTMENT_STATUSES
    .filter((status) => (citasPorEstado || {})[status] !== undefined)
    .map((status) => ({ status, count: citasPorEstado[status] }));

export const formatAlertDate = (isoDate) => {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? '' : format(date, "dd MMM yyyy, hh:mm a", { locale: es });
};

const toISODate = (date) => date.toISOString().slice(0, 10);

export const getPeriodRange = (period, referenceDate = new Date()) => {
  const end = new Date(referenceDate);
  const start = new Date(referenceDate);

  switch (period) {
    case PERIODS.WEEK:
      start.setDate(start.getDate() - 6);
      break;
    case PERIODS.MONTH:
      start.setMonth(start.getMonth() - 1);
      break;
    case PERIODS.YEAR:
      start.setFullYear(start.getFullYear() - 1);
      break;
    case PERIODS.DAY:
    default:
      break;
  }

  return { startDate: toISODate(start), endDate: toISODate(end) };
};

/**
 * Both /Dashboard/dashboard and /Excell/download-dashboard accept the same
 * filter query params, so the mapping from UI filter state -> request params
 * is shared between the data fetch and the Excel export.
 */
export const buildFilterParams = (filters = {}) => ({
  ...(filters.period ? { ...getPeriodRange(filters.period), groupBy: filters.period } : {}),
  ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
});
