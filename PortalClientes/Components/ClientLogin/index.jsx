import React, { useState } from 'react';
import { Frame, Input, Button, Barnner } from 'anteriority-ui';
import styles from './index.module.css';
import { TEXT_PORTAL } from '../../Constants';
import api from '../../../src/services/api/index';
import { setClientSession } from '../../../src/services/api/storage';

import { Badge } from 'anteriority-ui';

export default function ClientLogin({ onLoginSuccess }) {
  const T = TEXT_PORTAL.login;

  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await api.requestClientLoginCode(identifier.trim());
      setInfo(T.codeSentMessage);
      setStep('verify');
    } catch (err) {
      setError(err?.message || T.genericError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const resp = await api.verifyClientLoginCode(code.trim());
      if (!resp?.token) throw new Error(T.invalidCodeError);
      setClientSession(resp.token, resp.client);
      onLoginSuccess(resp.client);
    } catch (err) {
      setError(err?.message || T.invalidCodeError);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeIdentifier = () => {
    setError('');
    setInfo('');
    setCode('');
    setStep('request');
  };

  return (
    <div className={styles.wrapper}>
      <Frame title={step === 'request' ? T.requestTitle : T.verifyTitle}>
        <div className={styles.messageStack}>
          {error && <Barnner type="danger">{error}</Barnner>}
          {info && <Barnner type="success">{info}</Barnner>}
        </div>

        {step === 'request' && (
          <form className={styles.form} onSubmit={handleRequestCode}>
            <Badge className={styles.helpText}>{T.requestAccessHelp}</Badge>
            <Input
              label={T.identifierLabel}
              placeholder={T.identifierPlaceholder}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Button type="submit" variant={Button.VARIANTS.PRIMARY} loading={loading} fullWidth>
              {loading ? T.requestingAccess : T.requestAccessButton}
            </Button>
          </form>
        )}

        {step === 'verify' && (
          <form className={styles.form} onSubmit={handleVerifyCode}>
            <Input
              label={T.codeLabel}
              placeholder={T.codePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button type="submit" variant={Button.VARIANTS.PRIMARY} loading={loading} fullWidth>
              {loading ? T.verifying : T.verifyButton}
            </Button>
            <Button type="button" variant={Button.VARIANTS.GHOST} fullWidth onClick={handleChangeIdentifier}>
              {T.changeIdentifier}
            </Button>
          </form>
        )}
      </Frame>
    </div>
  );
}
