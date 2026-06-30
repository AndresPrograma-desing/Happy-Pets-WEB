import { login } from '../../services/api';
import { setUserId } from '../../context/LocalStorage';
import { playLoginSound } from '../../utils/songHelper';

export const handleLoginSubmit = async ({
    data,
    rol,
    setApiError,
    setLoading,
    navigate
}) => {
    setApiError(null);
    setLoading(true);
    try {
        const payload = { email: data.email, password: data.password, rol: rol, role: rol };
        const resp = await login(payload);

        const userId = resp?.id ?? resp?.user?.id ?? resp?.usuario?.id ?? resp?.data?.id ?? resp?.data?.user?.id ?? resp?.data?.usuario?.id ?? resp?.result?.id ?? resp?.result?.user?.id ?? resp?.result?.usuario?.id ?? null;
        if (userId) setUserId(String(userId));

        const serverRole = resp?.user?.rol || resp?.user?.role || resp?.data?.user?.rol || resp?.data?.user?.role || resp?.data?.rol || resp?.data?.role || resp?.result?.rol || resp?.result?.role || resp?.rol || resp?.role || '';
        const finalRole = String((serverRole || rol || '').toString()).toLowerCase();

        playLoginSound();

        if (finalRole.includes('doctor')) {
            navigate('/doctor');
        } else if (finalRole.includes('admin') || finalRole.includes('administr')) {
            navigate('/AdminSystem');
        } else if (finalRole.includes('secret') || finalRole.includes('secretar') || finalRole.includes('recep')) {
            navigate('/SecretariaSystem');
        } else {
            navigate('/inicio');
        }
    } catch (err) {
        setApiError(err?.message || 'Error de conexión con el servidor');
    } finally {
        setLoading(false);
    }
};