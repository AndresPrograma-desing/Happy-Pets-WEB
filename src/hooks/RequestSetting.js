import { useState, useEffect } from 'react';
import { getReportSettings, getFacturaSettigs } from '../services/api'; 

let cachedSettings = null;
let currentFetchPromise = null;

export const useReportSettings = () => {
    const [settings, setSettings] = useState(cachedSettings);
    const [loading, setLoading] = useState(!cachedSettings);
    const [error, setError] = useState(null);

    useEffect(() => { 
        if (cachedSettings && settings === null) {
            setSettings(cachedSettings);
        }

        const fetchData = async () => {
            try {
                if (!currentFetchPromise) {
                    currentFetchPromise = Promise.all([
                        getReportSettings(),
                        getFacturaSettigs()
                    ]);
                }
 
                const [reportData, facturaData] = await currentFetchPromise;
                
                const combinedData = {
                    ...reportData, 
                    daysf: facturaData?.daysf ?? 12,
                    isEnabledf: facturaData?.isEnabledf ?? false
                };
                
                cachedSettings = combinedData;
                setSettings(combinedData);
                setError(null);
            } catch (err) {
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
        days: settings?.days ?? 30,
        isDeleteEnabled: settings?.isEnabled ?? false, 
        isGenerateEnabled: settings?.generateEnabled ?? false,
 
        daysf: settings?.daysf ?? 12,
        isEnabledf: settings?.isEnabledf ?? false,
        
        loading,
        error,
        clearCache: () => { 
            cachedSettings = null; 
            currentFetchPromise = null;
            setSettings(null);
        }
    };
};