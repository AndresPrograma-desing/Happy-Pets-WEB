import React, { useEffect, useState } from "react";
import { TableA, Barnner, DateTag, Selector, DrawPanel, Callout } from "anteriority-ui";
import usePanelHeader from "../../../../../components/GenericPanel/usePanelHeader";
import { getInventoryMovements, getLowStockAlerts, getProducts } from "../../../../../services/api";
import { INVENTORY_TEXTS } from "./constants";
import { getMovementBadgeVariant, getMovementLabel } from "./utils";
import style from "./index.module.css";

const TYPE_OPTIONS = [
  { value: "", label: INVENTORY_TEXTS.typeAll },
  { value: "entrada", label: INVENTORY_TEXTS.typeEntrada },
  { value: "salida", label: INVENTORY_TEXTS.typeSalida },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function Inventory() {
  const [movements, setMovements] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [productId, setProductId] = useState("");
  const [movementType, setMovementType] = useState("");
  const [productOptions, setProductOptions] = useState([{ value: "", label: INVENTORY_TEXTS.filterProductAll }]);

  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  useEffect(() => {
    getProducts({ pageSize: 1000 })
      .then((res) => {
        const list = res?.items || res?.Items || [];
        setProductOptions([
          { value: "", label: INVENTORY_TEXTS.filterProductAll },
          ...list.map((p) => ({ value: String(p.id), label: p.nombre })),
        ]);
      })
      .catch(() => setProductOptions([{ value: "", label: INVENTORY_TEXTS.filterProductAll }]));

    getLowStockAlerts()
      .then((res) => setLowStockAlerts(Array.isArray(res) ? res : []))
      .catch(() => setLowStockAlerts([]));
  }, []);

  const fetchMovements = async (targetPage, targetPageSize) => {
    setLoading(true);
    try {
      const result = await getInventoryMovements({
        pageNumber: targetPage,
        pageSize: targetPageSize,
        productId: productId || undefined,
        movementType: movementType || undefined,
      });
      setMovements(result?.items || []);
      setTotalCount(result?.total_count || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching inventory movements:", err);
      setMovements([]);
      setTotalCount(0);
      setError(INVENTORY_TEXTS.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, productId, movementType]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageSizeChange = (newPageSize) => {
    setPage(1);
    setPageSize(newPageSize);
  };

  usePanelHeader({
    title: INVENTORY_TEXTS.panelTitle,
    message: INVENTORY_TEXTS.panelDescription,
    menuTitle: INVENTORY_TEXTS.menuTitle,
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
      header: INVENTORY_TEXTS.columnProduct,
      accessor: "producto_nombre",
    },
    {
      header: INVENTORY_TEXTS.columnType,
      render: (row) => (
        <Barnner type={getMovementBadgeVariant(row.tipo_movimiento)}>
          {getMovementLabel(row.tipo_movimiento, INVENTORY_TEXTS)}
        </Barnner>
      ),
    },
    {
      header: INVENTORY_TEXTS.columnQuantity,
      align: "center",
      accessor: "cantidad",
    },
    {
      header: INVENTORY_TEXTS.columnStockBefore,
      align: "center",
      accessor: "stock_anterior",
    },
    {
      header: INVENTORY_TEXTS.columnStockAfter,
      align: "center",
      accessor: "stock_nuevo",
    },
    {
      header: INVENTORY_TEXTS.columnUser,
      render: (row) => row.usuario_nombre || "—",
    },
    {
      header: INVENTORY_TEXTS.columnDate,
      render: (row) => <DateTag date={row.fecha_movimiento} />,
    },
  ];

  return (
    <div className={style.content}>
      {lowStockAlerts.length > 0 && (
        <Callout variant="warning" title={INVENTORY_TEXTS.lowStockTitle}>
          {lowStockAlerts
            .map((item) => `- ${INVENTORY_TEXTS.lowStockItem(item.nombre, item.stock, item.stock_minimo)}`)
            .join('\n\n')}
        </Callout>
      )}

      <div className={style.filtersRow}>
        <div className={style.filterField}>
          <Selector
            label={INVENTORY_TEXTS.filterProductLabel}
            options={productOptions}
            value={productId}
            onChange={(e) => { setPage(1); setProductId(e.target.value); }}
          />
        </div>
        <div className={style.filterField}>
          <Selector
            label={INVENTORY_TEXTS.filterTypeLabel}
            options={TYPE_OPTIONS}
            value={movementType}
            onChange={(e) => { setPage(1); setMovementType(e.target.value); }}
          />
        </div>
      </div>

      <div className={style.tableWrapper}>
        <TableA
          columns={columns}
          data={movements}
          loading={loading}
          error={error}
          onRetry={() => fetchMovements(page, pageSize)}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => setSelectedMovement(row)}
          emptyMessage={INVENTORY_TEXTS.emptyMessage}
        />
      </div>

      <DrawPanel
        isOpen={!!selectedMovement}
        onClose={() => setSelectedMovement(null)}
        title={INVENTORY_TEXTS.detailTitle}
        description={selectedMovement ? selectedMovement.producto_nombre : undefined}
        showActions={false}
      >
        {selectedMovement && (
          <div className={style.detailSection}>
            <div className={style.detailGrid}>
              <div className={style.detailItem}>
                <strong>{INVENTORY_TEXTS.columnStockBefore}</strong>
                <span>{selectedMovement.stock_anterior}</span>
              </div>
              <div className={style.detailItem}>
                <strong>{INVENTORY_TEXTS.columnStockAfter}</strong>
                <span>{selectedMovement.stock_nuevo}</span>
              </div>
              <div className={style.detailItem}>
                <strong>{INVENTORY_TEXTS.columnUser}</strong>
                <span>{selectedMovement.usuario_nombre || "—"}</span>
              </div>
              <div className={style.detailItem}>
                <strong>{INVENTORY_TEXTS.columnDate}</strong>
                <span><DateTag date={selectedMovement.fecha_movimiento} /></span>
              </div>
            </div>

            <Callout variant="neutral" title={INVENTORY_TEXTS.detailReason}>
              {selectedMovement.motivo || INVENTORY_TEXTS.noReason}
            </Callout>
          </div>
        )}
      </DrawPanel>
    </div>
  );
}
