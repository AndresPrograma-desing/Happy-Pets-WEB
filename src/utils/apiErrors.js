// Utilidades para parsear errores devueltos por el backend
// El `request()` en `src/services/api.js` lanza `Error` con una propiedad `body`
// que normalmente contiene el JSON devuelto por el servidor. Estas funciones
// extraen mensajes legibles, mapean errores por campo y ayudan a mostrarlos
// en `AlertModal` o en `react-hook-form`.

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

export function getApiBody(err) {
  if (!err) return null;
  if (err.body !== undefined && err.body !== null) return err.body;
  // axios-like shape
  if (err.response) {
    if (err.response.data !== undefined) return err.response.data;
    return err.response;
  }
  return err;
}

export function getAlertPayload(err) {
  const parsed = parseServerErrors(err);
  if (parsed.general && parsed.general.length > 0) {
    return parsed.general.join('\n');
  }
  const body = getApiBody(err);
  if (!body) return err?.message ?? String(err);
  if (typeof body === 'string') return body;
  return JSON.stringify(body);
}

function toCamelCaseField(field) {
  if (!field) return field;
  return field.split('.').map(s => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())).join('.');
}

function toSnakeCaseField(field) {
  if (!field) return field;
  return field.split('.').map(s => s.replace(/([A-Z])/g, '_$1').toLowerCase()).join('.');
}

// Devuelve un objeto { fieldErrors: { fieldName: message }, general: [messages...] }
export function parseServerErrors(err) {
  const body = getApiBody(err);
  const fieldErrors = {};
  const general = [];

  if (body == null) {
    const m = err?.message ?? String(err);
    if (m) general.push(m);
    return { fieldErrors, general };
  }

  if (typeof body === 'string' || typeof body === 'number') {
    general.push(String(body));
    return { fieldErrors, general };
  }

  // Si el body es un array de mensajes/objetos
  if (Array.isArray(body)) {
    body.forEach(item => {
      if (!item) return;
      if (typeof item === 'string' || typeof item === 'number') {
        general.push(String(item));
        return;
      }
      if (isObject(item)) {
        const f = item.field || item.path || item.param || item.property || '';
        const msg = item.message || item.msg || item.error || item.description || (item.constraints && Object.values(item.constraints).join(', '));
        if (f) fieldErrors[f] = (fieldErrors[f] ? fieldErrors[f] + ', ' : '') + (msg || 'Dato invalido');
        else general.push(msg || 'Dato invalido');
      }
    });
    return { fieldErrors, general };
  }

  // body es objeto
  if (isObject(body)) {
    // body.errors puede ser objeto { field: ['msg'] } o array
    if (isObject(body.errors) && !Array.isArray(body.errors)) {
      Object.entries(body.errors).forEach(([k, v]) => {
        if (!v && v !== 0) return;
        if (Array.isArray(v)) fieldErrors[k] = v.join(', ');
        else if (typeof v === 'string' || typeof v === 'number') fieldErrors[k] = String(v);
        else if (isObject(v)) fieldErrors[k] = v.message || v.msg || JSON.stringify(v);
      });
    } else if (Array.isArray(body.errors)) {
      body.errors.forEach(it => {
        if (!it) return;
        if (typeof it === 'string') general.push(it);
        else if (isObject(it)) {
          const f = it.field || it.path || it.param || '';
          const msg = it.message || it.msg || it.error || it.description || (it.constraints && Object.values(it.constraints).join(', '));
          if (f) fieldErrors[f] = (fieldErrors[f] ? fieldErrors[f] + ', ' : '') + (msg || 'Dato invalido');
          else general.push(msg || 'Dato invalido');
        }
      });
    }

    // details
    if (Array.isArray(body.details)) {
      body.details.forEach(it => {
        if (!it) return;
        if (typeof it === 'string') {
          general.push(it);
          return;
        }
        if (isObject(it)) {
          const f = it.field || it.path || it.param || '';
          const msg = it.message || it.msg || it.error || it.description || (it.constraints && Object.values(it.constraints).join(', '));
          if (f) fieldErrors[f] = (fieldErrors[f] ? fieldErrors[f] + ', ' : '') + (msg || 'Dato invalido');
          else general.push(msg || 'Dato invalido');
        }
      });
    }

    // top-level message / error
    if (body.message) {
      if (typeof body.message === 'string') general.push(body.message);
      else if (Array.isArray(body.message)) general.push(...body.message.filter(Boolean).map(String));
      else if (isObject(body.message)) general.push(body.message.message || JSON.stringify(body.message));
    }
    if (body.error) general.push(String(body.error));
  }

  // expandir variantes snake/camel para facilitar el mapping en el front
  const expanded = {};
  Object.keys(fieldErrors).forEach(k => {
    const msg = fieldErrors[k];
    expanded[k] = msg;
    const camel = toCamelCaseField(k);
    const snake = toSnakeCaseField(k);
    if (camel && camel !== k) expanded[camel] = msg;
    if (snake && snake !== k && snake !== camel) expanded[snake] = msg;
  });

  const dedupGeneral = Array.from(new Set(general.filter(Boolean)));
  return { fieldErrors: expanded, general: dedupGeneral };
}

// Aplica errores al react-hook-form: devuelve { applied: boolean, general: [msgs] }
export function applyServerErrorsToForm(err, { setError, clearErrors } = {}) {
  if (typeof setError !== 'function') return { applied: false, general: [] };
  const { fieldErrors, general } = parseServerErrors(err);
  if (typeof clearErrors === 'function') {
    try { clearErrors(Object.keys(fieldErrors)); } catch (err) { if (import.meta.env.DEV) console.error('clearErrors failed', err); }
  }
  let applied = false;
  Object.entries(fieldErrors).forEach(([field, msg]) => {
    try { setError(field, { type: 'server', message: msg }); applied = true; } catch (err) { if (import.meta.env.DEV) console.error('setError failed for field', field, err); }
  });
  return { applied, general };
}

export default {
  getApiBody,
  getAlertPayload,
  parseServerErrors,
  applyServerErrorsToForm,
};
