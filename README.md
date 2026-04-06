# React + Vite

Enlace para la documentacion en interfaz web [Abrir DOC.html](Documentation/DOC.html)



const API_BASE = (import.meta.env.VITE_API_URL || 'https://g27frlv5-5168.use2.devtunnels.ms').replace(/\/$/, '');

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
  // Aseguramos que el path siempre empiece con /
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Compatibilidad defensiva: si algún caller antiguo usa /auth/m, redirigir a /auth/me
  if (cleanPath === '/auth/m') cleanPath = '/auth/me';
  const url = `${API_BASE}${cleanPath}`;
  
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (auth) {
    const token = localStorage.getItem('token');
    // Es buena práctica verificar que el token no sea "undefined" o "null" como string
    if (token && token !== 'undefined') {
      opts.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  
  // Manejo de 204 No Content (común en logouts o deletes)
  if (res.status === 204) return null;

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    console.error('Error parsing JSON response:', e, 'Response text was:', text);
    data = text;
  }

  if (!res.ok) {
    // Si el backend devuelve un error 401, podrías querer cerrar sesión automáticamente
    if (res.status === 401) {
      logout();
      // window.location.href = '/login'; // Opcional: redirigir
    }
    const err = new Error(data?.message || res.statusText);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

// Cambiamos los paths para que sean consistentes
export async function login(credentials) {
  const data = await request('/Auth/login', { method: 'POST', body: credentials, auth: false });
  if (data?.token) localStorage.setItem('token', data.token);
  // Guardamos respuesta de login para reutilizar doctor_id sin llamar /auth/me
  if (data) localStorage.setItem('auth_login_data', JSON.stringify(data));
  const doctorId =
    extractDoctorId(data) ||
    extractDoctorId(data?.data) ||
    extractDoctorId(data?.result) ||
    '';
  if (doctorId) localStorage.setItem('doctor_id', String(doctorId));
  return data;
}

export async function createUser(user) {
  return request('/created/users', { method: 'POST', body: user });
}

// Productos
export async function getProducts() {
  return request('/products', { method: 'GET' });
}

// Admin products endpoints
export async function adminGetProducts() {
  return request('/admin/products', { method: 'GET' });
}

export async function adminCreateProduct(payload) {
  return request('/admin/products', { method: 'POST', body: payload });
}

export async function adminUpdateProduct(id, payload) {
  return request(`/admin/products/${id}`, { method: 'PUT', body: payload });
}

export async function adminDeleteProduct(id) {
  return request(`/admin/products/${id}`, { method: 'DELETE' });
}

export async function deleteCita(id) {
  return request(`/citas/${id}`, { method: 'DELETE' });
}

// Endpoint alternativo: algunos backends exponen rutas con el prefijo /delete
// Añadimos un helper para intentar este path si el DELETE directo a /citas/:id no existe.
export async function deleteCitaAlt(id) {
  return request(`/delete/citas/${id}`, { method: 'DELETE' });
}

export async function updateCitaEstado(id, estado) {
  return request(`/citas/${id}/estado`, { method: 'PATCH', body: { estado } });
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
  return request('/create_citas', { method: 'POST', body: payload });
}

export async function getCitasDetalle() {
  return request('/citas/detalle', { method: 'GET' });
}
export async function getCitas() {
  return request('/citas', { method: 'GET' });
}
export async function getMascotasByUserName(nombre) {
  const safeName = encodeURIComponent(String(nombre || '').trim());
  return request(`/users/${safeName}/mascotas`, { method: 'GET' });
}

export async function getSecretarias() {
  return request('/secretarias', { method: 'GET' });
}




export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('auth_login_data');
  localStorage.removeItem('doctor_id');
}

export function getToken() {
  return localStorage.getItem('token');
}

export async function getProfile() {
  return request('/auth/me');
}

export function getDoctorIdFromLoginSession() {
  try {
    const directDoctorId = localStorage.getItem('doctor_id');
    if (directDoctorId) return directDoctorId;

    const raw = localStorage.getItem('auth_login_data');
    if (!raw) return '';
    const data = JSON.parse(raw);
    return (
      extractDoctorId(data) ||
      extractDoctorId(data?.data) ||
      extractDoctorId(data?.user) ||
      extractDoctorId(data?.doctor) ||
      ''
    );
  } catch {
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
    const raw = localStorage.getItem('auth_login_data');
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
  } catch {
    return '';
  }
}

export async function decreaseProductStock(productId, cantidad = 1) {
  // Intento principal: endpoint específico proporcionado por backend
  try {
    return await request(`/decrease/products/${productId}/quantity`, { method: 'PATCH', body: { quantity: String(cantidad) } });
  } catch (err) {
    console.warn('No se pudo disminuir stock mediante endpoint específico, intentando con endpoints alternativos...', err);
    // Fallbacks: otros endpoints conocidos
    try {
      return await request(`/products/${productId}/quantity`, { method: 'PATCH', body: { quantity: String(cantidad) } });
    } catch (err2) {
      console.warn('No se pudo disminuir stock mediante endpoint general, intentando con endpoint admin...', err2);
      try {
        return await request(`/admin/products/${productId}/quantity`, { method: 'PATCH', body: { quantity: String(cantidad) } });
      } catch (err3) {
        console.warn('No se pudo disminuir stock mediante endpoints específicos, intentando actualizar producto directamente...', err3);
        try {
          return await request(`/products/${productId}/quantity`, { method: 'PATCH', body: { cantidad: String(cantidad) } });
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
};