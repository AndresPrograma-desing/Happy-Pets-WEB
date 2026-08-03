import { getMoneyName } from "./functions";
import { getLogsTxt } from "./logs/consoleLogTxt";
import { constants } from "./constansts";
import { Sidebar } from "lucide-react";
import ClientList from "../components/Clients/ClientList/list";


export const getDynamicTexts = (currentCurrency) => ({
    MoneysName: {
        MONEYTIPE: getMoneyName(currentCurrency),
    },
});

const TEXT = {

    MoneysName: {
        MONEYTIPE: getMoneyName("USD"),
    },
    reportes: {
        ReportGen: "Reporte Generado",
        reportsDownload: "Descargar Reportes generados.",
        reportError: "Hubo un fallo en el servidor",
        ReportGenerated: "El reporte se ha creado correctamente. Puedes encontrarlo en el historial para descargarlo.",
        historialReport: "Historial de Archivos",
        reportDownload: "Descargar Reporte",
        setReportStatus: "Reporte generado exitosamente",
        setReportStatusError: "Error al generar el reporte.",
        setReportStatusGenerating: "Generando reporte...",
        reportProcessing: "Procesando...",
        generateReportButton: "Generar Reporte de Actividad",
        viewReportHistoryButton: "Ver Historial de Reportes",
    },
    setting: {
        tittle: "Configuración.",
        subTittle: "Gestiona tus preferencias y seguridad",
        vacunas: "Control de Vacunación",
        errorCarga: "Error al obtener historial médico",
        moduleI: "Accesos y Seguridad",
        password: "Contraseña",
        passDesc: "Cambia contraseña de acceso para los usuarios.",
        report: "Reporte",
        gestionReport: "Gestión de Reportes",
        preferences: "Preferencias",
        changePass: "Cambiar Contraseña",
        changePassDesc: "Asegúrate de elegir una clave segura que no hayas usado antes.",
        configReport: "Configuración de Reportes",
        configReportDesc: "Configurar eliminación y generación de reportes.",
        title: "Configuración de Recibos",
        description: "Gestiona la configuración de recibos, incluyendo métodos de pago, impuestos y formatos de recibos.",
        tittleMoneySettings: "Configuración de Moneda",
        moneySettingsDesc: "Selecciona la moneda que se utilizará para las transacciones y reportes financieros.",
        logs: "Logs del Sistema",
        logsDesc: "Visualizar el registro detallado de auditoría de las acciones realizadas en el sistema.",
    },

    configReport: {
        autromaticReport: "Generación Automática",
        autoDeleting: "Eliminación Automática",
        retentionDays: "Días de Retención",
        retentionDesc: "Define por cuánto tiempo se conservarán los reportes antes de ser eliminados automáticamente.",
        autoDeleteDesc: "Activa o desactiva la eliminación automática de reportes según la configuración de retención.",
        autodeleteEnabled: `${constants.Enabled}: Los reportes se borrarán automáticamente cada 30 días.`,
        autodeleteDisabled: `${constants.Disabled}: Los reportes se eliminarán según la configuración de personalizada.`,
        autoGenerationDesc: `${constants.Enabled}: Los reportes se generarán automáticamente cada 15 días.`,
        autoGenerationEnabled: `${constants.Enabled}: La generación automática de reportes está activa, los reportes se generan cada 15 días.`,
        autoGenerationDisabled: `${constants.Disabled}: La generación automática de reportes está desactivada, los reportes se tienen que generar manualmente.`,
        chargingConfig: "Cargando configuración...",
        saveConfigDesc: "* Los reportes antiguos se eliminarán automáticamente después de este periodo.",
        save: "Guardar",
        days: "Días",
        placeholderDays: "Ej: 30",
        tooltipDays: "La cantidad de días que se ven es la última configuración guardada, puedes cambiarla y guardar para actualizar la configuración de retención.",
        updateReportHistory: "Actualizar historial de reportes",
        historyReport: "Historial de Reportes",
        chargingHistory: "Cargando historial de reportes...",
        notReports: "No hay reportes generados aún.",
        downloadReport: "Descargar",
        disabledByAutoDelete: "La eliminación manual está deshabilitada debido a la activación de la eliminación automática.",

        configReportMassages: {
            errorLoadingDays: getLogsTxt("configReportMassages.errorLoadingDays"),
            minDaysError: getLogsTxt("configReportMassages.minDaysError"),
            error: getLogsTxt("configReportMassages.error"),
            saveConfig: getLogsTxt("configReportMassages.saveConfig"),
            success: getLogsTxt("configReportMassages.success"),
            saveConfigError: getLogsTxt("configReportMassages.saveConfigError"),
            initialConfigError: getLogsTxt("configReportMassages.initialConfigError"),
            updateTrashError: getLogsTxt("configReportMassages.updateTrashError"),
            updateAutoGenError: getLogsTxt("configReportMassages.updateAutoGenError"),
            chargingReportErrror: getLogsTxt("configReportMassages.chargingReportErrror"),
        }
    },
    configFactura: {
        saveConfigDesc: "* Los archivos PDF de los recibos antiguos se eliminarán automáticamente después de este periodo.",
        autodeleteEnabled: `${constants.Enabled}: Los archivos PDF de los recibos se borrarán automáticamente cada 30 días.`,
        autodeleteDisabled: `${constants.Disabled}: Los archivos PDF de los recibos se eliminarán según la configuración de personalizada.`,
        autoDeleting: "Eliminación Automática",
    },
    moneySettings: {
        dollar: "Dólares (USD)",
        bolivares: "Bolívares (VES)",
        moneySelected: "Moneda actual seleccionada",
        atention: "Atención:",

        errorFetchingCurrency: getLogsTxt("moneySettingsMessages.errorFetchingCurrency"),
        errorUpdatingCurrency: getLogsTxt("moneySettingsMessages.errorUpdatingCurrency"),
    },

    homeMessages: {
        welcomeTitle: "Bienvenidos a Happy Pets",
        // welcomeHighlight: "Happy Pets",
        subtitle: "Sistema para optimizar procesos operativos de la Veterinaria Happy Pets",
        loginButton: "Iniciar sesión",
        closeLogin: "✕",
        vetNamePrefix: "Veterinaria",
        vetNameStrong: "Happy Pets",
        githubLinkText: "GitHub Repositorio",
        altReact: "React",
        altJs: "JS",
        altMysql: "MySQL",
        altDotnet: ".Net",
        altGithub: "GitHub",

    },
    loginFormMessages: {
        roleDoctorLabel: "Doctor",
        roleAdminLabel: "Administrador",
        roleSecretariaLabel: "Secretaria",
        headerTitle: "Accede a tu cuenta",
        emailLabel: "Correo",
        emailPlaceholder: "Ejemplo: correo@email.com",
        emailRequiredError: "Se requiere correo",
        emailInvalidError: "Correo invalido",
        passwordLabel: "Contraseña",
        passwordPlaceholder: "Ingresa tu contraseña (>8)",
        passwordRequiredError: "Se requiere contraseña",
        passwordMinLengthError: "La longitud mínima es de 6 caracteres",
        showPasswordAriaLabel: "Mostrar contraseña",
        hidePasswordAriaLabel: "Ocultar contraseña",
        roleLabel: "Rol",
        selectRoleAriaLabel: "Selecciona rol",
        loginButtonText: "Ingresar",
        loginButtonLoadingText: "Ingresando...",
        helpButtonText: "Ayuda",
        helpButtonAriaLabel: "Ayuda",
        modalCloseAriaLabel: "Cerrar ayuda",
        apiErrorRoleInvalid: "Rol invalido para el usuario",
        apiErrorInvalidData: "Datos invalidos",
        apiErrorCorrigeFormulario: "Corrige los errores del formulario"
    },
    adminInterface: {
        menuItemDashboard: "Dashboard",
        menuItemUsers: "Usuarios",
        menuItemProducts: "Productos",
        menuItemMessages: "Mensajes",
        genericPanelFacturas: `${constants.Facturas}`,
        menuItemSettings: "Ajustes",
        genericPanelMenuTitle: "Panel de Administración",
        genericPanelTitle: "Página del Administrador",
        genericPanelMessage: "Gestiona usuarios, productos, mensajes y más desde tu panel de administración.",

        createdUserMessages: {
            eyeIconShowAlt: "Mostrar contraseña",
            eyeIconHideAlt: "Ocultar contraseña",
            openButtonText: "+ Crear usuario",
            modalTitle: "Nuevo usuario",
            closeButtonAriaLabel: "Cerrar",
            nombrePlaceholder: "Nombre",
            nombreRequiredError: "Requerido",
            nombreMinLengthError: "Mínimo 2",
            apellidoPlaceholder: "Apellido",
            apellidoRequiredError: "Requerido",
            apellidoMinLengthError: "Mínimo 2",
            emailPlaceholder: "Correo electrónico",
            emailRequiredError: "Requerido",
            emailInvalidError: "Inválido",
            passwordPlaceholder: "Contraseña",
            passwordRequiredError: "Requerida",
            passwordMinLengthError: "Mínimo 6",
            selectRolOptionDoctor: "Doctor",
            selectRolOptionAdmin: "Administrador",
            selectRolOptionSecretaria: "Secretaria",
            successMessage: "Usuario creado",
            errorCreatingMessage: "Error al crear",
            cancelButtonText: "Cancelar",
            createButtonText: "Crear",
            creatingButtonText: "Creando..."
        },

    },
    appointmentCard: {
        notCompromised: "Sin compromisos.",


        appointmentCardError:{
        awaitCitaError: getLogsTxt("appointmentCard.awaitCitaError"),
        }
    },
    generalPanelTexts: {
        titleA: "Panel Administrativo",
        titleM: "Panel Médico",
        titleS: "Panel de Secretaria",
        
        optionsNavegations:{
            notificationCreated:"Crear Ticket",
            whatsapp:"WhatsApp",
            clientList:"Clientes",
        }

    },
    resendConfig: {
        panelTitle: "Configuración de Resend",
        panelDesc: "Visualiza las credenciales y el estado del servicio de envío de correos.",
        loading: "Cargando configuración de Resend...",
        errorLoading: "Error al obtener la configuración de Resend",
        noData: "No se encontraron datos de configuración.",
        cardTitle: "Credenciales y Estado",
        active: "Activo",
        inactive: "Inactivo",
        clientEmail: "Email de Cliente",
        apiKey: "API Key",
        urlResend: "URL Resend",
        apiUrl: "API URL"
    }
};


export const getText = (path) => {
    const keys = path.split('.');
    let result = TEXT;

    for (const key of keys) {
        if (result[key]) {
            result = result[key];
        } else {
            return path;
        }
    }
    return result;
};

export default TEXT;