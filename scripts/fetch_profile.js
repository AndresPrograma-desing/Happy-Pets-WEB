// Script para consultar /api/auth/me
// Uso: AUTH_TOKEN="<token>" node scripts/fetch_profile.js

const BASE = process.env.BASE_URL || process.env.BASE || 'https://g27frlv5-5168.use2.devtunnels.ms/api';

async function main() {
  const token = process.env.AUTH_TOKEN || process.env.TOKEN || '';
  const url = `${BASE.replace(/\/$/, '')}/auth/me`;
  console.log('GET', url);
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(url, { method: 'GET', headers });
    console.log('Status:', res.status);
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
    } else {
      const txt = await res.text();
      console.log(txt.slice(0, 4000));
    }
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

async function ensureFetch() {
  if (typeof fetch !== 'undefined') return;
  try {
    const mod = await import('node-fetch');
    // node-fetch ESM export default = fetch
    if (mod && (mod.default || mod.fetch)) {
      globalThis.fetch = mod.default ?? mod.fetch;
      if (mod.Headers) globalThis.Headers = mod.Headers;
      if (mod.Request) globalThis.Request = mod.Request;
      if (mod.Response) globalThis.Response = mod.Response;
      return;
    }
  } catch (err) {
    console.error('fetch no disponible y no se pudo importar node-fetch. Instala con: npm install node-fetch');
    process.exit(1);
  }
}

ensureFetch().then(() => main()).catch(err => {
  console.error('Error inicializando fetch:', err && err.message ? err.message : err);
  process.exit(1);
});
