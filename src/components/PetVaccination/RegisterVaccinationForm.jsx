import React from 'react';
import styles from './Index.module.css';
import TextField from '../screens/components/Material-UI/Components/TextField/Index';
import Selector from '../screens/components/Material-UI/Components/Selector/Index';
import AlertModal from '../AlertModal/AlertModal';
import { PET_VACCINATION_TEXT } from './constants';

export default function RegisterVaccinationForm({
  form,
  handleChange,
  handleVaccineChange,
  vaccines,
  loadingVaccines,
  batches,
  loadingBatches,
  formAlert,
  setFormAlert
}) {
  return (
    <div className={styles.formContent}>
      <Selector
        label={PET_VACCINATION_TEXT.formVaccineLabel}
        placeholder={PET_VACCINATION_TEXT.formVaccinePlaceholder}
        value={form.vaccine_id}
        onChange={(e) => handleVaccineChange(e.target.value)}
        loading={loadingVaccines}
        options={vaccines.map((v) => ({ value: String(v.id), label: v.name }))}
        required
      />

      <Selector
        label={PET_VACCINATION_TEXT.formBatchLabel}
        placeholder={form.vaccine_id ? PET_VACCINATION_TEXT.formBatchPlaceholder : PET_VACCINATION_TEXT.formBatchHelper}
        value={form.vaccine_batch_id}
        onChange={(e) => handleChange({ target: { name: 'vaccine_batch_id', value: e.target.value } })}
        loading={loadingBatches}
        options={batches.map((b) => ({ value: String(b.id), label: `${b.batch_number} — ${b.laboratory}` }))}
        required
      />

      <div className={styles.formRow}>
        <TextField
          label={PET_VACCINATION_TEXT.formApplicationDateLabel}
          name="application_date"
          type="date"
          value={form.application_date}
          onChange={handleChange}
          inputProps={{ max: new Date().toISOString().slice(0, 10) }}
          required
        />
        <TextField
          label={PET_VACCINATION_TEXT.formWeightLabel}
          name="weight_at_application"
          type="number"
          value={form.weight_at_application}
          onChange={handleChange}
          inputProps={{ step: '0.01' }}
        />
      </div>

      <div className={styles.formRow}>
        <TextField
          label={PET_VACCINATION_TEXT.formDoseLabel}
          name="dose"
          value={form.dose}
          onChange={handleChange}
        />
        <TextField
          label={PET_VACCINATION_TEXT.formNextDoseOverrideLabel}
          name="next_dose_date_override"
          type="date"
          value={form.next_dose_date_override}
          onChange={handleChange}
          inputProps={{ min: form.application_date || undefined }}
        />
      </div>

      <TextField
        label={PET_VACCINATION_TEXT.formObservationsLabel}
        name="clinical_observations"
        value={form.clinical_observations}
        onChange={handleChange}
        placeholder={PET_VACCINATION_TEXT.formObservationsPlaceholder}
        multiline
        rows={2}
      />

      <AlertModal
        open={formAlert.open}
        title={formAlert.title}
        message={formAlert.message}
        onClose={() => setFormAlert({ open: false, title: '', message: '' })}
        confirmText="Entendido"
      />
    </div>
  );
}
