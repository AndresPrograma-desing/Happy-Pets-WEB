import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './facturas.module.css';
import { getFacturas } from '../../../services/api';
import SpinerLoader from '../../SpinerLoader/SpinerLoader';
import { getIcon } from '../../../assets/icons/ExportIcon/Index';
import usePolling from '../../../hooks/UsePolling';
import Page1 from '../../Page1/Page1';
import filterCitasByEstado from '../../filter/FilterCitas/FilterStatus';
import SwitchComponent from '../../svg/Switchcomponent';
import LoginInfo from '../../LoginInfo/LoginInfo';
import { updateFacturaEstadoPago } from '../../../services/api';
import ModalTooltip from '../../ModalTooltip/ModalTooltip';
import AlertModal from '../../AlertModal/AlertModal';
import { QRCodeCanvas } from 'qrcode.react';
import PollingSeconds from '../../../hooks/PollingSecons';
// import SendFactura from '../../../Client/SendFactura';

function formatDate(iso) {
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

function formatCurrency(n) {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'VES' }).format(Number(n || 0));
}

const icons = {
  pdf: getIcon('fileText'),
  error: getIcon('x'),
};

// Hook local de facturas con polling y control de spinner
function useFacturas() {
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
  const SeconsPolling = PollingSeconds(); 
  usePolling(load, PollingSeconds());
 
  return { facturas, loading, error, refreshing, load };
}


const squareIcon = getIcon('square');
const squareCheckIcon = getIcon('squareCheck');



function PagoToggle({ metodo, estadoPago: inicial, facturaId }) {
  const [estado, setEstado] = useState(inicial);
  const [loading, setLoading] = useState(false);
  const isPagada = estado === 'pagada';

  const handlePago = async () => {
    if (isPagada || loading) return;
    setLoading(true);
    try {
      await updateFacturaEstadoPago(facturaId, 'pagada');
      setEstado('pagada');
    } catch (err) {
      alert('No se pudo actualizar el estado de pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className={styles.capitalize} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {metodo}
      <button
        type="button"
        className={styles.squareBtn}
        aria-label={isPagada ? 'Factura pagada' : 'Marcar como pagada'}
        onClick={handlePago}
        disabled={isPagada || loading}
        style={{ padding: 0, background: 'none', border: 'none', cursor: isPagada || loading ? 'default' : 'pointer' }}
      >
        <ModalTooltip text={isPagada ? 'Factura pagada' : 'Marcar como pagada'}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img src={isPagada ? squareCheckIcon : squareIcon} alt="" style={{ width: 20, height: 20 }} />
          </span>
        </ModalTooltip>
      </button>
    </span>
  );
}

// Header con boton de info que abre un portal con LoginInfo
const FacturasHeader = React.memo(function FacturasHeader({ onRefresh, pdfOnly, onPdfToggle }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);                        
  const portalRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const width = 320;
      const top = r.bottom + window.scrollY + 8;
      let left = r.right + window.scrollX - width;
      if (left < 8) left = 8;
      setPos({ top, left });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (portalRef.current && portalRef.current.contains(e.target)) return;
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Facturación</h1>
        <p className={styles.subtitle}>Gestión centralizada de servicios Happy Pets</p>
      </div>


      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0, minWidth: 220 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Page1 url="/SecretariaSystem" />
          <button className={styles.refresh} onClick={onRefresh}>
            <i className="fas fa-sync-alt"></i>
            <img src={getIcon('rotate')} alt="" className={styles.rotateIcon} />
            Refrescar
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, justifyContent: 'flex-end' }}>
          <SwitchComponent value={pdfOnly} onChange={onPdfToggle} />
          <span className={styles.pdfOnlyLabel}>Solo facturas generadas</span>
          <button ref={btnRef} className={styles.infoBtn} onClick={toggle} aria-label="Info filtro PDF">
            <img src={getIcon('help')} alt="Info" className={styles.icon} />
          </button>
        </div>
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div ref={portalRef} className={styles.loginInfoBox} style={{ position: 'absolute', top: pos.top + 'px', left: pos.left + 'px', zIndex: 99999 }}>
          <LoginInfo
            title="Filtrar por PDF"
            paragraphs={[ 'Activa para ver sólo facturas que ya tienen PDF generado. Esto oculta facturas aún en proceso de generación.' ]}
          />
        </div>,
        document.body
      )}
    </header>
  );
});

const FacturasStats = React.memo(({ totalFacturado, totalFacturas, pendientes }) => (
  <div className={styles.statsSummary}>
    <div className={styles.statCard}>
      <h3>
        <img src={getIcon('cardCredit')} alt="" className={styles.icon} />
        Total Facturado
      </h3>
      <p>{formatCurrency(totalFacturado)}</p>
    </div>
    <div className={styles.statCard}>
      <h3>
        <img src={getIcon('fileText')} alt="" className={styles.icon} />
        Facturas Totales
      </h3>
      <p>{totalFacturas}</p>
    </div>
    <div className={styles.statCard}>
      <h3>
        <img src={getIcon('fileClock')} alt="" className={styles.icon} />
        Pendientes
      </h3>
      <p className={styles.warningText}>{pendientes}</p>
    </div>
  </div>
));

const InvoiceCard = React.memo(function InvoiceCard({ factura, onShowQR }) {
  const id = factura.factura_id ?? factura.id;
  const isUrlValid = factura.url_docx?.startsWith('http');

  return (
    <div className={styles.invoiceCard}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.invoiceNumber}>#{factura.numero_factura}</span>
          <div className={styles.date}>{formatDate(factura.fecha_emision)}</div>
        </div>
        <span className={`${styles.statusBadge} ${factura.estado_pago === 'pagada' ? styles.statusPagada : styles.statusPendiente}`}>
          {factura.estado_pago}
        </span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.infoGroup}>
          <label>Propietario
      {/* <SendFactura></SendFactura> */}
          </label>
          <p>{factura.cliente_nombre}</p>
        </div>
        <div className={styles.infoGroup}>
          <label>Paciente</label>
          <p><i className="fas fa-paw"></i> {factura.mascota_nombre}</p>
        </div>
        <div className={styles.infoGroup}>
          <label>Atendido por</label>
          <p>{factura.doctor_nombre}</p>
        </div>
        <div className={styles.infoGroup}>
          <label>Método</label>
          <PagoToggle metodo={factura.metodo_pago} estadoPago={factura.estado_pago} facturaId={id} />
        </div>
      </div>

      <div className={styles.itemsSection}>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(factura.items || []).map((it, idx) => (
              <tr key={idx}>
                <td>{it.nombre}</td>
                <td>{it.cantidad}</td>
                <td>{formatCurrency(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        <div className={styles.cardFooter}>
        <div className={styles.totalAmount}>
          <span>Total Neto</span>
          <strong>{formatCurrency(factura.total)}</strong>
        </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ModalTooltip text={isUrlValid ? 'Descargar PDF' : 'PDF no disponible'}>
              <a href={isUrlValid ? factura.url_docx : '#'} target="_blank" rel="noreferrer" className={`${styles.btnDownload} ${!isUrlValid ? styles.disabled : ''}`}>
                <img src={isUrlValid ? icons.pdf : icons.error} alt="" className={styles.icon} />
                {isUrlValid ? 'PDF' : 'N/A'}
              </a>
            </ModalTooltip>

            {/* Botón para mostrar QR del PDF de esta factura */}
            <ModalTooltip text={isUrlValid ? 'Mostrar QR' : ' QR no disponible'}>
              <button
                type="button"
                className={styles.qrButton}
                onClick={() => isUrlValid && onShowQR && onShowQR(factura.url_docx, id)}
                disabled={!isUrlValid}
              >
                <img src={getIcon('ScanQr')} alt="" className={styles.ScanQr} />
                QR
              </button>
            </ModalTooltip>
          </div>
      </div>
    </div>
  );
});

export default function Facturas() {
  const { facturas, loading, error, load } = useFacturas();
  const [filterEstado] = useState('todos');
  const [pdfOnly, setPdfOnly] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [qrFacturaId, setQrFacturaId] = useState(null);
  const [qrCliente, setQrCliente] = useState('');
  const [qrNameClient, setQrNameClient] = useState(null);

  const openQr = (url, id, cliente) => {
    setQrUrl(url || '');
    setQrFacturaId(id ?? null);
    setQrCliente(cliente || '');
    setQrOpen(true);
  };

  const closeQr = () => {
    setQrOpen(false);
    setQrUrl('');
    setQrFacturaId(null);
    setQrCliente('');
  };

  const visibleFacturas = useMemo(() => {
    let filtered = filterCitasByEstado(facturas, filterEstado);
    if (pdfOnly) {
      filtered = filtered.filter((f) => f?.url_docx && typeof f.url_docx === 'string' && f.url_docx.startsWith('http'));
    }
    return filtered;
  }, [facturas, filterEstado, pdfOnly]);

  const totalFacturado = useMemo(() => visibleFacturas.reduce((acc, curr) => acc + (curr.total || 0), 0), [visibleFacturas]);
  const pendientes = useMemo(() => visibleFacturas.filter((f) => f.estado_pago === 'pendiente').length, [visibleFacturas]);

  const handleRefresh = () => load({ force: true });
  const handlePdfToggle = (v) => setPdfOnly(!!v);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <FacturasHeader onRefresh={handleRefresh} pdfOnly={pdfOnly} onPdfToggle={handlePdfToggle} />

        {!loading && !error && <FacturasStats totalFacturado={totalFacturado} totalFacturas={visibleFacturas.length} pendientes={pendientes} />}

        {loading ? (
          <div className={styles.center}><SpinerLoader /></div>
        ) : error ? (
          <div className={styles.center}>
            <div className={styles.error}>{error}</div>
            <button className={styles.retry} onClick={handleRefresh}>
              <img src={getIcon('rotate')} alt="" className={styles.icon} /> Reintentar
            </button>
          </div>
        ) : visibleFacturas.length > 0 ? (
          <>
            <div className={styles.invoiceGrid}>
              {visibleFacturas.map((f) => <InvoiceCard key={f.factura_id ?? f.id} factura={f} onShowQR={(url, id) => openQr(url, id, f.cliente_nombre)} />)}
            </div>
            {qrOpen && (
              <AlertModal
                open={qrOpen}
                title="Escanear para ver/descargar PDF"
                onClose={closeQr}
                onConfirm={closeQr}
                confirmText="Cerrar"
              >
                <div style={{ textAlign: 'center' }}>
                  {qrUrl ? (
                    <>
<div className={styles.qrMainContainer}>
  <QRCodeCanvas value={qrUrl} size={200} level="H" includeMargin={true} />
  <p className={styles.qrClienteText}>Cliente: <b>{qrCliente}</b></p>
  <p className={styles.qrIdText}>ID Factura: <b>{qrFacturaId}</b></p>
  <a href={qrUrl} target="_blank" rel="noopener noreferrer" className={styles.qrDownloadLink}>
    <img src={getIcon('download')} alt="" className={styles.qrDownloadIcon} />
    <span>Descargar PDF</span>
  </a>
</div>
                    </>
                  ) : (
                    <p>
                      <img src={getIcon('ban')} alt="" className={styles.qrErrorIcon} />
                      No hay URL disponible para esta factura.</p>
                  )}
                </div>
              </AlertModal>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <img src={getIcon('ban')} alt="" className={styles.emptyIcon} />
            No se encontraron registros de facturas.
          </div>
        )}
      </div>
    </div>
  );
}
