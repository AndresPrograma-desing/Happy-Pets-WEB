import { useState, useCallback, useRef, useMemo } from 'react';
import { request } from '../../services/api';
import usePolling from '../../hooks/UsePolling';
import PollingSeconds from '../../hooks/PollingSecons';

export function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function useRecetas() {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const firstLoadDoneRef = useRef(false);

  const load = useCallback(async (opts = {}) => {
    const { force = false } = opts;
    if (force || !firstLoadDoneRef.current) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      // Fetch recetas via /consultas endpoint
      const res = await request('/consultas', { method: 'GET' });
      const items = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];
      setRecetas(items || []);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      if (!firstLoadDoneRef.current) firstLoadDoneRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  usePolling(load, PollingSeconds());

  return { recetas, loading, error, refreshing, load };
}

export function useRecetasCalculadas(recetas, pdfOnly, searchTerm) {
  const visibleRecetas = useMemo(() => {
    // Only show consultas that actually have a receta
    let filtered = recetas.filter(r => r.receta && r.receta.trim() !== '');
    
    if (pdfOnly) {
      filtered = filtered.filter((f) => f?.url_docx && typeof f.url_docx === 'string' && f.url_docx.startsWith('http'));
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((f) => 
        f.cita_id?.toString().includes(query) ||
        f.mascota_id?.toString().includes(query) ||
        f.doctor_id?.toString().includes(query) ||
        f.mascota?.nombre?.toLowerCase().includes(query) ||
        f.mascota_nombre?.toLowerCase().includes(query) ||
        f.doctor?.nombre?.toLowerCase().includes(query) ||
        f.doctor_nombre?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [recetas, pdfOnly, searchTerm]);

  return { visibleRecetas };
}

export const EMAIL_TYPE_RECETA = 30; // Tipo de correo para recetas
