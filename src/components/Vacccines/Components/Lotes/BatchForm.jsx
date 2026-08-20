import React from 'react';
import styles from '../../Index.module.css';
import TextField from '../../../screens/components/Material-UI/Components/TextField/Index';
import { VACCINE_BATCHES_TEXT } from './constants';

export default function BatchForm({ batchForm, handleBatchFormChange }) {
  return (
    <div className={styles.formContent}>
      <div className={styles.formRow}>
        <TextField
          label={VACCINE_BATCHES_TEXT.laboratoryLabel}
          name="laboratory"
          value={batchForm.laboratory}
          onChange={handleBatchFormChange}
          required
        />
        <TextField
          label={VACCINE_BATCHES_TEXT.batchNumberLabel}
          name="batch_number"
          value={batchForm.batch_number}
          onChange={handleBatchFormChange}
          required
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label={VACCINE_BATCHES_TEXT.quantityLabel}
          name="quantity_in_stock"
          type="number"
          value={batchForm.quantity_in_stock}
          onChange={handleBatchFormChange}
          placeholder="0"
        />
        <TextField
          label={VACCINE_BATCHES_TEXT.receivedDateLabel}
          name="received_date"
          type="date"
          value={batchForm.received_date}
          onChange={handleBatchFormChange}
          required
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label={VACCINE_BATCHES_TEXT.expirationDateLabel}
          name="expiration_date"
          type="date"
          value={batchForm.expiration_date}
          onChange={handleBatchFormChange}
          required
        />
      </div>
    </div>
  );
}
