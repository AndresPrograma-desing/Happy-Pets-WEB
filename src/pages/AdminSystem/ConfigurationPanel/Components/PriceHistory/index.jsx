import React, { useEffect, useState } from "react";
import { TableA, DateTag, Selector, DrawPanel, Callout } from "anteriority-ui";
import usePanelHeader from "../../../../../components/GenericPanel/usePanelHeader";
import { getPriceHistory, getProducts } from "../../../../../services/api";
import { PRICE_HISTORY_TEXTS } from "./constants";
import style from "./index.module.css";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function formatCurrency(value) {
  return Number(value || 0).toFixed(2);
}

export default function PriceHistory() {
  const [history, setHistory] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [productId, setProductId] = useState("");
  const [productOptions, setProductOptions] = useState([{ value: "", label: PRICE_HISTORY_TEXTS.filterProductAll }]);

  useEffect(() => {
    getProducts({ pageSize: 1000 })
      .then((res) => {
        const list = res?.items || res?.Items || [];
        setProductOptions([
          { value: "", label: PRICE_HISTORY_TEXTS.filterProductAll },
          ...list.map((p) => ({ value: String(p.id), label: p.nombre })),
        ]);
      })
      .catch(() => setProductOptions([{ value: "", label: PRICE_HISTORY_TEXTS.filterProductAll }]));
  }, []);

  const fetchHistory = async (targetPage, targetPageSize) => {
    setLoading(true);
    try {
      const result = await getPriceHistory({
        pageNumber: targetPage,
        pageSize: targetPageSize,
        productId: productId || undefined,
      });
      setHistory(result?.items || []);
      setTotalCount(result?.total_count || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching price history:", err);
      setHistory([]);
      setTotalCount(0);
      setError(PRICE_HISTORY_TEXTS.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, productId]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageSizeChange = (newPageSize) => {
    setPage(1);
    setPageSize(newPageSize);
  };

  usePanelHeader({
    title: PRICE_HISTORY_TEXTS.panelTitle,
    message: PRICE_HISTORY_TEXTS.panelDescription,
    menuTitle: PRICE_HISTORY_TEXTS.menuTitle,
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
      header: PRICE_HISTORY_TEXTS.columnProduct,
      accessor: "producto_nombre",
    },
    {
      header: PRICE_HISTORY_TEXTS.columnPriceBefore,
      align: "center",
      render: (row) => formatCurrency(row.precio_anterior),
    },
    {
      header: PRICE_HISTORY_TEXTS.columnPriceAfter,
      align: "center",
      render: (row) => (
        <span className={row.precio_nuevo >= row.precio_anterior ? style.priceUp : style.priceDown}>
          {formatCurrency(row.precio_nuevo)}
        </span>
      ),
    },
    {
      header: PRICE_HISTORY_TEXTS.columnUser,
      render: (row) => row.usuario_nombre || "—",
    },
    {
      header: PRICE_HISTORY_TEXTS.columnDate,
      render: (row) => <DateTag date={row.fecha_cambio} />,
    },
  ];

  return (
    <div className={style.content}>
      <div className={style.filtersRow}>
        <div className={style.filterField}>
          <Selector
            label={PRICE_HISTORY_TEXTS.filterProductLabel}
            options={productOptions}
            value={productId}
            onChange={(e) => { setPage(1); setProductId(e.target.value); }}
          />
        </div>
      </div>

      <div className={style.tableWrapper}>
        <TableA
          columns={columns}
          data={history}
          loading={loading}
          error={error}
          onRetry={() => fetchHistory(page, pageSize)}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => setSelectedEntry(row)}
          emptyMessage={PRICE_HISTORY_TEXTS.emptyMessage}
        />
      </div>

      <DrawPanel
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title={PRICE_HISTORY_TEXTS.detailTitle}
        description={selectedEntry ? selectedEntry.producto_nombre : undefined}
        showActions={false}
      >
        {selectedEntry && (
          <div className={style.detailSection}>
            <div className={style.detailGrid}>
              <div className={style.detailItem}>
                <strong>{PRICE_HISTORY_TEXTS.columnPriceBefore}</strong>
                <span>{formatCurrency(selectedEntry.precio_anterior)}</span>
              </div>
              <div className={style.detailItem}>
                <strong>{PRICE_HISTORY_TEXTS.columnPriceAfter}</strong>
                <span>{formatCurrency(selectedEntry.precio_nuevo)}</span>
              </div>
              <div className={style.detailItem}>
                <strong>{PRICE_HISTORY_TEXTS.columnUser}</strong>
                <span>{selectedEntry.usuario_nombre || "—"}</span>
              </div>
              <div className={style.detailItem}>
                <strong>{PRICE_HISTORY_TEXTS.columnDate}</strong>
                <span><DateTag date={selectedEntry.fecha_cambio} /></span>
              </div>
            </div>

            <Callout variant="neutral" title={PRICE_HISTORY_TEXTS.detailReason}>
              {selectedEntry.motivo || PRICE_HISTORY_TEXTS.noReason}
            </Callout>
          </div>
        )}
      </DrawPanel>
    </div>
  );
}
