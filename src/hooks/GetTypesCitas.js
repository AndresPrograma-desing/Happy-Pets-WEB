import { useState, useEffect } from 'react';
import { getCitaTypes } from '../services/api';

const formatTypeLabel = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/[_\/]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export default function useCitaTypes() {
    const [types, setTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [typeError, setTypeError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        getCitaTypes()
            .then(res => {
                if (!isMounted) return;
                let data = [];
                if (Array.isArray(res)) data = res;
                else if (res?.types && Array.isArray(res.types)) data = res.types;
                else if (res?.data && Array.isArray(res.data)) data = res.data;
                else if (res?.result && Array.isArray(res.result)) data = res.result;

                const opts = data.map(item => {
                    let val = '';
                    let rawLabel = '';

                    if (typeof item === 'string') {
                        val = item;
                        rawLabel = item;
                    } else if (item && typeof item === 'object') {
                        val = item.type || item.id || item.name || item.value || '';
                        rawLabel = item.label || item.type || item.name || val;
                    }

                    return {
                        value: val,
                        label: formatTypeLabel(rawLabel)
                    };
                });

                if (opts.length > 0) {
                    setTypes(opts);
                } else {
                    setTypes([
                        { value: 'consulta', label: 'Consulta' },
                        { value: 'vacunacion', label: 'Vacunación' },
                        { value: 'cirugia', label: 'Cirugía' },
                        { value: 'emergencia', label: 'Emergencia' },
                        { value: 'seguimiento', label: 'Seguimiento' },
                        { value: 'desparasitacion', label: 'Desparasitación' }
                    ]);
                }
            })
            .catch(err => {
                if (!isMounted) return;
                setTypeError(err);
                setTypes([
                    { value: 'consulta', label: 'Consulta' },
                    { value: 'vacunacion', label: 'Vacunación' },
                    { value: 'cirugia', label: 'Cirugía' },
                    { value: 'emergencia', label: 'Emergencia' },
                    { value: 'seguimiento', label: 'Seguimiento' },
                    { value: 'desparasitacion', label: 'Desparasitación' }
                ]);
            })
            .finally(() => {
                if (isMounted) setLoadingTypes(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return { types, loadingTypes, typeError };
}
