import { useState, useEffect } from 'react';
import { getCitaStatuses } from '../services/api';

// Función para limpiar y normalizar los textos de los estados
const formatStatusLabel = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/[_\/]/g, ' ') 
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) 
        .join(' ');
};

export default function useCitaStatuses() {
    const [statuses, setStatuses] = useState([]);
    const [loadingStatuses, setLoadingStatuses] = useState(true);
    const [statusError, setStatusError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        
        getCitaStatuses()
            .then(res => {
                if (!isMounted) return;
                let data = [];
                if (Array.isArray(res)) data = res;
                else if (res?.statuses && Array.isArray(res.statuses)) data = res.statuses;
                else if (res?.data && Array.isArray(res.data)) data = res.data;
                else if (res?.result && Array.isArray(res.result)) data = res.result;

                const opts = data.map(item => {
                    let val = '';
                    let rawLabel = '';
                    
                    if (typeof item === 'string') {
                        val = item;
                        rawLabel = item;
                    } else if (item && typeof item === 'object') {
                        val = item.status || item.id || item.name || item.value || '';
                        rawLabel = item.label || item.status || item.name || val;
                    }

                    return { 
                        value: val, 
                        label: formatStatusLabel(rawLabel) 
                    };
                });
                
                setStatuses(opts);
            })
            .catch(err => {
                if (!isMounted) return;
                setStatusError(err);
                setStatuses([
                    { value: 'pendiente', label: 'Pendiente' },
                    { value: 'en_curso', label: 'En Curso' },
                    { value: 'completada', label: 'Completada' },
                    { value: 'cancelada', label: 'Cancelada' }
                ]);
            })
            .finally(() => {
                if (isMounted) setLoadingStatuses(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return { statuses, loadingStatuses, statusError };
}