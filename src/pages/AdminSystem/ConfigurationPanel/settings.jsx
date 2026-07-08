import React, { useState } from "react";
import style from "./settings.module.css";
import ChangePasswordForm from "../../../components/ChangePassword/newPassword";
import AlertModal from "../../../components/AlertModal/AlertModal";
import GenericPanel from "../../../components/GenericPanel/GenericPanel";
import { KeyRound, FileText, Settings2, ClipboardIcon, CircleDollarSign, Mail } from "lucide-react";
import Report from "./Components/Report/index";
import { getText } from "../../../constants";
import ConfigReport from "./Components/SettingReport";
import AutoDeleteToggle from "./Components/SettingReport/autoDeleting";
import AutoGeneracionToggle from "./Components/SettingReport/autoGenerating";
import ConfigFactura from "./Components/SettingFactura/index";
import AutoDeleteTogglefactura from "./Components/SettingFactura/autoDeleting";
import CurrencySelector from "./Components/MoneySettings/CurrencySelector";
import DesplegablePanel from "../../../components/screens/components/DesplegablePanel";
import SettingResend from "./Components/SettingResend";

const Settings = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  return (
    <GenericPanel
      title={getText("setting.tittle")}
      message={getText("setting.subTittle")}
      role="admin"
      menuTitle="Ajustes"
    >
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
              onToggle={() => toggleMenu('reports')}
              isOpen={activeMenu === 'reports'}
            >
              <Report />
            </DesplegablePanel>

            <DesplegablePanel
              title={getText("resendConfig.panelTitle")}
              description={getText("resendConfig.panelDesc")}
              icon={Mail}
              iconColorVariant="purple"
              onToggle={() => toggleMenu('resend')}
              isOpen={activeMenu === 'resend'}
            >
              <SettingResend />
            </DesplegablePanel>

          </div>
        </section>

            {/* SECCIÓN II: PREFERENCIAS */}
        <section className={style.section}>
          <h2 className={style.sectionTitle}>{getText("setting.preferences")}</h2>
          
          <div className={style.card}>
            {/* OPCIÓN 1: CONFIGURACIÓN DE REPORTES */}
            <DesplegablePanel
              title={getText("setting.configReport")}
              description={getText("setting.configReportDesc")}
              icon={Settings2}
              iconColorVariant="purple"
              onToggle={() => toggleMenu('config')}
              isOpen={activeMenu === 'config'}
            >
              <AutoDeleteToggle />
              <AutoGeneracionToggle />
              <hr style={{ border: '0', borderTop: '1px solid #131414', margin: '1.5rem 0' }} />
              <ConfigReport />
            </DesplegablePanel>

            {/* OPCIÓN 2: FACTURACIÓN */}
            <DesplegablePanel
              title={getText("setting.title")}
              description={getText("setting.description")}
              icon={ClipboardIcon}
              iconColorVariant="red"
              onToggle={() => toggleMenu('invoices')}
              isOpen={activeMenu === 'invoices'}
            >
              <AutoDeleteTogglefactura />
              <hr style={{ border: '0', borderTop: '1px solid #131414', margin: '1.5rem 0' }} />
              <ConfigFactura />
            </DesplegablePanel>

            {/* OPCIÓN 3: CONFIGURACIÓN DE MONEDA */}
            <DesplegablePanel
              title={getText("setting.tittleMoneySettings")}
              description={getText("setting.moneySettingsDesc")}
              icon={CircleDollarSign}
              iconColorVariant="green2"
              onToggle={() => toggleMenu('moneysettings')}
              isOpen={activeMenu === 'moneysettings'}
            >
              <CurrencySelector />
            </DesplegablePanel>
          </div>
        </section>

      </div>

      {showPasswordForm && (
        <AlertModal
          open={showPasswordForm}
          onClose={() => setShowPasswordForm(false)}
          title={getText("setting.changePass")}
          description={getText("setting.changePassDesc")}
        >
          <ChangePasswordForm />
        </AlertModal>
      )}
    </GenericPanel>
  );
};

export default Settings;