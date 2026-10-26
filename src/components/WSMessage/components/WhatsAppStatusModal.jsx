import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Loader2, XCircle, CheckCircle2, QrCode, RefreshCw, HelpCircle } from 'lucide-react';
import { wsmessageAPI } from '../../../services/api';
import usePolling from '../../../hooks/UsePolling';
import styles from './css/main.module.css';

export default function WhatsAppStatusModal() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState({ status: 'DISCONNECTED', qr: '' });
  const [error, setError] = useState(false);

   const checkStatus = async () => {
    try {
      setError(false);
      const res = await wsmessageAPI();
      if (res?.success && res?.data) {
        setSession({
          status: res.data.status || 'DISCONNECTED',
          qr: res.data.qr || ''
        });
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  usePolling(checkStatus, loading ? 5000 : 15000);

  return (
    <div className={styles.modalContent}>
      {loading ? (
        <div className={styles.centerBox}>
          <Loader2 className={styles.spinner} />
          <p className={styles.textMuted}>Verificando estado de conexión...</p>
        </div>
      ) : error ? (
        <div className={styles.centerBox}>
          <div className={styles.errorCircle}>
            <XCircle className={styles.errorIcon} />
          </div>
          <h3 className={styles.title}>Error de Conexión</h3>
          <p className={styles.textMuted}>No se pudo obtener el estado del servidor.</p>
          <button className={styles.retryBtn} onClick={() => { setLoading(true); checkStatus(); }}>
            <RefreshCw className={styles.retryIcon} />
            Reintentar
          </button>
        </div>
      ) : session.status === 'CONNECTED' ? (
        <div className={styles.centerBox}>
          <div className={styles.successCircle}>
            <CheckCircle2 className={styles.successIcon} />
          </div>
          <h3 className={styles.title}>Servicio Activo</h3>
          <p className={styles.statusConnected}>CONECTADO</p>
          <p className={styles.textDescription}>
            El sistema se encuentra vinculado correctamente y listo para el envío automático de comprobantes digitales.
          </p>
        </div>
      ) : session.qr ? (
        <div className={styles.centerBox}>
          <div className={styles.qrHeader}>
            <QrCode className={styles.qrHeaderIcon} />
            <div>
              <h3 className={styles.qrTitle}>Vincular WhatsApp</h3>
              <p className={styles.qrSubtitle}>Escanea el código para activar los envios de recibos automatocas a WhatsApp</p>
            </div>
          </div>

          <div className={styles.qrWrapper}>
            <QRCodeCanvas value={session.qr} size={220} level="H" includeMargin={true} />
          </div>

          <div className={styles.instructionsContainer}>
            <p className={styles.instructionStep}>1. Abre WhatsApp en tu teléfono móvil.</p>
            <p className={styles.instructionStep}>2. Ve a Configuración o Menú &gt; Dispositivos vinculados.</p>
            <p className={styles.instructionStep}>3. Selecciona Vincular un dispositivo y apunta tu cámara aquí.</p>
          </div>

          <button className={styles.refreshBtn} onClick={() => { setLoading(true); checkStatus(); }}>
            <RefreshCw className={styles.refreshIcon} />
            Actualizar QR
          </button>
        </div>
      ) : (
        <div className={styles.centerBox}>
          <div className={styles.warningCircle}>
            <HelpCircle className={styles.warningIcon} />
          </div>
          <h3 className={styles.title}>Generando Código</h3>
          <p className={styles.textMuted}>Espere un momento mientras el servidor prepara el entorno de sincronización.</p>
        </div>
      )}
    </div>
  );
}