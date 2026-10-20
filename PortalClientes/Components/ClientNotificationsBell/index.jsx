import React from 'react';
import { BellPlus } from 'lucide-react';
import { NotificationsPanel } from 'anteriority-ui';
import AnchoredDropdown from '../../../src/components/TopBar/components/AnchoredDropdown';
import { buildClientPanelNotifications } from './utils';
import styles from './index.module.css';

export default function ClientNotificationsBell({
  isOpen,
  anchorStyle,
  panelRef,
  notifications = [],
  onConfirmClick,
  onDeclineClick,
  onDismiss,
  onRequestClose
}) {
  const panelNotifications = buildClientPanelNotifications(notifications, {
    onConfirm: (notification) => { onConfirmClick?.(notification); onRequestClose?.(); },
    onDecline: (notification) => { onDeclineClick?.(notification); onRequestClose?.(); }
  });

  return (
    <AnchoredDropdown isOpen={isOpen} anchorStyle={anchorStyle} panelRef={panelRef} className={styles.frame}>
      <NotificationsPanel
        title="Notificaciones"
        icon={<BellPlus size={18} />}
        notifications={panelNotifications}
        emptyMessage="No tienes notificaciones."
        onDismiss={onDismiss}
        dismissLabel="Descartar notificación"
      />
    </AnchoredDropdown>
  );
}
