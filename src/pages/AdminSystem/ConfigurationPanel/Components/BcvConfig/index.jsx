import React from "react";
import { DollarSign, Loader2 } from "lucide-react";
import { updateBcvPrice } from "../../../../../services/api";
import PlaceholderButton from "../../../../../components/screens/components/PlaceholderButton";
import { useBcvSettings } from "./utils";
import { BCV_CONFIG_TEXT } from "../../../../../constants/TEXT";

export default function BcvConfig (){
    const { price, loading, clearCache } = useBcvSettings();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', color: '#64748b' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Cargando configuración BCV...</span>
            </div>
        );
    }

    return (
        <PlaceholderButton
            icon={DollarSign}
            tooltipText={BCV_CONFIG_TEXT.bcvPricePlaceholder}
            placeholder={BCV_CONFIG_TEXT.placeholderHint}
            unitText={BCV_CONFIG_TEXT.unitText}
            buttonText={BCV_CONFIG_TEXT.buttonText}
            hintText={BCV_CONFIG_TEXT.hintText}
            initialValue={price}
            onSavePromise={updateBcvPrice}
            clearCache={clearCache}
            successMessage={BCV_CONFIG_TEXT.successMessage}
            errorMessage={BCV_CONFIG_TEXT.errorMessage}
            validationErrorMsg={BCV_CONFIG_TEXT.validationErrorMsg}
        />
    )
}