import { request } from '../client';

export async function getCredencialPdf(id) {
  return request(`/Pdf/credencial/${id}`, {
    method: 'GET',
    responseType: 'blob'
  });
}

export async function getVaccinationCarnetPdf(mascotaId) {
  return request(`/Pdf/mascota/${mascotaId}/carnet`, {
    method: 'GET',
    responseType: 'blob'
  });
}
