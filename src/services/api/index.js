import { request } from './client';
import {
  getToken,
  logout,
  getDoctorIdFromLoginSession,
  getUserNameFromLoginSession,
  setStorageValue,
  TOKEN_KEY,
  LOGIN_DATA_KEY,
  DOCTOR_ID_KEY,
  extractDoctorId
} from './storage';

export {
  request,
  getToken,
  logout,
  getDoctorIdFromLoginSession,
  getUserNameFromLoginSession
};

export async function login(credentials) {
  const payload = {
    email: credentials?.email ?? credentials?.Email ?? '',
    password:
      credentials?.password ??
      credentials?.Password ??
      credentials?.contraseña ??
      credentials?.Contraseña ??
      '',
    rol: credentials?.rol ?? credentials?.Rol ?? credentials?.role ?? '',
  };
  
  const data = await request('/Auth/login', { method: 'POST', body: payload, auth: false });

  if (data?.token) setStorageValue(TOKEN_KEY, data.token);
  if (data) setStorageValue(LOGIN_DATA_KEY, JSON.stringify(data));

  const doctorId =
    extractDoctorId(data) ||
    extractDoctorId(data?.data) ||
    extractDoctorId(data?.result) ||
    '';
  if (doctorId) setStorageValue(DOCTOR_ID_KEY, doctorId);
  
  return data;
}
export async function getCodeRecovery(email) {
  return request(`/PasswordRecovery/request-code?email=${encodeURIComponent(email)}`, { method: 'GET' });
}
export async function sendCodeRecovery(code) {
  return request('/PasswordRecovery/verify-code', { method: 'POST', body: { code } });
}
export async function createUser(user) {
  return request('/Users/Create', { method: 'POST', body: user });
}
export async function users() {
  return request('/Users', { method: 'GET'});
}
export async function enableUser(id) {
  return request(`/Users/${id}/enable`, { method: 'PATCH' });
}
export async function disableUser(id) {
  return request(`/Users/${id}/disable`, { method: 'PATCH' });
}
export async function deleteUser(id) {
  return request(`/Users/${id}`, { method: 'DELETE' });
}

export async function getProducts() {
  const candidates = ['/products', '/Products', '/productos', '/Productos', '/admin/Products'];
  let lastError = null;
  for (const path of candidates) {
    try {
      return await request(path, { method: 'GET' });
    } catch (err) {
      lastError = err;
      if (!(err && err.status === 404)) {
        throw err;
      }
    }
  }
  throw lastError || new Error('No se pudo obtener productos');
}

export async function updateProducts(id, payload) {
  return request(`/Products/update/${id}`, { 
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(payload) 
  }); 
}
export async function categories() {
  return request('/Products/categories', { method: 'GET' });
}

export async function getFacturas() {
  const candidates = ['/facturas', '/Facturas', '/invoices', '/invoices/list'];
  let lastError = null;

  for (const path of candidates) {
    try {
      return await request(path, { method: 'GET' });
    } catch (err) {
      lastError = err;
      if (!(err && err.status === 404)) {
        throw err;
      }
    }
  }

  throw lastError || new Error('No se pudo obtener facturas');
}

export async function adminGetProducts() {
  return request('/admin/Products', { method: 'GET' });
}

export async function adminCreateProduct(payload) {
  return request('/Products/Create', { method: 'POST', body: payload });
}

export async function adminUpdateProduct(id, payload) {
  return request(`/admin/Products/${id}`, { method: 'PUT', body: payload });
}

export async function adminDeleteProduct(id) {
  if (id === undefined || id === null || String(id).trim() === '') {
    throw new Error('adminDeleteProduct: id inválido');
  }
  return request(`/Products/delete/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function deleteCita(id) {
  return request(`/Citas/${id}`, { method: 'DELETE' });
}

export async function deleteCitaAlt(id) {
  return request(`/Citas/${id}`, { method: 'DELETE' });
}

export async function updateCitaEstado(id, estado) {
  return request(`/Citas/${id}/status`, { method: 'PATCH', body: { estado } });
}

export async function createCliente(payload) {
  return request('/clientes', { method: 'POST', body: payload });
}

export async function createMascota(payload) {
  return request('/create_mascotas', { method: 'POST', body: payload });
}

export async function createClienteMascota(payload) {
  return request('/ClientPets/create-with-pet', { method: 'POST', body: payload });
}

export async function getClients() {
  return request('/Clients', { method: 'GET' });
}

export async function getUsers() {
  return request('/users', { method: 'GET' });
}
export async function sendInvoiceWSM(id) {
  return request(`/WSMessage/dispatch/appointment/${id}`, { method: 'POST' });
}

export async function createCita(payload) {
  const rawFecha = String(payload?.fecha_cita || '').trim();
  const rawHora = String(payload?.hora_cita || '').trim();
  const rawMotivo = String(payload?.motivo || '').trim();

  if (!rawHora) {
    throw new Error('La hora de la cita es obligatoria (hora_cita).');
  }

  if (!rawMotivo) {
    throw new Error('El motivo de la cita es obligatorio (motivo).');
  }

  if (!/^(\d{1,2}):(\d{2})(:\d{2})?$/.test(rawHora)) {
    throw new Error('Formato de hora inválido. Usa HH:mm.');
  }

  if (rawFecha && !/^\d{4}-\d{2}-\d{2}$/.test(rawFecha)) {
    throw new Error('Formato de fecha inválido. Usa YYYY-MM-DD.');
  }

  const horaConSegundos = rawHora.length === 5 ? `${rawHora}:00` : rawHora;

  const body = {
    mascota_id: Number(payload?.mascota_id),
    doctor_id: Number(payload?.doctor_id),
    hora_cita: horaConSegundos,
    motivo: rawMotivo,
    tipo_cita: String(payload?.tipo_cita || '').trim(),
    estado: String(payload?.estado || '').trim(),
    notas: String(payload?.notas || '').trim(),
    metodo_pago: String(payload?.metodo_pago || 'efectivo').trim(),
  };

  if (payload?.secretaria_id !== null && payload?.secretaria_id !== undefined && String(payload.secretaria_id).trim() !== '') {
    body.secretaria_id = Number(payload.secretaria_id);
  }

  if (rawFecha) {
    body.fecha_cita = rawFecha;
  }

  return request('/Citas/create', { method: 'POST', body });
}

export async function getCitasDetalle() {
  return request('/Citas/requests', { method: 'GET' });
}
export async function getCitas() {
  return request('/Citas/requests', { method: 'GET' });
}
export async function getMascotasByUserName(nombre) {
  const safeName = encodeURIComponent(String(nombre || '').trim());
  return request(`/users/${safeName}/pets`, { method: 'GET' });
}

export async function getSecretarias() {
  return request('/Users/secretarias', { method: 'GET' });
}

export async function sendMessage(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('sendMessage: payload object expected');
  }

  if ('emisorId' in payload || 'receptorId' in payload || 'contenido' in payload) {
    return request('/mensajes', { method: 'POST', body: payload });
  }

  const body = {
    emisorId: String(payload.from ?? payload.emisor ?? payload.sender ?? ''),
    receptorId: String(payload.to ?? payload.receptor ?? payload.receiver ?? ''),
    contenido: payload.content ?? payload.text ?? payload.body ?? payload.contenido ?? ''
  };

  return request('/mensajes', { method: 'POST', body });
}

export async function getConversation(userId, otherId) {
  const u = encodeURIComponent(String(userId || ''));
  const o = encodeURIComponent(String(otherId || ''));
  return request(`/mensajes/conversation/${u}/${o}`, { method: 'GET' });
}

export async function getUserMessages(userId) {
  return request(`/mensajes/user/${encodeURIComponent(String(userId || ''))}`, { method: 'GET' });
}

export async function markMessageAsRead(messageId) {
  return request(`/mensajes/${encodeURIComponent(String(messageId || ''))}/read`, { method: 'PATCH' });
}

export async function updateFacturaEstadoPago(idfactura, estado_pago = 'pagada') {
  return request(`/Facturas/${idfactura}/estado-pago`, {
    method: 'PATCH',
    body: { estado_pago },
  });
}

export async function updatePassword(userEmail, oldPassword, newPassword) {
  return request(`/auth/update-password`, {
    method: 'POST',
    body: { userEmail, oldPassword, newPassword },
  });
}
export async function genarateReport(generadoPor) {
  return request(`/Report/generate-full?generadoPor=${encodeURIComponent(generadoPor)}`, { method: 'POST' });
}
export async function files() {
  return request(`/Report`, { method: 'GET' });
}
export async function settingReport(days) {
  return request(`/Report/settings/retention-days`, 
    { method: 'POST', body: { days } });
}
export async function autoDeleting(isEnabled) {
  return request(`/Report/settings/autodelete`, 
    { method: 'POST', body: isEnabled });
}
export async function autoGeneration(isEnabled) {
  return request(`/Report/settings/autogenerate`,
    { method: 'POST', body: isEnabled });
}
export async function getReportSettings() {
  return request(`/Report/settings`, { method: 'GET' });
}
export async function getFacturaSettigs() {
  return request(`/Facturas/settings-facturas`, { method: 'GET' });
}

export async function getProfile() {
  return request('/auth/me');
}

export async function decreaseProductStock(productId, cantidad = 1) {
  try {
    return await request(`/Products/${productId}/quantity`, { method: 'PATCH', body: { quantity: String(cantidad) } });
  } catch (err) {
    try {
      return await request(`/Products/${productId}/quantity`, { method: 'PATCH', body: { quantity: String(cantidad) } });
    } catch (err2) {
      try {
        return await request(`/admin/Products/${productId}/quantity`, { method: 'PATCH', body: { quantity: String(cantidad) } });
      } catch (err3) {
        try {
          return await request(`/Products/${productId}/quantity`, { method: 'PATCH', body: { cantidad: String(cantidad) } });
        } catch (err4) {
          const prods = await getProducts();
          const p = Array.isArray(prods) ? prods.find(x => String(x.id) === String(productId)) : null;
          if (!p) throw new Error('product not found');
          const current = Number(p.stock ?? p.cantidad ?? p.cantidad_disponible ?? 0);
          const newStock = current - Number(cantidad);
          try {
            return await adminUpdateProduct(productId, { stock: newStock });
          } catch (uerr) {
            return await adminUpdateProduct(productId, { cantidad: newStock });
          }
        }
      }
    }
  }
}
export async function StatusUser(id) {
  return request(`/Users/${id}/status`, { method: 'GET'});
}

export async function getMoneyType() {
  return request('/Money', { method: 'GET' });
}

export async function updateMoneyType(money) {
  return request('/Money/update', { method: 'PUT', body: money });
}
export async function getDollarBcv() {
  return request('/api/money/tasa-dollar-bcv', { method: 'GET' });
}
export async function updateBcvPrice(price) {
  return request('/money/tasa-dollar-bcv/manual', { method: 'PUT', body: { price } });
}
export async function citaToday() {
  return request('/Citas/today', { method: 'GET' });
}
export async function createdNotification(payload) {
  return request('/Notification/created', {
    method: 'POST',
    body: payload
  });
}
export async function getNotifications(userId) {
  return request(`/Notification/user/${encodeURIComponent(String(userId || ''))}`, { method: 'GET' });
}
export async function markNotificationAsRead(notificationId) {
  return request(`/Notification/${encodeURIComponent(String(notificationId || ''))}/mark-as-read`, { method: 'POST' });
}
export async function wsmessageAPI() {
  return request(`/WSMessage/session/status`, { method: 'GET' });
}
export async function searchClients(query) {
  return request(`/ClientPets/lookup/clients?query=${encodeURIComponent(query)}`, { 
    method: 'GET' 
  });
}
export async function createPetForExistingClient(body) {
  return request(`/ClientPets/add-pet`, { 
    method: 'POST',
    body
  });


//Notificacion PUSH
}

export async function requestPasswordReset(email) {
  return request('/users/request-password-reset', {
    method: 'POST',
    body: { email: String(email).trim() },
  });
}

export async function getResetStatus(email) {
  return request(`/users/reset-status/${encodeURIComponent(email)}`, {
    method: 'GET',
  });
}

export async function getPendingResets() {
  return request('/users/pending-resets', {
    method: 'GET',
  });
}

export async function assignNewPassword(email, new_password) {
  return request('/users/assign-new-password', {
    method: 'POST',
    body: { 
      email: String(email).trim(),
      new_password: String(new_password).trim() 
    },
  });
}

export async function createConsulta(payload) {
  return request('/consultas/create', { method: 'POST', body: payload });
}

export async function getConsultaById(id) {
  return request(`/Consultas/${id}`, { method: 'GET' });
}

export default {
  request,
  login,
  logout,
  getToken,
  getProfile,
  getDoctorIdFromLoginSession,
  deleteCita,
  deleteCitaAlt,
  getCitas,
  updateCitaEstado,
  createCliente,
  createMascota,
  createClienteMascota,
  getClients,
  getUsers,
  createCita,
  getCitasDetalle,
  getMascotasByUserName,
  getSecretarias,
  getFacturas,
  getUserNameFromLoginSession,
  decreaseProductStock,
  sendMessage,
  getConversation,
  getUserMessages,
  markMessageAsRead,
  searchClients,
  createPetForExistingClient,
  createConsulta,
  getConsultaById,
  requestPasswordReset,
  getResetStatus,
  getPendingResets,
  assignNewPassword,
};
