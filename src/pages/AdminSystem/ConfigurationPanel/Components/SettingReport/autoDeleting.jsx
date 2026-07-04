import React, { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { autoDeleting } from '../../../../../services/api';
import { useReportSettings } from '../../../../../hooks/RequestSetting';
import SwitchComponent from "../../../../../components/screens/components/Swich/Index";
import style from '../../settings.module.css';
import { getText } from '../../../../../constants';
import ToggleCard from "../../../../../components/screens/components/ToggleCard";
import Loading from '../../../../../components/screens/components/Loading/Index';

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
        return <Loading />;
    }

    return (
        <ToggleCard
            title={getText("configReport.autoDeleting")}
            description={isEnabled
                ? getText("configReport.autodeleteEnabled")
                : getText("configReport.autodeleteDisabled")}
            icon={Trash2}
            action={
                <SwitchComponent
                    value={isEnabled}
                    onChange={handleToggle}
                    disabled={actionLoading}
                    activeColor="var(--SW-red)"
                    inactiveColor="var(--SW-disable-default)"
                    thumbColor="var(--SW-white)"
                />
            }
        />
    );
};

export default AutoDeleteToggle;