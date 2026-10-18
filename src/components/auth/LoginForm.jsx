import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContextHubLoginFrame from './components/ContextHubLoginFrame';
import { handleContextHubLoginSuccess } from './utils';
import { TEXTS } from './constants';
import styles from './LoginForm.module.css';

const CONTEXTHUB_ERROR_MESSAGES = {
    invalid_credentials: 'Correo o contraseña incorrectos.',
    rate_limited: 'Demasiados intentos. Intenta nuevamente en unos minutos.',
    client_not_found: 'El formulario de acceso no está disponible. Contacta al administrador.',
    missing_config: 'El formulario de acceso no está configurado correctamente.',
    sdk_load_failed: TEXTS.contextHubLoadError,
};

function LoginForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const handleSuccess = ({ ticket }) => {
        handleContextHubLoginSuccess({ ticket, setApiError, setLoading, navigate });
    };

    const handleError = (err) => {
        setApiError(CONTEXTHUB_ERROR_MESSAGES[err?.error] || TEXTS.defaultConnectionError);
    };

    return (
        <div className={styles.wrapper}>
            {!loading && apiError && <p className={styles.errorMessage}>{apiError}</p>}
            <ContextHubLoginFrame onSuccess={handleSuccess} onError={handleError} isLoading={loading} />
        </div>
    );
}

export default LoginForm;
