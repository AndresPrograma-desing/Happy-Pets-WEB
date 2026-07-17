import { request } from '../client';

/**
 * Obtiene las estadísticas generales del panel de control (Dashboard).
 * @returns {Promise<Object>} Datos de ganancias, pérdidas, citas, stock, etc.
 */
export async function getDashboardStats() {
  return request('/Dashboard/stats', { method: 'GET' });
}
