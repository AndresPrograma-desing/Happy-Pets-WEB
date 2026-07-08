import React, { useMemo } from 'react';
import styles from './FacturaDowloader.module.css';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import AlertModal from '../AlertModal/AlertModal';
import InvoiceViewer from '../FacturaPreviw/facturaPreviw';
import FacturaLocal from '../FacturaLocal/FacturaLocal';
import useFacturaDownloader, { PollFactura } from '../../hooks/FacturaDownloader';
import PollingSeconds from '../../hooks/PollingSecons';
import { DatabaseSearch, View, Search, RotateCw } from 'lucide-react';
import GenericPanel from '../GenericPanel/GenericPanel';
import TableA from '../screens/components/TableA';
import { getFacturaColumns } from './utils.jsx';
import Badge from '../screens/components/Badge';
import Button from '../screens/components/Button';
import Selector from '../screens/components/Material-UI/Components/Selector/Index';
import { TEXT_FACTURAS } from './constants';

export default function FacturaManager() {
  const {
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
  } = useFacturaDownloader();

  const stats = useMemo(() => ({
    total: (citas || []).length,
    pendientes: (citas || []).filter(c => (c.estado || '').toLowerCase() === 'pendiente').length,
    completadas: (citas || []).filter(c => (c.estado || '').toLowerCase() === 'completada').length,
  }), [citas]);

  const columns = useMemo(() => getFacturaColumns({
    generatingId,
    invoiceUrls,
    handleFileDownload,
    handleGenerate,
    setPreviewIframeUrl,
    setPreviewInvoice,
    setPreviewCitaId,
    setPreviewOpen
  }), [generatingId, invoiceUrls, handleFileDownload, handleGenerate, setPreviewIframeUrl, setPreviewInvoice, setPreviewCitaId, setPreviewOpen]);

  return (
    <GenericPanel title={TEXT_FACTURAS.title} menuTitle={TEXT_FACTURAS.menuTitle} role="secretaria">
    <div className={styles.container}>
      {Object.keys(invoiceUrls || {}).map((id) => (
        <PollFactura
          key={id}
          citaId={id}
          active={true}
          interval={PollingSeconds()}
          onFound={handlePollFound}
          onRemoved={handlePollRemoved}
        />
      ))}

      <div className={styles.controlsWrapper}>
        <div className={styles.controlsLeft}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={TEXT_FACTURAS.searchPlaceholder}
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Selector
            label={TEXT_FACTURAS.filterLabel}
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            options={TEXT_FACTURAS.statusOptions}
            fullWidth={false}
            style={{ minWidth: '200px' }}
          />
        </div>
        
        <div className={styles.controlsRight}>
          <Button 
            variant="outline"
            onClick={fetchCitas}
            icon={RotateCw}
            color="#475569"
            disabled={loading}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            {loading ? TEXT_FACTURAS.refreshingBtn : TEXT_FACTURAS.refreshBtn}
          </Button>
        </div>
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
          <div>
            <img src={getIcon('rotate')} className={styles.rotating} alt="" /><View className={styles.loadingIcon} /> Cargando previa...</div>
        )}
      </AlertModal>

      <div className={styles.tableWrapper}>
        <TableA 
          columns={columns}
          data={filteredCitas}
          loading={loading}
          keyExtractor={(row) => row.id}
          emptyIcon={DatabaseSearch}
          emptyMessage={TEXT_FACTURAS.emptyMessage}
        />
      </div>
    </div>
    </GenericPanel>
  );
}
