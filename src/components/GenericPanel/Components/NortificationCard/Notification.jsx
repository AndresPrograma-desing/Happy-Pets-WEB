import React, { useState } from 'react';
import cardStyles from '../css/CardMain.module.css';
import { Bell, BellRing, Eye, Circle, CheckCircle2 } from 'lucide-react';
import AlertModal from '../../../AlertModal/AlertModal'; 
import { markNotificationAsRead } from '../../../../services/api';
import CardV1 from '../../../screens/components/CardV1';
import { getPriorityData } from '../../../screens/components/CardV1/utils';

const NotificationCard = ({ notification = null, loading = false, error = null, onNotificationRead }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [justRead, setJustRead] = useState(false);

  const handleMarkAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const targetId = notification?.id || notification?._id;
    if (!targetId || isReading || justRead || notification?.is_read) return;
    setIsReading(true);
    try {
      await markNotificationAsRead(targetId);
      setJustRead(true);
      if (onNotificationRead) {
        onNotificationRead(targetId);
      }
    } catch (err) {
      console.error('Error al marcar la notificación como leída:', err);
      setIsReading(false);
    }
  };

  if (loading) {
    return (
      <CardV1
        badgeIcon={Bell}
        badgeText="ALERTAS"
        badgeBgColor="#94a3b8"
        badgeTextColor="#fff"
        isLoading={true}
      />
    );
  }

  if (error) {
    return (
      <CardV1
        badgeIcon={Bell}
        badgeText="ALERTAS"
        badgeBgColor="#ef4444"
        badgeTextColor="#fff"
        isError={true}
        errorText="Error de Red"
      />
    );
  }

  if (!notification) {
    return (
      <CardV1
        badgeIcon={Bell}
        badgeText="ALERTAS"
        badgeBgColor="#94a3b8"
        badgeTextColor="#fff"
        isEmpty={true}
        emptyText="Sin Alertas"
      />
    );
  }

  const priorityData = getPriorityData(notification.priority);
  const isLongMessage = notification.message && notification.message.length > 45;
  const isReadState = notification.is_read || justRead;
  
  const extraBadges = notification.isNew ? [{ text: 'Nueva', bgColor: '#eff6ff', textColor: '#3b82f6' }] : [];

  return (
    <div style={{ '--priority-color': priorityData.color }}>
      <CardV1
        badgeIcon={Bell}
        badgeText={priorityData.label}
        badgeBgColor="var(--priority-color)"
        badgeTextColor="#fff"
        extraBadges={extraBadges}
        actionIcon={isReadState ? CheckCircle2 : Circle}
        actionCustomClass={cardStyles.markAsReadBtn}
        actionDisabled={isReading || isReadState}
        actionTooltip={isReadState ? "Marcada como leída" : "Marcar como leída"}
        onActionClick={handleMarkAsRead}
        primaryText={
          <span className={cardStyles.titleText}>{notification.title}</span>
        }
        secondaryText={
          <span className={cardStyles.shortMessage}>
            {isLongMessage ? `${notification.message.substring(0, 20)}...` : notification.message}
          </span>
        }
        footerIcon={BellRing}
        footerIconColor="var(--priority-color)"
        footerContent={
          <span className={cardStyles.footerContent}>
            <span className={cardStyles.footerLabel}>De:</span> {notification.origin?.toLowerCase()}
            <span className={cardStyles.footerDivider}>|</span>
            <span className={cardStyles.footerLabel}>Para:</span> {notification.destination?.toLowerCase()}
          </span>
        }
      >
        {isLongMessage && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cardStyles.viewMoreBtn}
          >
            <Eye size={12} />
            Ver más
          </button>
        )}
      </CardV1>

      <AlertModal
        open={isModalOpen}
        title={notification.title || 'Detalle de Notificación'}
        onClose={() => setIsModalOpen(false)}
        confirmText="Entendido"
      >
        <div className={cardStyles.modalContent}>
          <div className={cardStyles.modalHeaderRow}>
            <div>
              <span className={cardStyles.modalLabel}>Prioridad:</span>
              <span className={cardStyles.modalPriority}>{priorityData.label}</span>
            </div>
            <div>
              <span className={cardStyles.modalLabel}>Fecha:</span>
              <span className={cardStyles.modalValue}>{notification.created_at ? notification.created_at.slice(0, 10) : 'Hoy'}</span>
            </div>
          </div>
          <div className={cardStyles.modalMessageBox}>
            <span className={cardStyles.modalBoxTitle}>Mensaje de Alerta Completo:</span>
            <p className={cardStyles.modalFullText}>{notification.message}</p>
          </div>
        </div>
      </AlertModal>
    </div>
  );
};

export default NotificationCard;