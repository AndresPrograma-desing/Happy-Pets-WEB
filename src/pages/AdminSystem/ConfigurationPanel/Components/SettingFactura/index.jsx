import React, { useState, useEffect } from 'react';
import { Save, Calendar, Loader2 } from 'lucide-react';
import { settingReport } from '../../../../../services/api'; 
import { useReportSettings } from '../../../../../hooks/RequestSetting'; 
import { getText } from '../../../../../constants';
import PlaceholderButton from '../../../../../components/screens/components/PlaceholderButton';
import Loading from '../../../../../components/screens/components/Loading/Index';

const ConfigFactura = () => {

    const { daysf, loading: isLoading, clearCache } = useReportSettings();
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
            hintText={getText("configFactura.saveConfigDesc")}
            initialValue={daysf}
            onSavePromise={settingReport}
            clearCache={clearCache}
            successMessage={getText("configReport.configReportMassages.saveConfig")}
            errorMessage={getText("configReport.configReportMassages.saveConfigError")}
            validationErrorMsg={getText("configReport.configReportMassages.minDaysError")}
        />
    );
};

export default ConfigFactura;