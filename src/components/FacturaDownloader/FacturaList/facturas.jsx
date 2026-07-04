import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './facturas.module.css';
import { sendEmails } from '../../../services/api/emails';
import { getIcon } from '../../../assets/icons/ExportIcon/Index';
import Page1 from '../../Page1/Page1';
import SwitchComponent from '../../screens/components/Swich/index';
import LoginInfo from '../../LoginInfo/LoginInfo';
import ModalTooltip from '../../ModalTooltip/ModalTooltip';
import AlertModal from '../../AlertModal/AlertModal';
import { QRCodeCanvas } from 'qrcode.react';
import Button from '../../UI/Button/Button';


import {
  FileText,
  RotateCw,
  HelpCircle,
  FileClock,
  Square,
  CheckSquare,
  QrCode,
  AlertTriangle,
  Ban,
  Search,
  X
} from 'lucide-react';

import {
  formatDate,
  formatCurrency,
  useFacturas,
  useFacturasCalculadas,
  handleActualizarPago,
  EMAIL_TYPE_RECIBO
} from './utils';

import { TEXT_INVOICES_GESTION, STATUS_PAYMENTS } from '../../../constants/TEXT';

function SearchInput({ value, onChange, placeholder = TEXT_INVOICES_GESTION.searchPlaceholder }) {
  return (
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.inputField}
      />
      {value && (
        <button 
          className={styles.clearButton} 
          onClick={() => onChange('')}
          type="button"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function PagoToggle({ metodo, estadoPago: inicial, facturaId }) {
  const [estado, setEstado] = useState(inicial);
  const [loading, setLoading] = useState(false);
  const isPagada = estado === STATUS_PAYMENTS.pagadas;

  return (
    <span className={styles.capitalize} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {metodo}
      <button
        type="button"
        className={styles.squareBtn}
        aria-label={isPagada ? 'Factura pagada' : 'Marcar como pagada'}
        onClick={() => !isPagada && !loading && handleActualizarPago(facturaId, setEstado, setLoading)}
        disabled={isPagada || loading}
        style={{ padding: 0, background: 'none', border: 'none', cursor: isPagada || loading ? 'default' : 'pointer' }}
      >
        <ModalTooltip text={isPagada ? 'Factura pagada' : 'Marcar como pagada'}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {isPagada ? <CheckSquare size={18} color="#10b981" /> : <Square size={18} color="#4a5568" />}
          </span>
        </ModalTooltip>
      </button>
    </span>
  );
}

const FacturasHeader = React.memo(function FacturasHeader({ onRefresh, pdfOnly, onPdfToggle }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const portalRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const top = r.bottom + window.scrollY + 8;
      let left = r.right + window.scrollX - 320;
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
        <h1 className={styles.title}>{TEXT_INVOICES_GESTION.gestioPagos}</h1>
        <p className={styles.subtitle}>Gestión centralizada de servicios Happy Pets</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0, minWidth: 220 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Page1 url="/SecretariaSystem" />
          <button className={styles.refresh} onClick={onRefresh}>
            <RotateCw size={16} color="#4a5568" />
            Refrescar
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, justifyContent: 'flex-end' }}>

          <SwitchComponent 
          value={pdfOnly}
          onChange={onPdfToggle}
           />

          <span className={styles.pdfOnlyLabel}>{TEXT_INVOICES_GESTION.pdfOnlyLabel}</span>
          <button ref={btnRef} className={styles.infoBtn} onClick={toggle} aria-label="Info filtro PDF">
            <HelpCircle size={18} color="#4a5568" />
          </button>
        </div>
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div ref={portalRef} className={styles.loginInfoBox} style={{ position: 'absolute', top: `${pos.top}px`, left: `${pos.left}px`, zIndex: 99999 }}>
          <LoginInfo
            title="Filtrar por PDF"
            paragraphs={ TEXT_INVOICES_GESTION.filterPdfInfo}
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
        <FileText size={18} color="#ffffff" />
        { TEXT_INVOICES_GESTION.paidtTotal }
      </h3>
      <p>{formatCurrency(totalFacturado)}</p>
    </div>
    <div className={styles.statCard}>
      <h3>
        <FileText size={18} color="#ffffff" />
        { TEXT_INVOICES_GESTION.receiptTotal }
      </h3>
      <p>{totalFacturas}</p>
    </div>
    <div className={styles.statCard}>
      <h3>
        <ModalTooltip text="Facturas pendiente de pago">
          <FileClock size={18} color="#4a5568" />
          { TEXT_INVOICES_GESTION.pending }
        </ModalTooltip>
      </h3>
      <p className={styles.warningText}>{pendientes}</p>
    </div>
  </div>
));

const InvoiceCard = React.memo(function InvoiceCard({ factura, onShowQR, onShowAlert }) {
  const id = factura.factura_id ?? factura.id;
  const isUrlValid = factura.url_docx?.startsWith('http');
  const [sending, setSending] = useState(false);

  const cardClassName = `${styles.invoiceCard} ${factura.isNew ? styles.recentCard : ''}`;

  const handleSendEmail = async () => {
    if (sending || !isUrlValid) return;
    setSending(true);
    try {
      const res = await sendEmails(factura.cita_id, EMAIL_TYPE_RECIBO);
      onShowAlert({
        title: 'Envío Exitoso',
        message: res?.message || `El recibo #${factura.numero_factura} fue enviada correctamente por correo.`
      });
    } catch (err) {
      console.error(err);
      onShowAlert({
        title: 'Fallo de Envío',
        message: err?.message || 'Hubo un problema al procesar el envío del recibo por correo.'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cardClassName}>
      {factura.isNew && (
        <div className={styles.recentBadge}>
          <ModalTooltip text="Factura más reciente">
            <span>Nueva</span>
          </ModalTooltip>
        </div>
      )}

      <div className={styles.cardHeader}>
        <div>
          <span className={styles.invoiceNumber}>#{factura.numero_factura}</span>
          <div className={styles.date}>{formatDate(factura.fecha_emision)}</div>
        </div>
        <div className={styles.statusActionWrapper}>
          <ModalTooltip text={factura.estado_pago === 'pagada' ? 'Factura pagada' : 'Factura pendiente de pago'}>
            <span className={`${styles.statusBadge} ${factura.estado_pago === 'pagada' ? styles.statusPagada : styles.statusPendiente}`}>
              {factura.estado_pago}
            </span>
          </ModalTooltip>
      
          <ModalTooltip text={!isUrlValid ? 'PDF no disponible' : sending ? 'Enviando...' : 'Enviar por correo'}>
            <Button
              icon={getIcon('send')}
              onClick={handleSendEmail}
              disabled={sending || !isUrlValid}
              loading={sending}
              onlyIcon={true}
              className={styles.invoiceCardSendBtn}
            />
          </ModalTooltip>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.infoGroup}>
          <label>Propietario</label>
          <p>{factura.cliente_nombre}</p>
        </div>
        <div className={styles.infoGroup}>
          <label>Paciente</label>
          <p>{factura.mascota_nombre}</p>
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
              <FileText size={16} color="#4a5568" />
              {isUrlValid ? 'PDF' : 'N/A'}
            </a>
          </ModalTooltip>

          <ModalTooltip text={isUrlValid ? 'Mostrar QR' : 'QR no disponible'}>
            <button
              type="button"
              className={styles.qrButton}
              onClick={() => isUrlValid && onShowQR && onShowQR(factura.url_docx, id)}
              disabled={!isUrlValid}
            >
              <QrCode size={16} color="#4a5568" />
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
  const [pdfOnly, setPdfOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState({ url: '', id: null, cliente: '', mascota: '' });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const { visibleFacturas, totalFacturado, pendientes } = useFacturasCalculadas(facturas, 'todos', pdfOnly, searchTerm);

  const openQr = (url, id, cliente, mascota) => {
    setQrData({ url: url || '', id: id ?? null, cliente: cliente || '', mascota: mascota || '' });
    setQrOpen(true);
  };

  const closeQr = () => {
    setQrOpen(false);
    setQrData({ url: '', id: null, cliente: '', mascota: '' });
  };

  const showAlert = useCallback(({ title, message }) => {
    setAlertConfig({ title, message });
    setAlertOpen(true);
  }, []);

  const closeAlert = () => {
    setAlertOpen(false);
    setAlertConfig({ title: '', message: '' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <FacturasHeader onRefresh={() => load({ force: true })} pdfOnly={pdfOnly} onPdfToggle={(v) => setPdfOnly(!!v)} />

        <div style={{ display: 'flex', maxWidth: '400px', width: '100%', marginBottom: '1.5rem' }}>
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Buscar por cliente o mascota" 
          />
        </div>

        {!loading && !error && (
          <FacturasStats totalFacturado={totalFacturado} totalFacturas={visibleFacturas.length} pendientes={pendientes} />
        )}

        {loading ? (
          <div className={styles.center} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando facturas...</div>
        ) : error ? (
          <div className={styles.center}>
            <div className={styles.error}>{error}</div>
            <button className={styles.retry} onClick={() => load({ force: true })}>
              <RotateCw size={14} /> Reintentar
            </button>
          </div>
        ) : visibleFacturas.length > 0 ? (
          <>
            <div className={styles.invoiceGrid}>
              {visibleFacturas.map((f) => (
                <InvoiceCard 
                  key={f.factura_id ?? f.id} 
                  factura={f} 
                  onShowQR={(url, id) => openQr(url, id, f.cliente_nombre, f.mascota_nombre)} 
                  onShowAlert={showAlert}
                />
              ))}
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
                  {qrData.url ? (
                    <div className={styles.qrMainContainer}>
                      <QRCodeCanvas value={qrData.url} size={200} level="H" includeMargin={true} />
                      <p className={styles.qrClienteText}>Cliente: <b>{qrData.cliente}</b></p>
                      <p className={styles.qrClienteText}>Mascota: <b>{qrData.mascota}</b></p>
                      <p className={styles.qrIdText}>ID Factura: <b>{qrData.id}</b></p>

                      <a href={qrData.url} target="_blank" rel="noopener noreferrer" className={styles.qrDownloadLink}>
                        <FileText size={16} />
                        <span>Descargar PDF</span>
                      </a>
                    </div>
                  ) : (
                    <p>
                      <Ban size={18} color="#ef4444" style={{ marginRight: 6 }} />
                      No hay URL disponible para esta factura.
                    </p>
                  )}
                </div>
              </AlertModal>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <Ban size={24} className={styles.emptyIcon} />
            <p>No se encontraron facturas.</p>
          </div>
        )}

        {alertOpen && (
          <AlertModal open={alertOpen} title={alertConfig.title} onClose={closeAlert} onConfirm={closeAlert} confirmText="Aceptar">
            <div style={{ textAlign: 'center', padding: '10px 0', color: '#2d3748', fontSize: '0.95rem' }}>
              {alertConfig.message}
            </div>
          </AlertModal>
        )}
      </div>
    </div>
  );
}