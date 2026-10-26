import React, { useState, useEffect } from 'react';
import { TableA, Barnner, DateTag, Selector, DrawPanel, Callout } from 'anteriority-ui';
import Input from '../../../../../components/screens/components/Input/Index';
import CalendarPicker from '../../../../../components/screens/components/CalendarPicker/Index';
import usePanelHeader from '../../../../../components/GenericPanel/usePanelHeader';
import { getLogs, getUsers } from '../../../../../services/api/index';
import { TEXTS } from './constants';
import { formatDate, formatJsonData, getLogsActionBadgeVariant } from './utils';
import styles from './Index.module.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  // Filtros de auditoría (HU-02)
  const [filterUserId, setFilterUserId] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [userOptions, setUserOptions] = useState([{ value: '', label: TEXTS.filterUserAll }]);

  useEffect(() => {
    getUsers()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || res?.items || [];
        setUserOptions([
          { value: '', label: TEXTS.filterUserAll },
          ...list.map((u) => ({
            value: String(u.id),
            label: `${u.nombre || ''} ${u.apellido || ''}`.trim() || `Usuario ${u.id}`
          }))
        ]);
      })
      .catch(() => setUserOptions([{ value: '', label: TEXTS.filterUserAll }]));
  }, []);

  const fetchLogsData = async (targetPage, targetPageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLogs({
        pageNumber: targetPage,
        pageSize: targetPageSize,
        userId: filterUserId || undefined,
        action: filterAction || undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined
      });

      const list = Array.isArray(data) ? data : (data?.items || []);
      setLogs(list);
      setTotalCount(data?.total_count ?? list.length);
    } catch (err) {
      setLogs([]);
      setTotalCount(0);
      setError(err?.isNetworkError ? TEXTS.errorNetwork : (err?.message || TEXTS.errorLoading));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsData(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filterUserId, filterAction, filterDateFrom, filterDateTo]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageSizeChange = (newPageSize) => {
    setPage(1);
    setPageSize(newPageSize);
  };

  usePanelHeader({
    title: TEXTS.title,
    message: TEXTS.description,
    menuTitle: 'Ajustes',
    showPagination: true,
    paginationCount: totalPages,
    paginationPage: page,
    onPaginationChange: (_, p) => setPage(p),
    pageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    onPageSizeChange: handlePageSizeChange
  });

  const columns = [
    {
      header: TEXTS.actionLabel,
      render: (row) => (
        <Barnner type={getLogsActionBadgeVariant(row.accion)}>{row.accion}</Barnner>
      )
    },
    {
      header: TEXTS.tableLabel,
      accessor: 'tabla_afectada'
    },
    {
      header: TEXTS.userLabel,
      render: (row) => row.usuario_nombre || 'N/A'
    },
    {
      header: TEXTS.ipLabel,
      accessor: 'ip_address'
    },
    {
      header: TEXTS.dateLabel,
      render: (row) => <DateTag date={row.created_at} />
    }
  ];

  return (
    <div className={styles.content}>
      <div className={styles.filtersRow}>
        <div className={styles.filterField}>
          <Selector
            label={TEXTS.filterUserLabel}
            options={userOptions}
            value={filterUserId}
            onChange={(e) => { setPage(1); setFilterUserId(e.target.value); }}
          />
        </div>
        <div className={styles.filterField}>
          <Input
            label={TEXTS.filterActionLabel}
            value={filterAction}
            onChange={(e) => { setPage(1); setFilterAction(e.target.value); }}
            placeholder={TEXTS.filterActionPlaceholder}
          />
        </div>
        <div className={styles.filterField}>
          <CalendarPicker
            label={TEXTS.filterDateFromLabel}
            name="filterDateFrom"
            value={filterDateFrom}
            onChange={(e) => { setPage(1); setFilterDateFrom(e.target.value); }}
          />
        </div>
        <div className={styles.filterField}>
          <CalendarPicker
            label={TEXTS.filterDateToLabel}
            name="filterDateTo"
            value={filterDateTo}
            onChange={(e) => { setPage(1); setFilterDateTo(e.target.value); }}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <TableA
          columns={columns}
          data={logs}
          loading={loading}
          error={error}
          onRetry={() => fetchLogsData(page, pageSize)}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => setSelectedLog(row)}
          emptyMessage={TEXTS.noLogs}
        />
      </div>

      <DrawPanel
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={TEXTS.detailsTitle}
        description={selectedLog ? `${selectedLog.accion} - ${selectedLog.tabla_afectada || 'N/A'}` : undefined}
        showActions={false}
      >
        {selectedLog && (
          <div className={styles.detailSection}>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <strong>ID Log</strong>
                <span>{selectedLog.id}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>{TEXTS.userLabel}</strong>
                <span>{selectedLog.usuario_nombre || 'N/A'} (ID: {selectedLog.usuario_id ?? 'N/A'})</span>
              </div>
              <div className={styles.detailItem}>
                <strong>{TEXTS.recordIdLabel}</strong>
                <span>{selectedLog.registro_id || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>{TEXTS.userAgentLabel}</strong>
                <span>{selectedLog.user_agent || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>{TEXTS.dateLabel}</strong>
                <span>{formatDate(selectedLog.created_at)}</span>
              </div>
            </div>

            {selectedLog.datos_previos && (
              <Callout variant="neutral" title={TEXTS.previousDataLabel}>
                <pre className={styles.codeBlock}>{formatJsonData(selectedLog.datos_previos)}</pre>
              </Callout>
            )}

            {selectedLog.datos_nuevos && (
              <Callout variant="neutral" title={TEXTS.newDataLabel}>
                <pre className={styles.codeBlock}>{formatJsonData(selectedLog.datos_nuevos)}</pre>
              </Callout>
            )}
          </div>
        )}
      </DrawPanel>
    </div>
  );
}
