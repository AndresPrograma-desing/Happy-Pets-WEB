import React, { useState, useEffect } from 'react';
import { Save, Calendar, Loader2 } from 'lucide-react';
import { settingReport } from '../../../../../services/api'; 
import { useReportSettings } from '../../../../../hooks/RequestSetting'; 
import { getText } from '../../../../../constants';
import PlaceholderButton from '../../../../../components/screens/components/PlaceholderButton';

const ConfigReport = () => {
    // 1. Extraemos isDeleteEnabled del hook
    const { days: initialDays, isDeleteEnabled, loading: isLoading, clearCache } = useReportSettings();
    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', color: '#64748b' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>{getText("configReport.chargingConfig")}</span>
            </div>
        );
    }

    return (
        <PlaceholderButton
            icon={Calendar}
            tooltipText={getText("configReport.tooltipDays")}
            placeholder={getText("configReport.placeholderDays")}
            unitText={getText("configReport.days")}
            buttonText={getText("configReport.save")}
            hintText={getText("configReport.saveConfigDesc")}
            disabledHintText={getText("configReport.disabledByAutoDelete")}
            initialValue={initialDays}
            disabled={isDeleteEnabled}
            onSavePromise={settingReport}
            clearCache={clearCache}
            successMessage={getText("configReport.configReportMassages.saveConfig")}
            errorMessage={getText("configReport.configReportMassages.saveConfigError")}
            validationErrorMsg={getText("configReport.configReportMassages.minDaysError")}
        />
    );
};

export default ConfigReport;