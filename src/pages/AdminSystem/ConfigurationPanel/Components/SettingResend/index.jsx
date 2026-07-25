import React, { useState, useEffect } from 'react';
import { Mail, Shield, ShieldCheck, Key, Globe, Link, Eye, EyeOff } from 'lucide-react';
import { resendData, updateResendData } from '../../../../../services/api/emails';
import { FormCard, FormInput } from '../../../../../components/screens/components/FormControls';
import { getText } from '../../../../../constants';
import Loading from '../../../../../components/screens/components/Loading/Index';
import CountdownBar from '../../../../../components/screens/components/CountdownBar';
import styles from './index.module.css';
import { TEXTS } from './constants';

export default function SettingResend({ onClose, onSaveStart, onSaveEnd }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [clientEmail, setClientEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [urlResend, setUrlResend] = useState('');
  const [active, setActive] = useState(false);

  const [showApiKey, setShowApiKey] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await resendData();
        const item = res?.data ?? res;
        if (item) {
          setData(item);
          setClientEmail(item.clientEmail || '');
          setApiKey(item.apiKey || '');
          setApiUrl(item.apiUrl || '');
          setUrlResend(item.urlResend || '');
          setActive(!!item.active);
        }
      } catch (err) {
        console.error(err);
        setError(err?.message || getText('resendConfig.errorLoading'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleToggleShowApiKey = () => {
    if (showApiKey) {
      handleHideApiKey();
    } else {
      setShowApiKey(true);
      setCountdownActive(true);
    }
  };

  const handleHideApiKey = () => {
    setShowApiKey(false);
    setCountdownActive(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    if (onSaveStart) onSaveStart();
    setSuccessMsg('');
    setError(null);
    try {
      let derivedUrlResend = '';
      try {
        if (apiUrl) {
          derivedUrlResend = new URL(apiUrl).origin;
        }
      } catch (e) {
        // fallback
      }

      const payload = {
        clientEmail,
        apiKey,
        apiUrl,
        urlResend: derivedUrlResend,
        active: apiKey && apiKey !== ''
      };

      const res = await updateResendData(payload);
      setSuccessMsg(res?.message || TEXTS.successSave);
      setActive(payload.active);
      setUrlResend(payload.urlResend);

      setTimeout(() => {
        setSuccessMsg('');
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err?.message || TEXTS.errorSave);
    } finally {
      setSaving(false);
      if (onSaveEnd) onSaveEnd();
    }
  };

  if (loading) {  
    return <Loading size="large" />;
  }

  if (error && !data) {
    return (
      <div className={styles.alertContainer + ' ' + styles.errorAlert}>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.alertContainer}>
        <p>{getText('resendConfig.noData')}</p>
      </div>
    );
  }

  return (
    <form id="resend-settings-form" onSubmit={handleSave}>
      <FormCard 
        icon={Shield} 
        title={getText('resendConfig.cardTitle')}
        headerActions={
          <div className={styles.cardHeaderActions + ' ' + (active ? styles.activeBadge : styles.inactiveBadge)}>
            <ShieldCheck size={14} />
            <span>{active ? getText('resendConfig.active') : getText('resendConfig.inactive')}</span>
          </div>
        }
      >
        <div className={styles.formContainer}>
          <FormInput 
            label={getText('resendConfig.clientEmail')} 
            icon={Mail} 
            value={clientEmail} 
            onChange={(e) => setClientEmail(e.target.value)}
          />
          
          <div>
            <div style={{ position: 'relative' }}>
              <FormInput 
                label={getText('resendConfig.apiKey')} 
                icon={Key} 
                type={showApiKey ? 'text' : 'password'} 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <button 
                        type="button" 
                        onClick={handleToggleShowApiKey} 
                        tabIndex={-1} 
                        style={{ 
                          position: 'absolute', 
                          right: '10px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center',
                          padding: 0,
                          zIndex: 10
                        }}
                      >
                        {showApiKey ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                      </button>
                    )
                  }
                }}
              />
            </div>
            <CountdownBar 
              active={countdownActive} 
              duration={10000} 
              //props por si se necesitan
              // height='600'
              // width=''
              // colors={['#6366f1', '#6366f1', '#6366f1']}
              onComplete={handleHideApiKey} 
            />
          </div>

          <FormInput 
            label={getText('resendConfig.urlResend')} 
            icon={Globe} 
            value={urlResend} 
            readOnly 
          />

          <FormInput 
            label={getText('resendConfig.apiUrl')} 
            icon={Link} 
            value={apiUrl} 
            onChange={(e) => setApiUrl(e.target.value)}
          />

          {successMsg && (
            <div className={styles.alertContainer + ' ' + styles.successAlert}>
              {successMsg}
            </div>
          )}

          {error && (
            <div className={styles.alertContainer + ' ' + styles.errorAlert}>
              {error}
            </div>
          )}
        </div>
      </FormCard>
    </form>
  );
}
