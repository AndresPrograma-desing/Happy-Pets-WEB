import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styles from "./LoginForm.module.css";
import CustomSelect from '../UI/DesplegableSelector/CustomSelect';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import { handleLoginSubmit } from './utils';
import Frame from '../screens/components/Frame/Index';
import TextField from '../screens/components/Material-UI/Components/TextField/Index';
import Button from '../screens/components/Button/index';
import Selector from '../screens/components/Material-UI/Components/Selector/Index';
import { getCodeRecovery, sendCodeRecovery } from '../../services/api';

function LoginForm() {
    const { register, handleSubmit, getValues, watch, setValue } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [rol, setRol] = useState('admin');
    const [mode, setMode] = useState('login'); // 'login' | 'request_email' | 'code_entry' | 'password_sent'

    const roleOptions = [
        { value: 'admin', label: 'Administrador', icon: getIcon('adminRole') },
        { value: 'doctor', label: 'Doctor', icon: getIcon('doctorRole') },
        { value: 'secretaria', label: 'Secretaria', icon: getIcon('secretariaRole') },
    ];



    const onSubmit = async (data) => {
        if (mode === 'request_email') {
            setLoading(true);
            setApiError(null);
            try {
                await getCodeRecovery(data.recoveryEmail);
                setValue('code', '');
                setMode('code_entry');
            } catch (error) {
                setApiError(error.message || 'Error al solicitar el código.');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (mode === 'code_entry') {
            setLoading(true);
            setApiError(null);
            try {
                await sendCodeRecovery(data.code);
                setMode('password_sent');
            } catch (error) {
                setApiError(error.message || 'Código inválido o error al verificar.');
            } finally {
                setLoading(false);
            }
            return;
        }

        handleLoginSubmit({
            data,
            rol,
            setApiError,
            setLoading,
            navigate
        });
    };

    if (mode === 'password_sent') {
        return (
            <Frame title="Contraseña Enviada" error={apiError}>
                <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: '#333' }}>
                    Se ha enviado una nueva contraseña a tu correo electrónico.
                </p>
                <div className={styles.actionGroup}>
                    <Button 
                        onClick={() => {
                            setMode('login');
                            setApiError(null);
                        }} 
                        variant="secondary"
                        fullWidth
                    >
                        Volver al Login
                    </Button>
                </div>
            </Frame>
        );
    }

    if (mode === 'request_email') {
        return (
            <Frame title="Recuperar Contraseña" error={apiError}>
                <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: '#333' }}>
                    Ingresa tu correo para recibir un código de recuperación.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <TextField
                        key="recoveryEmail"
                        id="recoveryEmail"
                        label="Correo electrónico"
                        type="text"
                        placeholder="Ingresa tu correo electrónico"
                        {...register("recoveryEmail", { required: true })}
                    />
                    <div className={styles.actionGroup} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                        <Button type="submit" variant="primary" disabled={loading} fullWidth>
                            Solicitar código
                        </Button>
                        <Button 
                            onClick={() => {
                                setMode('login');
                                setApiError(null);
                            }} 
                            variant="secondary"
                            disabled={loading}
                            fullWidth
                        >
                            Volver
                        </Button>
                    </div>
                </form>
            </Frame>
        );
    }

    if (mode === 'code_entry') {
        return (
            <Frame title="Verificar Código" error={apiError}>
                <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: '#333' }}>
                    Ingresa el código que hemos enviado a tu correo.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <TextField
                        key="code"
                        id="code"
                        label="Código de verificación"
                        type="text"
                        placeholder="Ingresa el código"
                        {...register("code", { required: true })}
                    />
                    <div className={styles.actionGroup} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                        <Button type="submit" variant="primary" disabled={loading} fullWidth>
                            Verificar y enviar clave
                        </Button>
                        <Button 
                            onClick={() => {
                                setMode('login');
                                setApiError(null);
                            }} 
                            variant=""
                            disabled={loading}
                            fullWidth
                        >
                            Volver
                        </Button>
                    </div>
                </form>
            </Frame>
        );
    }

    return (
        <Frame title="Iniciar Session" error={apiError}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <TextField
                    id="email"
                    label="Correo"
                    type="text"
                    placeholder="tu@email"
                    autoComplete="off"
                    {...register("email", { required: true })}
                />
                
                <TextField
                    id="password"
                    label="Contraseña"
                    type="password"
                    placeholder=""
                    autoComplete="new-password"
                    {...register("password", { required: true })}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000000' }}>Rol</label>
                    <div className={styles.customSelectWrapper}>
                        <Selector 
                            options={roleOptions}
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                            placeholder="Seleccione un rol"
                            showSearch={false}
                            searchPlaceholder="Busca un rol"
                        />
                    </div>
                </div>
                
                <div className={styles.actionGroup} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    <Button type="submit" variant="primary" disabled={loading} fullWidth>
                        Ingresar
                    </Button>
                    <Button 
                        onClick={() => {
                            setMode('request_email');
                            setApiError(null);
                        }}
                        variant="secondary"
                        disabled={loading}
                        fullWidth
                    >
                        Recuperar contraseña
                    </Button>
                </div>
            </form>
        </Frame>
    );
}

export default LoginForm;