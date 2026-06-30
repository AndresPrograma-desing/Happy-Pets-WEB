import { useState, useMemo, useEffect, useCallback } from 'react';
import { getProducts } from '../../services/api';
import { getAlertPayload } from '../../utils/apiErrors';

export const useProductListLogic = ({
    categoryMap,
    editFormRef
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const normalizeProduct = useCallback((p) => {
        const stock = p.stock ?? p.cantidad ?? ((p.existencia_inicial || 0) + (p.entradas || 0) - (p.salidas || 0));
        const price = Number(p.precio_venta ?? p.price ?? 0);
        const stockMin = p.stock_minimo ?? p.stockMin ?? p.min_stock ?? 0;

        let catId = '';
        const rawCat = p.categoria_id ?? p.categoriaId ?? p.categoryId ?? p.categoria ?? '';

        if (/^\d+$/.test(String(rawCat))) {
            catId = String(rawCat);
        } else if (rawCat) {
            const found = Object.entries(categoryMap).find(([, name]) =>
                name.toLowerCase() === String(rawCat).toLowerCase()
            );
            catId = found ? found[0] : '';
        }

        if (p.nombre === "Sin Producto") p.stock = 100;

        return {
            ...p,
            normalizedStock: stock,
            normalizedPrice: price,
            normalizedCatId: catId,
            displayName: p.nombre || p.name || 'Sin nombre',
            displayDesc: p.descripcion || p.description || '—'
        };
    }, [categoryMap]);

    const fetchProducts = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        
        setError(null);
        try {
            const res = await getProducts();
            
            // Resolve array
            let list = [];
            if (Array.isArray(res)) list = res;
            else if (res?.products) list = res.products;
            else if (res?.data) list = res.data;
            else if (res?.items) list = res.items;
            else if (typeof res === 'object') {
                 // Try to find first array recursively or simply look at values
                 for (const key in res) {
                     if (Array.isArray(res[key])) {
                         list = res[key];
                         break;
                     }
                 }
            }

            const normalizedList = list.map(p => normalizeProduct(p));
            setProducts(normalizedList);
            setLastUpdated(Date.now());
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(getAlertPayload(err));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [normalizeProduct]);

    // Initial fetch
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        setAlertTitle('Editar Detalles del Producto');
        setAlertOpen(true);
    };

    const handleConfirmModal = async () => {
        if (selectedProduct && editFormRef.current) {
            await editFormRef.current.submit();
        } else {
            setAlertOpen(false);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (searchTerm && !p.displayName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (filterCategory && String(p.normalizedCatId) !== String(filterCategory)) return false;
            if (maxPrice && p.normalizedPrice > Number(maxPrice)) return false;
            return true;
        });
    }, [products, searchTerm, filterCategory, maxPrice]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterCategory('');
        setMaxPrice('');
    };

    return {
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
    };
};