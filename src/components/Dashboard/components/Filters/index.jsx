import React from 'react';
import { X } from 'lucide-react';
import { DASHBOARD_TEXT } from '../../../../constants/TEXT';
import Button from '../../../screens/components/Button';
import { PERIODS, APPOINTMENT_STATUSES } from '../../utils';
import styles from './index.module.css';

const PERIOD_OPTIONS = [
  { value: PERIODS.DAY, label: DASHBOARD_TEXT.filterPeriodDay },
  { value: PERIODS.WEEK, label: DASHBOARD_TEXT.filterPeriodWeek },
  { value: PERIODS.MONTH, label: DASHBOARD_TEXT.filterPeriodMonth },
  { value: PERIODS.YEAR, label: DASHBOARD_TEXT.filterPeriodYear },
];

const STATUS_LABELS = {
  programada: DASHBOARD_TEXT.filterStatusScheduled,
  en_curso: DASHBOARD_TEXT.filterStatusInProgress,
  completada: DASHBOARD_TEXT.filterStatusCompleted,
  cancelada: DASHBOARD_TEXT.filterStatusCancelled,
  no_asistida: DASHBOARD_TEXT.filterStatusNoShow,
};

const STATUS_OPTIONS = [
  { value: 'all', label: DASHBOARD_TEXT.filterStatusAll },
  ...APPOINTMENT_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] })),
];

const Filters = (props) => {
  const { period, onPeriodChange, status, onStatusChange, onClear } = props;
  const hasActiveFilters = period !== null || status !== 'all';

  return (
    <div className={styles.filters}>
      <div className={styles.clearRow}>
        <Button
          type="button"
          variant={Button.VARIANTS.GHOST}
          size={Button.SIZES.SMALL}
          icon={X}
          disabled={!hasActiveFilters}
          onClick={onClear}
        >
          {DASHBOARD_TEXT.filterClearButton}
        </Button>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>{DASHBOARD_TEXT.filterPeriodLabel}</span>
        <div className={styles.optionsRow}>
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={period === option.value ? Button.VARIANTS.PRIMARY : Button.VARIANTS.OUTLINE}
              size={Button.SIZES.SMALL}
              onClick={() => onPeriodChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>{DASHBOARD_TEXT.filterStatusLabel}</span>
        <div className={styles.optionsRow}>
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={status === option.value ? Button.VARIANTS.PRIMARY : Button.VARIANTS.OUTLINE}
              size={Button.SIZES.SMALL}
              onClick={() => onStatusChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
