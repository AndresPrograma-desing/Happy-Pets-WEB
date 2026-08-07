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
    
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Estado dinámico de tamaño de página
    const [totalPages, setTotalPages] = useState(1);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    // Cambiar el tamaño de página y regresar siempre a la primera página
    const handlePageSizeChange = useCallback((newSize) => {
        setPageSize(newSize);
        setPage(1);
    }, []);

    const normalizeProduct = useCallback((p) => {
        const stock = p.stock ?? p.cantidad ?? ((p.existencia_inicial || 0) + (p.entradas || 0) - (p.salidas || 0));
        const price = Number(p.precioVenta ?? p.precio_venta ?? p.price ?? 0);
        const stockMin = p.stockMinimo ?? p.stock_minimo ?? p.stockMin ?? p.min_stock ?? 0;

        let catId = '';
        const rawCat = p.categoriaId ?? p.categoria_id ?? p.categoryId ?? p.categoria ?? '';

        if (/^\d+$/.test(String(rawCat))) {
            catId = String(rawCat);
        } else if (rawCat) {
            const found = Object.entries(categoryMap || {}).find(([, name]) =>
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
            const res = await getProducts({
                categoriaId: filterCategory || undefined,
                searchTerm: searchTerm || undefined,
                maxPrice: maxPrice || undefined,
                pageNumber: page,
                pageSize: pageSize
            });
            
            let list = [];
            if (Array.isArray(res)) list = res;
            else if (res?.products) list = res.products;
            else if (res?.data) list = res.data;
            else if (res?.items) list = res.items;
            else if (typeof res === 'object') {
                 for (const key in res) {
                     if (Array.isArray(res[key])) {
                         list = res[key];
                         break;
                     }
                 }
            }

            if (res?.totalPages) {
                setTotalPages(res.totalPages);
            } else {
                setTotalPages(list.length < pageSize && page === 1 ? 1 : page + (list.length === pageSize ? 1 : 0));
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
    }, [filterCategory, searchTerm, maxPrice, page, pageSize, normalizeProduct]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Reiniciar a la página 1 al cambiar cualquier filtro de búsqueda
    useEffect(() => {
        setPage(1);
    }, [filterCategory, searchTerm, maxPrice]);

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
        return products;
    }, [products]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterCategory('');
        setMaxPrice('');
        setPage(1);
    };

    return {
        searchTerm, setSearchTerm,
        filterCategory, setFilterCategory,
        maxPrice, setMaxPrice,
        page, setPage,
        pageSize, setPageSize,
        handlePageSizeChange,
        totalPages,
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