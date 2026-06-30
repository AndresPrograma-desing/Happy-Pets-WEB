import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2 } from 'lucide-react';
import styles from './ProductCreate.module.css';

import {    
  getProducts,
  adminCreateProduct,
  adminDeleteProduct
} from '../../../../services/api';

import TableA from '../../../../components/screens/components/TableA';
import AlertModal from '../../../../components/AlertModal/AlertModal';
import { getAlertPayload } from '../../../../utils/apiErrors';
import CustomSelect from '../../../../components/UI/DesplegableSelector/CustomSelect'; 
import useCategories from '../../../../hooks/requestCategories'; 

// --- CONTENIDO DEL FORMULARIO ---
function ProductFormContent({ form, onChange, onSelectChange, categories, loadingCats }) {
  return (
    <div className={styles.formContent}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Código</label>
          <input name="codigo" value={form.codigo} onChange={onChange} placeholder="Ej: PROD-001" />
        </div>
        <div className={styles.formGroup}>
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Nombre del producto" />
        </div>
      </div>

      <div className={styles.formGroupFull}>
        <label>Descripción</label>
        <input name="descripcion" value={form.descripcion} onChange={onChange} placeholder="Breve descripción del producto..." />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <CustomSelect 
            label="Categoría"
            options={categories}
            value={form.categoria_id}
            onChange={onSelectChange}
            placeholder={loadingCats ? "Cargando..." : "Selecciona una categoría"}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Tipo / Clase</label>
          <input name="tipo" value={form.tipo} onChange={onChange} placeholder="Ej: Insumo, Venta" />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Precio Compra</label>
          <input name="precio" type="number" value={form.precio} onChange={onChange} placeholder="0.00" />
        </div>
        <div className={styles.formGroup}>
          <label>Precio Venta</label>
          <input name="precio_venta" type="number" value={form.precio_venta} onChange={onChange} placeholder="0.00" />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Stock Inicial</label>
          <input name="stock" type="number" value={form.stock} onChange={onChange} placeholder="0" />
        </div>
        <div className={styles.formGroup}>
          <label>Stock Mínimo</label>
          <input name="stock_minimo" type="number" value={form.stock_minimo} onChange={onChange} placeholder="Alerta en..." />
        </div>
        <div className={styles.formGroup}>
          <label>Unidad Medida</label>
          <input name="unidad_medida" value={form.unidad_medida} onChange={onChange} placeholder="Ej: Und, Kg" />
        </div>
      </div>

      <div className={styles.formGroupFull}>
        <label>Proveedor</label>
        <input name="proveedor" value={form.proveedor} onChange={onChange} placeholder="Nombre del proveedor" />
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function ProductCreate({ hideHeader }) {
  const { categories, loading: loadingCats } = useCategories();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showForm, setShowForm] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  // Delete State
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    codigo: '', nombre: '', descripcion: '', categoria_id: '',
    tipo: '', precio: '', precio_venta: '', stock: '',
    stock_minimo: '', unidad_medida: '', proveedor: ''
  });

  const loadData = async () => {
    try {
      const data = await getProducts();
      const list = Array.isArray(data) ? data : (data?.products || data?.items || []);
      setItems(list.filter(Boolean));
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

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
      loadData();

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

  // ----- DELETE LOGIC -----
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      // Find the correct ID field
      const productId = productToDelete.id || productToDelete.producto_id || productToDelete.productId;
      if (!productId) {
        throw new Error("No se pudo identificar el ID del producto para eliminar.");
      }
      
      await adminDeleteProduct(productId);
      
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      loadData();
      
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
      header: 'NOMBRE',
      render: (row) => row.nombre || row.name || 'Sin nombre',
      align: 'left'
    },
    {
      header: 'DESCRIPCIÓN',
      render: (row) => row.descripcion || row.description || '—',
      align: 'left'
    },
    {
      header: 'PRECIO',
      render: (row) => {
          const p = Number(row.precio || row.price || 0);
          return `$${p.toFixed(2)}`;
      },
      align: 'left'
    },
    {
      header: 'STOCK',
      render: (row) => {
        const currentStock = Number(row.stock || row.stockActual || 0);
        const minStock = Number(row.stock_minimo || row.minStock || 0);
        return (
          <span style={{ fontWeight: currentStock < minStock ? 'bold' : 'normal', color: currentStock < minStock ? '#ef4444' : 'inherit' }}>
            {currentStock}
          </span>
        );
      },
      align: 'center'
    },
    {
      header: 'ACCIONES',
      align: 'center',
      render: (row) => (
        <button className={styles.deleteBtn} onClick={() => handleDeleteClick(row)} title="Eliminar Producto">
          <Trash2 size={16} />
          Eliminar
        </button>
      )
    }
  ];

  return (
    <div className={styles.page}>
      
      <div className={styles.topActions}>
          <button className={styles.primary} onClick={() => setShowForm(true)}>
            <PlusCircle size={18} />
            Agregar Producto
          </button>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Cargando inventario para administración...</div>
        ) : (
            <TableA 
              columns={columns}
              data={items}
              keyExtractor={(row) => row.id || row.codigo || row.nombre}
            />
        )}
      </div>

      {/* MODAL DEL FORMULARIO */}
      <AlertModal 
        open={showForm} 
        title="Registro de Nuevo Producto"
        onClose={() => setShowForm(false)}
        onConfirm={handleCreateSubmit}
        confirmText="Registrar"
        cancelText="Cancelar"
      >
        <ProductFormContent 
          form={form}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          categories={categories}
          loadingCats={loadingCats}
        />
      </AlertModal>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <AlertModal 
        open={deleteConfirmOpen} 
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar permanentemente el producto "${productToDelete?.nombre || productToDelete?.name}"? Esta acción no se puede deshacer.`}
        onClose={() => { setDeleteConfirmOpen(false); setProductToDelete(null); }}
        onConfirm={confirmDelete}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
      />

      {/* MODAL DE NOTIFICACIÓN DE ÉXITO O ERROR */}
      <AlertModal 
        open={alertOpen} 
        title={alertConfig.title} 
        message={alertConfig.message} 
        onClose={() => setAlertOpen(false)} 
        confirmText="Entendido"
      />
    </div>
  );
}