const APPOINTMENT_TYPE = 'CitaCreadaPorDoctor';
const PANEL_MESSAGE_MAX_LENGTH = 180;

function truncateMessage(message, maxLength = PANEL_MESSAGE_MAX_LENGTH) {
  if (!message || message.length <= maxLength) return message;
  return `${message.slice(0, maxLength).trimEnd()}…`;
}

export function buildClientPanelNotifications(notifications, { onConfirm, onDecline }) {
  return (notifications || []).map((notification) => {
    const canRespond = notification.type === APPOINTMENT_TYPE && !notification.is_read;

    return {
      id: notification.id,
      title: notification.title,
      message: truncateMessage(notification.message),
      variant: notification.is_read ? 'neutral' : 'info',
      actions: canRespond
        ? [
            { label: 'Confirmar asistencia', variant: 'primary', onClick: () => onConfirm(notification) },
            { label: 'No podré asistir', variant: 'outline', color: 'red', onClick: () => onDecline(notification) }
          ]
        : undefined
    };
  });
}
