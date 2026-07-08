import React, { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
// import { autoDeletingFactura } from '../../../../../services/api'; 
import { useReportSettings } from '../../../../../hooks/RequestSetting';
import SwitchComponent from "../../../../../components/screens/components/Swich/Index";
import style from '../../settings.module.css';
import { getText } from '../../../../../constants';
import ToggleCard from "../../../../../components/screens/components/ToggleCard";
import Loading from '../../../../../components/screens/components/Loading/Index';

const AutoDeleteTogglefactura = () => {
    const { isEnabledf: initialEnabled, loading, clearCache } = useReportSettings();
    const [isEnabled, setIsEnabled] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!loading) {
            setIsEnabled(initialEnabled);
        }
    }, [initialEnabled, loading]);

    const handleToggle = async (newValue) => {
        setActionLoading(true);
        try {
            // await autoDeletingFactura(newValue); 

            clearCache();

            setIsEnabled(newValue);
        } catch (error) {
            console.error(getText("configReport.configReportMassages.updateTrashError"), error);
            setIsEnabled(initialEnabled);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return null;
    }

    return (
     

        <ToggleCard
            title={getText("configFactura.autoDeleting") || getText("configReport.autoDeleting")}
            description={isEnabled
                ? getText("configFactura.autodeleteEnabled")
                : getText("configFactura.autodeleteDisabled")}
            icon={Trash2}
            action={
                <SwitchComponent
                    value={isEnabled}
                    onChange={handleToggle}
                    disabled={actionLoading}
                    activeColor="var(--SW-green)"
                    inactiveColor="var(--SW-disable-default)"
                    thumbColor="var(--SW-white)"
                />
            }
        />
    );
};

export default AutoDeleteTogglefactura;