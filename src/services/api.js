
const API_BASE = (import.meta.env.VITE_API_URL || 'https://g27frlv5-5168.use2.devtunnels.ms/api').replace(/\/$/, '');
const TOKEN_KEY = 'token';
const LOGIN_DATA_KEY = 'auth_login_data';
const DOCTOR_ID_KEY = 'doctor_id';

function getStorageValue(key) {
  const sessionValue = sessionStorage.getItem(key);
  if (sessionValue && sessionValue !== 'undefined' && sessionValue !== 'null') {
    return sessionValue;
  }

  const localValue = localStorage.getItem(key);
  if (localValue && localValue !== 'undefined' && localValue !== 'null') {
    // Mantiene una copia por pestaña para evitar que otra pestaña cambie la sesión actual.
    sessionStorage.setItem(key, localValue);
    return localValue;
  }

  return '';
}

function setStorageValue(key, value) {
  const safeValue = value == null ? '' : String(value);
  if (!safeValue) return;
  sessionStorage.setItem(key, safeValue);
  localStorage.setItem(key, safeValue);
}

function extractDoctorId(source) {
  if (!source || typeof source !== 'object') return '';
  return (
    source?.doctor_id ??
    source?.doctorId ??
    source?.doctor?.id ??
    source?.usuario?.doctor_id ??
    source?.usuario?.doctorId ??
    source?.usuario?.doctor?.id ??
    source?.usuario?.id ??
    source?.user?.doctor_id ??
    source?.user?.doctorId ??
    source?.user?.doctor?.id ??
    source?.user?.id ??
    source?.profile?.doctor_id ??
    source?.profile?.doctorId ??
    source?.profile?.doctor?.id ??
    source?.id ??
    ''
  );
}

async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  // Normaliza path
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/auth/m') cleanPath = '/auth/me';

  const base = (typeof API_BASE === 'string' ? API_BASE.replace(/\/$/, '') : '').trim();

  // Asegura que la ruta resultante tenga un único /api si API_BASE no lo contiene,
  // y evita duplicarlo si API_BASE ya termina en /api
  let pathNormalized = cleanPath;
  if (base.toLowerCase().endsWith('/api')) {
    if (pathNormalized.toLowerCase().startsWith('/api')) {
      pathNormalized = pathNormalized.slice(4); // quitar "/api" del inicio para no duplicar
    }
  } else {
    if (!pathNormalized.toLowerCase().startsWith('/api')) {
      pathNormalized = `/api${pathNormalized}`;
    }
  }
  const url = `${base}${pathNormalized}`;

  const opts = {
    method,
    headers: { ...headers },
  };

  // Evita respuestas cacheadas en polling GET para forzar request real al backend
  if (String(method || 'GET').toUpperCase() === 'GET') {
    opts.cache = 'no-store';
  }

  // Autorización con token si corresponde
  if (auth) {
    const token = getStorageValue(TOKEN_KEY);
    if (token) {
      opts.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // DEBUG: mostrar en consola las peticiones salientes (dev only)
  try {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      // Evitar imprimir bodies muy grandes
      const smallBody = body && typeof body === 'object' ? { ...body } : body;
      // No loggear tokens
      const safeHeaders = { ...opts.headers };
      if (safeHeaders.Authorization) safeHeaders.Authorization = '[REDACTED]';
      // Muestra método, URL, headers y body
      console.debug('[api.request]', method, url, safeHeaders, smallBody);
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('api.request logging failed', err);
  }

  // Preparar body: no incluir body en GET/HEAD; soportar FormData
  if (body !== undefined && !['GET', 'HEAD'].includes(method.toUpperCase())) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      // No forzar Content-Type, el navegador lo pone con boundary
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json';
      if (opts.headers['Content-Type'].includes('application/json') && typeof body !== 'string') {
        opts.body = JSON.stringify(body);
      } else {
        opts.body = body;
      }
    }
  }

  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    const e = new Error('Verifica la coneccion con el internet ' + (err.message || err));
    e.original = err;
    throw e;
  }

  if (res.status === 204) return null;

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  let data = null;
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      console.error(e);
      const txt = await res.text();
      data = txt || null;
    }
  } else {
    const txt = await res.text();
    try {
      data = txt ? JSON.parse(txt) : null;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to parse non-json response', err);
      data = txt || null;
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      try { logout(); } catch (err) { if (import.meta.env.DEV) console.error('logout failed', err); }
    }
    const err = new Error((data && (data.error || data.message)) || res.statusText);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

// Cambiamos los paths para que sean consistentes
export async function login(credentials) {
  // Aceptar varias formas de nombrar campos (es/eng) y enviar en minúsculas al backend
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

  // request() ya normaliza el /api, así que aquí usamos la ruta de controlador
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

export async function createUser(user) {
  return request('/Users/Create', { method: 'POST', body: user });
}

// Productos
export async function getProducts() {
  const candidates = ['/Products', '/products', '/Product', '/product'];
  let lastError = null;

  for (const path of candidates) {
    try {
      return await request(path, { method: 'GET' });
    } catch (err) {
      lastError = err;
      // Solo intentamos el siguiente candidato cuando la ruta no existe
      if (!(err && err.status === 404)) {
        throw err;
      }
    }
  }

  throw lastError || new Error('No se pudo obtener productos');
}

// Admin products endpoints
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
  return request('/clientes/mascota', { method: 'POST', body: payload });
}

export async function getClientes() {
  return request('/clientes', { method: 'GET' });
}

export async function getUsers() {
  return request('/users', { method: 'GET' });
}

export async function createCita(payload) {
  return request('/Citas/create', { method: 'POST', body: payload });
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

// Messaging endpoints
export async function sendMessage(payload) {
  // Backend expects Spanish keys: emisorId, receptorId, contenido
  if (!payload || typeof payload !== 'object') {
    throw new Error('sendMessage: payload object expected');
  }

  // If caller already provided Spanish-shaped payload, use it
  if ('emisorId' in payload || 'receptorId' in payload || 'contenido' in payload) {
    return request('/mensajes', { method: 'POST', body: payload });
  }

  // Map common English keys to Spanish shape
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




export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LOGIN_DATA_KEY);
  sessionStorage.removeItem(DOCTOR_ID_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LOGIN_DATA_KEY);
  localStorage.removeItem(DOCTOR_ID_KEY);
}

export function getToken() {
  return getStorageValue(TOKEN_KEY);
}

export async function getProfile() {
  return request('/auth/me');
}

export function getDoctorIdFromLoginSession() {
  try {
    const directDoctorId = getStorageValue(DOCTOR_ID_KEY);
    if (directDoctorId) return directDoctorId;

    const raw = getStorageValue(LOGIN_DATA_KEY);
    if (!raw) return '';
    const data = JSON.parse(raw);
    return (
      extractDoctorId(data) ||
      extractDoctorId(data?.data) ||
      extractDoctorId(data?.user) ||
      extractDoctorId(data?.doctor) ||
      ''
    );
  } catch (err) {
    if (import.meta.env.DEV) console.error('getDoctorIdFromLoginSession failed', err);
    return '';
  }
}

function extractUserName(source) {
  if (!source || typeof source !== 'object') return '';
  const nombre =
    source?.nombre ??
    source?.name ??
    source?.first_name ??
    source?.firstName ??
    '';
  const apellido =
    source?.apellido ??
    source?.last_name ??
    source?.lastName ??
    '';
  const full = `${String(nombre || '').trim()} ${String(apellido || '').trim()}`.trim();
  return full || '';
}

export function getUserNameFromLoginSession() {
  try {
    const raw = getStorageValue(LOGIN_DATA_KEY);
    if (!raw) return '';
    const data = JSON.parse(raw);
    return (
      extractUserName(data) ||
      extractUserName(data?.user) ||
      extractUserName(data?.doctor) ||
      extractUserName(data?.usuario) ||
      extractUserName(data?.profile) ||
      extractUserName(data?.data) ||
      ''
    );
  } catch (err) {
    if (import.meta.env.DEV) console.error('getUserNameFromLoginSession failed', err);
    return '';
  }
}

export async function decreaseProductStock(productId, cantidad = 1) {
  // Intento principal: endpoint específico proporcionado por backend
  try {
    return await request(`/Products/${productId}/quantity`, { method: 'PATCH', body: { quantity: String(cantidad) } });
  } catch (err) {
    console.warn('No se pudo disminuir stock mediante endpoint específico, intentando con endpoints alternativos...', err);
    // Fallbacks: otros endpoints conocidos
    try {
      return await request(`/Products/${productId}/quantity`, { method: 'PATCH', body: { quantity: String(cantidad) } });
    } catch (err2) {
      console.warn('No se pudo disminuir stock mediante endpoint general, intentando con endpoint admin...', err2);
      try {
        return await request(`/admin/Products/${productId}/quantity`, { method: 'PATCH', body: { quantity: String(cantidad) } });
      } catch (err3) {
        console.warn('No se pudo disminuir stock mediante endpoints específicos, intentando actualizar producto directamente...', err3);
        try {
          return await request(`/Products/${productId}/quantity`, { method: 'PATCH', body: { cantidad: String(cantidad) } });
        } catch (err4) {
          console.warn('No se pudo disminuir stock mediante endpoint general con "cantidad", intentando con endpoint admin...', err4);
          // Último recurso: actualizar mediante adminUpdateProduct tras obtener el producto
          const prods = await getProducts();
          const p = Array.isArray(prods) ? prods.find(x => String(x.id) === String(productId)) : null;
          if (!p) throw new Error('product not found');
          const current = Number(p.stock ?? p.cantidad ?? p.cantidad_disponible ?? 0);
          const newStock = current - Number(cantidad);
          try {
            return await adminUpdateProduct(productId, { stock: newStock });
          } catch (uerr) {
            console.warn('No se pudo actualizar stock mediante endpoint admin, intentando con campo "cantidad"...', uerr);
            return await adminUpdateProduct(productId, { cantidad: newStock });
          }
        }
      }
    }
  }
}

// Export por defecto para compatibilidad con imports tipo `import api from './services/api'`
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
  getClientes,
  getUsers,
  createCita,
  getCitasDetalle,
  getMascotasByUserName,
  getSecretarias,
  getUserNameFromLoginSession,
  decreaseProductStock,
  sendMessage,
  getConversation,
  getUserMessages,
  markMessageAsRead,
};