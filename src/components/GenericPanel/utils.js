import { getProfile } from '../../services/api';

/**
 * Sincroniza el nuevo nombre de usuario en el Local/Session Storage
 * para que toda la app mantenga la coherencia.
 */
export const syncStorageName = (newName) => {
  try {
    const raw = sessionStorage.getItem('auth_login_data') || localStorage.getItem('auth_login_data');
    if (raw) {
      const authData = JSON.parse(raw);
      if (authData.usuario) authData.usuario.nombre = newName;
      if (authData.user) {
        authData.user.nombre = newName;
        authData.user.name = newName;
      }
      authData.nombre = newName;
      authData.name = newName;
      sessionStorage.setItem('auth_login_data', JSON.stringify(authData));
    }
  } catch (err) {
    console.error('Error sincronizando nombre en storage:', err);
  }
};

/**
 * Obtiene el perfil actualizado desde el backend y extrae el nombre correcto.
 */
export const fetchProfileName = async () => {
  try {
    const profile = await getProfile();
    const data = profile?.data || profile?.user || profile;
    const fullName = data?.name || data?.nombre || null;
    return fullName ? fullName.split(' ')[0] : null;
  } catch (err) {
    console.error('Error al obtener el perfil en GenericPanel:', err);
    return null;
  }
};
