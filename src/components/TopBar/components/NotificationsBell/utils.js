export function formatNotificationTimestamp(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

export function getNotificationVariant(priority) {
  const key = String(priority || '').toLowerCase();
  if (key === '3' || key === 'alta') return 'danger';
  if (key === '2' || key === 'media') return 'warning';
  if (key === '1' || key === 'baja') return 'info';
  return 'neutral';
}

export function isNotificationRead(notification) {
  return !!(
    notification?.is_read ||
    notification?.leida ||
    notification?.read ||
    notification?.isRead ||
    notification?.completada ||
    notification?.completed
  );
}

const PANEL_MESSAGE_MAX_LENGTH = 180;

export function truncateMessage(message, maxLength = PANEL_MESSAGE_MAX_LENGTH) {
  if (!message || message.length <= maxLength) return message;
  return `${message.slice(0, maxLength).trimEnd()}…`;
}

export function buildPanelNotifications(notifications, onItemClick) {
  return (notifications || []).map((notification, idx) => ({
    id: notification.id ?? notification._id ?? notification.__key ?? idx,
    title: notification.title,
    message: truncateMessage(notification.message),
    timestamp: formatNotificationTimestamp(notification.created_at || notification.createdAt),
    variant: getNotificationVariant(notification.priority),
    onClick: () => onItemClick(notification)
  }));
}
