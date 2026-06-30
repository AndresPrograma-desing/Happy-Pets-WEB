export function extractDoctorIdFromToken(token) {
    try {
        if (!token) return '';
        const parts = token.split('.');
        if (parts.length < 2) return '';
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const payload = JSON.parse(atob(padded));
        return (
            payload?.doctor_id ??
            payload?.doctorId ??
            payload?.user?.doctor_id ??
            payload?.user?.doctorId ??
            payload?.user_id ??
            payload?.id ??
            payload?.sub ??
            ''
        );
    } catch (err) {
        if (import.meta.env.DEV) console.error('', err);
        return '';
    }
}

export function normalizeUserMascotaResults(raw) {
    const list = Array.isArray(raw)
        ? raw
        : raw?.data || raw?.items || raw?.rows || [];

    return list.map((cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        fullName: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
        email: cliente.email || '',
        identificacion: cliente.identificacion || '',
        mascotas: Array.isArray(cliente.mascotas) ? cliente.mascotas : []
    }));
}