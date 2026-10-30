// Reglas de formato compartidas por todos los formularios. Espejo de las validaciones del backend
// (DTOs con [RegularExpression] / [Range] / NotFutureDate), para avisar antes de enviar.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const TELEFONO_RE = /^[\d\s+\-()]{7,20}$/;

export const isValidEmail = (value) => EMAIL_RE.test(String(value ?? '').trim());
export const isValidTelefono = (value) => TELEFONO_RE.test(String(value ?? '').trim());
export const isNonNegativeNumber = (value) => {
  const str = String(value ?? '').trim();
  return str !== '' && !isNaN(Number(str)) && Number(str) >= 0;
};
export const isNotFutureDate = (value) => {
  if (!value) return true;
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.getTime() <= Date.now();
};
