import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styles from "./LoginForm.module.css";
import { HelpCircle } from 'lucide-react';
import { handleLoginSubmit } from './utils';
import Frame from '../screens/components/Frame/Index';
import TextField from '../screens/components/Material-UI/Components/TextField/Index';
import Button from '../screens/components/Button/index';
import ModalTooltip from '../ModalTooltip/ModalTooltip';
import { getCodeRecovery, sendCodeRecovery } from '../../services/api';
import CountdownBar from '../screens/components/CountdownBar';
import { useCountdown } from '../screens/components/CountdownBar/utils';
import { TEXTS } from './constants';

function LoginForm() {
    const { register, handleSubmit, getValues, watch, setValue } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [mode, setMode] = useState('login'); // 'login' | 'request_email' | 'code_entry' | 'password_sent'

    const [countdownActive, setCountdownActive] = useState(false);
    const [countdownDuration, setCountdownDuration] = useState(0);

    const timerState = useCountdown(
        countdownActive,
        countdownDuration,
        () => {
            setCountdownActive(false);
            setApiError(null);
        }
    );

    const onSubmit = async (data) => {
        if (mode === 'request_email') {
            setLoading(true);
            setApiError(null);
            try {
                await getCodeRecovery(data.recoveryEmail);
                setValue('code', '');
                setMode('code_entry');
            } catch (error) {
                setApiError(error.message || TEXTS.defaultRequestEmailError);
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
                setApiError(error.message || TEXTS.defaultVerifyCodeError);
            } finally {
                setLoading(false);
            }
            return;
        }

        handleLoginSubmit({
            data,
            setApiError,
            setLoading,
            navigate,
            setCountdownActive,
            setCountdownDuration
        });
    };

    const remainingTime = timerState.remainingSeconds > 0 ? ` ${Math.ceil(timerState.remainingSeconds)}s` : '';
    const errorText = apiError
        ? (typeof apiError === 'object'
            ? `${apiError.message}${remainingTime}`
            : apiError)
        : null;

    if (mode === 'password_sent') {
        return (
            <Frame 
                title={TEXTS.sentTitle} 
                content={TEXTS.sentContent}
                error={errorText}
            >
                <div className={styles.actionGroup}>
                    <Button 
                        onClick={() => {
                            setMode('login');
                            setApiError(null);
                        }} 
                        borderColor={"var(--border-gray-low)"}
                        fullWidth
                    >
                        {TEXTS.sentBack}
                    </Button>
                </div>
            </Frame>
        );
    }

    if (mode === 'request_email') {
        return (
            <Frame title={TEXTS.recoveryTitle} 
            icon={
                <ModalTooltip text={TEXTS.recoveryTooltip}>
                    <HelpCircle size={20} style={{ cursor: 'help' }} />
                </ModalTooltip>
            }   
            content={TEXTS.recoveryContent}
            error={errorText}>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <TextField
                        key="recoveryEmail"
                        id="recoveryEmail"
                        label={TEXTS.recoveryEmailLabel}
                        type="text"
                        placeholder={TEXTS.recoveryEmailPlaceholder}
                        {...register("recoveryEmail", { required: true })}
                    />
                    <div className={styles.actionGroup} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                        <Button type="submit" variant="primary" disabled={loading} fullWidth>
                            {TEXTS.recoverySubmit}
                        </Button>
                        <Button 
                            onClick={() => {
                                setMode('login');
                                setApiError(null);
                            }} 
                            borderColor={"var(--border-gray-low)"}
                            fullWidth
                        >
                            {TEXTS.backButton}
                        </Button>
                    </div>
                </form>
            </Frame>
        );
    }

    if (mode === 'code_entry') {
        return (
            <Frame 
                title={TEXTS.verifyTitle} 
                content={TEXTS.verifyContent}
                error={errorText}
            >
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <TextField
                        key="code"
                        id="code"
                        label={TEXTS.verifyCodeLabel}
                        type="text"
                        placeholder={TEXTS.verifyCodePlaceholder}
                        {...register("code", { required: true })}
                    />
                    <div className={styles.actionGroup} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                        <Button type="submit" variant="primary" disabled={loading} fullWidth>
                            {TEXTS.verifySubmit}
                        </Button>
                        <Button 
                            onClick={() => {
                                setMode('login');
                                setApiError(null);
                            }} 
                            borderColor={"var(--border-gray-low)"}
                            fullWidth
                        >
                            {TEXTS.backButton}
                        </Button>
                    </div>
                </form>
            </Frame>
        );
    }

    const frameError = countdownActive ? null : errorText;

    return (
        <Frame
            title={TEXTS.title}
            error={frameError}
        >
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                {countdownActive && (
                    <CountdownBar 
                        active={countdownActive} 
                        duration={countdownDuration}
                        isOverlay={true}
                        overlayMessage={errorText}
                        onComplete={() => {
                            setCountdownActive(false);
                            setApiError(null);
                        }}
                    />
                )}
                <TextField
                    id="email"
                    label={TEXTS.emailLabel}
                    type="text"
                    placeholder={TEXTS.emailPlaceholder}
                    autoComplete="off"
                    required
                    requiredColor="red"
                    {...register("email", { required: true })}
                />
                
                <TextField
                    id="password"
                    label={TEXTS.passwordLabel}
                    type="password"
                    placeholder=""
                    autoComplete="new-password"
                    required
                    requiredColor="red"
                    {...register("password", { required: true })}
                />

                <div className={styles.actionGroup} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading || countdownActive} fullWidth>
                        {TEXTS.submitButton}

                    </Button>
                    <Button 
                        onClick={() => {
                            setMode('request_email');
                            setApiError(null);
                        }}
                        disabled={loading || countdownActive}
                        borderColor={"var(--border-gray-low)"}
                        fullWidth
                    >
                        {TEXTS.recoverPasswordButton} 
                    </Button>
                </div>
            </form>
        </Frame>
    );
}

export default LoginForm;