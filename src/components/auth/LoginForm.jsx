import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styles from "./LoginForm.module.css";
import CustomSelect from '../UI/DesplegableSelector/CustomSelect';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import { handleLoginSubmit } from './utils';

function LoginForm() {
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [rol, setRol] = useState('admin');

    const roleOptions = [
        { id: 'admin', name: <div className={styles.roleOption}><img src={getIcon('adminRole')} className={styles.roleIcon} alt=""/> Administrador</div> },
        { id: 'doctor', name: <div className={styles.roleOption}><img src={getIcon('doctorRole')} className={styles.roleIcon} alt=""/> Doctor</div> },
        { id: 'secretaria', name: <div className={styles.roleOption}><img src={getIcon('secretariaRole')} className={styles.roleIcon} alt=""/> Secretaria</div> },
    ];

    const onSubmit = (data) => {
        handleLoginSubmit({
            data,
            rol,
            setApiError,
            setLoading,
            navigate
        });
    };

    return (
        <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Iniciar Session</h3>
            
            {apiError && <p className={styles.errorMessage}>{apiError}</p>}
            
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.label}>Correo</label>
                    <input
                        id="email"
                        type="text"
                        placeholder="iangel@kortech.dev"
                        className={styles.input}
                        {...register("email", { required: true })}
                    />
                </div>
                
                <div className={styles.inputGroup}>
                    <label htmlFor="password" className={styles.label}>Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className={styles.input}
                        {...register("password", { required: true })}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Rol</label>
                    <div className={styles.customSelectWrapper}>
                        <CustomSelect 
                            options={roleOptions}
                            value={rol}
                            onChange={(val) => setRol(val)}
                        />
                    </div>
                </div>
                
                <div className={styles.actionGroup}>
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        Ingresar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;