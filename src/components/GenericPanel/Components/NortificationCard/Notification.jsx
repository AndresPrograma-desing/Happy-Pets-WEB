import React, { useState } from 'react';
import cardStyles from '../css/CardMain.module.css';
import { Bell, BellRing, Eye, Circle, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { DrawPanel, Badge, Callout } from 'anteriority-ui';
import { markNotificationAsRead } from '../../../../services/api';
import CardV1 from '../../../screens/components/CardV1';
import { getPriorityData } from '../../../screens/components/CardV1/utils';

const getCalloutVariant = (priority) => {
  const key = String(priority || '').toLowerCase();
  if (key === '3' || key === 'alta') return 'danger';
  if (key === '2' || key === 'media') return 'warning';
  if (key === '1' || key === 'baja') return 'success';
  return 'neutral';
};

const NotificationCard = ({ notification = null, loading = false, error = null, onNotificationRead }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
  const PriorityIcon = priorityData.icon;
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
            onClick={() => setIsDrawerOpen(true)}
            className={cardStyles.viewMoreBtn}
          >
            <Eye size={12} />
            Ver más
          </button>
        )}
      </CardV1>

      <DrawPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={notification.title || 'Detalle de Notificación'}
        width="420px"
      >
        <div className={cardStyles.detailContent}>
          <div className={cardStyles.detailRow}>
            <Badge
              icon={PriorityIcon}
              label="Prioridad"
              value={priorityData.label}
              iconColor={priorityData.color}
              valueColor={priorityData.color}
            />
            <Badge
              icon={Calendar}
              label="Fecha"
              value={notification.created_at ? notification.created_at.slice(0, 10) : 'Hoy'}
              iconColor="#64748b"
            />
          </div>

          <Callout
            variant={getCalloutVariant(notification.priority)}
            icon={BellRing}
            title="Mensaje de alerta"
            iconColor={priorityData.color}
            borderColor={priorityData.color}
          >
            {notification.message}
          </Callout>

          <div className={cardStyles.detailRow}>
            <Badge label="De" value={notification.origin?.toLowerCase()} />
            <ArrowRight size={14} color="#94a3b8" />
            <Badge label="Para" value={notification.destination?.toLowerCase()} />
          </div>
        </div>
      </DrawPanel>
    </div>
  );
};

export default NotificationCard;