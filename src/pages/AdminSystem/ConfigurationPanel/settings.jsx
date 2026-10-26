import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "./settings.module.css";
import AlertModal from "../../../components/AlertModal/AlertModal";
import usePanelHeader from "../../../components/GenericPanel/usePanelHeader";
import { KeyRound, FileText, ClipboardIcon, CircleDollarSign, Mail, Eye, EyeOff, Sparkles, Briefcase, AlertTriangle } from "lucide-react";
import Report from "./Components/Report/index";
import { getText } from "../../../constants";
import CurrencySelector from "./Components/MoneySettings/CurrencySelector";
import SettingResend from "./Components/SettingResend";
// import GroqSettings from "./Components/NowGrodSettings/index";
import { DesplegablePanel, DrawPanel } from "anteriority-ui";
import PasswordResetPanel from "./Components/PasswordReset";
import { CONFIG_PANEL_TEXTS, WORKER_EVENTS_TEXTS } from "./constants";
import WorkerCenter from "./Components/WorkerCenter";

const workerDescriptions = {
  AutoGenerateReportWorker: "Este worker se encarga de ejecutar de forma periódica la autogeneración de reportes financieros y de actividad del sistema, asegurando que los reportes más recientes siempre estén disponibles.",
  DeleteReportWorker: "Este worker realiza la limpieza automática del almacenamiento físico del servidor eliminando reportes antiguos según el período de retención configurado para optimizar el espacio en disco."
};

const Settings = () => {
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showResendPanel, setShowResendPanel] = useState(false);
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [showMoneyPanel, setShowMoneyPanel] = useState(false);
  // const [showGroqPanel, setShowGroqPanel] = useState(false);
  // const [groqLoading, setGroqLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Password reset panel state is fully encapsulated in PasswordResetPanel now.

  usePanelHeader({
    title: getText("setting.tittle"),
    message: getText("setting.subTittle"),
    menuTitle: "Ajustes"
  });

  return (
    <>
      <div className={style.container}>

        <section className={style.section}>
          <h2 className={style.sectionTitle}>{getText("setting.moduleI")}</h2>
          <div className={style.card}>

            <DesplegablePanel
              title={getText("setting.password")}
              description={getText("setting.passDesc")}
              icon={KeyRound}
              iconColorVariant="blue"
              onToggle={() => setShowPasswordForm(true)}
              isOpen={false}
            />

            <DesplegablePanel
              title={getText("setting.report")}
              description={getText("setting.gestionReport")}
              icon={FileText}
              iconColorVariant="green"
              onToggle={() => setShowReportPanel(true)}
              isOpen={false}
            />

            <DesplegablePanel
              title={getText("resendConfig.panelTitle")}
              description={getText("resendConfig.panelDesc")}
              icon={Mail}
              iconColorVariant="purple"
              onToggle={() => setShowResendPanel(true)}
              isOpen={false}
            />

            {/* <DesplegablePanel
              title="Configuración de NowGrod IA (En desarrollo, No funcional)"
              description="Personaliza el nombre, correo, foto de perfil, reglas de respuesta y base de conocimientos de tu IA."
              icon={Sparkles}
              iconColorVariant="blue"
              onToggle={() => setShowGroqPanel(true)}
              isOpen={false}
            /> */}

            <DesplegablePanel
              title={getText("setting.logs")}
              description={getText("setting.logsDesc")}
              icon={ClipboardIcon}
              iconColorVariant="purple"
              onToggle={() => navigate('/administracion/registros')}
              isOpen={false}
            />

            <DesplegablePanel
              title={WORKER_EVENTS_TEXTS.panelTitle}
              description={WORKER_EVENTS_TEXTS.panelDescription}
              icon={AlertTriangle}
              iconColorVariant="red"
              onToggle={() => navigate('/administracion/eventos-workers')}
              isOpen={false}
            />

          </div>
        </section>

        {/* SECCIÓN II: PREFERENCIAS */}
        <section className={style.section}>
          <h2 className={style.sectionTitle}>{getText("setting.preferences")}</h2>

          <div className={style.card}>
            {/* OPCIÓN 1: CONFIGURACIÓN DE MONEDA */}
            <DesplegablePanel
              title={getText("setting.tittleMoneySettings")}
              description={getText("setting.moneySettingsDesc")}
              icon={CircleDollarSign}
              iconColorVariant="green2"
              onToggle={() => setShowMoneyPanel(true)}
              isOpen={false}
            />
          </div>
        </section>

        {/* SECCIÓN III: WORKER CENTER */}
        <section className={style.section}>
          <h2 className={style.sectionTitle}>
            <Briefcase size={16} />
            {CONFIG_PANEL_TEXTS.workerCenterTitle}
          </h2>
          <WorkerCenter descriptions={workerDescriptions} />
        </section>

      </div>

      <PasswordResetPanel
        isOpen={showPasswordForm}
        onClose={() => setShowPasswordForm(false)}
      />

      <DrawPanel
        isOpen={showResendPanel}
        onClose={() => setShowResendPanel(false)}
        title={getText("resendConfig.panelTitle")}
        // width="450px"
        showActions={true}
        confirmText="Guardar Cambios"
        cancelText="Cancelar"
        formId="resend-settings-form"
        loading={resendLoading}
      >
        <SettingResend
          onClose={() => setShowResendPanel(false)}
          onSaveStart={() => setResendLoading(true)}
          onSaveEnd={() => setResendLoading(false)}
        />
      </DrawPanel>

      <DrawPanel
        isOpen={showReportPanel}
        onClose={() => setShowReportPanel(false)}
        title={getText("setting.report")}
      // width="450px"
      >
        <Report />
      </DrawPanel>

      <DrawPanel
        isOpen={showMoneyPanel}
        onClose={() => setShowMoneyPanel(false)}
        title={getText("setting.tittleMoneySettings")}
      >
        <CurrencySelector />
      </DrawPanel>

      {/* <DrawPanel
        isOpen={showGroqPanel}
        onClose={() => setShowGroqPanel(false)}
        title="Ajustes del Asistente NowGroq.ia"
        showActions={true}
        confirmText="Guardar Cambios"
        cancelText="Cancelar"
        formId="groq-profile-form"
        loading={groqLoading}
      >
        <GroqSettings 
          onClose={() => setShowGroqPanel(false)} 
          onSaveStart={() => setGroqLoading(true)}
          onSaveEnd={() => setGroqLoading(false)}
        />
      </DrawPanel> */}
    </>
  );
};

export default Settings;
