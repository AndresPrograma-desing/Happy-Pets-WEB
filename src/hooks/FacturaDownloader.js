import { useState, useMemo, useEffect, useCallback } from 'react';
import api from '../services/api';
import { generateInvoiceForCita, mapFacturaToInvoice } from '../utils/GenerateFactura';
import { getAlertPayload } from '../utils/apiErrors';
import usePolling from './UsePolling';
import { filterCitasByEstado } from '../components/filter/FilterCitas/FilterStatus';

// Poller component: periodically checks GET /Facturas/cita/{citaId} and reports updates
export function PollFactura({ citaId, onFound, onRemoved, interval = 1000, active = true }) {
  const safeId = encodeURIComponent(String(citaId));

  const check = useCallback(async () => {
    try {
      const raw = await api.request(`/Facturas/cita/${safeId}`, { method: 'GET' });
      const d = raw?.data ?? raw ?? {};

      const candidates = [
        d?.UrlDocx, d?.urlDocx, d?.url_docx, d?.Url_Docx,
        d?.Url, d?.url, d?.file_url, d?.link, d?.archivo, d?.Archivo
      ];
      let urlCandidate = null;
      for (const c of candidates) {
        if (typeof c === 'string' && c.trim() !== '') { urlCandidate = c.trim(); break; }
      }

      if (typeof urlCandidate === 'string' && /la factura se ha eliminado/i.test(urlCandidate)) {
        onRemoved && onRemoved(citaId);
        return;
      }

      const isUrlLike = (s) => typeof s === 'string' && (s.match(/^https?:\/\//i) || s.startsWith('/') || s.match(/\.docx(\?|$)/i));
      if (!urlCandidate || !isUrlLike(urlCandidate)) {
        // Treat as removed if no valid UrlDocx
        onRemoved && onRemoved(citaId);
        return;
      }

      let final = urlCandidate;
      if (final.startsWith('/')) final = `${window.location.origin}${final}`;

      const invoiceObj = mapFacturaToInvoice(raw);
      onFound && onFound(citaId, { url: final, raw, invoice: invoiceObj });
    } catch (err) {
      // If 404, treat as removed; otherwise ignore transient errors
      if (err && err.status === 404) {
        onRemoved && onRemoved(citaId);
      }
    }
  }, [citaId, safeId, onFound, onRemoved]);

  usePolling(check, interval, active);
  return null;
}

export default function useFacturaDownloader() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [invoiceUrls, setInvoiceUrls] = useState({});

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertOnConfirm, setAlertOnConfirm] = useState(null);
  const [alertConfirmText, setAlertConfirmText] = useState('Cerrar');
  const [alertCancelText, setAlertCancelText] = useState('Cancelar');

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [previewIframeUrl, setPreviewIframeUrl] = useState(null);
  const [previewCitaId, setPreviewCitaId] = useState(null);

  const normalizeCitas = useCallback((raw) => {
    if (!raw) return [];
    const content = raw.data || raw.result || raw.results || raw.items || raw;
    if (Array.isArray(content)) return content;
    if (content?.$values && Array.isArray(content.$values)) return content.$values;
    return [];
  }, []);

  const fetchCitas = useCallback(async () => {
    try {
      setLoading(true);
      setAlertMessage(null);
      const response = await api.getCitas();
      const dataNormalizada = normalizeCitas(response);
      setCitas(dataNormalizada);
    } catch (err) {
      console.error('Error en fetchCitas:', err);
      try { setAlertMessage(getAlertPayload(err)); } catch { setAlertMessage(String(err?.message || err)); }
      setAlertTitle('Error');
      setAlertOnConfirm(null);
      setAlertConfirmText('Cerrar');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }, [normalizeCitas]);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);

  const filteredCitas = useMemo(() => {
    let result = [...citas];
    const q = (searchTerm || '').toLowerCase().trim();
    if (q) {
      result = result.filter((c) => {
        const id = String(c.id || '').toLowerCase();
        const clienteNombre = `${c.Mascotum?.Cliente?.nombre || ''} ${c.Mascotum?.Cliente?.apellido || ''}`.toLowerCase();
        const telefono = String(c.Mascotum?.Cliente?.telefono || '').toLowerCase();
        const mascota = String(c.Mascotum?.nombre || '').toLowerCase();
        const doctor = `${c.doctor?.nombre || ''} ${c.doctor?.apellido || ''}`.toLowerCase();
        return id.includes(q) || clienteNombre.includes(q) || telefono.includes(q) || mascota.includes(q) || doctor.includes(q);
      });
    }
    // Filtrado por estado (delegado a utilitario centralizado)
    result = filterCitasByEstado(result, filterEstado);
    return result;
  }, [citas, searchTerm, filterEstado]);

  const handleGenerate = useCallback(async (citaId) => {
    try {
      setGeneratingId(citaId);
      setAlertMessage(null);
      const resp = await generateInvoiceForCita(citaId);

      if (!resp) throw new Error('Sin respuesta del servidor');

      let finalUrl = null;
      if (resp.url) finalUrl = resp.url;
      else if (resp.file && typeof resp.file === 'string') finalUrl = resp.file;
      else if (resp.blob) finalUrl = URL.createObjectURL(resp.blob);

      if (!finalUrl) throw new Error('No se pudo procesar el archivo');

      if (typeof finalUrl === 'string' && !finalUrl.match(/^https?:\/\//i) && !finalUrl.startsWith('/')) {
        finalUrl = `${window.location.origin}/facturas/${encodeURIComponent(String(finalUrl))}`;
      } else if (typeof finalUrl === 'string' && finalUrl.startsWith('/')) {
        finalUrl = `${window.location.origin}${finalUrl}`;
      }

      const safeId = encodeURIComponent(String(citaId));
      let invoiceRaw = null;
      let invoiceObj = null;
      try {
        invoiceRaw = await api.request(`/Facturas/cita/${safeId}`, { method: 'GET' });
        invoiceObj = mapFacturaToInvoice(invoiceRaw);
      } catch {
        invoiceObj = null;
      }

      const extractUrlDocx = (raw) => {
        if (!raw) return null;
        const d = raw.data ?? raw;
        const candidates = [
          d?.UrlDocx, d?.urlDocx, d?.url_docx, d?.Url_Docx,
          d?.Url, d?.url, d?.file_url, d?.link, d?.archivo, d?.Archivo
        ];
        for (const c of candidates) {
          if (typeof c === 'string' && c.trim() !== '') return c.trim();
        }
        return null;
      };

      const url_docx = extractUrlDocx(invoiceRaw);
      if (typeof url_docx === 'string' && /la factura se ha eliminado/i.test(url_docx)) {
        setAlertMessage('La factura se ha eliminado en el servidor. Intenta generarla de nuevo si es necesario.');
        setAlertTitle('Aviso');
        setAlertConfirmText('Cerrar');
        setAlertOnConfirm(null);
        setAlertOpen(true);
        return;
      }

      const isUrlLike = (s) => typeof s === 'string' && (s.match(/^https?:\/\//i) || s.startsWith('/') || s.match(/\.docx(\?|$)/i));
      if (url_docx && isUrlLike(url_docx)) {
        if (url_docx.startsWith('/')) finalUrl = `${window.location.origin}${url_docx}`;
        else finalUrl = url_docx;
      } else if (!finalUrl) {
        setAlertMessage('No se encontró un enlace de descarga (UrlDocx) para la factura generada.');
        setAlertTitle('Aviso');
        setAlertConfirmText('Cerrar');
        setAlertOnConfirm(null);
        setAlertOpen(true);
        return;
      }

      const previewUrl = `${window.location.origin}/test/facturaPreviw.html?citaId=${encodeURIComponent(String(citaId))}`;

      setInvoiceUrls(prev => ({
        ...prev,
        [citaId]: { url: finalUrl, file: resp.file ?? null, raw: resp.raw ?? resp, invoice: invoiceObj, previewUrl }
      }));

      let fileName = resp.file && typeof resp.file === 'string' ? resp.file : null;
      if (!fileName && finalUrl) {
        try {
          const u = new URL(finalUrl);
          fileName = u.pathname.split('/').filter(Boolean).pop();
          if (fileName) fileName = decodeURIComponent(fileName);
        } catch {
          const parts = String(finalUrl).split('/');
          fileName = parts.pop() || finalUrl;
        }
      }

      setAlertMessage(`Factura creada: ${fileName || 'desconocida'}`);
      setAlertTitle('Factura creada');
      setAlertConfirmText('Ver');
      setAlertCancelText('Cerrar');
      setAlertOnConfirm(() => () => {
        setPreviewIframeUrl(null);
        setPreviewCitaId(citaId);
        setPreviewOpen(true);
      });
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage(getAlertPayload(err));
      setAlertTitle('Error');
      setAlertOnConfirm(null);
      setAlertConfirmText('Cerrar');
      setAlertOpen(true);
    } finally {
      setGeneratingId(null);
    }
  }, []);

  const handleFileDownload = useCallback(async (citaId) => {
    const meta = invoiceUrls[citaId];
    if (!meta || !meta.url) {
      setAlertMessage('No hay factura generada para descargar');
      setAlertTitle('Error');
      setAlertOpen(true);
      return;
    }

    setGeneratingId(citaId);
    try {
      const url = meta.url;
      if (String(url).startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = meta.file || `Factura-${citaId}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      const token = api.getToken ? api.getToken() : '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(url, { headers, credentials: 'include' });
      if (!res.ok) {
        try { window.open(url, '_blank', 'noopener'); } catch { /* ignore */ }
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const fileName = meta.file || (() => {
        try { const u = new URL(url); return decodeURIComponent(u.pathname.split('/').filter(Boolean).pop()); } catch { return `Factura-${citaId}.docx`; }
      })();
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      try { window.open(meta.url, '_blank', 'noopener'); } catch { /* ignore */ }
    } finally {
      setGeneratingId(null);
    }
  }, [invoiceUrls]);

  const handlePollFound = useCallback((citaId, meta) => {
    setInvoiceUrls(prev => {
      const current = prev?.[citaId] ?? {};
      return {
        ...prev,
        [citaId]: {
          ...current,
          url: meta.url ?? current.url,
          file: current.file ?? meta.file ?? null,
          raw: meta.raw ?? current.raw,
          invoice: meta.invoice ?? current.invoice,
          previewUrl: current.previewUrl ?? `${window.location.origin}/test/facturaPreviw.html?citaId=${encodeURIComponent(String(citaId))}`
        }
      };
    });
  }, []);

  const handlePollRemoved = useCallback((citaId) => {
    setInvoiceUrls(prev => {
      if (!prev || !(citaId in prev)) return prev;
      const copy = { ...prev };
      delete copy[citaId];
      return copy;
    });
    console.info(`Factura for cita ${citaId} was removed on server; UI reverted to Generar.`);
  }, []);

  return {
    citas,
    loading,
    generatingId,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    invoiceUrls,

    alertOpen,
    setAlertOpen,
    alertMessage,
    alertTitle,
    alertOnConfirm,
    alertConfirmText,
    alertCancelText,
    setAlertMessage,
    setAlertTitle,
    setAlertOnConfirm,
    setAlertConfirmText,
    setAlertCancelText,

    fetchCitas,
    handleGenerate,
    handleFileDownload,

    previewOpen,
    setPreviewOpen,
    previewInvoice,
    setPreviewInvoice,
    previewIframeUrl,
    setPreviewIframeUrl,
    previewCitaId,
    setPreviewCitaId,

    filteredCitas,
    handlePollFound,
    handlePollRemoved
  };
}
