import { login, loginWithContextHub } from '../../services/api';
import { setUserId } from '../../context/LocalStorage';
import { playLoginSound } from '../../utils/songHelper';

const navigateAfterLogin = (resp, navigate) => {
    const userId = resp?.id ?? resp?.user?.id ?? resp?.usuario?.id ?? resp?.data?.id ?? resp?.data?.user?.id ?? resp?.data?.usuario?.id ?? resp?.result?.id ?? resp?.result?.user?.id ?? resp?.result?.usuario?.id ?? null;
    if (userId) setUserId(String(userId));

    const serverRole = resp?.user?.rol || resp?.user?.role || resp?.data?.user?.rol || resp?.data?.user?.role || resp?.data?.rol || resp?.data?.role || resp?.result?.rol || resp?.result?.role || resp?.rol || resp?.role || '';
    const finalRole = String(serverRole || '').toLowerCase();

    playLoginSound();

    if (finalRole.includes('doctor')) {
        navigate('/doctor');
    } else if (finalRole.includes('admin') || finalRole.includes('administr')) {
        navigate('/administracion');
    } else if (finalRole.includes('secret') || finalRole.includes('secretar') || finalRole.includes('recep')) {
        navigate('/secretaria');
    } else {
        navigate('/inicio');
    }
};

export const handleLoginSubmit = async ({
    data,
    setApiError,
    setLoading,
    navigate,
    setCountdownActive,
    setCountdownDuration
}) => {
    setApiError(null);
    setLoading(true);
    try {
        const payload = { email: data.email, password: data.password };
        const resp = await login(payload);
        setLoading(false);
        navigateAfterLogin(resp, navigate);
    } catch (err) {
        if (err?.isNetworkError) {
            // Sin respuesta del API: mantener el modal en carga y reintentar,
            // en vez de salir con un mensaje de conexión hardcodeado.
            setTimeout(() => {
                handleLoginSubmit({ data, setApiError, setLoading, navigate, setCountdownActive, setCountdownDuration });
            }, 5000);
            return;
        }

        if (err?.body && typeof err.body === 'object' && 'tryAgainTime' in err.body) {
            setApiError({
                message: err.message || 'Demasiados intentos fallidos, intenta en: ',
                tryAgainTime: err.body.tryAgainTime
            });
            if (setCountdownActive && setCountdownDuration) {
                setCountdownDuration(err.body.tryAgainTime * 1000);
                setCountdownActive(true);
            }
        } else {
            setApiError(err?.message);
        }
        setLoading(false);
    }
};

export const handleContextHubLoginSuccess = async ({ ticket, setApiError, setLoading, navigate }) => {
    setApiError(null);
    setLoading(true);
    try {
        const resp = await loginWithContextHub(ticket);
        setLoading(false);
        navigateAfterLogin(resp, navigate);
    } catch (err) {
        setApiError(err?.message);
        setLoading(false);
    }
};