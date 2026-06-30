import React, { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { autoDeleting } from '../../../../../services/api';
import { useReportSettings } from '../../../../../hooks/RequestSetting';
import SwitchComponent from "../../../../../components/svg/Switchcomponent";
import style from '../../settings.module.css';
import { getText } from '../../../../../constants';
import ToggleCard from "../../../../../components/screens/components/ToggleCard";

const AutoDeleteToggle = () => {
    const { isDeleteEnabled, loading, clearCache } = useReportSettings();
    const [isEnabled, setIsEnabled] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!loading) {
            setIsEnabled(isDeleteEnabled);
        }
    }, [isDeleteEnabled, loading]);

    const handleToggle = async (newValue) => {
        setActionLoading(true);
        try {
            await autoDeleting(newValue);

            clearCache();

            setIsEnabled(newValue);
        } catch (error) {
            console.error(getText("configReport.configReportMassages.updateTrashError"), error);
            setIsEnabled(isDeleteEnabled);
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
            title={getText("configReport.autoDeleting")}
            description={isEnabled
                ? getText("configReport.autodeleteEnabled")
                : getText("configReport.autodeleteDisabled")}
            icon={Trash2}
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

export default AutoDeleteToggle;