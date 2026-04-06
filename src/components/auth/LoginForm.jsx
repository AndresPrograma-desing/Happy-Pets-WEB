import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Select, { components as Components } from 'react-select';
import { login } from '../../services/api';
import { applyServerErrorsToForm } from '../../utils/apiErrors';
import styles  from "./LoginForm.module.css";
import { playLoginSound } from '../../utils/songHelper';


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

    const [rol, setRol] = useState('admin'); // Valor por defecto para el rol en el formulario de login

    const roleOptions = [
        { value: 'doctor', label: 'Doctor' },
        { value: 'admin', label: 'Administrador' },
        { value: 'secretaria', label: 'Secretaria' },
    ];
 
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
                    <h2 className={styles.headerTitle}>Accede a tu cuenta</h2>
                </div>

                {apiError && <p className={styles.error}>{apiError}</p>}

                <div>
                    <label htmlFor="email">Correo</label>
                    <input
                        id="email"
                        {...register("email", {
                            required: "Se requiere correo",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Correo invalido",
                            },
                        })}
                    />
                    {errors.email && <p className={styles.error}>{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="password">Contraseña</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                                    <path d="m2 2 20 20" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <p className={styles.error}>{errors.password.message}</p>}
                </div>

                <div className={styles.roleWrapper}>
                    <label htmlFor="role" className={styles.roleLabel}>Rol</label>
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
                        components={{ DropdownIndicator }}
                    />
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.primary} disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;