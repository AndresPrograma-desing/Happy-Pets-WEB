import { request } from '../client';

/**
 * Builds the query string shared by /Dashboard/dashboard and /Excell/download-dashboard.
 * @param {Object} [filters]
 * @param {string} [filters.startDate] - YYYY-MM-DD
 * @param {string} [filters.endDate] - YYYY-MM-DD
 * @param {'day'|'week'|'month'|'year'} [filters.groupBy]
 * @param {string} [filters.status] - estado de cita (ej. 'completada')
 */
export function buildDashboardQuery(filters = {}) {
  const { startDate, endDate, groupBy, status } = filters;
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (groupBy) params.set('groupBy', groupBy);
  if (status) params.set('status', status);
  return params.toString();
}

/**
 * Obtiene las estadísticas generales del panel de control (Dashboard).
 * @param {Object} [filters] - ver buildDashboardQuery
 * @returns {Promise<Object>} Datos de ganancias, pérdidas, citas, stock, etc.
 */
export async function getDashboardStats(filters = {}) {
  const query = buildDashboardQuery(filters);
  return request(`/Dashboard/dashboard${query ? `?${query}` : ''}`, { method: 'GET' });
}
