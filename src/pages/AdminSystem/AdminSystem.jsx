import React from 'react';
import usePanelHeader from '../../components/GenericPanel/usePanelHeader';
import { getText } from '../../constants';
import DollarCard from '../../components/GenericPanel/Components/Cards/DollarBcv';
import BillingStatusCard from '../../components/GenericPanel/Components/Cards/BillingStatusCard';
import Notification from '../../components/GenericPanel/Components/NortificationCard/Notification';
import styles from '../../styles/card.module.css';
import useNotificationsContext from '../../hooks/useNotificationsContext';

function AdminSystem() {
  const { notifications, loading: notificationsLoading, error: notificationsError } = useNotificationsContext();

  usePanelHeader({
    menuTitle: getText("adminInterface.genericPanelMenuTitle"),
    title: getText("adminInterface.genericPanelTitle"),
    message: getText("adminInterface.genericPanelMessage"),
    showDashboardAvatar: true
  });

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div className={styles.cardContainer}>
          <DollarCard />
          <BillingStatusCard />
          {notificationsLoading && <Notification loading={true} />}
          {!notificationsLoading && notificationsError && <Notification error={notificationsError} />}
          {!notificationsLoading && !notificationsError && notifications.length === 0 && <Notification />}
          {!notificationsLoading && !notificationsError && notifications.map((n, idx) => (
            <Notification
              key={n.__key || idx}
              notification={n}
              onNotificationRead={(id) => {
                window.dispatchEvent(new CustomEvent('reload-notifications'));
              }}
            />
          ))}
        </div>

      </div>
    </>
  );
}

export default AdminSystem;