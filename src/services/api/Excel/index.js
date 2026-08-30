import { request } from '../client';
import { buildDashboardQuery } from '../Dashboard';

/**
 * Descarga el Excel del Dashboard, respetando los mismos filtros aplicados a /Dashboard/dashboard.
 * @param {Object} [filters] - ver buildDashboardQuery en services/api/Dashboard
 * @returns {Promise<{blob: Blob, filename: string}>}
 */
export async function downloadDashboardExcel(filters = {}) {
  const query = buildDashboardQuery(filters);
  return request(`/Excell/download-dashboard${query ? `?${query}` : ''}`, {
    method: 'GET',
    responseType: 'blob',
  });
}
