import React, { useEffect, useState } from "react";
import { TableA, Barnner, DateTag, Selector, DrawPanel, Callout } from "anteriority-ui";
import CalendarPicker from "../../../../../components/screens/components/CalendarPicker/Index";
import usePanelHeader from "../../../../../components/GenericPanel/usePanelHeader";
import { getWorkerProcessEvents } from "../../../../../services/api";
import { WORKER_EVENTS_TEXTS } from "../../constants";
import { buildVinculationSummary, getTypeEventBadgeVariant, getTypeEventLabel, getCalloutVariant, getWorkerDisplayName } from "./utils";
import style from "./index.module.css";

const TYPE_OPTIONS = [
  { value: "", label: WORKER_EVENTS_TEXTS.typeAll },
  { value: "Error", label: WORKER_EVENTS_TEXTS.typeError },
  { value: "Warning", label: WORKER_EVENTS_TEXTS.typeWarning },
  { value: "Success", label: WORKER_EVENTS_TEXTS.typeSuccess },
];

const STATUS_OPTIONS = [
  { value: "", label: WORKER_EVENTS_TEXTS.statusAll },
  { value: "false", label: WORKER_EVENTS_TEXTS.statusActive },
  { value: "true", label: WORKER_EVENTS_TEXTS.statusResolved },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const WorkerProcessEvents = () => {
  const [events, setEvents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [typeEvent, setTypeEvent] = useState("");
  const [isResolved, setIsResolved] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchEvents = async (targetPage, targetPageSize) => {
    setLoading(true);
    try {
      const result = await getWorkerProcessEvents({
        pageNumber: targetPage,
        pageSize: targetPageSize,
        typeEvent: typeEvent || undefined,
        isResolved: isResolved === "" ? undefined : isResolved,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setEvents(result?.items || []);
      setTotalCount(result?.total_count || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching worker process events:", err);
      setError(WORKER_EVENTS_TEXTS.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, typeEvent, isResolved, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageSizeChange = (newPageSize) => {
    setPage(1);
    setPageSize(newPageSize);
  };

  usePanelHeader({
    title: WORKER_EVENTS_TEXTS.panelTitle,
    message: WORKER_EVENTS_TEXTS.panelDescription,
    menuTitle: "Ajustes",
    showPagination: true,
    paginationCount: totalPages,
    paginationPage: page,
    onPaginationChange: (_, p) => setPage(p),
    pageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    onPageSizeChange: handlePageSizeChange,
  });

  const columns = [
    {
      header: WORKER_EVENTS_TEXTS.columnEvent,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.9rem" }}>{getWorkerDisplayName(row.name_event)}</div>
          {row.title && <div style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: "2px" }}>{row.title}</div>}
        </div>
      ),
    },
    {
      header: WORKER_EVENTS_TEXTS.columnType,
      render: (row) => (
        <Barnner type={getTypeEventBadgeVariant(row.type_event)}>{getTypeEventLabel(row.type_event)}</Barnner>
      ),
    },
    {
      header: WORKER_EVENTS_TEXTS.columnIntents,
      align: "center",
      accessor: "intents",
    },
    {
      header: WORKER_EVENTS_TEXTS.columnStatus,
      render: (row) => (
        <Barnner type={row.is_resolved ? "success" : "danger"}>
          {row.is_resolved ? WORKER_EVENTS_TEXTS.statusResolvedLabel : WORKER_EVENTS_TEXTS.statusActiveLabel}
        </Barnner>
      ),
    },
    {
      header: WORKER_EVENTS_TEXTS.columnCreated,
      render: (row) => <DateTag date={row.created} />,
    },
    {
      header: WORKER_EVENTS_TEXTS.columnResolvedAt,
      render: (row) => <DateTag date={row.resolved_at} />,
    },
  ];

  return (
    <div className={style.content}>
      <div className={style.filtersRow}>
        <div className={style.filterField}>
          <Selector
            label={WORKER_EVENTS_TEXTS.filterTypeLabel}
            options={TYPE_OPTIONS}
            value={typeEvent}
            onChange={(e) => { setPage(1); setTypeEvent(e.target.value); }}
          />
        </div>
        <div className={style.filterField}>
          <Selector
            label={WORKER_EVENTS_TEXTS.filterStatusLabel}
            options={STATUS_OPTIONS}
            value={isResolved}
            onChange={(e) => { setPage(1); setIsResolved(e.target.value); }}
          />
        </div>
        <div className={style.filterField}>
          <CalendarPicker
            label={WORKER_EVENTS_TEXTS.filterFromLabel}
            name="fromDate"
            value={fromDate}
            onChange={(e) => { setPage(1); setFromDate(e.target.value); }}
          />
        </div>
        <div className={style.filterField}>
          <CalendarPicker
            label={WORKER_EVENTS_TEXTS.filterToLabel}
            name="toDate"
            value={toDate}
            onChange={(e) => { setPage(1); setToDate(e.target.value); }}
          />
        </div>
      </div>

      <div className={style.tableWrapper}>
        <TableA
          columns={columns}
          data={events}
          loading={loading}
          error={error}
          onRetry={() => fetchEvents(page, pageSize)}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => setSelectedEvent(row)}
          emptyMessage={WORKER_EVENTS_TEXTS.emptyMessage}
        />
      </div>

      <DrawPanel
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={WORKER_EVENTS_TEXTS.detailTitle}
        description={selectedEvent ? getWorkerDisplayName(selectedEvent.name_event) : undefined}
        showActions={false}
      >
        {selectedEvent && (
          <div className={style.detailSection}>
            {selectedEvent.error_message && (
              <Callout variant={getCalloutVariant(selectedEvent.type_event)} title={WORKER_EVENTS_TEXTS.detailError}>
                {selectedEvent.error_message}
              </Callout>
            )}

            {buildVinculationSummary(selectedEvent.snapshot) ? (
              <Callout variant="neutral" title={WORKER_EVENTS_TEXTS.detailVinculation}>
                {buildVinculationSummary(selectedEvent.snapshot)}
              </Callout>
            ) : (
              <div className={style.detailMuted}>{WORKER_EVENTS_TEXTS.noVinculation}</div>
            )}
          </div>
        )}
      </DrawPanel>
    </div>
  );
};

export default WorkerProcessEvents;
