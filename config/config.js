// difinicion de urls de API
const baseURL_Tunnel = "https://g27frlv5-5168.use2.devtunnels.ms";
const baseURL_LocalHost = "http://localhost:5168";

export const DEV_URL_API = {
    baseURL: baseURL_LocalHost
};

// Flag to use dummy data without a backend API (dynamic via localStorage)
export const isDummyModeActive = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('USE_DUMMY_DATA') === 'true';
    }
    return false;
};
