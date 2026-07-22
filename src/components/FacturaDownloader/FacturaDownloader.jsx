import React, { useMemo, useState, useEffect } from 'react';
import styles from './FacturaDowloader.module.css';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import AlertModal from '../AlertModal/AlertModal';
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
import SearchInput from '../UI/Search/Search';
import useCitaStatuses from '../../hooks/GetCitasStatuses.js';

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

  const { statuses } = useCitaStatuses();

  const opcionesEstado = useMemo(() => {
    return [{ value: '', label: TEXT_FACTURAS.allStatusLabel || 'Todas' }, ...(statuses || [])];
  }, [statuses]);

  const stats = useMemo(() => ({
    total: (citas || []).length,
    pendientes: (citas || []).filter(c => (c.estado || '').toLowerCase() === 'pendiente').length,
    completadas: (citas || []).filter(c => (c.estado || '').toLowerCase() === 'completada').length,
  }), [citas]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterEstado]);

  const pageCount = Math.ceil((filteredCitas || []).length / itemsPerPage);
  const paginatedCitas = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return (filteredCitas || []).slice(start, start + itemsPerPage);
  }, [filteredCitas, page]);

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
    <GenericPanel 
      title={TEXT_FACTURAS.title} 
      menuTitle={TEXT_FACTURAS.menuTitle} 
      role="secretaria"
      showPagination={true}
      paginationCount={pageCount}
      paginationPage={page}
      onPaginationChange={(e, v) => setPage(v)}
    >
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
          <div style={{ flex: 1 }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={TEXT_FACTURAS.searchPlaceholder}
              label="Buscar Recibo"
            />
          </div>
          <Selector
            label={TEXT_FACTURAS.filterLabel}
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            options={opcionesEstado}
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
        title={alertTitle}
        onClose={() => setAlertOpen(false)}
        hideActions={!alertOnConfirm}
        confirmText={alertConfirmText}
        cancelText={alertCancelText}
        onConfirm={() => {
          if (alertOnConfirm) alertOnConfirm();
          setAlertOpen(false);
        }}
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '500' }}>{alertMessage}</p>
        </div>
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