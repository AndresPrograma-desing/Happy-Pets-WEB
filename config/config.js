// difinicion de urls de API
const baseURL_Tunnel = "https://g27frlv5-5168.use2.devtunnels.ms";
const baseURL_LocalHost = "http://localhost:5168";

// Selecciona la URL base según el modo de Vite (local o tunnel/server)
const getBaseURL = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        if (import.meta.env.VITE_API_URL) {
            return import.meta.env.VITE_API_URL;
        }
        if (import.meta.env.MODE === 'localhost') {
            return baseURL_LocalHost;
        }
        if (import.meta.env.MODE === 'tunnel' || import.meta.env.PROD) {
            return baseURL_Tunnel;
        }
    }
    return baseURL_LocalHost;
};

export const DEV_URL_API = {
    baseURL: getBaseURL()
};

// Flag to use dummy data without a backend API (dynamic via localStorage)
export const isDummyModeActive = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('USE_DUMMY_DATA') === 'true';
    }
    return false;
};
