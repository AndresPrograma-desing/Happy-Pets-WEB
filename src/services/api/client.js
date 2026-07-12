import { getStorageValue, logout, TOKEN_KEY } from './storage';
import { DEV_URL_API, isDummyModeActive } from '../../../config/config';
import dummyDB from '../../dummy/db.json';

// Cambia aquí si deseas usar el localhost o el tunnel por defecto
export const API_BASE = (import.meta.env.VITE_API_URL || `${DEV_URL_API.baseURL}/api`).replace(/\/$/, '');

export async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
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
    if (lowerPath.includes('/products/categories')) return dummyDB.categories;
    if (lowerPath.includes('/products')) return dummyDB.products;
    if (lowerPath.includes('/citas/requests') || lowerPath.includes('/citas/today')) return dummyDB.citas;
    if (lowerPath.includes('/clients')) return dummyDB.clients;
    if (lowerPath.includes('/money/tasa-dollar-bcv')) return dummyDB.money.tasa_dollar_bcv;
    
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

  if (auth) {
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
    const errMsg = (data && (data.error || data.message)) || res.statusText || 'Error en la petición';
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
