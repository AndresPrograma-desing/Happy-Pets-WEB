import React, { useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import usePanelHeader from '../../../GenericPanel/usePanelHeader';
import styles from '../../Index.module.css';
import DrawPanel from '../../../screens/components/DrawPanel';
import Button from '../../../screens/components/Button';
import Selector from '../../../screens/components/Material-UI/Components/Selector/Index';
import AlertModal from '../../../AlertModal/AlertModal';
import BatchesTable from './BatchesTable';
import BatchForm from './BatchForm';
import { useVaccineBatchesPageLogic } from './utils';
import { VACCINE_BATCHES_TEXT } from './constants';

export default function VaccineBatchesPanel() {
  const {
    vaccines,
    loadingVaccines,
    loadVaccines,
    selectedVaccineId,
    handleVaccineSelect,
    batches,
    loadingBatches,
    batchError,
    fetchBatches,
    showBatchForm,
    openBatchForm,
    closeBatchForm,
    batchForm,
    handleBatchFormChange,
    handleCreateBatch,
    creatingBatch,
    batchAlert,
    setBatchAlert,
    successAlert,
    setSuccessAlert
  } = useVaccineBatchesPageLogic();

  useEffect(() => {
    loadVaccines();
  }, [loadVaccines]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  usePanelHeader({
    title: VACCINE_BATCHES_TEXT.pageTitle,
    menuTitle: VACCINE_BATCHES_TEXT.menuTitle
  });

  return (
    <div className={styles.content}>
      <div className={styles.topActions}>
        <Button
          onClick={openBatchForm}
          icon={PlusCircle}
          variant="primary"
          color={Button.COLORS.PURPLE}
          disabled={!selectedVaccineId}
        >
          {VACCINE_BATCHES_TEXT.addBatchBtn}
        </Button>
      </div>

      <div className={styles.selectorRow}>
        <Selector
          label={VACCINE_BATCHES_TEXT.vaccineSelectLabel}
          placeholder={loadingVaccines ? VACCINE_BATCHES_TEXT.loadingVaccines : VACCINE_BATCHES_TEXT.vaccineSelectPlaceholder}
          value={selectedVaccineId}
          onChange={(e) => handleVaccineSelect(e.target.value)}
          options={vaccines.map((v) => ({ value: String(v.id), label: v.name }))}
        />
      </div>

      {selectedVaccineId ? (
        <BatchesTable
          batches={batches}
          loading={loadingBatches}
          error={batchError}
          onRetry={fetchBatches}
        />
      ) : (
        <p className={styles.emptyText}>{VACCINE_BATCHES_TEXT.noVaccineSelected}</p>
      )}

      <DrawPanel
        isOpen={showBatchForm}
        title={VACCINE_BATCHES_TEXT.batchDrawerTitle}
        onClose={closeBatchForm}
        onConfirm={handleCreateBatch}
        confirmText={creatingBatch ? VACCINE_BATCHES_TEXT.savingBatch : VACCINE_BATCHES_TEXT.confirmBtn}
        cancelText={VACCINE_BATCHES_TEXT.cancelBtn}
        showActions={true}
      >
        <BatchForm
          batchForm={batchForm}
          handleBatchFormChange={handleBatchFormChange}
        />
      </DrawPanel>

      <AlertModal
        open={batchAlert.open}
        title={batchAlert.title}
        message={batchAlert.message}
        onClose={() => setBatchAlert({ open: false, title: '', message: '' })}
        confirmText="Entendido"
      />

      <AlertModal
        open={successAlert.open}
        title="¡Lote registrado!"
        message={successAlert.message}
        onClose={() => setSuccessAlert({ open: false, message: '' })}
        confirmText="Entendido"
      />
    </div>
  );
}
