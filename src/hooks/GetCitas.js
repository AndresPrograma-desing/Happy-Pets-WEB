import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { expirePastCitas } from './ExpireCitas';

function getServerNow(response) {
  const candidate =
    response?.server_time ??
    response?.serverTime ??
    response?.current_time ??
    response?.currentTime ??
    response?.now ??
    null;

  if (!candidate) return new Date();
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

// Hook para obtener las citas desde el backend
export default function useGetCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const syncingExpiredRef = useRef(new Set());

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.request('/Citas/requests', { method: 'GET' });

      const list = Array.isArray(res)
        ? res
        : (res?.citas || res?.items || res?.data || (res ? [res] : []));

      const normalized = list.map((cita) => {
        const cliente = cita?.Mascotum?.Cliente || {};
        const doctor = cita?.doctor || {};

        const pacienteNombre = [cliente?.nombre, cliente?.apellido]
          .filter(Boolean)
          .join(' ')
          .trim();

        const doctorNombre = [doctor?.nombre, doctor?.apellido]
          .filter(Boolean)
          .join(' ')
          .trim();

        return {
          ...cita,
          paciente_nombre: pacienteNombre || cliente?.nombre || '—',
          paciente_telefono: cliente?.telefono || '—',
          doctor_nombre: doctorNombre || doctor?.nombre || '—',
          doctor_rol: doctor?.rol || '—',
          mascota_nombre:
            cita?.Mascotum?.nombre ||
            cita?.mascota?.nombre ||
            cita?.nombre_mascota ||
            cita?.mascota_nombre ||
            '—',
          mascota_id:
            cita?.mascota_id || cita?.Mascotum?.id || cita?.mascota?.id || null,
        };
      });

      const nowFromServer = getServerNow(res);
      const { updatedCitas, expiredIds } = expirePastCitas(normalized, nowFromServer);
      setCitas(updatedCitas);

      // Persistir en DB los expiredIds. Si falla, permitimos reintento en futuros polls.
      expiredIds.forEach((id) => {
        const key = String(id);
        if (syncingExpiredRef.current.has(key)) return;
        syncingExpiredRef.current.add(key);

        (async function syncExpired() {
          try {
            // Intentar persistir el cambio en la API
            const res = await api.updateCitaEstado(id, 'no_asistida');
            // Log opcional en modo dev
            if (import.meta.env.DEV) console.debug('[expire] updated cita', id, res);
            // deja el id marcado como sincronizado
          } catch (err) {
            // Si falla, removemos el flag para permitir reintento en el siguiente poll
            syncingExpiredRef.current.delete(key);
            if (import.meta.env.DEV) console.error('[expire] failed to update cita', id, err);
          }
        })();
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  return { citas, loading, error, refetch: fetchCitas };
}
