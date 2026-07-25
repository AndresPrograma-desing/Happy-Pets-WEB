import { getStorageValue, logout, TOKEN_KEY } from './storage';
import { DEV_URL_API } from '../../../config/config';
import { request } from './client';

export async function getEmailsTemplates() {
    return request('Emails/Templates', { method: 'GET' });
}

export async function updateEmailTemplate(id, data) {
    return request(`Emails/Templates/${id}`, { method: 'PUT', body: data });
}

// emailTypeCode

//  public const int Recibos = 25;
//         public const int ResetPassword = 15;
//         public const int Bienvenido = 10;

//         public static string GetEmailTypeString(int typeCode)
//         {
//             return typeCode switch
//             {
//                 Recibos => "Recibos",
//                 ResetPassword => "ResetPassword",
//                 Bienvenido => "Bienvenido",
//                 _ => "Unknown"
//             };
//         }

export async function sendEmails( EntityId, emailTypeCode ) {
    return request(`Emails/send-email/${EntityId}?emailTypeCode=${emailTypeCode}`, { method: 'POST' });
}

export async function resendData() {
  return request ('Emails/data-resend', {method: 'GET'});
}

export async function updateResendData(data) {
  return request ('Emails/update-resend', {method: 'POST', body: data});
}