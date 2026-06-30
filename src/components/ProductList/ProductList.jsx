import React, { useCallback, useRef } from 'react';
import { PackageSearch } from 'lucide-react';
import styles from './ProductList.module.css';
import ProductFilters from '../filter/ProductFilter/ProductFilters';
import usePolling from '../../hooks/UsePolling';
import useCategories from '../../hooks/requestCategories';
import AlertModal from '../AlertModal/AlertModal';
import { getAlertPayload } from '../../utils/apiErrors';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import EditProducts from '../../pages/AdminSystem/products/Created/EditProducts/EditProducts';
import ModalTooltip from '../ModalTooltip/ModalTooltip';
import { useCurrency } from '../../hooks/moneyType';
import { useProductListLogic } from './utils';
import TableB from '../screens/components/TableB';

const pollingInterval = 20000;

export default function ProductList() {
    const { categories, categoryMap } = useCategories(pollingInterval);
    const editFormRef = useRef(null);

    const {
        searchTerm, setSearchTerm,
        filterCategory, setFilterCategory,
        maxPrice, setMaxPrice,
        loading, error, refreshing, lastUpdated,
        selectedProduct, setSelectedProduct,
        alertOpen, setAlertOpen,
        alertMessage, setAlertMessage,
        alertTitle, setAlertTitle,
        fetchProducts,
        handleEditClick,
        handleConfirmModal,
        filteredProducts,
        handleClearFilters
    } = useProductListLogic({
        categoryMap,
        editFormRef
    });

    const { currency, convertAmount, isLoading: currencyLoading } = useCurrency();
    const esUSD = currency?.toUpperCase() === 'USD';

    usePolling(() => {
        fetchProducts(true);
    }, pollingInterval);

    const formatCurrency = useCallback((v) => {
        const n = Number(v || 0);
        try {
            return new Intl.NumberFormat(esUSD ? 'en-US' : 'es-VE', {
                style: 'currency',
                currency: currency || 'VES',
                maximumFractionDigits: 2
            }).format(n);
        } catch (err) {
            console.error('Error en formato de moneda:', err);
            return (esUSD ? '$ ' : 'Bs. ') + n.toLocaleString();
        }
    }, [currency, esUSD]);

    if (currencyLoading) {
        return (
            <div className={styles.center}>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando productos...</div>
                <p style={{ color: '#fff', marginTop: '10px' }}>Cargando tipos de cambio...</p>
            </div>
        );
    }

    const columns = [
        {
            label: 'NOMBRE',
            key: 'displayName',
            width: '25%'
        },
        {
            label: 'DESCRIPCIÓN',
            key: 'displayDesc',
            width: '30%'
        },
        {
            label: 'PRECIO',
            key: 'price',
            width: '15%',
            render: (row) => {
                const montoBase = row.normalizedPrice;
                const montoConvertido = convertAmount(montoBase, esUSD ? 'VES' : 'USD');
                const fmtPrice = formatCurrency(montoBase);
                const textoTooltip = esUSD
                    ? `Equivalente: ${montoConvertido.toFixed(2)} Bs`
                    : `Equivalente: $${montoConvertido.toFixed(2)} USD`;
                return (
                    <ModalTooltip text={textoTooltip}>
                        <span className={styles.priceText}>{fmtPrice}</span>
                    </ModalTooltip>
                );
            }
        },
        {
            label: 'STOCK',
            key: 'stock',
            width: '15%',
            type: 'badge',
            badgeClass: (row) => {
                const stockMin = row.stock_minimo ?? row.stockMin ?? row.min_stock ?? 0;
                return row.normalizedStock < stockMin ? styles.lowStockBadge : styles.normalStockBadge;
            },
            render: (row) => {
                const stockMin = row.stock_minimo ?? row.stockMin ?? row.min_stock ?? 0;
                const isLowStock = row.normalizedStock < stockMin;
                return (
                    <div className={styles.stockStatus}>
                        {row.normalizedStock}
                        {isLowStock && (
                            <ModalTooltip text={`Stock bajo. Mínimo: ${stockMin}`} position="top">
                                <img src={getIcon('warning')} alt="Alerta" className={styles.warningIcon} style={{ width: '16px', marginLeft: '6px' }} />
                            </ModalTooltip>
                        )}
                    </div>
                );
            }
        },
        {
            label: 'ACCIONES',
            key: 'actions',
            type: 'actions',
            align: 'center',
            width: '15%',
            actions: [
                {
                    label: 'Editar',
                    icon: getIcon('pencil') || undefined,
                    onClick: (row) => handleEditClick(row),
                    className: styles.editActionBtn
                }
            ]
        }
    ];

    return (
        <div className={styles.content}>
            <ProductFilters
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                filterCategory={filterCategory} setFilterCategory={setFilterCategory}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                categories={categories}
                onClear={handleClearFilters}
            />

            <div className={styles.tableWrapper}>
                <TableB 
                    columns={columns}
                    data={filteredProducts}
                    loading={loading}
                    error={error}
                    onRetry={() => fetchProducts(false)}
                    emptyIcon={PackageSearch}
                    emptyMessage="No se encontraron productos en el inventario."
                    rowKey={(row) => row.id || row.nombre}
                    rowClassName={(row) => {
                        const stockMin = row.stock_minimo ?? row.stockMin ?? row.min_stock ?? 0;
                        return row.normalizedStock < stockMin ? styles.lowStockRow : '';
                    }}
                />
            </div>

            <div className={styles.footer}>
                <span className={styles.iconText}>
                    <img src={getIcon('fileCheck')} alt="Sinc" />
                    Última sincronización: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
                {refreshing && (
                    <>
                        <span className={styles.separator}></span>
                        <span className={styles.iconText} style={{ color: '#0ea5a4' }}>
                            <img src={getIcon('listRestart')} alt="Actualizando" className={styles.spin} />
                            Actualizando...
                        </span>
                    </>
                )}
            </div>

            <AlertModal
                open={alertOpen}
                title={alertTitle}
                confirmText={selectedProduct ? "Actualizar" : "Entendido"}
                cancelText={selectedProduct ? "Cancelar" : null}
                onClose={() => { setAlertOpen(false); setSelectedProduct(null); }}
                onConfirm={handleConfirmModal}
            >
                {selectedProduct ? (
                    <EditProducts
                        ref={editFormRef}
                        productData={selectedProduct}
                        onUpdateSuccess={() => {
                            setAlertOpen(false);
                            setSelectedProduct(null);
                            fetchProducts();
                        }}
                        onError={(err) => setAlertMessage(getAlertPayload(err))}
                    />
                ) : (
                    <p>{alertMessage}</p>
                )}
            </AlertModal>
        </div>
    );
}