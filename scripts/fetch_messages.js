// Script para consultar endpoints de mensajería y mostrar ejemplo de respuesta
// Ejecutar: node scripts/fetch_messages.js

const BASE = process.env.BASE_URL || process.env.BASE || 'https://g27frlv5-5168.use2.devtunnels.ms/api';

async function tryGet(path) {
  const url = `${BASE.replace(/\/$/, '')}${path}`;
  console.log('\nGET', url);
  try {
    const headers = {};
    const token = process.env.AUTH_TOKEN || process.env.TOKEN || '';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'GET', headers });
    console.log('Status:', res.status);
    const txt = await res.text();
    let data;
    try { data = JSON.parse(txt); } catch (e) { data = txt; }
    if (typeof data === 'object') {
      const out = JSON.stringify(data, null, 2);
      console.log(out.length > 5000 ? out.slice(0, 5000) + '\n...[truncated]' : out);
    } else {
      console.log(String(data).slice(0, 2000));
    }
  } catch (err) {
    console.error('Fetch error:', err && err.message ? err.message : err);
  }
}

async function main() {
  // Intentos con IDs; puede sobreescribirse con la variable de entorno USER_IDS (csv)
  const envUsers = process.env.USER_IDS;
  const userCandidates = envUsers ? envUsers.split(',').map(s=>s.trim()).filter(Boolean) : ['1', '2', '3', 'me'];
  for (const u of userCandidates) {
    await tryGet(`/mensajes/user/${encodeURIComponent(u)}`);
  }

  // Pares de conversación; puede pasarse vía PAIRS env como 'a-b,a-c'
  const envPairs = process.env.PAIRS;
  const defaultPairs = [['1','2'], ['2','1'], ['1','3']];
  const pairs = envPairs ? envPairs.split(',').map(p=> { const [a,b]=p.split('-'); return [a?.trim(), b?.trim()]; }) : defaultPairs;
  for (const [a,b] of pairs) {
    if (!a || !b) continue;
    await tryGet(`/mensajes/conversation/${encodeURIComponent(a)}/${encodeURIComponent(b)}`);
  }

  console.log('\nHecho. Si obtienes 401, proporciona un token válido o el ID de usuario que quieras probar.');
}

// Node may not have global fetch in very old versions
if (typeof fetch === 'undefined') {
  console.error('fetch no está disponible en este entorno Node. Usa Node 18+ o instala node-fetch.');
  process.exit(1);
}

main().catch(err => { console.error('Error en main:', err); process.exit(1); });
