import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from './ProductCreate.module.css';

import {    
  getProducts,
  adminCreateProduct
} from '../../../../services/api';

// 1. IMPORTACIÓN DEL COMPONENTE DE LISTA
import ProductList from '../../../../components/ProductList/ProductList'; 
import DeleteProducto from '../Deleteproducto/DeleteProducto';
import HistoryTable from '../../../../components/HystoryTable/HistoryTable';
import AlertModal from '../../../../components/AlertModal/AlertModal';
import { getAlertPayload } from '../../../../utils/apiErrors';

// --- COMPONENTE INTERNO: ProductForm (CAMPOS COMPLETOS) ---
function ProductForm({ onCancel, onSubmit }) {
  const [form, setForm] = useState({
    codigo: '', 
    nombre: '', 
    descripcion: '', 
    categoria_id: '',
    tipo: '', 
    precio: '', 
    precio_venta: '', 
    stock: '',
    stock_minimo: '',
    unidad_medida: '', 
    proveedor: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleValidateAndSubmit = () => {
    if (!form.codigo.trim() || !form.nombre.trim()) {
      return setError('Código y Nombre son obligatorios');
    }
    if (!form.categoria_id) return setError('La Categoría es obligatoria');
    onSubmit(form);
  };

  return (
    <div className={styles.modalOverlay} onMouseDown={onCancel}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>📦 Registro Detallado de Producto</h3>
          <button className={styles.closeX} onClick={onCancel}>&times;</button>
        </div>
        
        <div className={styles.formContent}>
          {/* Fila 1 */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Código</label>
              <input name="codigo" value={form.codigo} onChange={handleChange} placeholder="Ej: PROD01" />
            </div>
            <div className={styles.formGroup}>
              <label>Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del producto" />
            </div>
          </div>

          {/* Fila 2 - Descripción Completa */}
          <div className={styles.formGroupFull}>
            <label>Descripción</label>
            <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Detalles adicionales..." />
          </div>

          {/* Fila 3 */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Categoría (ID)</label>
              <input name="categoria_id" type="number" value={form.categoria_id} onChange={handleChange} placeholder="Ej: 1" />
            </div>
            <div className={styles.formGroup}>
              <label>Tipo / Clase</label>
              <input name="tipo" value={form.tipo} onChange={handleChange} placeholder="Ej: Joya, Insumo..." />
            </div>
          </div>

          {/* Fila 4 */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Precio Compra</label>
              <input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="0.00" />
            </div>
            <div className={styles.formGroup}>
              <label>Precio Venta</label>
              <input name="precio_venta" type="number" value={form.precio_venta} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>

          {/* Fila 5 */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Stock Inicial</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
            </div>
            <div className={styles.formGroup}>
              <label>Stock Mínimo</label>
              <input name="stock_minimo" type="number" value={form.stock_minimo} onChange={handleChange} placeholder="0" />
            </div>
            <div className={styles.formGroup}>
              <label>Unidad de Medida</label>
              <input name="unidad_medida" value={form.unidad_medida} onChange={handleChange} placeholder="Ej: Und, Gramos, Par" />
            </div>
          </div>

          {/* Fila 6 */}
          <div className={styles.formGroupFull}>
            <label>Proveedor</label>
            <input name="proveedor" value={form.proveedor} onChange={handleChange} placeholder="Nombre del proveedor" />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onCancel}>Cancelar</button>
          <button className={styles.primary} onClick={handleValidateAndSubmit}>Registrar Producto</button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function ProductCreate() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyDeleted, setHistoryDeleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [showForm, setShowForm] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      setError(null);
      const data = await getProducts();
      console.log('getProducts response:', data);
      // Normalizar respuestas que pueden venir en distintos idiomas/propiedades
      const list = Array.isArray(data)
        ? data
        : (data?.products || data?.productos || data?.items || data?.data || []);
      console.log('normalized list:', list);
      setItems(list.filter(Boolean));
      setLastUpdated(Date.now());

    } catch (e) {
      console.error("Error al cargar:", e);
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDeleted = (product) => {
    if (!product) {
      loadData();
      return;
    }
    const newEntry = {
      ...product,
      id: `del-${Date.now()}`,
      fecha_registro: new Date().toLocaleTimeString(),
      deleted: true,
    };
    setHistoryDeleted(prev => [newEntry, ...prev].slice(0, 8));
    // refrescar lista
    loadData();
  };

  const handleCreate = async (payload) => {
    try {
      // El backend de creación espera nombres en camelCase.
      const sanitized = {
        codigo: payload.codigo,
        nombre: payload.nombre,
        descripcion: payload.descripcion,
        categoriaId: Number(payload.categoria_id) || 1,
        tipo: payload.tipo,
        precio: Number(payload.precio) || 0,
        precioVenta: Number(payload.precio_venta) || 0,
        stock: Number(payload.stock) || 0,
        stockMinimo: Number(payload.stock_minimo) || 0,
        unidadMedida: payload.unidad_medida,
        proveedor: payload.proveedor,
      };

      await adminCreateProduct(sanitized);

      const newEntry = {
        ...sanitized,
        id: Date.now(),
        fecha_registro: new Date().toLocaleTimeString()
      };
      
      setHistory(prev => [newEntry, ...prev].slice(0, 8));
      setShowForm(false);
      await loadData(); 

    } catch (e) {
        console.error("Error al crear producto:", e);
      // Mostrar el error devuelto por el backend en el AlertModal (formateado)
      setAlertMessage(getAlertPayload(e));
      setAlertOpen(true);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Administrar Producos</h2>
        <div className={styles.headerActions}>
          <button className={styles.primary} onClick={() => setShowForm(true)}>
            + Agregar Producto
          </button>
          <DeleteProducto onDeleted={handleDeleted} />
          <button className={styles.secondary} onClick={() => navigate('/AdminSystem')}>
             Volver
          </button>
        </div>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}

      {/* --- SECCIÓN HISTORIAL (Estilo Excel) --- */}
         <div style={{ display: 'flex', gap: '20px', width: '100%', alignItems: 'flex-start' }}>
            <HistoryTable title="Historial de Cargas Recientes" data={history} stylesModule={styles} />
            <HistoryTable title="Eliminados Recientemente" data={historyDeleted} stylesModule={styles} />
          </div>

      <hr className={styles.separator} />

      {/* --- RENDERIZADO DEL PRODUCT LIST (TABLA GENERAL) --- */}
      {loading ? (
        <div className={styles.loading}>Cargando inventario...</div>
      ) : (
        <ProductList 
          products={items} 
          lastUpdated={lastUpdated} 
          isRefreshing={isRefreshing} 
        />
      )}

      {/* --- MODAL DEL FORMULARIO --- */}
      {showForm && (
        <ProductForm 
          onCancel={() => setShowForm(false)} 
          onSubmit={handleCreate} 
        />
      )}

      <AlertModal
        open={alertOpen}
        title="Error al crear producto"
        message={alertMessage || 'Error al crear el producto.'}
        confirmText="Cerrar"
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}