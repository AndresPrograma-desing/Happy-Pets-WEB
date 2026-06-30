import { getStorageValue, logout, TOKEN_KEY } from './storage';
import { DEV_URL_API } from '../../../config/config';
import { request } from './client';

export async function getEmailsTemplates() {
    return request('Emails/Templates', { method: 'GET' });
}

export async function updateEmailTemplate(id, data) {
    return request(`Emails/Templates/${id}`, { method: 'PUT', body: data });
}
