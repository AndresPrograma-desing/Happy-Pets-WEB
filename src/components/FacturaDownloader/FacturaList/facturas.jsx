import React, { useState, useCallback } from 'react';
import styles from './facturas.module.css';
import { sendEmails } from '../../../services/api/emails';
import AlertModal from '../../AlertModal/AlertModal';
import { QRCodeCanvas } from 'qrcode.react';
import { RotateCw, FileText, FileClock, Ban, Inbox, Search, X } from 'lucide-react';
import GenericPanel from '../../GenericPanel/GenericPanel';
import Button from '../../screens/components/Button';
import TableB from '../../screens/components/TableB/index';
import SwitchComponent from '../../screens/components/Swich/Index';
import ModalTooltip from '../../ModalTooltip/ModalTooltip';
import Badge from '../../screens/components/Badge';
import InfoTooltip from '../../screens/components/InfoTooltip';
import Selector from '../../screens/components/Material-UI/Components/Selector/Index';
import SearchInput from '../../UI/Search/Search';

import {
  useFacturas,
  useFacturasCalculadas,
  getFacturasColumns,
  getFacturasExpandable,
  EMAIL_TYPE_RECIBO,
  formatCurrency
} from './utils';

import { TEXT_FACTURAS_LIST } from './constants';

// Removed FacturasHeader to inline components directly

// Removed old StatsCards

export default function Facturas() {
  const { facturas, loading, error, load } = useFacturas();
  const [pdfOnly, setPdfOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState({ url: '', id: null, cliente: '', mascota: '' });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const [sendingId, setSendingId] = useState(null);

  const { visibleFacturas, totalFacturado, pendientes } = useFacturasCalculadas(facturas, filterEstado, pdfOnly, searchTerm);

  const openQr = useCallback((url, id, cliente, mascota) => {
    setQrData({ url: url || '', id: id ?? null, cliente: cliente || '', mascota: mascota || '' });
    setQrOpen(true);
  }, []);

  const closeQr = useCallback(() => {
    setQrOpen(false);
    setQrData({ url: '', id: null, cliente: '', mascota: '' });
  }, []);

  const showAlert = useCallback(({ title, message }) => {
    setAlertConfig({ title, message });
    setAlertOpen(true);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertOpen(false);
    setAlertConfig({ title: '', message: '' });
  }, []);

  const handleSendEmail = useCallback(async (factura) => {
    const id = factura.factura_id ?? factura.id;
    if (sendingId === id || !factura.url_docx?.startsWith('http')) return;
    
    setSendingId(id);
    try {
      const res = await sendEmails(factura.cita_id, EMAIL_TYPE_RECIBO);
      showAlert({
        title: 'Envío Exitoso',
        message: res?.message || `El recibo #${factura.numero_factura} fue enviado correctamente por correo.`
      });
    } catch (err) {
      console.error(err);
      showAlert({
        title: 'Fallo de Envío',
        message: err?.message || 'Hubo un problema al procesar el envío del recibo por correo.'
      });
    } finally {
      setSendingId(null);
    }
  }, [sendingId, showAlert]);

  const handlePaymentUpdate = useCallback((id, newEstado) => {
    // Para reflejar el cambio visualmente en el estado global si es necesario
    load({ force: true });
  }, [load]);

  const columns = React.useMemo(() => getFacturasColumns({
    onSendEmail: handleSendEmail,
    sendingId,
    onShowQR: openQr,
    onPaymentUpdate: handlePaymentUpdate
  }), [handleSendEmail, sendingId, openQr, handlePaymentUpdate]);

  const expandable = React.useMemo(() => getFacturasExpandable({
    onShowQR: openQr,
    onPaymentUpdate: handlePaymentUpdate
  }), [openQr, handlePaymentUpdate]);

  return (
    <GenericPanel title={TEXT_FACTURAS_LIST.title} menuTitle={TEXT_FACTURAS_LIST.menuTitle} role="secretaria">
      <div className={styles.container}>
        <div className={styles.headerControlsContainer}>
          <div className={styles.leftControls} style={{ flex: 1, maxWidth: '750px', flexWrap: 'nowrap' }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={TEXT_FACTURAS_LIST.searchPlaceholder}
                label="Buscar Factura"
              />
            </div>

            <Selector
              label="Estado"
              options={TEXT_FACTURAS_LIST.statusOptions}
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={{ width: '200px', flexShrink: 0 }}
            />
            
            <div className={styles.switchWrapper} style={{ flexShrink: 0 }}>
              <SwitchComponent value={pdfOnly} onChange={(v) => setPdfOnly(!!v)} />
              <span className={styles.switchLabel} style={{ display: 'none' }}>{TEXT_FACTURAS_LIST.pdfOnlyLabel}</span>
              <InfoTooltip 
                title="Filtrar por PDF"
                content="Muestra únicamente las facturas que tengan un documento PDF generado."
              />
            </div>
          </div>
          
          <div className={styles.rightControls}>
            <Button 
              variant="outline"
              onClick={() => load({ force: true })}
              icon={RotateCw}
              color="#475569"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              Refrescar
            </Button>
          </div>
        </div>

        {!loading && !error && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Badge icon={FileText} label={TEXT_FACTURAS_LIST.paidtTotal} value={formatCurrency(totalFacturado)} />
            <Badge icon={FileText} label={TEXT_FACTURAS_LIST.receiptTotal} value={visibleFacturas.length} />
            <Badge icon={FileClock} label={TEXT_FACTURAS_LIST.pending} value={pendientes} style={{ backgroundColor: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }} />
          </div>
        )}

        <div style={{ marginTop: '1rem', overflow: 'hidden', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <TableB
            columns={columns}
            data={visibleFacturas}
            loading={loading}
            error={error}
            onRetry={() => load({ force: true })}
            expandable={expandable}
            rowKey={(f) => f.factura_id ?? f.id}
            emptyIcon={Inbox}
            emptyMessage={TEXT_FACTURAS_LIST.emptyMessage}
          />
        </div>

        {qrOpen && (
          <AlertModal
            open={qrOpen}
            title="Escanear para ver/descargar PDF"
            onClose={closeQr}
            onConfirm={closeQr}
            confirmText="Cerrar"
            hideActions={true}
          >
            <div style={{ textAlign: 'center', padding: '1rem' }}>
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

        {alertOpen && (
          <AlertModal open={alertOpen} title={alertConfig.title} onClose={closeAlert} onConfirm={closeAlert} confirmText="Aceptar" hideActions={false}>
            <div style={{ textAlign: 'center', padding: '10px 0', color: '#2d3748', fontSize: '0.95rem' }}>
              {alertConfig.message}
            </div>
          </AlertModal>
        )}
      </div>
    </GenericPanel>
  );
}