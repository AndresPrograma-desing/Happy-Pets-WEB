import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { FormCard, HoursPicker } from 'anteriority-ui';
import { getWorkingHours, updateWorkingHours } from '../../../../../services/api/workingHours';
import Loading from '../../../../../components/screens/components/Loading/Index';
import styles from './index.module.css';
import { WORKING_HOURS_TEXTS as TEXTS, WORKING_HOURS_FORM_ID, DEFAULT_RANGE } from './constants';
import { parseWorkingHoursResponse, buildWorkingHoursPayload, validateRange } from './utils';

export default function WorkingHours({ onClose, onSaveStart, onSaveEnd }) {
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getWorkingHours();
        setRange(parseWorkingHoursResponse(res));
      } catch (err) {
        console.error(err);
        setError(err?.message || TEXTS.errorLoad);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg('');

    const validationError = validateRange(range);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (onSaveStart) onSaveStart();
    try {
      const res = await updateWorkingHours(buildWorkingHoursPayload(range));
      setSuccessMsg(res?.message || TEXTS.successSave);
      setTimeout(() => {
        setSuccessMsg('');
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err?.message || TEXTS.errorSave);
    } finally {
      if (onSaveEnd) onSaveEnd();
    }
  };

  if (loading) return <Loading size="large" />;

  return (
    <form id={WORKING_HOURS_FORM_ID} onSubmit={handleSave}>
      <FormCard icon={Clock} title={TEXTS.cardTitle}>
        <div className={styles.formContainer}>
          <HoursPicker
            label={TEXTS.rangeLabel}
            name="workingHours"
            range
            format24h
            value={range}
            onChange={(e) => setRange(e.target.value)}
          />

          <p className={styles.hint}>{TEXTS.hint}</p>

          {successMsg && (
            <div className={`${styles.alertContainer} ${styles.successAlert}`}>{successMsg}</div>
          )}
          {error && (
            <div className={`${styles.alertContainer} ${styles.errorAlert}`}>{error}</div>
          )}
        </div>
      </FormCard>
    </form>
  );
}
