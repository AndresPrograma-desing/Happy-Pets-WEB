import React, { useState } from 'react';
import { BellPlus } from 'lucide-react';
import { NotificationsPanel } from 'anteriority-ui';
import AnchoredDropdown from '../AnchoredDropdown';
import DrawPanel from '../../../screens/components/DrawPanel/index';
import MultilinePlaceholder from '../../../screens/components/Material-UI/Components/MultilinePlaceholder/index';
import Button from '../../../screens/components/Button';
import { markNotificationAsRead, respondToCitaRequest } from '../../../../services/api';
import { buildPanelNotifications } from './utils';
import { TOPBAR_TEXT } from '../../constants';
import styles from './index.module.css';

const CITA_REQUEST_TYPE = 'SolicitudCitaCliente';

const NotificationsBell = ({ isOpen, anchorStyle, panelRef, notifications, loading, error }) => {
  const [detailTarget, setDetailTarget] = useState(null);
  const [respondAction, setRespondAction] = useState(null); // 'accept' | 'reject'
  const [respondMensaje, setRespondMensaje] = useState('');
  const [respondLoading, setRespondLoading] = useState(false);
  const [respondError, setRespondError] = useState('');
  const text = TOPBAR_TEXT.notifications;

  const closeDetail = () => {
    setDetailTarget(null);
    setRespondAction(null);
    setRespondMensaje('');
    setRespondError('');
  };

  const handleItemClick = async (notification) => {
    const isRead = notification?.is_read || notification?.leida || notification?.read || notification?.isRead;

    if (notification?.type === CITA_REQUEST_TYPE && !isRead) {
      setDetailTarget(notification);
      setRespondAction(null);
      setRespondMensaje('');
      setRespondError('');
      return;
    }

    const targetId = notification?.id || notification?._id;
    if (!targetId || isRead) return;
    try {
      await markNotificationAsRead(targetId);
      window.dispatchEvent(new CustomEvent('reload-notifications'));
    } catch (err) {
      console.error('Error al marcar la notificación como leída:', err);
    }
  };

  const handleDismiss = async (id) => {
    if (!id) return;
    try {
      await markNotificationAsRead(id);
      window.dispatchEvent(new CustomEvent('reload-notifications'));
    } catch (err) {
      console.error('Error al descartar la notificación:', err);
    }
  };

  const panelNotifications = buildPanelNotifications(notifications, handleItemClick);

  const submitRespond = async () => {
    if (respondAction === 'reject' && !respondMensaje.trim()) {
      setRespondError('Indica el motivo del rechazo.');
      return;
    }
    setRespondLoading(true);
    setRespondError('');
    try {
      await respondToCitaRequest(detailTarget.id, respondAction === 'accept', respondMensaje.trim());
      window.dispatchEvent(new CustomEvent('reload-notifications'));
      closeDetail();
    } catch (err) {
      setRespondError(err?.message || 'No se pudo enviar la respuesta.');
    } finally {
      setRespondLoading(false);
    }
  };

  return (
    <>
      <AnchoredDropdown
        isOpen={isOpen}
        anchorStyle={anchorStyle}
        panelRef={panelRef}
        className={error ? styles.errorBox : ''}
      >
        {error ? text.errorText : (
          <NotificationsPanel
            title={text.title}
            icon={<BellPlus size={18} />}
            notifications={panelNotifications}
            isLoading={loading}
            emptyMessage={text.emptyText}
            onDismiss={handleDismiss}
            dismissLabel="Descartar notificación"
          />
        )}
      </AnchoredDropdown>

      <DrawPanel
        isOpen={!!detailTarget}
        onClose={closeDetail}
        title={detailTarget?.title || 'Solicitud de cita'}
        description={!respondAction ? detailTarget?.message : ''}
        showActions={!!respondAction}
        onConfirm={submitRespond}
        confirmText={respondLoading ? 'Enviando...' : (respondAction === 'accept' ? 'Enviar aceptación' : 'Enviar rechazo')}
        cancelText="Volver"
        loading={respondLoading}
      >
        {!respondAction && (
          <div className={styles.detailActions}>
            <Button color={Button.COLORS.BLUE} onClick={() => setRespondAction('accept')}>
              Aceptar
            </Button>
            <Button variant={Button.VARIANTS.OUTLINE} color={Button.COLORS.RED} onClick={() => setRespondAction('reject')}>
              Rechazar
            </Button>
          </div>
        )}
        {respondAction && (
          <MultilinePlaceholder
            label={respondAction === 'accept' ? 'Mensaje para el cliente (opcional)' : 'Motivo del rechazo'}
            placeholder={respondAction === 'accept' ? 'Ej: te contactaremos para coordinar fecha y hora' : 'Ej: no hay disponibilidad ese día'}
            value={respondMensaje}
            onChange={(e) => setRespondMensaje(e.target.value)}
            error={respondError}
            required={respondAction === 'reject'}
          />
        )}
      </DrawPanel>
    </>
  );
};

export default NotificationsBell;
