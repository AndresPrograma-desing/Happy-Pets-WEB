import React from 'react';
import styles from './index.module.css';
import ToggleCard from '../../screens/components/ToggleCard';
import { Bell, AlertCircle, RefreshCw } from 'lucide-react';
import { usePushNotifications } from './utils';
import { useLocation } from 'react-router-dom';

const getIconByType = (type) => {
  switch (type) {
    case 'Error':
      return AlertCircle;
    case 'Worker':
      return RefreshCw;
    case 'Ticket':
    default:
      return Bell;
  }
};

const GlobalPushNotification = ({ userId }) => {
  const { notifications, removeNotification } = usePushNotifications(userId);
  const location = useLocation();

  const publicRoutes = ['/login', '/inicio', '/'];
  if (!userId || publicRoutes.includes(location.pathname)) {
    return null;
  }

  if (notifications.length === 0) return null;
  
  return (
    <div className={styles.toastContainer}>
      {notifications.map((notif) => {
        const IconComponent = getIconByType(notif.type);
        return (
          <div 
            key={notif.id} 
            className={`${styles.toastWrapper} ${notif.isExiting ? styles.fadeOut : ''}`}
          >
            <ToggleCard
              title={notif.title}
              description={notif.message}
              icon={IconComponent}
              onClose={() => removeNotification(notif.id)}
              closeText="Cerrar"
            />
          </div>
        );
      })}
    </div>
  );
};

export default GlobalPushNotification;
