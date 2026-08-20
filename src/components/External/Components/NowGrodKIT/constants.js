export const TEXTS = {
  tooltip: 'NowGrod.ia Chatbot',
  title: 'NowGrod.ia Chatbot',
  loading: 'Generando sesión segura',
  errorFetch: 'No se pudo establecer la sesión con NowGrod.ia. Intente de nuevo.',
  expired: 'El token de sesión ha expirado.',
  btnRetry: 'Reintentar',
  btnRenew: 'Renovar Token',
  btnGo: 'Ir a NowGrod.ia',
  copyTitle: 'Copiar URL',
  timerPrefix: 'El token expira en: ',
  redirectTitle: 'Abriendo NowGrod.ia',
  redirectSubtitle: 'Conectando con la consola de cliente mediante firma de sesión segura...',
  errorMessageToken: 'La respuesta del servidor no contiene un token válido.',
  close: 'Cerrar',
};

export const CONFIG = Object.freeze({
  REDIRECT_DURATION_MS: 2000,
  REDIRECT_INTERVAL_MS: 50,
  DEFAULT_EXPIRE_SEC: 300,
  BASE_REDIRECT_URL: 'http://localhost:5174/client',
  COPY_FEEDBACK_DURATION_MS: 2000,
});