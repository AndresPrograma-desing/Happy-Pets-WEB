import { getProfile } from '../../services/api';

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

export const fetchProfileName = async () => {
  try {
    const profile = await getProfile();
    const data = profile?.data || profile?.user || profile;
    const fullName = data?.name || data?.nombre || null;
    const avatarUrl = data?.avatarUrl || data?.avatar_url || data?.avatar || null;
    
    return {
      name: fullName ? fullName.split(' ')[0] : null,
      avatarUrl: avatarUrl
    };
  } catch (err) {
    console.error('Error al obtener el perfil en GenericPanel:', err);
    return null;
  }
};