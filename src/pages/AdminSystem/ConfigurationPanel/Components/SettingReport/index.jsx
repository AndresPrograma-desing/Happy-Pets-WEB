import React, { useState, useEffect } from 'react';
import { Save, Calendar, Loader2 } from 'lucide-react';
import { settingReport } from '../../../../../services/api'; 
import { useReportSettings } from '../../../../../hooks/RequestSetting'; 
import { getText } from '../../../../../constants';
import PlaceholderButton from '../../../../../components/screens/components/PlaceholderButton';
import Loading from '../../../../../components/screens/components/Loading/Index';

const ConfigReport = () => {
    // 1. Extraemos isDeleteEnabled del hook
    const { days: initialDays, isDeleteEnabled, loading: isLoading, clearCache } = useReportSettings();
    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', width: '100%' }}>
                <Loading size="medium" text="" />
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