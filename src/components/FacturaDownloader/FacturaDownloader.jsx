import React, { useMemo } from 'react';
import styles from './FacturaDowloader.module.css';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import AlertModal from '../AlertModal/AlertModal';
import InvoiceViewer from '../FacturaPreviw/facturaPreviw';
import FacturaLocal from '../FacturaLocal/FacturaLocal';
import useFacturaDownloader, { PollFactura } from '../../hooks/FacturaDownloader';
import Page1 from '../Page1/Page1';
import PollingSeconds from '../../hooks/PollingSecons';
import ModalTooltip from '../ModalTooltip/ModalTooltip';

function getStatusStyle(estado) {
  const s = String(estado || '').toLowerCase();
  if (s === 'pendiente') return { label: 'Pendiente', bg: '#adf3a9', color: '#92400e', border: '#f59e0b' };
  if (s === 'completada' || s === 'completado' || s === 'completa') return { label: 'Completada', bg: '#ecfdf5', color: '#065f46', border: '#10b981' };
  if (s === 'cancelada') return { label: 'Cancelada', bg: '#fff1f2', color: '#9f1239', border: '#f43f5e' };
  if(s === 'no_asistida' || s === 'no asistida') return { label: 'No Asistida', bg: '#fef2f2', color: '#991b1b', border: '#ef4444' };
  if(s === 'programada') return { label: 'Programada', bg: '#fef3c7', color: '#78350f', border: '#fbbf24' };
  return { label: estado || 'Desconocido', bg: '#f8fafc', color: '#0f172a', border: '#e2e8f0' };
}

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

  return (
    <div className={styles.container}>
      {/* Polling components: one per generated invoice to verify UrlDocx still exists */}
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
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>
            <img src={getIcon('service')} className={styles.serviceIcon} alt="" />
            Panel de Facturación</h1>
          <p>Gestión y descarga de documentos profesionales</p>
        </div>
        <Page1 url="/SecretariaSystem" />
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
          <option value="todos">
            <img src={getIcon('check')} className={styles.filterIcon} alt="" />
            Todos los estados</option>
          <option value="programada">
            <img src={getIcon('check')} className={styles.filterIcon} alt="" />
            Programada</option>
          <option value="completada">
            <img src={getIcon('')} className={styles.filterIcon} alt="" />
            Completada</option>
          <option value="no_asistida">
            <img src={getIcon('check')} className={styles.filterIcon} alt="" />
            No Asistida</option>
          <option value="cancelada">
            <img src={getIcon('check')} className={styles.filterIcon} alt="" />
            Cancelada</option>
        </select>
        <button onClick={fetchCitas} className={styles.refreshBtn} disabled={loading}>
          <img src={getIcon('rotate')} className={loading ? styles.rotating : ''} alt="" />
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
          <div>
            <img src={getIcon('rotate')} className={styles.rotating} alt="" />Cargando previa...</div>
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
                      <div className={styles.clientPhone}>{cita.Mascotum?.Cliente?.telefono}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.petCell}>
                      {cita.Mascotum?.nombre} <small>({cita.Mascotum?.raza})</small>
                    </div>
                  </td>
                  <td className={styles.doctorCell}>Dr. {cita.doctor?.nombre}</td>
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
                        disabled={
                          generatingId === cita.id ||
                          [
                            'programada',
                            'no_asistida',
                            'cancelada'
                          ].includes((cita.estado || '').toLowerCase())
                      }
                        style={[
                          'programada',
                          'no_asistida',
                          'cancelada'
                        ].includes((cita.estado || '').toLowerCase()) ? { backgroundColor: '#56585a', cursor: 'not-allowed' } : {}}
                      >
                        {generatingId === cita.id ? (
                          <><span className={styles.btnLoader}></span> Generando...</>
                        ) : invoiceUrls[cita.id] ? (
                          <><img src={getIcon('download')} alt="" className={styles.btnIcon} /> Descargar</>
                        ) : (
                          <ModalTooltip text="Generar Factura">
                          <><img src={getIcon('clipboardPlus')} alt="" className={styles.btnIcon} /> Generar</>
                          </ModalTooltip>
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
