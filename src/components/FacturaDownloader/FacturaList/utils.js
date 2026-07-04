import { useState, useCallback, useRef, useMemo } from 'react';
import { getFacturas, updateFacturaEstadoPago } from '../../../services/api';
import usePolling from '../../../hooks/UsePolling';
import PollingSeconds from '../../../hooks/PollingSecons';
import filterCitasByEstado from '../../filter/FilterCitas/FilterStatus';
import { getText } from '../../../constants';

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

export function formatCurrency(n) {
  return new Intl.NumberFormat('es-US', { 
    style: 'currency', 
    currency: getText("MoneysName.MONEYTIPE") 
  }).format(Number(n || 0));
}

export function useFacturas() {
  const [facturas, setFacturas] = useState([]);
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
      const res = await getFacturas();
      const items = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];
      setFacturas(items || []);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      if (!firstLoadDoneRef.current) firstLoadDoneRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  usePolling(load, PollingSeconds());

  return { facturas, loading, error, refreshing, load };
}

export function useFacturasCalculadas(facturas, filterEstado, pdfOnly, searchTerm) {
  const visibleFacturas = useMemo(() => {
    let filtered = filterCitasByEstado(facturas, filterEstado);
    
    if (pdfOnly) {
      filtered = filtered.filter((f) => f?.url_docx && typeof f.url_docx === 'string' && f.url_docx.startsWith('http'));
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((f) => 
        f.numero_factura?.toString().includes(query) ||
        f.cliente_nombre?.toLowerCase().includes(query) ||
        f.mascota_nombre?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [facturas, filterEstado, pdfOnly, searchTerm]);

  const totalFacturado = useMemo(() => visibleFacturas.reduce((acc, curr) => acc + (curr.total || 0), 0), [visibleFacturas]);
  const pendientes = useMemo(() => visibleFacturas.filter((f) => f.estado_pago === 'pendiente').length, [visibleFacturas]);

  return { visibleFacturas, totalFacturado, pendientes };
}

export async function handleActualizarPago(facturaId, setEstado, setLoading) {
  setLoading(true);
  try {
    await updateFacturaEstadoPago(facturaId, 'pagada');
    setEstado('pagada');
  } catch (err) {
    console.error(err);
    alert('No se pudo actualizar el estado de pago.');
  } finally {
    setLoading(false);
  }
}

export const EMAIL_TYPE_RECIBO = 25;