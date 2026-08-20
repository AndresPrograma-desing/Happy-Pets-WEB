import React, { useEffect, useCallback, useState } from 'react';
import { PlusCircle, Download, Syringe } from 'lucide-react';
import styles from './Index.module.css';
import DrawPanel from '../screens/components/DrawPanel';
import TableB from '../screens/components/TableB';
import Button from '../screens/components/Button';
import Loading from '../screens/components/Loading/Index';
import AlertModal from '../AlertModal/AlertModal';
import RegisterVaccinationForm from './RegisterVaccinationForm';
import {
  usePetVaccinationLogic,
  useCarnetDownload,
  usePetVaccinationActions,
  useRegisterVaccinationLogic,
  formatDate,
  TRAFFIC_LIGHT_CLASS
} from './utils';
import { PET_VACCINATION_TEXT } from './constants';

export default function PetVaccinationPanel({ mascotaId }) {
  const { status, history, loading, error, fetchData } = usePetVaccinationLogic(mascotaId);
  const { download, downloading, downloadError, setDownloadError } = useCarnetDownload(mascotaId);
  const {
    actionModal,
    openPostpone,
    openInvoice,
    closeActionModal,
    setReason,
    confirmAction,
    actionLoading,
    resultAlert,
    setResultAlert
  } = usePetVaccinationActions(fetchData);

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [successAlert, setSuccessAlert] = useState({ open: false, message: '' });

  const handleRegisterSuccess = useCallback((vaccineName) => {
    setShowRegisterForm(false);
    setSuccessAlert({ open: true, message: PET_VACCINATION_TEXT.registerSuccessMessage(vaccineName) });
    fetchData();
  }, [fetchData]);

  const registerLogic = useRegisterVaccinationLogic({ mascotaId, onSuccess: handleRegisterSuccess });
  const { loadVaccines } = registerLogic;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (showRegisterForm) {
      loadVaccines();
    }
  }, [showRegisterForm, loadVaccines]);

  if (!mascotaId) {
    return <p className={styles.emptyText}>{PET_VACCINATION_TEXT.noPetSelected}</p>;
  }

  const historyColumns = [
    { label: PET_VACCINATION_TEXT.vaccineCol, key: 'vaccine_name', width: '17%' },
    {
      label: PET_VACCINATION_TEXT.applicationDateCol,
      key: 'application_date',
      width: '12%',
      render: (row) => formatDate(row.application_date)
    },
    {
      label: PET_VACCINATION_TEXT.doseCol,
      key: 'dose',
      width: '9%',
      render: (row) => row.dose || '—'
    },
    {
      label: PET_VACCINATION_TEXT.nextDoseCol,
      key: 'next_dose_date',
      width: '12%',
      render: (row) => formatDate(row.next_dose_date)
    },
    {
      label: PET_VACCINATION_TEXT.statusCol,
      key: 'status',
      width: '11%',
      type: 'badge',
      badgeClass: (row) => styles[`status_${row.status}`] || '',
      render: (row) => PET_VACCINATION_TEXT.statusLabels[row.status] || row.status
    },
    {
      label: PET_VACCINATION_TEXT.batchCol,
      key: 'batch_number',
      width: '11%',
      render: (row) => row.batch_number || '—'
    },
    {
      label: PET_VACCINATION_TEXT.doctorCol,
      key: 'doctor_name',
      width: '10%',
      render: (row) => row.doctor_name || '—'
    },
    {
      label: PET_VACCINATION_TEXT.actionsCol,
      key: 'actions',
      type: 'actions',
      align: 'center',
      width: '18%',
      actions: [
        {
          label: PET_VACCINATION_TEXT.postponeBtn,
          onClick: (row) => openPostpone(row),
          disabled: (row) => row.status === 'Postponed'
        },
        {
          label: PET_VACCINATION_TEXT.invoiceBtn,
          onClick: (row) => openInvoice(row),
          disabled: (row) => !!row.detalle_factura_id
        }
      ]
    }
  ];

  return (
    <div className={styles.panelContent}>
      <div className={styles.topActions}>
        <Button
          onClick={() => setShowRegisterForm(true)}
          icon={PlusCircle}
          variant="primary"
          color={Button.COLORS.PURPLE}
        >
          {PET_VACCINATION_TEXT.registerBtn}
        </Button>
        <Button
          onClick={download}
          icon={Download}
          variant="outline"
          disabled={downloading}
        >
          {downloading ? PET_VACCINATION_TEXT.downloadingCarnet : PET_VACCINATION_TEXT.downloadCarnetBtn}
        </Button>
      </div>

      <h3 className={styles.sectionTitle}>{PET_VACCINATION_TEXT.statusTitle}</h3>
      {loading ? (
        <Loading size="small" text="Cargando estado de vacunación..." />
      ) : status.length === 0 ? (
        <p className={styles.emptyText}>{PET_VACCINATION_TEXT.statusEmpty}</p>
      ) : (
        <div className={styles.statusGrid}>
          {status.map((item) => (
            <div
              key={item.vaccine_id}
              className={`${styles.statusCard} ${styles[TRAFFIC_LIGHT_CLASS[item.traffic_light]] || ''}`}
            >
              <div className={styles.statusCardHeader}>
                <Syringe size={16} />
                <span className={styles.statusCardName}>{item.vaccine_name}</span>
              </div>
              <span className={styles.statusCardBadge}>
                {PET_VACCINATION_TEXT.trafficLightLabels[item.traffic_light] || item.traffic_light}
              </span>
              <div className={styles.statusCardDates}>
                <span>Última: {formatDate(item.last_application_date)}</span>
                <span>Próxima: {formatDate(item.next_dose_date)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className={styles.sectionTitle}>{PET_VACCINATION_TEXT.historyTitle}</h3>
      <div className={styles.tableWrapper}>
        <TableB
          columns={historyColumns}
          data={history}
          loading={loading}
          error={error}
          onRetry={fetchData}
          emptyIcon={Syringe}
          emptyMessage={PET_VACCINATION_TEXT.historyEmptyMessage}
          rowKey={(row) => row.id}
        />
      </div>

      <DrawPanel
        isOpen={showRegisterForm}
        title={PET_VACCINATION_TEXT.registerDrawerTitle}
        onClose={() => { setShowRegisterForm(false); registerLogic.resetForm(); }}
        onConfirm={registerLogic.handleSubmit}
        confirmText={registerLogic.submitting ? 'Registrando...' : PET_VACCINATION_TEXT.registerConfirmBtn}
        cancelText="Cancelar"
        showActions={true}
      >
        <RegisterVaccinationForm
          form={registerLogic.form}
          handleChange={registerLogic.handleChange}
          handleVaccineChange={registerLogic.handleVaccineChange}
          vaccines={registerLogic.vaccines}
          loadingVaccines={registerLogic.loadingVaccines}
          batches={registerLogic.batches}
          loadingBatches={registerLogic.loadingBatches}
          formAlert={registerLogic.formAlert}
          setFormAlert={registerLogic.setFormAlert}
        />
      </DrawPanel>

      <AlertModal
        open={actionModal.open}
        title={actionModal.mode === 'postpone' ? PET_VACCINATION_TEXT.postponeModalTitle : PET_VACCINATION_TEXT.invoiceModalTitle}
        message={actionModal.mode === 'invoice' ? PET_VACCINATION_TEXT.invoiceModalMessage : ''}
        onClose={closeActionModal}
        onConfirm={confirmAction}
        confirmText={actionLoading ? 'Procesando...' : (actionModal.mode === 'postpone' ? PET_VACCINATION_TEXT.postponeBtn : PET_VACCINATION_TEXT.invoiceBtn)}
        cancelText="Cancelar"
        showInput={actionModal.mode === 'postpone'}
        inputType="text"
        inputLabel={PET_VACCINATION_TEXT.postponeReasonLabel}
        inputValue={actionModal.reason}
        onInputChange={(e) => setReason(e.target.value)}
      />

      <AlertModal
        open={resultAlert.open}
        title={resultAlert.title}
        message={resultAlert.message}
        onClose={() => setResultAlert({ open: false, title: '', message: '' })}
        confirmText="Entendido"
      />

      <AlertModal
        open={successAlert.open}
        title={PET_VACCINATION_TEXT.registerSuccessTitle}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ open: false, message: '' })}
        confirmText="Entendido"
      />

      <AlertModal
        open={!!downloadError}
        title="Error"
        message={downloadError}
        onClose={() => setDownloadError(null)}
        confirmText="Entendido"
      />
    </div>
  );
}
