import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Tag, Factory, DollarSign, Box, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updateProducts } from '../../../../../services/api';
import style from './EditProducts.module.css';

const ProductEditForm = forwardRef(({ productData, onUpdateSuccess, onError }, ref) => {
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoriaId: 0,
        tipo: '',
        precio: 0,
        precioVenta: 0,
        stock: 0,
        stockMinimo: 10,
        proveedor: ''
    });

    // Estado para mostrar mensajes de éxito o error al usuario
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (productData) {
            setFormData({
                codigo: productData.codigo || '',
                nombre: productData.nombre || '',
                descripcion: productData.descripcion || '',
                categoriaId: Number(productData.categoriaId || productData.categoria_id) || 0,
                tipo: productData.tipo || '',
                precio: Number(productData.precio) || 0,
                precioVenta: Number(productData.precioVenta || productData.precio_venta) || 0,
                stock: Number(productData.stock) || 0,
                stockMinimo: Number(productData.stockMinimo || productData.stock_minimo) || 10,
                proveedor: productData.proveedor || ''
            });
        }
    }, [productData]);

    useImperativeHandle(ref, () => ({
        submit: async () => {
            setStatus({ type: '', message: '' }); // Limpiar mensajes previos
            try {
                // Mapeo exacto a los JsonPropertyName de tu C#
                const payload = {
                    codigo: formData.codigo || null,
                    nombre: formData.nombre || null,
                    descripcion: formData.descripcion || null,
                    categoria_id: parseInt(formData.categoriaId) || 0,
                    tipo: formData.tipo || null,
                    precio: parseFloat(formData.precio) || 0,
                    precio_venta: parseFloat(formData.precioVenta) || 0,
                    stock: parseInt(formData.stock) || 0,
                    stock_minimo: parseInt(formData.stockMinimo) || 0,
                    proveedor: formData.proveedor || null
                };
                
                const response = await updateProducts(productData.id, payload);
                
                setStatus({ type: 'success', message: response?.message });
                
                if (onUpdateSuccess) {
                    // Esperar un momento para que el usuario vea el éxito antes de cerrar
                    setTimeout(() => onUpdateSuccess(response), 1500);
                }
            } catch (err) {
                // Extraer el mensaje de error del API si existe
                const errorMessage = err.response?.data?.message || err.message || 'Error al conectar con el servidor';
                setStatus({ type: 'error', message: errorMessage });
                
                if (onError) onError(err);
                throw err;
            }
        }
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <form className={style.productFormInline}>
            {/* Banner de Feedback */}
            {status.message && (
                <div className={`${style.statusBanner} ${style[status.type]}`}>
                    {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span>{status.message}</span>
                </div>
            )}

            <div className={style.scrollableArea}>
                <div className={style.gridInputs}>
                    <div className={style.inputGroup}>
                        <label><Tag size={14} /> Código</label>
                        <input name="codigo" value={formData.codigo} onChange={handleChange} />
                    </div>
                    <div className={style.inputGroup}>
                        <label>Nombre del Producto</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} required />
                    </div>
                    <div className={style.inputGroupFull}>
                        <label>Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="2" />
                    </div>
                    <div className={style.inputGroup}>
                        <label>Tipo / Categoría</label>
                        <input name="tipo" value={formData.tipo} onChange={handleChange} />
                    </div>
                    <div className={style.inputGroup}>
                        <label><Factory size={14} /> Proveedor</label>
                        <input name="proveedor" value={formData.proveedor} onChange={handleChange} />
                    </div>
                    <div className={style.inputGroup}>
                        <label><DollarSign size={14} /> Precio Compra</label>
                        <input type="number" name="precio" value={formData.precio} onChange={handleChange} step="0.01" />
                    </div>
                    <div className={style.inputGroup}>
                        <label><DollarSign size={14} /> Precio Venta</label>
                        <input type="number" name="precioVenta" value={formData.precioVenta} onChange={handleChange} step="0.01" />
                    </div>
                    <div className={style.inputGroup}>
                        <label><Box size={14} /> Stock</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} />
                    </div>
                    <div className={style.inputGroup}>
                        <label>Stock Mínimo</label>
                        <input type="number" name="stockMinimo" value={formData.stockMinimo} onChange={handleChange} />
                    </div>
                </div>
            </div>
        </form>
    );
});

export default ProductEditForm;