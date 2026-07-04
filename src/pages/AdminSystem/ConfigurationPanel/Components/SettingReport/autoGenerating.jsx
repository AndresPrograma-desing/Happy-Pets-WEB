import React, { useState, useEffect } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { autoGeneration } from '../../../../../services/api';
// Asegúrate de usar la versión del hook que separa isGenerateEnabled e isDeleteEnabled
import { useReportSettings } from '../../../../../hooks/RequestSetting';
import SwitchComponent from "../../../../../components/screens/components/Swich/Index";
import style from '../../settings.module.css';
import { getText } from '../../../../../constants';
import ToggleCard from "../../../../../components/screens/components/ToggleCard";
import Loading from '../../../../../components/screens/components/Loading/Index';



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
        return <Loading />;
    }

    return (
        <ToggleCard
            title={getText("configReport.autromaticReport")}
            description={isEnabled
                ? getText("configReport.autoGenerationEnabled")
                : getText("configReport.autoGenerationDisabled")}
            icon={Settings}
            action={
                <SwitchComponent
                    value={isEnabled}
                    onChange={handleToggle}
                    disabled={actionLoading}
                    activeColor="var(--SW-green)"
                    inactiveColor="var(--SW-disable-default)"
                    thumbColor="var(-SW-white)"
                />
            }
        />
    );
};

export default AutoGeneracionToggle;