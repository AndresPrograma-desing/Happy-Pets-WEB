import React, { useState, useEffect } from 'react';
import useChangePassword from '../../hooks/changePassword';
import style from './newPassword.module.css';
import { Lock, EyeOff, Eye, Loader2, Check, AlertCircle, Mail } from 'lucide-react';
import ModalTooltip from '../ModalTooltip/ModalTooltip';


const ChangePasswordForm = ({ userEmail }) => {
    const { changePassword, loading, error, success } = useChangePassword();
    
    const [formData, setFormData] = useState({
        email: userEmail || '',
        lastPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPass, setShowPass] = useState(false);
    const [localError, setLocalError] = useState(null);

    // Limpiar errores locales cuando el usuario escribe
    useEffect(() => {
        if (localError) setLocalError(null);
    }, [formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación básica de cliente antes de ir al servidor
        if (formData.newPassword !== formData.confirmPassword) {
            setLocalError("Las contraseñas nuevas no coinciden");
            return;
        }

        await changePassword(formData.email, formData.lastPassword, formData.newPassword);
    };

    // Priorizar el error del backend sobre el local
    const displayError = error || localError;

    return (
        <div className={style.container}>
            <form className={style.form} onSubmit={handleSubmit} noValidate>
                <header className={style.header}>
                    <div className={style.iconCircle}>
                        <Lock size={24} />
                    </div>
                    <h2>Seguridad de la Cuenta</h2>
                    <p>Actualiza tu contraseña para mantener tu cuenta segura.</p>
                </header>

                <div className={style.body}>
                    {/* Input Email */}
                    <div className={style.inputGroup}>
                        <label>Correo Electrónico</label>
                        <div className={style.inputWrapper}>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="usuario@correo.com"
                                disabled={loading || !!userEmail} // Bloqueado si ya viene por prop
                                className={userEmail ? style.disabledInput : ''}
                            />
                        </div>
                    </div>

            
                    <div className={style.inputGroup}>
                        <label>Contraseña Actual</label>
                        <div className={style.inputWrapper}>
                            <input
                                type={showPass ? "text" : "password"}
                                name="lastPassword"
                                value={formData.lastPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <hr className={style.divider} />

                    {/* Nueva Password */}
                    <div className={style.inputGroup}>
                        <label>Nueva Contraseña</label>
                        <div className={style.inputWrapper}>
                            <input
                                type={showPass ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                disabled={loading}
                            />
                            <button 
                                type="button" 
                                className={style.eyeBtn}
                                onClick={() => setShowPass(!showPass)}
                                tabIndex="-1"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar Nueva Password */}
                    <div className={style.inputGroup}>
                        <label>Confirmar Nueva Contraseña</label>
                        <div className={style.inputWrapper}>
                            <input
                                type={showPass ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repite la nueva contraseña"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Mensajes de Feedback con Animación */}
                <div className={style.feedbackArea}>
                    {displayError && (
                        <div className={`${style.message} ${style.error}`}>
                            <AlertCircle size={18} />
                            <span>{displayError}</span>
                        </div>
                    )}
                    
                    {success && (
                        <div className={`${style.message} ${style.success}`}>
                            <Check size={18} />
                            <span>¡Contraseña actualizada correctamente!</span>
                        </div>
                    )}
                </div>

                <footer className={style.footer}>
                    <button 
                        type="submit" 
                        className={style.submitBtn} 
                        disabled={loading || !formData.lastPassword || !formData.newPassword}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Verificando...</span>
                            </>
                        ) : (
                            "Guardar Cambios"
                        )}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default ChangePasswordForm;