//Desde aquí se pueden configurar opciones de la interfaz de usuario, como mostrar un banner de desarrollo, habilitar notificaciones, etc. Esto permite activar o desactivar características sin necesidad de modificar el código en múltiples lugares.

export const uiSettings = {
    showDevBanner: true,      
    showNewFeatures: true,
};


export const isDevelopmentMode = () => 
    
    uiSettings.showDevBanner;
    uiSettings.showNewFeatures;

