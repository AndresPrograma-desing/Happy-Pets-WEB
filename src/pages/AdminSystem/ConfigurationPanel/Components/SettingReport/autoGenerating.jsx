import React, { useState, useEffect } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { autoGeneration } from '../../../../../services/api';
// Asegúrate de usar la versión del hook que separa isGenerateEnabled e isDeleteEnabled
import { useReportSettings } from '../../../../../hooks/RequestSetting';
import SwitchComponent from "../../../../../components/svg/Switchcomponent";
import style from '../../settings.module.css';
import { getText } from '../../../../../constants';
import ToggleCard from "../../../../../components/screens/components/ToggleCard";

const AutoGeneracionToggle = () => {
    // 1. Extraemos específicamente el valor de generación
    const { isGenerateEnabled, loading, clearCache } = useReportSettings();

    // Estado local para respuesta instantánea en la UI
    const [isEnabled, setIsEnabled] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // 2. Sincronizamos cuando el hook termina de cargar
    useEffect(() => {
        if (!loading) {
            setIsEnabled(isGenerateEnabled);
        }
    }, [isGenerateEnabled, loading]);

    const handleToggle = async (newValue) => {
        setActionLoading(true);
        try {
            await autoGeneration(newValue);
            // 3. Limpiamos caché para que la próxima vez que se cargue esté fresco
            clearCache();
            // 4. Actualizamos el estado local para que el botón se mueva ya
            setIsEnabled(newValue);
        } catch (error) {
            console.error(getText("configReport.configReportMassages.updateAutoGenError"), error);
            // Si falla, revertimos al valor que tiene el hook
            setIsEnabled(isGenerateEnabled);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', color: '#64748b' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Cargando...</span>
            </div>
        );
    }

    return (
        <ToggleCard
            title={getText("configReport.autromaticReport")}
            description={isEnabled
                ? getText("configReport.autoGenerationEnabled")
                : getText("configReport.autoGenerationDisabled")}
            icon={Settings}
            action={
                actionLoading ? (
                    <Loader2 size={20} className={style.spinner} />
                ) : (
                    <SwitchComponent
                        value={isEnabled}
                        onChange={handleToggle}
                    />
                )
            }
        />
    );
};

export default AutoGeneracionToggle;