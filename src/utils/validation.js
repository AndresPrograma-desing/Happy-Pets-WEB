// Reglas de formato compartidas por todos los formularios. Espejo de las validaciones del backend
// (DTOs con [RegularExpression] / [Range] / NotFutureDate), para avisar antes de enviar.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const TELEFONO_RE = /^\d+$/;
export const soloDigitos = (value) => String(value ?? '').replace(/\D/g, '');

export const CEDULA_TIPOS = [
  { value: 'V', label: 'Venezolano (V)' },
  { value: 'E', label: 'Extranjero (E)' },
];
export const CEDULA_DIGITOS_RE = /^\d{6,8}$/;

export const buildCedula = (tipo, numero) => `${tipo}-${String(numero ?? '').trim()}`;

export const isValidCedula = (value) => {
  const match = /^([VE])-(\d+)$/.exec(String(value ?? '').trim());
  return !!match && CEDULA_DIGITOS_RE.test(match[2]);
};

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
