import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Hook para obtener las citas desde el backend
export default function useGetCitas(autoFetch = true, pageNumber = 1, pageSize = 10) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCitas({
        allDates: true,
        pageNumber,
        pageSize
      });

      const list = Array.isArray(res)
        ? res
        : (res?.citas || res?.items || res?.data || (res ? [res] : []));

      const totalCount = res?.total_count ?? res?.totalCount;
      if (res?.totalPages) {
        setTotalPages(res.totalPages);
      } else if (res?.totalPagesCount) {
        setTotalPages(res.totalPagesCount);
      } else if (totalCount !== undefined) {
        setTotalPages(Math.ceil(totalCount / pageSize) || 1);
      } else {
        setTotalPages(list.length < pageSize && pageNumber === 1 ? 1 : pageNumber + (list.length === pageSize ? 1 : 0));
      }

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
  }, [pageNumber, pageSize]);

  useEffect(() => {
    if (autoFetch) {
      fetchCitas();
    }
  }, [fetchCitas, autoFetch]);

  return { citas, loading, error, totalPages, refetch: fetchCitas };
}
