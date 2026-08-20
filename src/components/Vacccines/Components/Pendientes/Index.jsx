import React, { useEffect, useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import styles from '../../Index.module.css';
import usePanelHeader from '../../../GenericPanel/usePanelHeader';
import TableB from '../../../screens/components/TableB';
import Filter from '../../../screens/components/Filter/Index';
import TextField from '../../../screens/components/Material-UI/Components/TextField/Index';
import CopyText from '../../../screens/components/CopyText/Index';
import { formatDate, usePendingVaccinationsLogic } from './utils';
import { PENDING_VACCINATIONS_TEXT } from './constants';

export default function PendingVaccinations() {
  const {
    items,
    loading,
    error,
    page,
    setPage,
    pageSize,
    handlePageSizeChange,
    totalPages,
    searchTerm,
    setSearchTerm,
    handleClearFilters,
    fetchPending
  } = usePendingVaccinationsLogic();

  useEffect(() => {
    setPage(1);
  }, [searchTerm, setPage]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending, page, pageSize, searchTerm]);

  const activeFiltersCount = useMemo(() => [searchTerm].filter(Boolean).length, [searchTerm]);

  const columns = [
    { label: PENDING_VACCINATIONS_TEXT.petCol, key: 'mascota_nombre', width: '20%' },
    { label: PENDING_VACCINATIONS_TEXT.ownerCol, key: 'cliente_nombre', width: '25%' },
    {
      label: PENDING_VACCINATIONS_TEXT.phoneCol,
      key: 'cliente_telefono',
      width: '15%',
      render: (row) => (row.cliente_telefono ? <CopyText text={row.cliente_telefono} /> : '—')
    },
    { label: PENDING_VACCINATIONS_TEXT.vaccineCol, key: 'vaccine_name', width: '20%' },
    {
      label: PENDING_VACCINATIONS_TEXT.nextDoseCol,
      key: 'next_dose_date',
      width: '20%',
      render: (row) => formatDate(row.next_dose_date)
    }
  ];

  usePanelHeader({
    title: PENDING_VACCINATIONS_TEXT.pendingTitle,
    menuTitle: PENDING_VACCINATIONS_TEXT.pendingMenuTitle,
    showPagination: true,
    paginationCount: totalPages,
    paginationPage: page,
    onPaginationChange: (e, p) => setPage(p),
    pageSize,
    pageSizeOptions: [5, 10, 20, 50],
    onPageSizeChange: handlePageSizeChange
  });

  return (
    <div className={styles.content}>
      <Filter
        onClear={handleClearFilters}
        searchTerm={searchTerm}
        title={PENDING_VACCINATIONS_TEXT.pendingFilterTitle}
        activeFiltersCount={activeFiltersCount}
      >
        <TextField
          label={PENDING_VACCINATIONS_TEXT.pendingSearchLabel}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={PENDING_VACCINATIONS_TEXT.pendingSearchPlaceholder}
        />
      </Filter>

      <div className={styles.tableWrapper}>
        <TableB
          columns={columns}
          data={items}
          loading={loading}
          error={error}
          onRetry={() => fetchPending()}
          emptyIcon={CalendarClock}
          emptyMessage={PENDING_VACCINATIONS_TEXT.pendingEmptyMessage}
          rowKey={(row) => row.pet_vaccination_id}
        />
      </div>
    </div>
  );
}
