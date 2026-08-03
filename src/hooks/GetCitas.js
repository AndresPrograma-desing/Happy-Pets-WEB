import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Hook para obtener las citas desde el backend
export default function useGetCitas(autoFetch = true) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      setCitas(normalized);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCitas();
    }
  }, [fetchCitas, autoFetch]);

  return { citas, loading, error, refetch: fetchCitas };
}
