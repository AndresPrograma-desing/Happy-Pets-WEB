import React, { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../../../services/api';
import Search from '../../screens/components/Material-UI/Components/Search/Index';

function normalizeProducts(res) {
    if (Array.isArray(res)) return res;
    return res?.products || res?.productos || res?.items || res?.data || [];
}

function getProductName(product) {
    return product?.nombre || product?.name || product?.titulo || 'Sin nombre';
}

function getProductId(product) {
    return product?.id || product?._id || product?.ID || null;
}

export default function AgreeProduct({ value, initialLabel = '', placeholder = 'Buscar producto...', onSelect }) {
    const [allProducts, setAllProducts] = useState([]);
    const [query, setQuery] = useState(initialLabel || '');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadProducts() {
            setLoading(true);
            try {
                const res = await getProducts();
                if (!mounted) return;
                setAllProducts(normalizeProducts(res));
            } catch (err) {
                if (!mounted) return;
                if (import.meta.env.DEV) console.error('loadProducts failed', err);
                setAllProducts([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadProducts();
        return () => {
            mounted = false;
        };
    }, []);

    const options = useMemo(() => {
        return allProducts.map((p) => ({
            value: String(getProductId(p)),
            label: getProductName(p),
            _raw: p
        }));
    }, [allProducts]);

    const selectedOption = useMemo(() => {
        if (!value) return null;
        return options.find((opt) => opt.value === String(value)) || null;
    }, [value, options]);

    return (
        <Search
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            options={options}
            loading={loading}
            value={selectedOption}
            onChange={(selected) => {
                if (selected && selected._raw) {
                    onSelect(selected._raw);
                }
            }}
            inputValue={query}
            onInputChange={(val) => setQuery(val || '')}
            label="Producto"
            placeholder={placeholder}
        />
    );
}