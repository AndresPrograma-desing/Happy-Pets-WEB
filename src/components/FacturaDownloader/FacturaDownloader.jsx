import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { generateInvoiceForCita } from '../../utils/GenerateFactura';
import api from '../../services/api';
import styles from './FacturaDowloader.module.css';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import AlertModal from '../AlertModal/AlertModal';
import { getAlertPayload } from '../../utils/apiErrors';
import InvoiceViewer from '../FacturaPreviw/facturaPreviw';
import { mapFacturaToInvoice } from '../../utils/GenerateFactura';
import FacturaLocal from '../FacturaLocal/FacturaLocal';

const STATUS_CONFIG = {
  programada: { label: 'Programada', color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd' },
  pendiente: { label: 'Pendiente', color: '#9a3412', bg: '#ffedd5', border: '#fed7aa' },
  completada: { label: 'Completada', color: '#ffffff', bg: '#46b6cc86', border: '#36a6a652' },
  cancelada: { label: 'Cancelada', color: '#b91c1c', bg: '#fee2e2', border: '#fecaca' },
  en_progreso: { label: 'En progreso', color: '#4338ca', bg: '#e0e7ff', border: '#c7d2fe' },
  default: { label: 'No asistida', color: '#ffffff', bg: '#c00000', border: '#e5000058' }
};

const getStatusStyle = (estado) => {
  const key = estado?.toLowerCase() || 'default';
  return STATUS_CONFIG[key] || STATUS_CONFIG.default;
};

export default function FacturaManager() {
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

  const normalizeCitas = (raw) => {
    if (!raw) return [];
    const content = raw.data || raw.result || raw.results || raw.items || raw;
    if (Array.isArray(content)) return content;
    if (content?.$values && Array.isArray(content.$values)) return content.$values;
    return [];
  };

  const fetchCitas = useCallback(async () => {
    try {
      setLoading(true);
      setAlertMessage(null);
      const response = await api.getCitas();
      const dataNormalizada = normalizeCitas(response);
      setCitas(dataNormalizada);
    } catch (err) {
      console.error("Error en fetchCitas:", err);
      setAlertMessage(getAlertPayload(err));
      setAlertTitle('Error');
      setAlertOnConfirm(null);
      setAlertConfirmText('Cerrar');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

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

    if (filterEstado !== 'todos') {
      result = result.filter(c => (c.estado || '').toLowerCase() === filterEstado);
    }

    return result;
  }, [citas, searchTerm, filterEstado]);

  const handleGenerate = async (citaId) => {
    try {
      setGeneratingId(citaId);
      setAlertMessage(null);
      const resp = await generateInvoiceForCita(citaId);

      if (!resp) throw new Error('Sin respuesta del servidor');

      let finalUrl = null;
      // resp may contain url, file or blob
      if (resp.url) finalUrl = resp.url;
      else if (resp.file && typeof resp.file === 'string') finalUrl = resp.file;
      else if (resp.blob) finalUrl = URL.createObjectURL(resp.blob);

      if (!finalUrl) throw new Error('No se pudo procesar el archivo');

      // Normalizar finalUrl: si es solo un nombre de archivo, crear ruta pública a /facturas/{file}
      if (typeof finalUrl === 'string' && !finalUrl.match(/^https?:\/\//i) && !finalUrl.startsWith('/')) {
        finalUrl = `${window.location.origin}/facturas/${encodeURIComponent(String(finalUrl))}`;
      } else if (typeof finalUrl === 'string' && finalUrl.startsWith('/')) {
        finalUrl = `${window.location.origin}${finalUrl}`;
      }

      // Guardar metadata (url, file, raw)
      // Además, obtener los datos de la factura para preview usando GET /api/Facturas/cita/{id}
      const safeId = encodeURIComponent(String(citaId));
      let invoiceRaw = null;
      let invoiceObj = null;
      try {
        invoiceRaw = await api.request(`/Facturas/cita/${safeId}`, { method: 'GET' });
        invoiceObj = mapFacturaToInvoice(invoiceRaw);
      } catch (fetchErr) {
        // No bloqueante: si no se puede obtener datos de preview, seguimos guardando URL
        invoiceObj = null;
      }

      // Construir URL al preview estático y guardarla con los metadatos
      const previewUrl = `${window.location.origin}/test/facturaPreviw.html?citaId=${encodeURIComponent(String(citaId))}`;

      setInvoiceUrls(prev => ({
        ...prev,
        [citaId]: { url: finalUrl, file: resp.file ?? null, raw: resp.raw ?? resp, invoice: invoiceObj, previewUrl }
      }));

      // Extraer nombre de archivo para mostrar en el modal
      let fileName = resp.file && typeof resp.file === 'string' ? resp.file : null;
      if (!fileName && finalUrl) {
        try {
          const u = new URL(finalUrl);
          fileName = u.pathname.split('/').filter(Boolean).pop();
          if (fileName) fileName = decodeURIComponent(fileName);
        } catch (e) {
          const parts = String(finalUrl).split('/');
          fileName = parts.pop() || finalUrl;
        }
      }

      setAlertMessage(`Factura creada: ${fileName || 'desconocida'}`);
      setAlertTitle('Factura creada');
      setAlertConfirmText('Ver');
      setAlertCancelText('Cerrar');
      setAlertOnConfirm(() => () => {
        // Abrir la vista previa interna usando el componente FacturaLocal
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
  };

  const handleFileDownload = async (citaId) => {
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
      // If it's an object URL (blob:), just trigger download
      if (String(url).startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = meta.file || `Factura-${citaId}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      // Try fetching the file (include auth token if available)
      const token = api.getToken ? api.getToken() : '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(url, { headers, credentials: 'include' });
      if (!res.ok) {
        // Fallback: open the url in a new tab
        try { window.open(url, '_blank', 'noopener'); } catch (e) { /* ignore */ }
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const fileName = meta.file || (() => {
        try { const u = new URL(url); return decodeURIComponent(u.pathname.split('/').filter(Boolean).pop()); } catch (e) { return `Factura-${citaId}.docx`; }
      })();
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      try { window.open(meta.url, '_blank', 'noopener'); } catch (e) { /* ignore */ }
    } finally {
      setGeneratingId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: citas.length,
      pendientes: citas.filter(c => (c.estado || '').toLowerCase() === 'pendiente').length,
      completadas: citas.filter(c => (c.estado || '').toLowerCase() === 'completada').length,
    };
  }, [citas]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [previewIframeUrl, setPreviewIframeUrl] = useState(null);
  const [previewCitaId, setPreviewCitaId] = useState(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Facturación Happy Pets</h1>
          <p>Gestión y descarga de documentos profesionales</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard} style={{ borderLeftColor: '#0f172a' }}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statCard} style={{ borderLeftColor: '#f59e0b' }}>
            <span className={styles.statValue}>{stats.pendientes}</span>
            <span className={styles.statLabel}>Pendientes</span>
          </div>
          <div className={styles.statCard} style={{ borderLeftColor: '#10b981' }}>
            <span className={styles.statValue}>{stats.completadas}</span>
            <span className={styles.statLabel}>Completadas</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <img src={getIcon('search')} alt="" className={styles.searchIconInside} />
          <input
            type="text"
            placeholder="Buscar por ID, cliente, mascota o doctor..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <button onClick={fetchCitas} className={styles.refreshBtn} disabled={loading}>
          <img src={getIcon('listRestart')} className={loading ? styles.rotating : ''} alt="" />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <AlertModal
        open={alertOpen}
        title={alertTitle || 'Aviso'}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
        onConfirm={alertOnConfirm ? () => { alertOnConfirm(); setAlertOpen(false); } : undefined}
        confirmText={alertConfirmText || 'Cerrar'}
        cancelText={alertCancelText || 'Cancelar'}
      />

      <AlertModal
        open={previewOpen}
        title="Vista previa de factura"
        message={null}
        onClose={() => { setPreviewOpen(false); setPreviewIframeUrl(null); setPreviewInvoice(null); setPreviewCitaId(null); }}
        confirmText="Cerrar"
        onConfirm={() => { setPreviewOpen(false); setPreviewIframeUrl(null); setPreviewInvoice(null); setPreviewCitaId(null); }}
      >
        {previewIframeUrl ? (
          <iframe
            src={previewIframeUrl}
            title="Factura preview"
            style={{ width: '100%', height: '70vh', border: 'none' }}
          />
        ) : previewCitaId ? (
          <div style={{ width: '100%', height: '70vh', overflow: 'auto' }}>
            <FacturaLocal idCita={previewCitaId} />
          </div>
        ) : previewInvoice ? (
          <InvoiceViewer invoice={previewInvoice} />
        ) : (
          <div>Cargando preview...</div>
        )}
      </AlertModal>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Cliente</th>
              <th>Mascota</th>
              <th>Doctor</th>
              <th>Estado</th>
              <th className={styles.textRight}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className={styles.textCenter}>Cargando datos...</td></tr>
            ) : filteredCitas.map((cita) => {
              const status = getStatusStyle(cita.estado);
              return (
                <tr key={cita.id} className={styles.tableRow}>
                  <td className={styles.idCell}>#{cita.id}</td>
                  <td>
                    <div className={styles.dateCell}>
                      {new Date(cita.fecha_cita).toLocaleDateString()}
                      <small>{cita.hora_cita}</small>
                    </div>
                  </td>
                  <td>
                    <div className={styles.clientCell}>
                      <strong>{cita.Mascotum?.Cliente?.nombre} {cita.Mascotum?.Cliente?.apellido}</strong>
                      <small>{cita.Mascotum?.Cliente?.telefono}</small>
                    </div>
                  </td>
                  <td>{cita.Mascotum?.nombre} <small>({cita.Mascotum?.raza})</small></td>
                  <td>Dr. {cita.doctor?.nombre}</td>
                  <td>
                    <span className={styles.statusBadge} style={{ backgroundColor: status.bg, color: status.color, borderColor: status.border }}>
                      {status.label}
                    </span>
                  </td>
                  <td className={styles.textRight}>
                    <div className={styles.actionContainer}>
                      <button
                        className={styles.downloadBtn}
                        onClick={() => (invoiceUrls[cita.id] ? handleFileDownload(cita.id) : handleGenerate(cita.id))}
                        disabled={generatingId === cita.id}
                      >
                        {generatingId === cita.id ? (
                          <><span className={styles.btnLoader}></span> Generando...</>
                        ) : invoiceUrls[cita.id] ? (
                          <><img src={getIcon('download')} alt="" className={styles.btnIcon} /> Descargar</>
                        ) : (
                          <><img src={getIcon('download')} alt="" className={styles.btnIcon} /> Generar</>
                        )}
                      </button>
                      {invoiceUrls[cita.id] && (
                        <a
                          href={invoiceUrls[cita.id].url || '#'}
                          onClick={(e) => {
                            e.preventDefault();
                            setPreviewIframeUrl(null);
                            setPreviewInvoice(null);
                            setPreviewCitaId(cita.id);
                            setPreviewOpen(true);
                          }}
                          className={styles.viewBtn}
                        >
                          <img src={getIcon('fileText')} alt="" className={styles.btnIcon} /> Ver Factura
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}