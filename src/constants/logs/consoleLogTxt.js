
const LOGS = {

        configReportMassages: {
            errorLoadingDays: "Error al cargar configuración de días.",
            minDaysError: "Mínimo 1 día.",
            error: "error",
            saveConfig: "Configuración guardada.",
            success: "success",
            saveConfigError: "Error al guardar.",
            initialConfigError: "Error al obtener la configuración inicial.",
            updateTrashError: "Error al actualizar la eliminación automática.",
            updateAutoGenError: "Error al actualizar la generación automática.",
            chargingReportErrror: "No se pudieron cargar los reportes anteriores.",
        },
        moneySettingsMessages: {
            errorFetchingCurrency: "Error al obtener la moneda actual.",
            errorUpdatingCurrency: "Error al actualizar la moneda.",
        },
        appointmentCard:{
            awaitCitaError: "Error al obtener la cita de hoy.",
        }

};


export const getLogsTxt = (path) => {
    const keys = path.split('.');
    let result = LOGS;

    for (const key of keys) {
        if (result[key]) {
            result = result[key];
        } else {
            return path;
        }
    }
    return result;
};

export default LOGS;