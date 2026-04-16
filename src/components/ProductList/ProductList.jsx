import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styles from './ProductList.module.css';
import ProductFilters from '../filter/ProductFilter/ProductFilters';
import usePolling from '../../hooks/UsePolling';
import { getProducts } from '../../services/api';
import AlertModal from '../AlertModal/AlertModal';
import { getAlertPayload } from '../../utils/apiErrors';
import { getIcon } from '../../assets/icons/ExportIcon/Index';


const CATEGORY_NAMES = {
    '1': 'Medicamentos', '2': 'Vacunas', '3': 'Alimentos',
    '4': 'Accesorios', '5': 'Servicios', '6': 'Laboratory'
};

export default function ProductList({ products: initialProducts, lastUpdated }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [localProducts, setLocalProducts] = useState(initialProducts || []);
    const [localRefreshing, setLocalRefreshing] = useState(false);
    const [localLastUpdated, setLocalLastUpdated] = useState(lastUpdated ?? Date.now());
    const localNextUpdate = useMemo(() => { 
        const next = new Date(localLastUpdated);
        next.setSeconds(next.getSeconds() + 20);
        return next;
    }, [localLastUpdated]);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertOnConfirm, setAlertOnConfirm] = useState(null);

    // --- NORMALIZADOR DE PRODUCTO ---
    // Centralizamos la lógica de campos opcionales aquí
    const normalizeProduct = useCallback((p) => {
        const stock = p.stock ?? p.cantidad ?? ((p.existencia_inicial || 0) + (p.entradas || 0) - (p.salidas || 0));
        const price = Number(p.precio ?? p.price ?? 0);
        
        // Determinar ID de categoría de forma robusta
        let catId = '';
        const rawCat = p.categoria_id ?? p.categoriaId ?? p.categoryId ?? p.categoria ?? '';
        if (/^\d+$/.test(String(rawCat))) {
            catId = String(rawCat);
        } else if (rawCat) {
            const found = Object.entries(CATEGORY_NAMES).find(([, name]) =>
                name.toLowerCase() === String(rawCat).toLowerCase()
            );
            catId = found ? found[0] : '';
        }
if(p.nombre == "Sin Producto"){
    p.stock =100;
}
        return {
            ...p,
            normalizedStock: stock,
            normalizedPrice: price,
            normalizedCatId: catId,
            displayName: p.nombre || p.name || 'Sin nombre',
            displayDesc: p.descripcion || p.description || '—'
        };
    }, []);

    // --- FETCH CON NORMALIZACIÓN ---
    const fetchProducts = useCallback(async () => {
        setLocalRefreshing(true);
        try {
            const res = await getProducts();
            const list = Array.isArray(res) ? res : (res?.data ?? []);
            
            // Normalizamos antes de guardar en el estado
            const normalizedList = list.map(p => normalizeProduct(p));
            
            setLocalProducts(normalizedList);
            setLocalLastUpdated(Date.now());
        } catch (err) {
            console.error('❌ Error polling:', err);
            try {
                setAlertMessage(getAlertPayload(err));
            } catch {
                setAlertMessage(String(err?.message || err));
            }
            setAlertTitle('Error al cargar productos');
            setAlertOnConfirm(() => fetchProducts);
            setAlertOpen(true);
        } finally {
            setLocalRefreshing(false);
        }
    }, [normalizeProduct]);

    usePolling(fetchProducts, 20000);

    // Sincronización inicial/padre
    useEffect(() => {
        if (initialProducts?.length > 0) {
            setLocalProducts(initialProducts.map(p => normalizeProduct(p)));
        }
    }, [initialProducts, normalizeProduct]);

    // --- FILTRADO ---
    const filteredProducts = useMemo(() => {
        return localProducts.filter(p => {
            if (searchTerm && !p.displayName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (filterCategory && p.normalizedCatId !== filterCategory) return false;
            if (maxPrice && p.normalizedPrice > Number(maxPrice)) return false;
            return true;
        });
    }, [localProducts, searchTerm, filterCategory, maxPrice]);

    return (
        <div className={styles.content}>
            <ProductFilters
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                filterCategory={filterCategory} setFilterCategory={setFilterCategory}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                categories={useMemo(() => Object.keys(CATEGORY_NAMES).map(id => ({ id, name: CATEGORY_NAMES[id] })), [])}
                onClear={() => { setSearchTerm(''); setFilterCategory(''); setMaxPrice(''); }}
            />

            <div className={styles.tableWrapper}>
                <table className={styles.inventoryTable}>
                    <thead>
                        <tr>
                            <th>NOMBRE</th>
                            <th>DESCRIPCIÓN</th>
                            <th>PRECIO</th>
                            <th>STOCK ACTUAL</th>
                            <th>STOCK MÍNIMO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((p) => {
                            const isLowStock = p.normalizedStock < 5;
                            const fmtPrice = new Intl.NumberFormat('en-US', { 
                                style: 'currency', currency: 'USD' 
                            }).format(p.normalizedPrice);

                            return (
                                <tr key={p.id} className={isLowStock ? styles.lowStockRow : ''}>
                                    <td className={styles.nameCell}>{p.displayName}</td>
                                    <td className={styles.descriptionCell}>{p.displayDesc}</td>
                                    <td className={styles.priceCell}>{fmtPrice}</td>
                                    <td className={styles.stockCell}>
                                        {p.normalizedStock} 
                                        {isLowStock && <span className={styles.lowStockWarning}>
                                            <img src={getIcon('alert')} alt="Alerta de bajo stock" />
                                             Bajo</span>}
                                    </td>
                                    <td className={styles.minStockCell}>{p.stock_minimo ?? '—'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
              <span className={styles.iconText}><img src={getIcon('fileCheck')} alt="File Check" /> Última sincronización: {new Date(localLastUpdated).toLocaleTimeString()}</span>
                <br />
              <span className={styles.iconText}><img src={getIcon('fileClock')} alt="File Clock" /> Próxima incronización: {new Date(localNextUpdate).toLocaleTimeString()}</span>
            </div>

            {localRefreshing && <div className={styles.floatingRefresh}>
                <span className={styles.refreshIcon}><img src={getIcon('listRestart')} alt="Refreshing" /></span>
                Actualizando...</div>}

            <AlertModal
                open={alertOpen}
                title={alertTitle || "Error"}
                message={alertMessage}
                onClose={() => setAlertOpen(false)}
                onConfirm={alertOnConfirm ? () => { alertOnConfirm(); setAlertOpen(false); } : undefined}
            />
        </div>
    );
}