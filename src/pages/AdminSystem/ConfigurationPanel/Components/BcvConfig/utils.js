import { useState, useEffect } from 'react';
import { getDollarBcv } from '../../../../../services/api';

let cachedBcv = null;
let currentFetchPromise = null;

export const useBcvSettings = () => {
    const [price, setPrice] = useState(cachedBcv);
    const [loading, setLoading] = useState(!cachedBcv);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (cachedBcv && price === null) {
            setPrice(cachedBcv);
        }

        const fetchData = async () => {
            try {
                if (!currentFetchPromise) {
                    currentFetchPromise = getDollarBcv();
                }

                const response = await currentFetchPromise;

                const priceData = response?.price ?? response?.tasa ?? response ?? '';
                
                cachedBcv = priceData;
                setPrice(priceData);
                setError(null);
            } catch (err) {
                console.error("Error fetching BCV:", err);
                setError(err);
                currentFetchPromise = null;
            } finally {
                setLoading(false);
                currentFetchPromise = null;
            }
        };

        fetchData();
    }, []);

    return {
        price,
        loading,
        error,
        clearCache: () => {
            cachedBcv = null;
            currentFetchPromise = null;
            setPrice(null);
        }
    };
};
