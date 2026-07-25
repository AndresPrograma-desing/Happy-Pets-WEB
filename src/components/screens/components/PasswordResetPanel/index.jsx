import React, { useState, useEffect } from "react";
import { Mail, Eye, EyeOff } from "lucide-react";
import DrawPanel from "../DrawPanel/index";
import TextField from "../Material-UI/Components/TextField/Index";
import ToggleCard from "../ToggleCard";
import Loading from "../Loading/Index";
import ErrorMessage from "../../../Notification/Error/ErrorMessage";
import Button from "../Button/index";
import CountdownBar from "../CountdownBar";
import DateTag from "../DateTag";
import useAdminPasswordReset from "../../../../hooks/useAdminPasswordReset";

export default function PasswordResetPanel({ isOpen, onClose }) {
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
    startPolling,
    stopPolling,
    activeTicket,
    setActiveTicket,
    resetResetState
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
    if (isOpen) {
      fetchPendingList();
    } else {
      setPwdData({ email: '', newPassword: '', confirmPassword: '' });
      setLocalPwdError(null);
      resetResetState();
      stopPolling();
    }
  }, [isOpen, fetchPendingList, resetResetState, stopPolling]);

  const handleContinuePending = (pendingUser) => {
    setPwdData({ ...pwdData, email: pendingUser.email });
    setPwdStatus(pendingUser.status);
    setActiveTicket(pendingUser);
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
      const ok = await assignNewPassword(pwdData.email, pwdData.newPassword);
      if (ok) {
        setTimeout(() => {
          resetResetState();
          setPwdData({ email: '', newPassword: '', confirmPassword: '' });
          fetchPendingList();
        }, 3000);
      }
    }
  };

  return (
    <DrawPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Restablecimiento de Contraseñas"
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
        
        {(requestLoading || pwdLoading || fetchLoading || (pwdStep === 2 && (!activeTicket || !activeTicket.expiracion))) ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <Loading 
              size="large" 
              phrases={["Iniciando solicitud"]}
              variant=''
            />
          </div>
        ) : pwdStep === 2 ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '1.5rem', width: '100%' }}>
            <Loading 
              size="large" 
              phrases={["Cargando", "Esperando la aceptación del usuario", "Verificando"]}
              variant='bounce'
            />
            <div style={{ textAlign: 'center', width: '100%' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#475569' }}>
                Esperando por: <b>{pwdData.email}</b>
              </p>
              <div style={{ width: '100%', padding: '0 20px', boxSizing: 'border-box', marginBottom: '15px' }}>
                <CountdownBar 
                  active={true} 
                  expiresAt={activeTicket?.expiracion} 
                  totalDuration={(activeTicket?.expiresInSeconds || activeTicket?.expires_in_seconds || 900) * 1000} 
                />
              </div>
              <Button
                type="button"
                onClick={() => {
                  resetResetState();
                  stopPolling();
                }}
                color="var(--button-red, #ef4444)"
                size="small"
                style={{ fontSize: '0.75rem', marginTop: '10px' }}
              >
                Cancelar Espera
              </Button>
            </div>
          </div>
        ) : (
          <>
            {pwdStep === 1 && !fetchLoading && (
              <>
                {pendingList && pendingList.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '0.9rem' }}>Hay solicitudes en proceso:</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pendingList.map((item, idx) => {
                        const isExpired = item.status === 'Pending' && (
                          item.expiresInSeconds === 0 || 
                          item.expires_in_seconds === 0 || 
                          (item.expiracion && new Date(item.expiracion).getTime() <= Date.now())
                        );

                        return (
                          <li key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>{item.email}</div>
                              <div style={{ 
                                fontSize: '0.75rem', 
                                color: isExpired ? '#ef4444' : item.status === 'Accepted' ? '#16a34a' : '#b45309',
                                marginBottom: '6px'
                              }}>
                                {isExpired ? 'Solicitud expirada' : item.status === 'Accepted' ? 'Lista para asignar nueva clave' : 'Enviado al correo'}
                              </div>
                              {item.expiracion && (
                                <DateTag 
                                  date={item.expiracion} 
                                  bgColor={isExpired ? '#fef2f2' : item.status === 'Accepted' ? '#f0fdf4' : '#fffbeb'} 
                                  textColor={isExpired ? '#991b1b' : item.status === 'Accepted' ? '#166534' : '#92400e'} 
                                />
                              )}
                            </div>
                            <Button
                              onClick={() => handleContinuePending(item)}
                              color={isExpired ? 'inherit' : item.status === 'Accepted' ? 'var(--button-green)' : 'primary'}
                              size="small"
                              style={{ fontSize: '0.75rem', padding: '4px 10px', minWidth: 'auto' }}
                              disabled={isExpired}
                            >
                              Continuar
                            </Button>
                          </li>
                        );
                      })}
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
                  description="A continuación ingrese la nueva clave, esta debe tener al menos 6 caracteres, puede cerrar el panel, pero tras 15 minutos expirará la solicitud."
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
                    slotProps={{
                      input: {
                        endAdornment: (
                          <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            {showPass ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                          </button>
                        )
                      }
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
  );
}
