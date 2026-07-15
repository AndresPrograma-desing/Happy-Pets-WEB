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
import DrawPanel from '../../../../components/screens/components/DrawPanel';
import { getAlertPayload } from '../../../../utils/apiErrors';
import TextField from '../../../../components/screens/components/Material-UI/Components/TextField/Index';
import Selector from '../../../../components/screens/components/Material-UI/Components/Selector/Index';
import useCategories from '../../../../hooks/requestCategories';

import Button from "../../../../components/screens/components/Button";

// --- CONTENIDO DEL FORMULARIO ---
function ProductFormContent({ form, onChange, onSelectChange, categoryOptions, loadingCats }) {
  return (
    <div className={styles.formContent} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px 5px' }}>
      <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <TextField label="Código" name="codigo" value={form.codigo} onChange={onChange} placeholder="Ej: PROD-001" />
        <TextField label="Nombre" name="nombre" value={form.nombre} onChange={onChange} placeholder="Nombre del producto" />
      </div>

      <TextField label="Descripción" name="descripcion" value={form.descripcion} onChange={onChange} placeholder="Breve descripción del producto..." multiline rows={2} />

      <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <Selector 
            label="Categoría"
            options={categoryOptions}
            value={form.categoria_id}
            onChange={(e) => onSelectChange(e.target.value)}
            placeholder={loadingCats ? "Cargando..." : "Selecciona una categoría"}
          />
        <TextField label="Tipo / Clase" name="tipo" value={form.tipo} onChange={onChange} placeholder="Ej: Insumo, Venta" />
      </div>

      <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <TextField label="Precio Compra" name="precio" type="number" value={form.precio} onChange={onChange} placeholder="0.00" inputProps={{ step: "0.01" }} />
        <TextField label="Precio Venta" name="precio_venta" type="number" value={form.precio_venta} onChange={onChange} placeholder="0.00" inputProps={{ step: "0.01" }} />
      </div>

      <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
        <TextField label="Stock Inicial" name="stock" type="number" value={form.stock} onChange={onChange} placeholder="0" />
        <TextField label="Stock Mínimo" name="stock_minimo" type="number" value={form.stock_minimo} onChange={onChange} placeholder="Alerta en..." />
        <TextField label="Unidad Medida" name="unidad_medida" value={form.unidad_medida} onChange={onChange} placeholder="Ej: Und, Kg" />
      </div>

      <TextField label="Proveedor" name="proveedor" value={form.proveedor} onChange={onChange} placeholder="Nombre del proveedor" />
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
        <Button onClick={() => handleDeleteClick(row)} 
        icon={Trash2}
        variant="danger"  
        title="Eliminar Producto">
          Eliminar
        </Button>
      )
    }
  ];

  return (
    <div className={styles.page}>
      
      <div className={styles.topActions}>
          <Button onClick={() => setShowForm(true)} 
            icon={PlusCircle}
            variant="primary" 
            color={Button.COLORS.PURPLE}
            title="Agregar Producto">
            Agregar Producto
          </Button> 
      </div>

      <div className={styles.tableWrapper}>
        <TableA 
          columns={columns}
          data={items}
          loading={loading}
          keyExtractor={(row) => row.id || row.codigo || row.nombre}
        />
      </div>

      {/* PANEL DEL FORMULARIO */}
      <DrawPanel 
        isOpen={showForm} 
        title="Registro de Nuevo Producto"
        onClose={() => setShowForm(false)}
        onConfirm={handleCreateSubmit}
        confirmText="Registrar"
        cancelText="Cancelar"
        showActions={true}
        width="600px"
      >
        <ProductFormContent 
          form={form}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          categoryOptions={categories.map((cat) => {
              const val = typeof cat === 'string' ? cat : (cat.id ?? String(cat));
              const label = typeof cat === 'string' ? cat : (cat.name ?? val);
              return { value: val, label: label };
          })}
          loadingCats={loadingCats}
        />
      </DrawPanel>

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