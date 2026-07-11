import React from 'react';
import GenericPanel from '../../components/GenericPanel/GenericPanel';
import CreatedUser from './CreatedUser';
import { getText } from '../../constants';
import DollarCard from '../../components/GenericPanel/Components/Cards/DollarBcv';
import BillingStatusCard from '../../components/GenericPanel/Components/Cards/BillingStatusCard';
import Notification from '../../components/GenericPanel/Components/NortificationCard/Notification';
import styles from '../../styles/card.module.css';
import useNotifications from '../../hooks/useNotifications';

function AdminSystem() {
  const { notifications, loading: notificationsLoading, error: notificationsError } = useNotifications();

  return (
    <GenericPanel
      menuTitle={getText("adminInterface.genericPanelMenuTitle")}
      title={getText("adminInterface.genericPanelTitle")}
      message={getText("adminInterface.genericPanelMessage")}
      role="admin"
    >
      <div style={{ marginBottom: 24 }}>
        <CreatedUser />
        <hr style={{ border: '0', borderTop: '1px solid #131414', margin: '1.5rem 0' }} />

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
    </GenericPanel>
  );
}

export default AdminSystem;