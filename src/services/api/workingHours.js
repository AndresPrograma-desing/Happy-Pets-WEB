import { request } from './client';

export async function getWorkingHours() {
  return request('WorkingHours', { method: 'GET' });
}

export async function updateWorkingHours(data) {
  return request('WorkingHours', { method: 'PUT', body: data });
}
