// Script para enviar mensajes de prueba usando la forma en español (emisorId/receptorId/contenido)
// Uso: BASE_URL='http://localhost:3002/api' AUTH_TOKEN='testtoken123' node scripts/send_test_messages.js

const BASE = process.env.BASE_URL || process.env.BASE || 'https://g27frlv5-5168.use2.devtunnels.ms/api';
const TOKEN = process.env.AUTH_TOKEN || process.env.TOKEN || '';

async function post(path, body) {
  const url = `${BASE.replace(/\/$/, '')}${path}`;
  console.log('\nPOST', url);
  console.log('body:', body);
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); } catch (e) { data = txt; }
  console.log('Status:', res.status);
  console.log(data);
  return { status: res.status, data };
}

async function main() {
  if (typeof fetch === 'undefined') {
    console.error('fetch no disponible en Node. Usa Node 18+');
    process.exit(1);
  }

  const tests = [
    { emisorId: 29, receptorId: 30, contenido: 'Hola 30, ¿puedes confirmar la cita de mañana?' },
    { emisorId: 30, receptorId: 29, contenido: 'Sí 29, confirmado. Gracias.' },
    { emisorId: 29, receptorId: 31, contenido: 'Hola 31, necesito enviarte un informe.' }
  ];

  for (const t of tests) {
    try { await post('/mensajes', t); } catch (err) { console.error('Error al enviar:', err); }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
