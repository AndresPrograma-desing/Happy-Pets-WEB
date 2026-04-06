import React, { useState, useEffect, useCallback, useRef } from "react";
import { getProducts } from '../../../services/api';
import styles from './Products.module.css';
import { useNavigate } from 'react-router-dom';
import ProductList from '../../../components/ProductList/ProductList'; // Nuevo componente
import SpinerLoader from '../../../components/SpinerLoader/SpinerLoader'; // Nuevo componente

// Función auxiliar para encontrar el array de datos
function findFirstArray(obj) {
    if (!obj) return null;
    if (Array.isArray(obj)) return obj;
    if (typeof obj !== 'object') return null;
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (Array.isArray(val)) return val;
        if (val && typeof val === 'object') {
            const found = findFirstArray(val);
            if (found) return found;
        }
    }
    return null;
}

export default function Products() {
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    
    const navigate = useNavigate();

    const mountedRef = useRef(true);

    const loadData = useCallback(async (isFirstLoad = false) => {
        if (!mountedRef.current) return;
        if (isFirstLoad) setLoading(true);
        else setIsRefreshing(true);

        try {
            const data = await getProducts();
            const items = Array.isArray(data)
                ? data
                : (data?.products || data?.items || data?.data || findFirstArray(data) || []);
            
            if (mountedRef.current) {
                setProducts(items.filter(Boolean));
                setLastUpdated(Date.now());
                setError(null);
            }
        } catch (err) {
            console.error('Error:', err);
            if (isFirstLoad && mountedRef.current) setError(err.message || 'Error al cargar productos');
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        loadData(true);
        return () => { mountedRef.current = false; };
    }, [loadData]);

    return (
        <div className={styles.page}>
            {/* --- CABECERA --- */}
            <div className={styles.headerRow}>
                <h1 className={styles.mainTitle}>INVENTARIO DE PRODUCTOS</h1>
                {lastUpdated && (
                    <div className={styles.lastUpdatedHeader}>
                        Sincronizado: {new Date(lastUpdated).toLocaleTimeString()}
                    </div>
                )}
                
                <button className={styles.backBtn} onClick={() => navigate('/AdminSystem')}>
                    Volver
                </button>
                <button className={styles.backBtn} style={{ marginLeft: 8 }} onClick={() => navigate('/AdminSystem/products/manage')}>
                    Administrar productos
                </button>
            </div>

            {/* --- ESTADOS DE CARGA Y CONTENIDO --- */}
            {loading ? (
                <div className={styles.centerContainer}>
                    <p className={styles.loading}>Cargando inventario...</p>
                </div>
            ) : error ? (
                <div className={styles.centerContainer}>
                    <p className={styles.error}>{error}</p>
                    <button onClick={() => loadData(true)} className={styles.retryBtn}>Reintentar</button>
                </div>
            ) : (
                <ProductList 
                    products={products} 
                    lastUpdated={lastUpdated} 
                    isRefreshing={isRefreshing} 
                />
            )}
        </div>
    );
}