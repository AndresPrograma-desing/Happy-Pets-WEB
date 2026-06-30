import React, { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../../../services/api';
import styles from './AgreeProduct.module.css';
import { Search, BanIcon } from 'lucide-react';

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

export default function AgreeProduct({ value, initialLabel = '', placeholder = 'Buscar...', onSelect }) {
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

    useEffect(() => {
        if (initialLabel) {
            setQuery(initialLabel);
            return;
        }
        if (!value) {
            setQuery('');
            return;
        }
        const found = allProducts.find((p) => String(getProductId(p)) === String(value));
        if (found) {
            setQuery(getProductName(found));
        }
    }, [value, initialLabel, allProducts]);

    const filteredProducts = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return allProducts.slice(0, 8);
        return allProducts
            .filter((p) => getProductName(p).toLowerCase().includes(term))
            .slice(0, 8);
    }, [allProducts, query]);

    const handlePick = (product) => {
        const name = getProductName(product);
        setQuery(name);
        setOpen(false);
        if (typeof onSelect === 'function') onSelect(product);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setOpen(false);
            if (!value) {
                setQuery('');
            } else {
                const found = allProducts.find((p) => String(getProductId(p)) === String(value));
                if (found) setQuery(getProductName(found));
            }
        }, 200);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.inputContainer}>
                <Search className={styles.searchIcon} size={16} />
                <input
                    className={styles.input}
                    type="text"
                    value={query}
                    placeholder={loading ? 'Cargando productos...' : placeholder}
                    onFocus={() => setOpen(true)}
                    onBlur={handleBlur}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                />
            </div>

            {open && (
                <div className={styles.dropdown}>
                    {filteredProducts.length === 0 ? (
                        <div className={styles.empty}>
                            <BanIcon size={20} /> No hay modificaciones
                        </div>
                    ) : (
                        filteredProducts.map((product) => {
                            const id = getProductId(product);
                            const name = getProductName(product);
                            return (
                                <button
                                    key={id ?? name}
                                    type="button"
                                    className={styles.item}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handlePick(product)}
                                >
                                    <span>{name}</span>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}