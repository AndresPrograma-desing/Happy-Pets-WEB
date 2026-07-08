import React, { useState, useEffect } from 'react';
import { Mail, Shield, ShieldCheck, Key, Globe, Link, Loader2 } from 'lucide-react';
import { resendData } from '../../../../../services/api/emails';
import { FormCard, FormInput } from '../../../../../components/screens/components/FormControls';
import { getText } from '../../../../../constants';
import Loading from '../../../../../components/screens/components/Loading/Index';

export default function SettingResend() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await resendData();
        const item = res?.data ?? res;
        setData(item);
      } catch (err) {
        console.error(err);
        setError(err?.message || getText('resendConfig.errorLoading'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {  
    return (
      <Loading size="large" />
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', color: '#ef4444' }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '1rem', color: '#64748b' }}>
        <p>{getText('resendConfig.noData')}</p>
      </div>
    );
  }

  return (
    <FormCard 
      icon={Shield} 
      title={getText('resendConfig.cardTitle')}
      headerActions={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
          backgroundColor: data.active ? '#dcfce7' : '#fee2e2',
          color: data.active ? '#166534' : '#991b1b'
        }}>
          <ShieldCheck size={14} />
          <span>{data.active ? getText('resendConfig.active') : getText('resendConfig.inactive')}</span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <FormInput 
          label={getText('resendConfig.clientEmail')} 
          icon={Mail} 
          value={data.clientEmail || ''} 
          readOnly 
        />
        <FormInput 
          label={getText('resendConfig.apiKey')} 
          icon={Key} 
          type="password" 
          value={data.apiKey || ''} 
          readOnly 
        />
        <FormInput 
          label={getText('resendConfig.urlResend')} 
          icon={Globe} 
          value={data.urlResend || ''} 
          readOnly 
        />
        <FormInput 
          label={getText('resendConfig.apiUrl')} 
          icon={Link} 
          value={data.apiUrl || ''} 
          readOnly 
        />
      </div>
    </FormCard>
  );
}
