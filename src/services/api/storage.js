export const TOKEN_KEY = 'token';
export const LOGIN_DATA_KEY = 'auth_login_data';
export const DOCTOR_ID_KEY = 'doctor_id';
export const CLIENT_TOKEN_KEY = 'client_token';
export const CLIENT_DATA_KEY = 'client_auth_data';

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
  sessionStorage.removeItem('user_permissions');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LOGIN_DATA_KEY);
  localStorage.removeItem(DOCTOR_ID_KEY);
  localStorage.removeItem('user_permissions');
  localStorage.removeItem('USE_DUMMY_DATA');
}

// Sesión del Portal de Clientes: aislada de la sesión de empleados (TOKEN_KEY/LOGIN_DATA_KEY)
// para que un mismo navegador compartido (ej. recepción) no mezcle ambos tokens.
export function getClientToken() {
  return getStorageValue(CLIENT_TOKEN_KEY);
}

export function setClientSession(token, client) {
  setStorageValue(CLIENT_TOKEN_KEY, token);
  setStorageValue(CLIENT_DATA_KEY, JSON.stringify(client || {}));
}

export function getClientSessionData() {
  try {
    const raw = getStorageValue(CLIENT_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clientLogout() {
  sessionStorage.removeItem(CLIENT_TOKEN_KEY);
  sessionStorage.removeItem(CLIENT_DATA_KEY);
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(CLIENT_DATA_KEY);
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

export function extractUserFirstName(source) {
  if (!source || typeof source !== 'object') return '';
  return (
    source?.nombre ??
    source?.name ??
    source?.first_name ??
    source?.firstName ??
    ''
  );
}

export function extractUserLastName(source) {
  if (!source || typeof source !== 'object') return '';
  return (
    source?.apellido ??
    source?.last_name ??
    source?.lastName ??
    ''
  );
}

export function getUserFirstNameFromLoginSession() {
  try {
    const raw = getStorageValue(LOGIN_DATA_KEY);
    if (!raw) return '';
    const data = JSON.parse(raw);
    const firstName = (
      extractUserFirstName(data) ||
      extractUserFirstName(data?.user) ||
      extractUserFirstName(data?.doctor) ||
      extractUserFirstName(data?.usuario) ||
      extractUserFirstName(data?.profile) ||
      extractUserFirstName(data?.data) ||
      ''
    );
    if (firstName) return firstName;

    const fullName = getUserNameFromLoginSession();
    if (fullName) {
      return fullName.trim().split(/\s+/)[0] || '';
    }
    return '';
  } catch (err) {
    return '';
  }
}

export function getUserLastNameFromLoginSession() {
  try {
    const raw = getStorageValue(LOGIN_DATA_KEY);
    if (!raw) return '';
    const data = JSON.parse(raw);
    const lastName = (
      extractUserLastName(data) ||
      extractUserLastName(data?.user) ||
      extractUserLastName(data?.doctor) ||
      extractUserLastName(data?.usuario) ||
      extractUserLastName(data?.profile) ||
      extractUserLastName(data?.data) ||
      ''
    );
    if (lastName) return lastName;

    const fullName = getUserNameFromLoginSession();
    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        return parts.slice(1).join(' ');
      }
    }
    return '';
  } catch (err) {
    return '';
  }
}

export function getUserEmailFromLoginSession() {
  try {
    const raw = getStorageValue(LOGIN_DATA_KEY);
    if (!raw) return '';
    const data = JSON.parse(raw);
    return (
      data?.email ??
      data?.user?.email ??
      data?.doctor?.email ??
      data?.usuario?.email ??
      data?.profile?.email ??
      data?.data?.email ??
      ''
    );
  } catch (err) {
    return '';
  }
}

export function syncStorageProfileData(newName, newLastName, newEmail) {
  try {
    const raw = sessionStorage.getItem(LOGIN_DATA_KEY) || localStorage.getItem(LOGIN_DATA_KEY);
    if (raw) {
      const authData = JSON.parse(raw);
      
      const updateSource = (source) => {
        if (!source || typeof source !== 'object') return;
        if ('nombre' in source || source.nombre !== undefined) source.nombre = newName;
        if ('name' in source || source.name !== undefined) source.name = newName;
        if ('first_name' in source || source.first_name !== undefined) source.first_name = newName;
        if ('firstName' in source || source.firstName !== undefined) source.firstName = newName;
        
        if ('apellido' in source || source.apellido !== undefined) source.apellido = newLastName;
        if ('last_name' in source || source.last_name !== undefined) source.last_name = newLastName;
        if ('lastName' in source || source.lastName !== undefined) source.lastName = newLastName;

        if ('email' in source || source.email !== undefined) source.email = newEmail;
      };

      updateSource(authData);
      updateSource(authData.usuario);
      updateSource(authData.user);
      updateSource(authData.doctor);
      updateSource(authData.profile);
      updateSource(authData.data);
      
      sessionStorage.setItem(LOGIN_DATA_KEY, JSON.stringify(authData));
      localStorage.setItem(LOGIN_DATA_KEY, JSON.stringify(authData));
    }
  } catch (err) {
    console.error('Error sincronizando datos de perfil en storage:', err);
  }
}

export function syncStorageNameAndLastName(newName, newLastName) {
  const currentEmail = getUserEmailFromLoginSession();
  syncStorageProfileData(newName, newLastName, currentEmail);
}
