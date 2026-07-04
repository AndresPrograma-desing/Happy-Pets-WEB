import { useState, useEffect, useCallback, useMemo } from 'react';
import { categories } from '../services/api';

const useCategories = (pollingInterval = null) => {
    const [categoryList, setCategoryList] = useState([]);
    const [categoryMap, setCategoryMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await categories();
            let list = [];
            if (Array.isArray(data)) {
                list = data;
            } else if (data && Array.isArray(data.data)) {
                list = data.data;
            } else if (data && Array.isArray(data.categories)) {
                list = data.categories;
            } else if (data && Array.isArray(data.items)) {
                list = data.items;
            }
            
            setCategoryList(list);
            
            // Creamos un mapa { id: "nombre" } para acceso O(1)
            const map = list.reduce((acc, cat) => {
                    const id = cat.id || cat.categoria_id;
                    const name = cat.name || cat.nombre;
                    if (id) acc[id] = name;
                    return acc;
                }, {});
                
                setCategoryMap(map);
            setError(null);
        } catch (err) {
            console.error('Error al cargar categorías:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();

        // Si se pasa un intervalo, activamos el polling
        if (pollingInterval) {
            const interval = setInterval(fetchCategories, pollingInterval);
            return () => clearInterval(interval);
        }
    }, [fetchCategories, pollingInterval]);

    // Memorizamos las opciones para selectores/filtros
    const categoryOptions = useMemo(() => 
        categoryList.map(cat => ({
            id: cat.id || cat.categoria_id,
            name: cat.name || cat.nombre || "Sin nombre"
        })), [categoryList]);

    return {
        categories: categoryOptions, // Formato array [{id, name}]
        categoryMap,                 // Formato objeto {id: name}
        loading,
        error,
        refresh: fetchCategories     // Permite recargar manualmente
    };
};

export default useCategories;