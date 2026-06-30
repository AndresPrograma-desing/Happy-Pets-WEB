export const TOKEN_KEY = 'token';
export const LOGIN_DATA_KEY = 'auth_login_data';
export const DOCTOR_ID_KEY = 'doctor_id';

export function getStorageValue(key) {
  const sessionValue = sessionStorage.getItem(key);
  if (sessionValue && sessionValue !== 'undefined' && sessionValue !== 'null') {
    return sessionValue;
  }

  const localValue = localStorage.getItem(key);
  if (localValue && localValue !== 'undefined' && localValue !== 'null') {
    sessionStorage.setItem(key, localValue);
    return localValue;
  }

  return '';
}

export function setStorageValue(key, value) {
  const safeValue = value == null ? '' : String(value);
  if (!safeValue) return;
  sessionStorage.setItem(key, safeValue);
  localStorage.setItem(key, safeValue);
}

export function getToken() {
  return getStorageValue(TOKEN_KEY);
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LOGIN_DATA_KEY);
  sessionStorage.removeItem(DOCTOR_ID_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LOGIN_DATA_KEY);
  localStorage.removeItem(DOCTOR_ID_KEY);
}

export function extractDoctorId(source) {
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

export function extractUserName(source) {
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
