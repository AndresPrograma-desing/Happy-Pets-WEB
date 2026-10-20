import { getStorageValue, logout, TOKEN_KEY, getClientToken, clientLogout } from './storage';
import { DEV_URL_API, isDummyModeActive } from '../../../config/config';
import dummyDB from '../../dummy/db.json';

export const API_BASE = `${DEV_URL_API.baseURL}/api`;

export async function request(path, { method = 'GET', body, headers = {}, auth = true, responseType } = {}) {
  if (isDummyModeActive()) {
    const lowerPath = path.toLowerCase();
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 400));
    
    if (lowerPath.includes('/auth/login')) {
      let credentials = {};
      try { credentials = typeof body === 'string' ? JSON.parse(body) : (body || {}); } catch(e){}
      const rol = credentials?.rol?.toLowerCase() || '';
      if (rol === 'doctor') return dummyDB.auth.doctor;
      if (rol === 'secretaria') return dummyDB.auth.secretaria;
      return dummyDB.auth.login; // default admin
    }
    if (lowerPath.includes('/auth/me')) return dummyDB.auth.me;
    if (lowerPath.includes('/users/roles')) {
      return {
        roles: ["admin", "doctor", "secretaria"]
      };
    }
    if (lowerPath.includes('/products/categories')) return dummyDB.categories;
    if (lowerPath.includes('/products')) return dummyDB.products;
    if (lowerPath.includes('/citas/requests') || lowerPath.includes('/citas/today')) return dummyDB.citas;
    if (lowerPath.includes('/clients')) return dummyDB.clients;
    if (lowerPath.includes('/money/tasa-dollar-bcv')) return dummyDB.money.tasa_dollar_bcv;
    if (lowerPath.includes('/logs/get-logs')) {
      const logs = [
        {
          "id": 1,
          "usuario_id": 1,
          "usuario_nombre": "Admin User",
          "accion": "CREAR_PRODUCTO",
          "tabla_afectada": "Products",
          "registro_id": 12,
          "datos_previos": null,
          "datos_nuevos": "{\"nombre\": \"Antibiótico Felino\", \"precio\": 15.0}",
          "ip_address": "192.168.1.50",
          "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          "created_at": "2026-07-30T10:15:30.000Z"
        },
        {
          "id": 2,
          "usuario_id": 2,
          "usuario_nombre": "Dr. Juan",
          "accion": "ACTUALIZAR_CITA",
          "tabla_afectada": "Citas",
          "registro_id": 101,
          "datos_previos": "{\"estado\": \"pendiente\"}",
          "datos_nuevos": "{\"estado\": \"completada\"}",
          "ip_address": "192.168.1.55",
          "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
          "created_at": "2026-07-30T11:20:00.000Z"
        },
        {
          "id": 3,
          "usuario_id": 1,
          "usuario_nombre": "Admin User",
          "accion": "ELIMINAR_USUARIO",
          "tabla_afectada": "Users",
          "registro_id": 99,
          "datos_previos": "{\"id\": 99, \"nombre\": \"Test User\", \"rol\": \"secretaria\"}",
          "datos_nuevos": null,
          "ip_address": "192.168.1.50",
          "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          "created_at": "2026-07-30T12:05:15.000Z"
        },
        {
          "id": 4,
          "usuario_id": 3,
          "usuario_nombre": "Ana Secretaria",
          "accion": "CREAR_CLIENTE",
          "tabla_afectada": "Clients",
          "registro_id": 54,
          "datos_previos": null,
          "datos_nuevos": "{\"nombre\": \"Maria Gomez\", \"telefono\": \"0412-5555555\"}",
          "ip_address": "192.168.1.60",
          "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          "created_at": "2026-07-30T13:40:00.000Z"
        },
        {
          "id": 5,
          "usuario_id": 1,
          "usuario_nombre": "Admin User",
          "accion": "ACTUALIZAR_MONEDA",
          "tabla_afectada": "Money",
          "registro_id": 1,
          "datos_previos": "{\"tasa_dollar_bcv\": 36.20}",
          "datos_nuevos": "{\"tasa_dollar_bcv\": 36.50}",
          "ip_address": "127.0.0.1",
          "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          "created_at": "2026-07-30T14:10:00.000Z"
        }
      ];
      const params = new URLSearchParams(path.split('?')[1] || '');
      const pageNumber = parseInt(params.get('pageNumber') || '1', 10);
      const pageSize = parseInt(params.get('pageSize') || '10', 10);
      const start = (pageNumber - 1) * pageSize;
      const end = start + pageSize;
      return logs.slice(start, end);
    }
    if (lowerPath.includes('/clients/validate')) {
      return {
        id: 1,
        nombre: "Ignacio",
        apellido: "Andres",
        email: "ignacioangel671@gmail.com",
        identificacion: "V-12345678",
        mascotas: [
          {
            id: 1,
            nombre: "Firulais"
          },
          {
            id: 11,
            nombre: "doki"
          }
        ]
      };
    }
    if (lowerPath.includes('/medicalhistory/mascota/')) {
      const petId = path.split('/').pop() || '1';
      const petName = petId === '1' ? 'Firulais' : 'doki';
      const petColor = petId === '1' ? 'Marrón' : 'Gris';
      return {
        mascota: {
          id: Number(petId),
          nombre: petName,
          especie: petId === '1' ? 'Perro' : 'Gato',
          raza: petId === '1' ? 'Golden Retriever' : 'Siamés',
          fechaNacimiento: petId === '1' ? '2021-08-01' : '2022-05-15',
          color: petColor
        },
        consultas: [
          {
            id: 1,
            fecha_consulta: '2026-07-15T10:00:00.000Z',
            doctor_nombre: 'Dr. Ramírez',
            receta: 'Vitamina C, 1 pastilla diaria por 30 días.'
          }
        ]
      };
    }

    // Default mock response for unhandled endpoints
    console.warn(`[Mock] Unhandled dummy endpoint: ${path}`);
    return { success: true, dummyFallback: true };
  }

  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/auth/m') cleanPath = '/auth/me';

  const base = (typeof API_BASE === 'string' ? API_BASE.replace(/\/$/, '') : '').trim();

  let pathNormalized = cleanPath;
  if (base.toLowerCase().endsWith('/api')) {
    if (pathNormalized.toLowerCase().startsWith('/api')) {
      pathNormalized = pathNormalized.slice(4); 
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

  if (String(method || 'GET').toUpperCase() === 'GET') {
    opts.cache = 'no-store';
  }

  if (auth === 'client') {
    const clientToken = getClientToken();
    if (clientToken) {
      opts.headers['Authorization'] = `Bearer ${clientToken}`;
    }
  } else if (auth) {
    const token = getStorageValue(TOKEN_KEY);
    if (token) {
      opts.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      const smallBody = body && typeof body === 'object' ? { ...body } : body;
      const safeHeaders = { ...opts.headers };
      if (safeHeaders.Authorization) safeHeaders.Authorization = '[REDACTED]';
      console.debug('[api.request]', method, url, safeHeaders, smallBody);
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('api.request logging failed', err);
  }

  if (body !== undefined && !['GET', 'HEAD'].includes(method.toUpperCase())) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
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
    if (import.meta.env.DEV) console.error('[api.request] fetch failed', err);
    const e = new Error(err?.message || 'Network request failed');
    e.original = err;
    e.isNetworkError = true;
    throw e;
  }

  if (res.status === 204) return null;

  if (res.ok && responseType === 'blob') {
    const blob = await res.blob();
    const contentDisposition = res.headers.get('content-disposition') || '';
    let filename = '';
    
    // Check filename*=UTF-8''filename.pdf
    const utf8Matches = /filename\*=UTF-8''([^;\n]+)/i.exec(contentDisposition);
    if (utf8Matches && utf8Matches[1]) {
      try {
        filename = decodeURIComponent(utf8Matches[1]);
      } catch (e) {
        filename = utf8Matches[1];
      }
    } else {
      // Fallback to filename="filename.pdf"
      const matches = /filename="?([^";\n]+)"?/i.exec(contentDisposition);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }
    return { blob, filename };
  }

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
      try { auth === 'client' ? clientLogout() : logout(); } catch (err) { if (import.meta.env.DEV) console.error('logout failed', err); }
    }

    // 1. Priorizamos el mensaje detallado enviado por el backend en el JSON
    let errMsg = (data && (data.error || data.message));

    // 2. Si el backend no envió un mensaje personalizado, asignamos mensajes amigables según el status code
    if (!errMsg) {
      switch (res.status) {
        case 400:
          errMsg = 'Solicitud incorrecta. Verifique los datos enviados.';
          break;
        case 401:
          errMsg = 'Sesión expirada o no autorizada. Por favor, inicie sesión nuevamente.';
          break;
        case 403:
          errMsg = 'No tiene permisos para realizar esta acción.';
          break;
        case 404:
          errMsg = 'El recurso solicitado no fue encontrado.';
          break;
        case 500:
          errMsg = 'Error interno del servidor. Intente de nuevo más tarde.';
          break;
        default:
          errMsg = res.statusText || `Error en la petición (Código: ${res.status})`;
      }
    }

    const err = new Error(errMsg);
    err.status = res.status;
    err.body = data;
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', { 
        detail: { message: errMsg, status: res.status } 
      }));
    }

    throw err;
  }


  return data;
}
