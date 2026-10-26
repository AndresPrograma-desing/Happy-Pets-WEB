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
  extractDoctorId,
  getUserFirstNameFromLoginSession,
  getUserLastNameFromLoginSession,
  syncStorageNameAndLastName,
  getUserEmailFromLoginSession,
  syncStorageProfileData
} from './storage';

export {
  request,
  getToken,
  logout,
  getDoctorIdFromLoginSession,
  getUserNameFromLoginSession,
  getUserFirstNameFromLoginSession,
  getUserLastNameFromLoginSession,
  syncStorageNameAndLastName,
  getUserEmailFromLoginSession,
  syncStorageProfileData
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
export async function loginWithContextHub(ticket) {
  const data = await request('/Auth/login-contexthub', { method: 'POST', body: { ticket }, auth: false });

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
export async function getRoles() {
  return request('/Users/roles', { method: 'GET' });
}


export async function getProducts(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.categoriaId) queryParams.append('categoriaId', params.categoriaId);
  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
  if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  const candidates = ['/products', '/Products', '/productos', '/Productos', '/admin/Products'];
  let lastError = null;
  for (const path of candidates) {
    try {
      return await request(`${path}${queryString}`, { method: 'GET' });
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

export async function getClients(pageNumber, pageSize, query) {
  const params = [];
  if (pageNumber !== undefined && pageNumber !== null) params.push(`pageNumber=${pageNumber}`);
  if (pageSize !== undefined && pageSize !== null) params.push(`pageSize=${pageSize}`);
  if (query) params.push(`query=${encodeURIComponent(query)}`);
  const queryString = params.length > 0 ? `?${params.join('&')}` : '';
  return request(`/Clients${queryString}`, { method: 'GET' });
}
export async function deleteClient(id) {
  return request(`/Clients/delete/${encodeURIComponent(id)}`, { method: 'DELETE' });
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

  if (payload?.servicio_id !== null && payload?.servicio_id !== undefined && String(payload.servicio_id).trim() !== '') {
    body.servicio_id = Number(payload.servicio_id);
  }

  if (rawFecha) {
    body.fecha_cita = rawFecha;
  }

  return request('/Citas/create', { method: 'POST', body });
}
export async function getCitasDetalle(params = {}) {
  const query = new URLSearchParams();
  
  if (params.status) query.append('status', params.status);
  if (params.date) query.append('date', params.date);
  if (params.allDates !== undefined) query.append('allDates', params.allDates);
  if (params.pageNumber) query.append('pageNumber', params.pageNumber);
  if (params.pageSize) query.append('pageSize', params.pageSize);
  
  const queryString = query.toString();
  const url = queryString ? `/Citas/requests?${queryString}` : '/Citas/requests';
  
  return request(url, { method: 'GET' });
}

export async function getCitas(params = {}) {
  const query = new URLSearchParams();
  
  if (params.status) query.append('status', params.status);
  if (params.date) query.append('date', params.date);
  if (params.allDates !== undefined) query.append('allDates', params.allDates);
  if (params.pageNumber) query.append('pageNumber', params.pageNumber);
  if (params.pageSize) query.append('pageSize', params.pageSize);
  
  const queryString = query.toString();
  const url = queryString ? `/Citas/requests?${queryString}` : '/Citas/requests';
  
  return request(url, { method: 'GET' });
}

export async function getCitaStatuses() {
  return request('/Citas/statuses', { method: 'GET' });
}

export async function getCitaTypes() {
  return request('/Citas/types', { method: 'GET' });
}

export async function updateCita(id, payload) {
  return request(`/Citas/update/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
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
  return request(`/mensajes/${u}/${o}/conversations`, { method: 'GET' });
}

export async function getUserMessages(userId) {
  return request(`/mensajes/${encodeURIComponent(String(userId || ''))}/message-user`, { method: 'GET' });
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
export async function downloadReportExcel(id) {
  return request(`/Report/excel/${id}`, { method: 'GET', responseType: 'blob' });
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

export async function getUserPermissions(userId) {
  return request(`/UserPermissions/${userId}`, { method: 'GET' });
}

export async function updateUserPermissions(userId, permissions) {
  return request(`/UserPermissions/${userId}`, { method: 'PUT', body: { permissions } });
}

export async function getPermissionsCatalog() {
  return request('/Permissions/permission', { method: 'GET' });
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
  return request(`/Notification/user/${encodeURIComponent(String(userId || ''))}/notifications`, { method: 'GET' });
}
export async function markNotificationAsRead(notificationId) {
  return request(`/Notification/${encodeURIComponent(String(notificationId || ''))}/mark-as-read`, { method: 'POST' });
}
export async function respondToCitaRequest(alertId, aceptar, mensaje) {
  return request(`/Notification/${encodeURIComponent(String(alertId || ''))}/respond-cita-request`, {
    method: 'POST',
    body: { aceptar, mensaje }
  });
}
export async function wsmessageAPI() {
  return request(`/WSMessage/session/status`, { method: 'GET' });
}
export async function searchClients(query) {
  return request(`/ClientPets/lookup/clients?query=${encodeURIComponent(query)}`, { 
    method: 'GET' 
  });
}
export async function uploadClientImage(clientId, file) {
  const body = new FormData();
  body.append('image', file);
  return request(`/ClientPets/client/${encodeURIComponent(clientId)}/image`, { method: 'POST', body });
}
export async function uploadPetImage(petId, file) {
  const body = new FormData();
  body.append('image', file);
  return request(`/ClientPets/pet/${encodeURIComponent(petId)}/image`, { method: 'POST', body });
}
export async function createPetForExistingClient(body) {
  return request(`/ClientPets/add-pet`, { 
    method: 'POST',
    body
  });
}
export async function updateClient(id, payload) {
  return request(`/Clients/update/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: payload
  });
}
export async function updatePet(id, payload) {
  return request(`/Pets/update/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: payload
  });
}
export async function deletePet(id) {
  return request(`/Pets/delete/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
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

export async function updateConsultaReceta(id, payload) {
  return request(`/Consultas/${id}/receta`, { method: 'PATCH', body: payload });
}

export async function generateConsultaPdf(id) {
  return request(`/Consultas/${id}/pdf`, { method: 'POST' });
}

export async function updateUserName(payload) {
  return request('/Users/update-user-name', { method: 'PATCH', body: payload });
}
export async function ChangeProfileAvatar(payload) {
  return request('/Profile/update-profile', { method: 'POST', body: payload });
}

export async function getMedicalHistory(id) {
  return request(`/MedicalHistory/mascota/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function refrestMedicalHistory(id) {
  return request(`/MedicalHistory/mascota/${encodeURIComponent(id)}/history`, { method: 'POST' });
}
export async function grop(pregunta, historial = []) {
  return request('/NowGrod/consultar', { 
    method: 'POST',
    body: { pregunta, historial }
  });
}

export async function externalNowGrodWeb() {
  return request('/NowGrod/session-token', {method: 'GET' });
}

export async function getIaConocimiento(categoria) {
  return request(`/IaConocimiento/categoria/${encodeURIComponent(categoria || '')}`);
}
export async function saveIaConocimiento(payload) {
  return request('/IaConocimiento/guardar', {
    method: 'POST',
    body: payload
  });
}
export async function getCalendar({ year, month, doctorId } = {}) {
  const queryParams = new URLSearchParams();
  if (year) queryParams.append('year', year);
  if (month) queryParams.append('month', month);
  if (doctorId) queryParams.append('doctorId', doctorId);

  const queryString = queryParams.toString();
  const url = `/Calendar/get-calendar${queryString ? `?${queryString}` : ''}`;

  return request(url, { method: 'GET' });
}

export async function checkDoctorAvailability({ doctorId, date, time, durationMinutes = 30 } = {}) {
  const queryParams = new URLSearchParams();
  if (doctorId) queryParams.append('doctorId', doctorId);
  if (date) queryParams.append('date', date);
  if (time) queryParams.append('time', time);
  if (durationMinutes) queryParams.append('durationMinutes', durationMinutes);

  const queryString = queryParams.toString();
  const url = `/Calendar/check-availability${queryString ? `?${queryString}` : ''}`;

  return request(url, { method: 'GET' });
}

export async function getLogs(params = {}) {
  const query = new URLSearchParams();
  query.append('pageNumber', params.pageNumber || 1);
  query.append('pageSize', params.pageSize || 10);
  if (params.userId) query.append('userId', params.userId);
  if (params.action) query.append('action', params.action);
  if (params.dateFrom) query.append('dateFrom', params.dateFrom);
  if (params.dateTo) query.append('dateTo', params.dateTo);

  return request(`/Logs/get-logs?${query.toString()}`, { method: 'GET' });
}

export async function getWorkerProcessEvents(filters = {}) {
  const { pageNumber = 1, pageSize = 10, typeEvent, isResolved, fromDate, toDate } = filters;

  const params = new URLSearchParams({ pageNumber, pageSize });
  if (typeEvent) params.append('typeEvent', typeEvent);
  if (isResolved !== undefined && isResolved !== null) params.append('isResolved', isResolved);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);

  return request(`/WorkerProcessEvents/get-events?${params.toString()}`, { method: 'GET' });
}

export async function getClientById(id) {
  return request(`/Clients/${encodeURIComponent(id)}`, {
    method: 'GET',
    auth: false
  });
}

// Portal de Clientes: login passwordless por código de un solo uso enviado al correo
// (el cliente nunca crea ni recuerda una contraseña). Sesión propia (token 'client',
// ver services/api/storage.js), independiente del login de empleados.
// Ver Controller/Clients/ClientAuthController.cs.
export async function requestClientLoginCode(identifier) {
  return request('/ClientAuth/request-code', {
    method: 'POST',
    body: { identifier },
    auth: false
  });
}

export async function verifyClientLoginCode(code) {
  return request('/ClientAuth/verify-code', {
    method: 'POST',
    body: { code },
    auth: false
  });
}

export async function getClientMe() {
  return request('/ClientAuth/me', { method: 'GET', auth: 'client' });
}

export async function getClientMeMascotas() {
  return request('/ClientAuth/me/mascotas', { method: 'GET', auth: 'client' });
}

export async function getClientMeCitas() {
  return request('/ClientAuth/me/citas', { method: 'GET', auth: 'client' });
}

export async function getClientMeHistorial(mascotaId) {
  return request(`/ClientAuth/me/mascotas/${encodeURIComponent(mascotaId)}/historial`, { method: 'GET', auth: 'client' });
}

export async function getClientMeHistorialPdf(mascotaId) {
  return request(`/ClientAuth/me/mascotas/${encodeURIComponent(mascotaId)}/historial/pdf`, {
    method: 'GET',
    auth: 'client',
    responseType: 'blob'
  });
}

export async function uploadMyClientImage(file) {
  const body = new FormData();
  body.append('image', file);
  return request('/ClientAuth/me/image', { method: 'POST', body, auth: 'client' });
}

export async function uploadMyPetImage(petId, file) {
  const body = new FormData();
  body.append('image', file);
  return request(`/ClientAuth/me/mascotas/${encodeURIComponent(petId)}/image`, { method: 'POST', body, auth: 'client' });
}

// Portal de Clientes: acciones de autoservicio (cancelar cita, solicitar cita nueva,
// solicitar renovación de receta). Ver Controller/Clients/ClientRequestsController.cs.
export async function cancelClientCita(citaId, motivo) {
  return request(`/ClientRequests/citas/${encodeURIComponent(citaId)}/cancel`, {
    method: 'POST',
    body: { motivo },
    auth: 'client'
  });
}

export async function confirmClientCita(citaId, mensaje) {
  return request(`/ClientRequests/citas/${encodeURIComponent(citaId)}/confirm`, {
    method: 'POST',
    body: { mensaje },
    auth: 'client'
  });
}

export async function getClientMeNotifications() {
  return request('/ClientAuth/me/notifications', { method: 'GET', auth: 'client' });
}

export async function markClientNotificationAsRead(alertId) {
  return request(`/ClientAuth/me/notifications/${encodeURIComponent(alertId)}/read`, { method: 'POST', auth: 'client' });
}

export async function requestClientCita({ mascotaId, motivo, fechaPreferida, horaPreferida }) {
  return request('/ClientRequests/citas', {
    method: 'POST',
    body: {
      mascota_id: mascotaId,
      motivo,
      fecha_preferida: fechaPreferida || null,
      hora_preferida: horaPreferida || null
    },
    auth: 'client'
  });
}

export async function requestClientRecetaRenewal(consultaId, nota) {
  return request(`/ClientRequests/recetas/${encodeURIComponent(consultaId)}/renovar`, {
    method: 'POST',
    body: { nota },
    auth: 'client'
  });
}

export async function getVaccineSpecies() {
  return request('/Vaccine/species', { method: 'GET' });
}

export async function getVaccines(params = {}) {
  const query = new URLSearchParams();
  if (params.species) query.append('species', params.species);
  if (params.active !== undefined) query.append('active', params.active);
  if (params.searchTerm) query.append('searchTerm', params.searchTerm);
  if (params.pageNumber) query.append('pageNumber', params.pageNumber);
  if (params.pageSize) query.append('pageSize', params.pageSize);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/Vaccine${queryString}`, { method: 'GET' });
}

export async function createVaccine(payload) {
  return request('/Vaccine/create', { method: 'POST', body: payload });
}

export async function getVaccineById(id) {
  return request(`/Vaccine/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function updateVaccine(id, payload) {
  return request(`/Vaccine/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
}

export async function deleteVaccine(id) {
  return request(`/Vaccine/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getVaccineBatches(vaccineId, params = {}) {
  const query = new URLSearchParams();
  if (params.active !== undefined) query.append('active', params.active);
  if (params.searchTerm) query.append('searchTerm', params.searchTerm);
  if (params.pageNumber) query.append('pageNumber', params.pageNumber);
  if (params.pageSize) query.append('pageSize', params.pageSize);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/Vaccine/${encodeURIComponent(vaccineId)}/batches${queryString}`, { method: 'GET' });
}

export async function createVaccineBatch(vaccineId, payload) {
  return request(`/Vaccine/${encodeURIComponent(vaccineId)}/batches`, { method: 'POST', body: payload });
}

export async function getPetVaccinationStatus(mascotaId) {
  return request(`/PetVaccination/mascota/${encodeURIComponent(mascotaId)}/status`, { method: 'GET' });
}

export async function getPetVaccinationHistory(mascotaId, status) {
  const queryString = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/PetVaccination/mascota/${encodeURIComponent(mascotaId)}/history${queryString}`, { method: 'GET' });
}

export async function registerPetVaccination(payload) {
  return request('/PetVaccination/register', { method: 'POST', body: payload });
}

export async function postponePetVaccination(id, payload) {
  return request(`/PetVaccination/${encodeURIComponent(id)}/postpone`, { method: 'PATCH', body: payload });
}

export async function sendPetVaccinationToInvoice(id) {
  return request(`/PetVaccination/${encodeURIComponent(id)}/send-to-invoice`, { method: 'POST' });
}

export async function getPendingVaccinationsThisWeek(params = {}) {
  const query = new URLSearchParams();
  if (params.searchTerm) query.append('searchTerm', params.searchTerm);
  if (params.pageNumber) query.append('pageNumber', params.pageNumber);
  if (params.pageSize) query.append('pageSize', params.pageSize);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/PetVaccination/pending-this-week${queryString}`, { method: 'GET' });
}

export async function getInventoryMovements(params = {}) {
  const query = new URLSearchParams();
  if (params.productId) query.append('productId', params.productId);
  if (params.movementType) query.append('movementType', params.movementType);
  if (params.pageNumber) query.append('pageNumber', params.pageNumber);
  if (params.pageSize) query.append('pageSize', params.pageSize);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/MovimientosInventario${queryString}`, { method: 'GET' });
}

export async function getLowStockAlerts() {
  return request('/MovimientosInventario/alertas-stock-minimo', { method: 'GET' });
}

export async function getPriceHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.productId) query.append('productId', params.productId);
  if (params.pageNumber) query.append('pageNumber', params.pageNumber);
  if (params.pageSize) query.append('pageSize', params.pageSize);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/HistorialPrecio${queryString}`, { method: 'GET' });
}

export async function getServices(params = {}) {
  const query = new URLSearchParams();
  if (params.active !== undefined) query.append('active', params.active);
  if (params.searchTerm) query.append('searchTerm', params.searchTerm);
  if (params.pageNumber) query.append('pageNumber', params.pageNumber);
  if (params.pageSize) query.append('pageSize', params.pageSize);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/Servicio${queryString}`, { method: 'GET' });
}

export async function createService(payload) {
  return request('/Servicio/create', { method: 'POST', body: payload });
}

export async function updateService(id, payload) {
  return request(`/Servicio/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
}

export async function deleteService(id) {
  return request(`/Servicio/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getClientAccount(clientId) {
  return request(`/Facturas/client/${encodeURIComponent(clientId)}/account`, { method: 'GET' });
}

export async function getWorkerConfigs() {
  return request('/WorkerConfig', { method: 'GET' });
}

export async function updateWorkerConfig(name, config) {
  return request(`/WorkerConfig/${name}`, {
    method: 'PUT',
    body: config
  });
}

export default {
  getWorkerConfigs,
  updateWorkerConfig,
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
  uploadClientImage,
  uploadPetImage,
  createConsulta,
  getConsultaById,
  requestPasswordReset,
  getResetStatus,
  getPendingResets,
  assignNewPassword,
  updateUserName,
  getUserFirstNameFromLoginSession,
  getUserLastNameFromLoginSession,
  syncStorageNameAndLastName,
  getUserEmailFromLoginSession,
  syncStorageProfileData,
  getMedicalHistory,
  refrestMedicalHistory,
  grop,
  getIaConocimiento,
  saveIaConocimiento,
  updateConsultaReceta,
  generateConsultaPdf,
  getCalendar,
  checkDoctorAvailability,
  getLogs,
  getRoles,
  getClientById,
  requestClientLoginCode,
  verifyClientLoginCode,
  getClientMe,
  getClientMeMascotas,
  getClientMeCitas,
  getClientMeHistorial,
  getClientMeHistorialPdf,
  uploadMyClientImage,
  uploadMyPetImage,
  cancelClientCita,
  confirmClientCita,
  getClientMeNotifications,
  markClientNotificationAsRead,
  requestClientCita,
  requestClientRecetaRenewal,
  getVaccineSpecies,
  getVaccines,
  createVaccine,
  getVaccineById,
  updateVaccine,
  deleteVaccine,
  getVaccineBatches,
  createVaccineBatch,
  getPetVaccinationStatus,
  getPetVaccinationHistory,
  registerPetVaccination,
  postponePetVaccination,
  sendPetVaccinationToInvoice,
  getPendingVaccinationsThisWeek,
  getUserPermissions,
  updateUserPermissions,
  getPermissionsCatalog,
  getInventoryMovements,
  getLowStockAlerts,
  getPriceHistory,
  getServices,
  createService,
  updateService,
  deleteService,
  getClientAccount,
  externalNowGrosWeb: externalNowGrodWeb
};
