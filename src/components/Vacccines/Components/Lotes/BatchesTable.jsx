import React from 'react';
import { PackageSearch } from 'lucide-react';
import TableB from '../../../screens/components/TableB';
import styles from '../../Index.module.css';
import { VACCINE_BATCHES_TEXT } from './constants';

export default function BatchesTable({ batches, loading, error, onRetry }) {
  const columns = [
    { label: VACCINE_BATCHES_TEXT.laboratoryCol, key: 'laboratory', width: '25%' },
    { label: VACCINE_BATCHES_TEXT.batchNumberCol, key: 'batch_number', width: '20%' },
    { label: VACCINE_BATCHES_TEXT.expirationCol, key: 'expiration_date', width: '20%' },
    { label: VACCINE_BATCHES_TEXT.stockCol, key: 'quantity_in_stock', width: '15%' },
    {
      label: VACCINE_BATCHES_TEXT.statusCol,
      key: 'status',
      width: '20%',
      type: 'badge',
      badgeClass: (row) => (row.is_expired ? styles.inactiveBadge : styles.activeBadge),
      render: (row) => (row.is_expired ? VACCINE_BATCHES_TEXT.expiredLabel : VACCINE_BATCHES_TEXT.validLabel)
    }
  ];

  return (
    <div className={styles.tableWrapper}>
      <TableB
        columns={columns}
        data={batches}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyIcon={PackageSearch}
        emptyMessage={VACCINE_BATCHES_TEXT.emptyMessage}
        rowKey={(row) => row.id}
      />
    </div>
  );
}
