import { useCallback, useEffect, useState, startTransition } from 'react';
import usePolling from './UsePolling';
import api from '../services/api';

function defaultGetCitaId(c) {
  return c?.id ?? c?._id ?? c?.ID;
}

export default function usePanelCitas({
  initialCitas = [],
  getCitaId = defaultGetCitaId,
  fetchCitasFn = null,
  polling = true,
  pollingInterval = 10000,
} = {}) {
  const normalizeCita = useCallback((cita, previous = {}) => {
    const cliente = cita?.Mascotum?.Cliente || cita?.cliente || {};
    const doctorObj = cita?.doctor || {};

    const pacienteNombre =
      cita?.paciente_nombre ||
      cita?.paciente ||
      [cliente?.nombre, cliente?.apellido].filter(Boolean).join(' ').trim() ||
      previous?.paciente_nombre ||
      '—';

    const pacienteTelefono =
      cita?.paciente_telefono || cita?.telefono || cliente?.telefono || previous?.paciente_telefono || '—';

    const mascotaNombre =
      cita?.mascota_nombre ||
      cita?.nombre_mascota ||
      cita?.mascota?.nombre ||
      cita?.Mascotum?.nombre ||
      (typeof cita?.mascota === 'string' ? cita?.mascota : '') ||
      previous?.mascota_nombre ||
      '—';

    const doctorNombre =
      cita?.doctor_nombre ||
      [doctorObj?.nombre, doctorObj?.apellido].filter(Boolean).join(' ').trim() ||
      previous?.doctor_nombre ||
      '—';

    return {
      ...cita,
      paciente_nombre: pacienteNombre,
      paciente_telefono: pacienteTelefono,
      mascota_nombre: mascotaNombre,
      doctor_nombre: doctorNombre,
    };
  }, []);

  const [listaCitas, setListaCitas] = useState(() =>
    Array.isArray(initialCitas) ? initialCitas.map((c) => normalizeCita(c)) : []
  );

  // Sincronizar cuando el padre cambia las citas: normalizamos y solo actualizamos
  // si hay cambios relevantes para evitar renders en cascada.
  useEffect(() => {
    if (!Array.isArray(initialCitas)) return;

    const prevMap = new Map((listaCitas || []).map((c) => [String(getCitaId(c) ?? ''), c]));
    const next = initialCitas.map((cita) => {
      const key = String(getCitaId(cita) ?? '');
      return normalizeCita(cita, prevMap.get(key));
    });

    const comparable = (c) => {
      if (!c) return '';
      const id = String(getCitaId(c) ?? '');
      const estado = c?.estado ?? c?.status ?? '';
      const fecha = c?.fecha_cita ?? c?.fecha ?? '';
      const hora = c?.hora_cita ?? c?.hora ?? '';
      const paciente_nombre = c?.paciente_nombre ?? '';
      const paciente_telefono = c?.paciente_telefono ?? '';
      const mascota_nombre = c?.mascota_nombre ?? '';
      return JSON.stringify([id, estado, fecha, hora, paciente_nombre, paciente_telefono, mascota_nombre]);
    };

    const prevMapForCompare = new Map((listaCitas || []).map((c) => [String(getCitaId(c) ?? ''), c]));
    const nextMapForCompare = new Map(next.map((c) => [String(getCitaId(c) ?? ''), c]));

    const sameLength = (listaCitas || []).length === next.length;
    const sameContent =
      sameLength &&
      [...nextMapForCompare.keys()].every((k) => comparable(prevMapForCompare.get(k)) === comparable(nextMapForCompare.get(k)));

    if (sameContent) return;
    // Usar startTransition para evitar renders en cascada al actualizar estado desde el efecto
    try {
      startTransition(() => setListaCitas(next));
    } catch (e) {
      // En caso de entornos que no soporten startTransition, aplicar actualización asincrónica
      if (import.meta.env.DEV) console.error(e);
      setTimeout(() => setListaCitas(next), 0);
    }
  }, [initialCitas, getCitaId, normalizeCita, listaCitas]);

  const fetchFn = fetchCitasFn ?? api.getCitas;

  const fetchCitas = useCallback(async () => {
    try {
      const response = await fetchFn();
      const list = Array.isArray(response) ? response : response?.data ?? [];
      setListaCitas((prev) => {
        const prevMap = new Map(prev.map((c) => [String(getCitaId(c) ?? ''), c]));
        return list.map((cita) => {
          const key = String(getCitaId(cita) ?? '');
          return normalizeCita(cita, prevMap.get(key));
        });
      });
      try {
        if (import.meta.env.DEV) console.debug('[usePanelCitas] fetched', Array.isArray(list) ? list.length : 0);
      } catch (e) {
        if (import.meta.env.DEV) console.error(e);
      }
    } catch (err) {
      console.error('Error al actualizar citas (usePanelCitas):', err);
    }
  }, [fetchFn, getCitaId, normalizeCita]);

  // Polling configurable
  usePolling(fetchCitas, pollingInterval, polling);

  const refetch = useCallback(() => fetchCitas(), [fetchCitas]);

  const updateCitaLocally = useCallback(
    (citaId, patch) => {
      setListaCitas((prev) => prev.map((it) => (String(getCitaId(it)) === String(citaId) ? { ...it, ...patch } : it)));
    },
    [getCitaId]
  );

  return { listaCitas, setListaCitas, refetch, updateCitaLocally };
}
