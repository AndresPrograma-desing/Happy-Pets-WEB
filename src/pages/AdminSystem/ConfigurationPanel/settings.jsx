import React, { useState, useEffect } from "react";
import style from "./settings.module.css";
import AlertModal from "../../../components/AlertModal/AlertModal";
import GenericPanel from "../../../components/GenericPanel/GenericPanel";
import { KeyRound, FileText, Settings2, ClipboardIcon, CircleDollarSign, Mail, Eye, EyeOff, Sparkles } from "lucide-react";
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
import GroqSettings from "./Components/GroqSettings/index";
import DrawPanel from "../../../components/screens/components/DrawPanel/index";
import TextField from "../../../components/screens/components/Material-UI/Components/TextField/Index";
import MultilinePlaceholder from "../../../components/screens/components/Material-UI/Components/MultilinePlaceholder/index";
import UserAvatar from "../../../components/screens/components/Profile/Avatar/Index.jsx";
import useAdminPasswordReset from "../../../hooks/useAdminPasswordReset";
import ToggleCard from "../../../components/screens/components/ToggleCard";
import Loading from "../../../components/screens/components/Loading/Index";
import ErrorMessage from "../../../components/Notification/Error/ErrorMessage";
import Button from "../../../components/screens/components/Button/index";

const Settings = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showResendPanel, setShowResendPanel] = useState(false);
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [showGroqPanel, setShowGroqPanel] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const misFrases = ["Cargando", "Esperando la aceptación de la solicitud", "Enviale un mensaje"];

  // Change Password State via Real API Polling
  const { 
    requestPasswordReset, 
    assignNewPassword, 
    requestLoading, 
    pwdLoading, 
    error: apiError, 
    success: pwdSuccess, 
    status: pwdStatus, 
    setStatus: setPwdStatus,
    clearError,
    pendingList,
    fetchLoading,
    fetchPendingList,
    startPolling
  } = useAdminPasswordReset();

  const [pwdData, setPwdData] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [localPwdError, setLocalPwdError] = useState(null);

  // Map API status to UI Steps
  const pwdStep = pwdStatus === 'Idle' ? 1 : pwdStatus === 'Pending' ? 2 : 3;

  const [showPwdToast, setShowPwdToast] = useState(false);

  useEffect(() => {
    if (pwdStep === 2) {
      setShowPwdToast(true);
    } else {
      setShowPwdToast(false);
    }
  }, [pwdStep]);

  useEffect(() => {
    if (showPasswordForm) {
      fetchPendingList();
    } else {
      setPwdStatus('Idle');
      setPwdData({ email: '', newPassword: '', confirmPassword: '' });
      setLocalPwdError(null);
      clearError();
    }
  }, [showPasswordForm, fetchPendingList]);

  const handleContinuePending = (pendingUser) => {
    setPwdData({ ...pwdData, email: pendingUser.email });
    setPwdStatus(pendingUser.status);
    if (pendingUser.status === 'Pending') {
      startPolling(pendingUser.email);
    }
  };

  useEffect(() => {
    if (localPwdError) setLocalPwdError(null);
  }, [pwdData]);

  const handlePwdChange = (e) => setPwdData({ ...pwdData, [e.target.name]: e.target.value });

  const submitPasswordChange = async (e) => {
    if (e) e.preventDefault();
    clearError();
    
    if (pwdStep === 1) {
      if (!pwdData.email) {
        setLocalPwdError("Ingresa el correo del usuario.");
        return;
      }
      await requestPasswordReset(pwdData.email);
      return;
    }
    
    if (pwdStep === 3) {
      if (pwdData.newPassword !== pwdData.confirmPassword) {
        setLocalPwdError("Las contraseñas nuevas no coinciden");
        return;
      }
      if (pwdData.newPassword.length < 6) {
        setLocalPwdError("La contraseña debe tener al menos 6 caracteres");
        return;
      }
      await assignNewPassword(pwdData.email, pwdData.newPassword);
    }
  };

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

            <DesplegablePanel
              title="Configuración de GROQ IA"
              description="Personaliza el nombre, correo, foto de perfil, reglas de respuesta y base de conocimientos de tu IA."
              icon={Sparkles}
              iconColorVariant="blue"
              onToggle={() => setShowGroqPanel(true)}
              isOpen={false}
            />

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

      <DrawPanel
        isOpen={showPasswordForm}
        onClose={() => setShowPasswordForm(false)}
        title="Restablecimiento de Contraseñas"
        width="450px"
        showActions={true}
        onConfirm={submitPasswordChange}
        confirmText={pwdStep === 1 ? "Solicitar Aprobación" : "Cambiar Clave"}
        cancelText="Cancelar"
        loading={pwdLoading || requestLoading}
        formId="changePwdForm"
      >
        
        {showPwdToast && (
          <ToggleCard
            title="Recuperación de Contraseña"
            description={`Se envio la solicitua al usuario ${pwdData.email}`}
            icon={Mail}
            iconColorVariant="blue"
            onClose={() => setShowPwdToast(false)}
            variant="floating"
          />
        )}

        <form id="changePwdForm" onSubmit={submitPasswordChange} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '10px 0' }}>
          
          {(requestLoading || pwdLoading || pwdStep === 2 || fetchLoading) ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <Loading size="large" phrases={misFrases}/>
            </div>
          ) : (
            <>
          {pwdStep === 1 && !fetchLoading && (
            <>
              {pendingList && pendingList.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '0.9rem' }}>Hay solicitudes en proceso:</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pendingList.map((item, idx) => (
                      <li key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>{item.email}</div>
                          <div style={{ fontSize: '0.75rem', color: item.status === 'Accepted' ? '#16a34a' : '#b45309' }}>
                            {item.status === 'Accepted' ? 'Lista para asignar nueva clave' : 'Enviado al correo'}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleContinuePending(item)}
                          color={item.status === 'Accepted' ? 'var(--button-green)' : 'primary'}
                          size="small"
                          style={{ fontSize: '0.75rem', padding: '4px 10px', minWidth: 'auto' }}
                        >
                          Continuar
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />
                  <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '0.9rem' }}>O iniciar nueva solicitud:</h4>
                </div>
              )}
              <ToggleCard
                title="Correo Electrónico"
                description="Ingresa el correo electrónico del usuario para enviarle una solicitud de aprobación para el cambio de clave."
                icon={Mail}
                iconColorVariant="blue"
                isOpen={false}
              />
              <TextField
                label="Correo Electrónico"
                name="email"
                value={pwdData.email}
                onChange={handlePwdChange}
                placeholder="usuario@correo.com"
                disabled={pwdLoading || requestLoading}
                autoComplete="off"
              />
            </>
          )}

          {pwdStep === 3 && (
            <>
             <ToggleCard
             title="Correo Electrónico"
             description="A continuacion ingrese la nueva clave, esta debe tener al menos 6 caracteres, puede cerrar el panel, pero tras 15 minutos expitrara la solicitud."
             icon={Mail}
             iconColorVariant="blue"
             isOpen={false}
             />
              <TextField
                label="Correo Electrónico (Autocompletado)"
                name="email"
                value={pwdData.email || 'usuario@correo.com'}
                disabled={true}
              />
              <div style={{ position: 'relative', marginTop: '10px' }}>
                <TextField
                  label="Nueva Contraseña"
                  name="newPassword"
                  type={showPass ? "text" : "password"}
                  value={pwdData.newPassword}
                  onChange={handlePwdChange}
                  placeholder="Mínimo 6 caracteres"
                  disabled={pwdLoading}
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {showPass ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                      </button>
                    )
                  }}
                />
              </div>
              <TextField
                label="Confirmar Nueva Contraseña"
                name="confirmPassword"
                type={showPass ? "text" : "password"}
                value={pwdData.confirmPassword}
                onChange={handlePwdChange}
                placeholder="Repite la nueva contraseña"
                disabled={pwdLoading}
                autoComplete="new-password"
              />
            </>
          )}
          <ErrorMessage 
            message={apiError || localPwdError} 
            title="Error en la solicitud" 
            variant="danger" 
          />
          {pwdSuccess && (
            <ErrorMessage 
              message="¡Contraseña actualizada correctamente!" 
              title="Operación Exitosa" 
              variant="success" 
            />
          )}
            </>
          )}
        </form>
      </DrawPanel>

      <DrawPanel
        isOpen={showResendPanel}
        onClose={() => setShowResendPanel(false)}
        title={getText("resendConfig.panelTitle")}
        width="450px"
      >
        <SettingResend />
      </DrawPanel>

      <DrawPanel
        isOpen={showReportPanel}
        onClose={() => setShowReportPanel(false)}
        title={getText("setting.report")}
        width="450px"
      >
        <Report />
      </DrawPanel>

      <DrawPanel
        isOpen={showGroqPanel}
        onClose={() => setShowGroqPanel(false)}
        title="Ajustes del Asistente GROQ"
      >
        <GroqSettings onClose={() => setShowGroqPanel(false)} />
      </DrawPanel>
    </GenericPanel>
  );
};

export default Settings;