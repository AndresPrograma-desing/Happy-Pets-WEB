import React, { useEffect, useRef, useState } from 'react';
import { BellPlus, BellOff } from 'lucide-react';
import Button from '../../../screens/components/Button';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import Frame from '../../../screens/components/Frame/Index';
import EmptyState from '../../../screens/components/EmptyState';
import useNotificationsContext from '../../../../hooks/useNotificationsContext';
import { markNotificationAsRead } from '../../../../services/api';
import { TOPBAR_TEXT } from '../../constants';
import topBarStyles from '../../Index.module.css';
import styles from './index.module.css';

const NotificationsBell = () => {
  const { notifications, loading, error } = useNotificationsContext();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const text = TOPBAR_TEXT.notifications;

  const unread = notifications?.filter((n) => !(n.is_read || n.leida || n.read || n.isRead || n.completada || n.completed)) || [];
  const count = unread.length > 0 ? unread.length : (notifications?.length || 0);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleItemClick = async (notification) => {
    const targetId = notification?.id || notification?._id;
    const isRead = notification?.is_read || notification?.leida || notification?.read || notification?.isRead;
    if (!targetId || isRead) return;
    try {
      await markNotificationAsRead(targetId);
      window.dispatchEvent(new CustomEvent('reload-notifications'));
    } catch (err) {
      console.error('Error al marcar la notificación como leída:', err);
    }
  };

  return (
    <div className={topBarStyles.iconButtonWrap} ref={containerRef}>
      <Button
        variant={Button.VARIANTS.GHOST}
        className={topBarStyles.actionIconButton}
        aria-label={text.title}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ModalTooltip text={text.title} position="bottom">
          <BellPlus size={18} />
        </ModalTooltip>
      </Button>

      {count > 0 && (
        <span className={topBarStyles.iconCountBadge}>{count > 99 ? '99+' : count}</span>
      )}

      {isOpen && (
        <Frame
          className={styles.anchoredFrame}
          title={text.title}
          icon={<BellPlus size={18} />}
          isLoading={loading}
          error={error ? text.errorText : ''}
          LoadingSize="small"
        >
          <div className={styles.list}>
            {!loading && !error && notifications.length === 0 && (
              <EmptyState icon={BellOff} text={text.emptyText} />
            )}
            {!loading && !error && notifications.map((notification, idx) => (
              <button
                key={notification.__key || notification.id || idx}
                type="button"
                className={styles.item}
                onClick={() => handleItemClick(notification)}
              >
                {text.itemPrefix} <strong>{notification.origin || text.unknownSender}</strong>
              </button>
            ))}
          </div>
        </Frame>
      )}
    </div>
  );
};

export default NotificationsBell;
