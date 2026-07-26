import React, { useState, useRef, useCallback } from "react";
import { PlusCircle, Trash2, PackageSearch } from 'lucide-react';
import styles from './ProductCreate.module.css';

import {    
  adminCreateProduct,
  adminDeleteProduct
} from '../../../../services/api';

import GenericPanel from '../../../../components/GenericPanel/GenericPanel';
import TableB from '../../../../components/screens/components/TableB';
import AlertModal from '../../../../components/AlertModal/AlertModal';
import DrawPanel from '../../../../components/screens/components/DrawPanel';
import { getAlertPayload } from '../../../../utils/apiErrors';
import TextField from '../../../../components/screens/components/Material-UI/Components/TextField/Index';
import Selector from '../../../../components/screens/components/Material-UI/Components/Selector/Index';
import Filter from '../../../../components/screens/components/Filter/Index';
import useCategories from '../../../../hooks/requestCategories';
import { useProductListLogic } from '../../../../components/ProductList/utils';
import { useCurrency } from '../../../../hooks/moneyType';
import ModalTooltip from '../../../../components/ModalTooltip/ModalTooltip';
import { getIcon } from '../../../../assets/icons/ExportIcon/Index';

import Button from "../../../../components/screens/components/Button";

function ProductFormContent({ form, onChange, onSelectChange, categoryOptions, loadingCats }) {
  return (
    <div className={styles.formContent} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px 5px' }}>
      <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <TextField 
        label="Código" 
        name="codigo" 
        value={form.codigo} 
        onChange={onChange} 
        placeholder="Ej: PROD-001" 
        required
        />
        <TextField 
        label="Nombre" 
        name="nombre" 
        value={form.nombre} 
        onChange={onChange} 
        placeholder="Nombre del producto" 
        required
        />
      </div>

      <TextField 
      label="Descripción" 
      name="descripcion" 
      value={form.descripcion} 
      onChange={onChange} 
      placeholder="Breve descripción del producto..." 
      multiline 
      rows={2} 
      required
      />

      <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <Selector 
            label="Categoría"
            options={categoryOptions}
            value={form.categoria_id}
            onChange={(e) => onSelectChange(e.target.value)}
            required
            placeholder={loadingCats ? "Cargando..." : "Selecciona una categoría"}
          />
        <TextField 
        label="Tipo / Clase" 
        name="tipo" 
        value={form.tipo} 
        onChange={onChange} 
        placeholder="Ej: Insumo, Venta" 
        required
        />
      </div>

      <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <TextField label="Precio Compra" 
        name="precio" 
        type="number" 
        value={form.precio} 
        onChange={onChange} 
        placeholder="0.00" 
        required
        inputProps={{ step: "0.01" }} 
        />
        <TextField 
        label="Precio Venta" 
        name="precio_venta" 
        type="number" 
        value={form.precio_venta} 
        onChange={onChange} 
        placeholder="0.00" 
        required
        inputProps={{ step: "0.01" }} 
        />
      </div>

      <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
        <TextField 
        label="Stock Inicial" 
        name="stock" 
        type="number" 
        value={form.stock} 
        onChange={onChange} 
        placeholder="0" 
        required
        />
        <TextField 
        label="Stock Mínimo" 
        name="stock_minimo" 
        type="number" 
        value={form.stock_minimo} 
        onChange={onChange} 
        placeholder="Alerta en..." 
        required
        />
        <TextField 
        label="Unidad Medida" 
        name="unidad_medida" 
        value={form.unidad_medida} 
        onChange={onChange} 
        placeholder="Ej: Und, Kg" 
        required
        />
      </div>

      <TextField label="Proveedor" 
      name="proveedor" 
      value={form.proveedor} 
      onChange={onChange} 
      placeholder="Nombre del proveedor" 
      required
      />
    </div>
  );
}

export default function ProductCreate({ hideHeader }) {
  const { categories, categoryMap, loading: loadingCats } = useCategories();
  const editFormRef = useRef(null);

  const {
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    maxPrice, setMaxPrice,
    page, setPage,
    totalPages,
    loading,
    error,
    fetchProducts,
    filteredProducts,
    handleClearFilters
  } = useProductListLogic({
    categoryMap,
    editFormRef
  });
  
  const [showForm, setShowForm] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    codigo: '', nombre: '', descripcion: '', categoria_id: '',
    tipo: '', precio: '', precio_venta: '', stock: '',
    stock_minimo: '', unidad_medida: '', proveedor: ''
  });

  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (searchTerm && searchTerm.trim() !== '') count++;
    if (filterCategory && String(filterCategory).trim() !== '') count++;
    if (maxPrice && String(maxPrice).trim() !== '') count++;
    return count;
  }, [searchTerm, filterCategory, maxPrice]);

  const { currency, convertAmount, isLoading: currencyLoading } = useCurrency();
  const esUSD = currency?.toUpperCase() === 'USD';

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSelectChange = (val) => setForm({ ...form, categoria_id: val });

  const handleCreateSubmit = async () => {
    if (!form.codigo.trim() || !form.nombre.trim() || !form.categoria_id) {
      setAlertConfig({ title: 'Atención', message: 'Código, Nombre y Categoría son obligatorios.' });
      setAlertOpen(true);
      return;
    }

    try {
      const sanitized = {
        ...form,
        categoriaId: Number(form.categoria_id),
        precio: Number(form.precio) || 0,
        precioVenta: Number(form.precio_venta) || 0,
        stock: Number(form.stock) || 0,
        stockMinimo: Number(form.stock_minimo) || 0,
      };
      
      await adminCreateProduct(sanitized);
      const nombreCreado = form.nombre;

      setShowForm(false);
      setForm({ codigo: '', nombre: '', descripcion: '', categoria_id: '', tipo: '', precio: '', precio_venta: '', stock: '', stock_minimo: '', unidad_medida: '', proveedor: '' });
      
      fetchProducts();

      setAlertConfig({ 
        title: '¡Éxito!', 
        message: `El producto "${nombreCreado}" se ha registrado correctamente.` 
      });
      setAlertOpen(true);

    } catch (e) { 
      setAlertConfig({ 
        title: 'Error', 
        message: getAlertPayload(e) 
      });
      setAlertOpen(true);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const productId = productToDelete.id || productToDelete.producto_id || productToDelete.productId;
      if (!productId) {
        throw new Error("No se pudo identificar el ID del producto para eliminar.");
      }
      
      await adminDeleteProduct(productId);
      
      setDeleteConfirmOpen(false);
      setProductToDelete(null);

      fetchProducts();
      
      setAlertConfig({ 
        title: 'Producto Eliminado', 
        message: `El producto ha sido eliminado correctamente del inventario.` 
      });
      setAlertOpen(true);

    } catch (e) {
      setDeleteConfirmOpen(false);
      setAlertConfig({ 
        title: 'Error al Eliminar', 
        message: getAlertPayload(e) 
      });
      setAlertOpen(true);
    }
  };

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
                label: 'Eliminar',
                icon: getIcon('trash') || Trash2,
                onClick: (row) => handleDeleteClick(row),
                className: styles.deleteActionBtn || 'danger'
            }
        ]
    }
  ];

  const categoryOptionsFormatted = categories.map((cat) => {
    const val = typeof cat === 'string' ? cat : (cat.id ?? String(cat));
    const label = typeof cat === 'string' ? cat : (cat.name ?? val);
    return { value: val, label: label };
  });

  return (
    <GenericPanel
      title="Gestión y Creación de Productos"
      role="admin"
      menuTitle="Panel de Administración"
      showPagination={true}
      paginationCount={totalPages}
      paginationPage={page}
      onPaginationChange={(e, p) => setPage(p)}
    >
      <div className={styles.page}>
        <div className={styles.topActions} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <Button onClick={() => setShowForm(true)} 
              icon={PlusCircle}
              variant="primary" 
              color={Button.COLORS.PURPLE}
              title="Agregar Producto">
              Agregar Producto
            </Button> 
        </div>

        <div className={styles.content}>
          <Filter
              onClear={handleClearFilters}
              searchTerm={searchTerm}
              title="Filtros de Productos"
              activeFiltersCount={activeFiltersCount}
          >
              <TextField 
                  label="Nombre" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Buscar producto..."
              />
              
              <Selector
                  id="categoria-create-select"
                  label="Categoría"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  emptyOptionLabel="Todas las categorías"
                  options={categoryOptionsFormatted}
              />

              <TextField 
                  label="Precio máximo" 
                  type="number" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)} 
                  placeholder="Ej. 150.00"
              />
          </Filter>

          <div className={styles.tableWrapper}>
            <TableB 
                columns={columns}
                data={filteredProducts}
                loading={loading || currencyLoading}
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
        </div>

        <DrawPanel 
          isOpen={showForm} 
          title="Registro de Nuevo Producto"
          onClose={() => setShowForm(false)}
          onConfirm={handleCreateSubmit}
          confirmText="Registrar"
          cancelText="Cancelar"
          showActions={true}
          showCountdown={true}
          formData={form}
          requiredFields={['codigo', 'nombre', 'descripcion', 'categoria_id', 'tipo', 'precio', 'precio_venta', 'stock', 'stock_minimo', 'unidad_medida', 'proveedor']}
        >
          <ProductFormContent 
            form={form}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            categoryOptions={categoryOptionsFormatted}
            loadingCats={loadingCats}
          />
        </DrawPanel>

        <AlertModal 
          open={deleteConfirmOpen} 
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar permanentemente el producto "${productToDelete?.nombre || productToDelete?.name}"? Esta acción no se puede deshacer.`}
          onClose={() => { setDeleteConfirmOpen(false); setProductToDelete(null); }}
          onConfirm={confirmDelete}
          confirmText="Sí, Eliminar"
          cancelText="Cancelar"
        />

        <AlertModal 
          open={alertOpen} 
          title={alertConfig.title} 
          message={alertConfig.message} 
          onClose={() => setAlertOpen(false)} 
          confirmText="Entendido"
        />
      </div>
    </GenericPanel>
  );
}