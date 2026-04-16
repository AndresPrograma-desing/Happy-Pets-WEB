import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Select, { components as Components } from 'react-select';
import { login } from '../../services/api';
import { applyServerErrorsToForm } from '../../utils/apiErrors';
import styles  from "./LoginForm.module.css";
import { playLoginSound } from '../../utils/songHelper';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import LoginInfo from '../LoginInfo/LoginInfo';


function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const [rol, setRol] = useState('admin'); // Valor por defecto para el rol en el formulario de login

    const roleOptions = [
        { value: 'doctor', label: 'Doctor', icon: getIcon('doctorRole') },
        { value: 'admin', label: 'Administrador', icon: getIcon('adminRole') },
        { value: 'secretaria', label: 'Secretaria', icon: getIcon('secretariaRole') },
    ];
    // Custom Option for react-select to show icon and label
    const RoleOption = (props) => (
        <Components.Option {...props}>
            <img
                src={props.data.icon}
                alt={props.data.label}
                className={styles.roleIcon}
            />
            {props.data.label}
        </Components.Option>
    );
 
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            border: '1px solid rgba(226,228,232,0.6)',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none',
            minHeight: '40px'
        }),
        singleValue: (provided) => ({ ...provided, color: '#ffffff' }),
        menu: (provided) => ({ ...provided, borderRadius: 8, overflow: 'hidden' }),
        option: (provided, state) => ({
            ...provided,
            background: state.isFocused ? '#2563eb' : 'transparent',
            color: '#000000',
            cursor: 'pointer'
        }),
        placeholder: (provided) => ({ ...provided, color: '#0052b7' }),
    };

    // Custom dropdown indicator that rotates when menu is open
    const DropdownIndicator = (props) => {
        return (
            <Components.DropdownIndicator {...props}>
                <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    aria-hidden="true"
                    className={props.selectProps && props.selectProps.menuIsOpen ? styles.indicatorRotated : styles.indicator}
                >
                    <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Components.DropdownIndicator>
        );
    };

    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
        setApiError(null);
        setLoading(true);
        try {
            const payload = { email: data.email, password: data.password, rol, role: rol };
            console.debug('Login payload:', payload);
            const resp = await login(payload);

            // Detectar rol en varias formas de respuesta del backend
            const serverRole =
                resp?.user?.rol ||
                resp?.user?.role ||
                resp?.data?.user?.rol ||
                resp?.data?.user?.role ||
                resp?.data?.rol ||
                resp?.data?.role ||
                resp?.result?.rol ||
                resp?.result?.role ||
                resp?.rol ||
                resp?.role ||
                '';

            const finalRole = String((serverRole || rol || '').toString()).toLowerCase();

            // Reproducir sonido antes de navegar
            playLoginSound();

            // Redirigir según rol (incluir secretaria hacia el panel correspondiente)
            if (finalRole.includes('doctor')) {
                navigate('/doctor');
            } else if (finalRole.includes('admin') || finalRole.includes('administr')) {
                navigate('/AdminSystem');
            } else if (finalRole.includes('secret') || finalRole.includes('secretar') || finalRole.includes('recep')) {
                navigate('/SecretariaSystem');
            } else {
                navigate('/inicio');
            }
        } catch (err) {
            // Intentamos mapear errores por campo al formulario
            const { applied, general } = applyServerErrorsToForm(err, { setError, clearErrors });
            if (applied) {
                setApiError(general && general.length ? general.join('\n') : 'Corrige los errores del formulario');
            } else {
                // Si no hay errores por campo mostramos mensaje general
                const serverMsg = err.body?.message || err.message || '';
                const isForbidden = err.status === 403 || /forbidden/i.test(serverMsg);
                if (isForbidden) {
                    setApiError('Rol invalido para el usuario');
                } else {
                    const isAuthError = err.status === 401 || /unauthoriz/i.test(serverMsg);
                    setApiError(isAuthError ? 'Datos invalidos' : (serverMsg || 'Datos invalidos'));
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.header}>
                    <h2 className={styles.headerTitle}>
                        <span className={styles.iconBubble}>
                            <img src={getIcon('user')} alt="Veterinaria" className={styles.headerIcon} />
                        </span>
                        Accede a tu cuenta</h2>
                </div>

                {apiError && <p className={styles.error}>{apiError}</p>}

                <div>
                    <label htmlFor="email">
                        <img src={getIcon('mailOpen')} alt="Correo" className={styles.emailIcon} />
                        Correo</label>
                    <input
                        id="email"
                        placeholder="Ejemplo: correo@email.com"
                        {...register("email", {
                            required: "Se requiere correo",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Correo invalido",
                            },
                        })}
                    />
                    {errors.email && <p className={styles.error}>
                        <img src={getIcon('warning')} alt="Error" className={styles.warningIcon} />
                        {errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="password">
                        <img src={getIcon('userKey')} alt="Contraseña" className={styles.userKeyIcon} />
                        Contraseña</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Ingresa tu contraseña (>8)"
                            {...register("password", {
                                required: "Se requiere contraseña",
                                minLength: {
                                    value: 6,
                                    message: "La longitud mínima es de 6 caracteres",
                                },
                            })}
                        />
                        <button
                            type="button"
                            aria-pressed={showPassword}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            className={styles.toggleButton}
                            onClick={() => setShowPassword(s => !s)}
                        >
                            {showPassword ? (
                                <div className={styles.eyeOffIconWrapper}>
                                    <img src={getIcon('eyeOff')} alt="Ocultar contraseña" className={styles.eyeOffIcon} />
                                </div>
                            ) : (
                                <div className={styles.eyeIconWrapper}>
                                    <img src={getIcon('eye')} alt="Mostrar contraseña" className={styles.eyeIcon} />
                                </div>
                            )}
                        </button>
                    </div>
                    {errors.password && <p className={styles.error}>{errors.password.message}</p>}
                </div>

                <div className={styles.roleWrapper}>
                    <label htmlFor="role" className={styles.roleLabel}>
                        <img src={getIcon('userRole')} alt="Rol" className={styles.userRole} />
                        Rol</label>
                    <Select
                        inputId="role"
                        instanceId="role-select"
                        classNamePrefix="react-select"
                        options={roleOptions}
                        value={roleOptions.find(o => o.value === rol)}
                        onChange={(opt) => setRol(opt.value)}
                        styles={selectStyles}
                        menuPlacement="auto"
                        aria-label="Selecciona rol"
                        components={{ DropdownIndicator, Option: RoleOption }}
                    />
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.primary} disabled={loading}>{loading ? (
                        <span className={styles.btnLoader}>
                        <img src={getIcon('loader')} alt="Cargando" className={styles.loaderIcon}  />
                        Ingresando...
                        </span>
                    ) : (
                        <span className={styles.btnContent}>
                        <img src={getIcon('enter')} alt="Ingresar" className={styles.enterIcon}  />
                        Ingresar
                        </span>
                    )}

                    </button>
                </div>
                <div className={styles.helpButtonRow}>
                    <button
                        type="button"
                        className={styles.helpButton}
                        onClick={() => setShowHelpModal(true)}
                        aria-label="Ayuda"
                    >
                        <img src={getIcon('help')} alt="Ayuda" className={styles.helpIcon} />
                        Ayuda
                    </button>
                </div>
            </form>

            {showHelpModal && (
                <div className={styles.modalOverlay} role="presentation" onClick={() => setShowHelpModal(false)}>
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="login-help-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className={styles.modalClose}
                            aria-label="Cerrar ayuda"
                            onClick={() => setShowHelpModal(false)}
                            
                        > 
                        

                            <span className={styles.closeIconWrapper}>
                                <img src={getIcon('x')} alt="Cerrar" className={styles.closeIcon} />
                            </span>
                        </button>
                        <LoginInfo className={styles.helpContent} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginForm;