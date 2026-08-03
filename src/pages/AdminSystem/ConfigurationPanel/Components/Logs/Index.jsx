import React, { useState, useEffect } from 'react';
import { ShieldAlert, FileText, Lock, CheckCircle2 } from 'lucide-react';
import Container from '../../../../../components/screens/components/Container/index';
import Frame from '../../../../../components/screens/components/Frame/Index';
import DesplegablePanel from '../../../../../components/screens/components/DesplegablePanel/index';
import Input from '../../../../../components/screens/components/Input/Index';
import Button from '../../../../../components/screens/components/Button/index';
import Loading from '../../../../../components/screens/components/Loading/Index';
import { getLogs } from '../../../../../services/api/index';
import { TEXTS } from './constants';
import { verifyPassword, formatDate, formatJsonData, getLogsActionColor } from './utils';
import styles from './Index.module.css';

export default function SystemLogs() {
  // Estado de autorización usando sessionStorage para retener el acceso durante la sesión actual
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('sys_logs_auth') === 'true';
  });
  
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Carga de logs desde el servicio centralizado de la API
  const fetchLogsData = async (targetPage) => {
    setLoading(true);
    setError(null);
    try {
      const pageSize = 10;
      const data = await getLogs(targetPage, pageSize);
      if (Array.isArray(data)) {
        setLogs(data);
        // Si recibimos el tamaño máximo de página, asumimos que puede haber una página siguiente
        if (data.length === pageSize) {
          setPageCount((prev) => Math.max(prev, targetPage + 1));
        } else {
          setPageCount((prev) => Math.max(prev, targetPage));
        }
      } else {
        setLogs([]);
      }
    } catch (err) {
      setError(err?.message || TEXTS.incorrectPassword);
    } finally {
      setLoading(false);
    }
  };

  // Cargar logs al autorizar o al cambiar la página
  useEffect(() => {
    if (isAuthorized) {
      fetchLogsData(page);
    }
  }, [isAuthorized, page]);

  // Manejador para el formulario de clave
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');

    const isValid = verifyPassword(passwordInput, TEXTS.dummyPassword);
    if (isValid) {
      setIsAuthorized(true);
      sessionStorage.setItem('sys_logs_auth', 'true');
    } else {
      setPasswordError(TEXTS.incorrectPassword);
    }
  };

  // Manejador del cambio de página
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    setExpandedLogId(null); // Colapsar todos los paneles al cambiar de página
  };

  // Manejador de toggling para los paneles desplegables
  const handleToggleLog = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  // Vista de Login/Acceso de Clave
  if (!isAuthorized) {
    const passwordForm = (
      <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
        <Input
          id="sys-logs-pwd"
          label={TEXTS.passwordPlaceholder}
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          required
          autoFocus
          error={!!passwordError}
          helperText={passwordError}
        />
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          icon={Lock}
        >
          {TEXTS.submitButton}
        </Button>
      </form>
    );

    return (
      <div className={styles.passwordScreen}>
        <div className={styles.passwordFrame}>
          <Frame
            title={TEXTS.passwordPromptTitle}
            content={TEXTS.passwordPromptDesc}
            icon={<ShieldAlert size={40} color="#f59e0b" />}
          >
            {passwordForm}
          </Frame>
        </div>
      </div>
    );
  }

  // Vista del listado de Logs
  return (
    <div className={styles.logsWrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>{TEXTS.title}</h1>
        <p className={styles.description}>{TEXTS.description}</p>
      </div>

      <Container
        showPagination={true}
        paginationCount={pageCount}
        paginationPage={page}
        onPaginationChange={handlePageChange}
      >
        {loading ? (
          <Loading text={TEXTS.loading} />
        ) : error ? (
          <div className={styles.errorText} style={{ textAlign: 'center', padding: '2rem' }}>
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className={styles.noLogsMessage}>
            {TEXTS.noLogs}
          </div>
        ) : (
          <div className={styles.logsList}>
            {logs.map((log) => {
              const actionColor = getLogsActionColor(log.accion);
              const badgeElement = (
                <span className={`${styles.actionBadge} ${styles[actionColor]}`}>
                  {log.accion}
                </span>
              );

              return (
                <DesplegablePanel
                  key={log.id}
                  title={`${log.accion} - ${log.tabla_afectada}`}
                  description={`${TEXTS.userLabel} ${log.usuario_nombre || 'N/A'} | ${TEXTS.dateLabel} ${formatDate(log.created_at)}`}
                  icon={FileText}
                  iconColorVariant={actionColor}
                  isOpen={expandedLogId === log.id}
                  onToggle={() => handleToggleLog(log.id)}
                  action={badgeElement}
                >
                  <div className={styles.logDetailGrid}>
                    <div className={styles.detailItem}>
                      <strong>ID Log</strong>
                      <span>{log.id}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>{TEXTS.userLabel}</strong>
                      <span>{log.usuario_nombre || 'N/A'} (ID: {log.usuario_id})</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>{TEXTS.tableLabel}</strong>
                      <span>{log.tabla_afectada || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>{TEXTS.recordIdLabel}</strong>
                      <span>{log.registro_id || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>{TEXTS.ipLabel}</strong>
                      <span>{log.ip_address || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>{TEXTS.userAgentLabel}</strong>
                      <span>{log.user_agent || 'N/A'}</span>
                    </div>
                    
                    {log.datos_previos && (
                      <div className={`${styles.detailItem} ${styles.fullWidthDetail}`}>
                        <strong>{TEXTS.previousDataLabel}</strong>
                        <pre className={styles.codeBlock}>
                          {formatJsonData(log.datos_previos)}
                        </pre>
                      </div>
                    )}
                    
                    {log.datos_nuevos && (
                      <div className={`${styles.detailItem} ${styles.fullWidthDetail}`}>
                        <strong>{TEXTS.newDataLabel}</strong>
                        <pre className={styles.codeBlock}>
                          {formatJsonData(log.datos_nuevos)}
                        </pre>
                      </div>
                    )}
                  </div>
                </DesplegablePanel>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
