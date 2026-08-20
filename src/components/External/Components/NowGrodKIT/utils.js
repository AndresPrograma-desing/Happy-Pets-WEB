import { CONFIG } from './constants';

/**
 * Convierte segundos a formato MM:SS.
 * @param {number} totalSeconds - Segundos restantes.
 * @returns {string} Tiempo formateado (ej. "04:59").
 */
export function formatTime(totalSeconds) {
  if (typeof totalSeconds !== 'number' || totalSeconds < 0) return '00:00';
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Genera la URL con el parametro token inyectado.
 * @param {string|null} token - JWT o hash de sesión.
 * @returns {string} URL absoluta o cadena vacía si no hay token.
 */
export function getTargetUrl(token) {
  if (!token) return '';
  try {
    const url = new URL(CONFIG.BASE_REDIRECT_URL);
    url.searchParams.set('token', token);
    return url.toString();
  } catch (error) {
    console.error('URL base inválida:', CONFIG.BASE_REDIRECT_URL, error);
    return '';
  }
}