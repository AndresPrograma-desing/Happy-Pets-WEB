import React from 'react';
import usePanelHeader from '../../components/GenericPanel/usePanelHeader';
import DollarCard from '../../components/GenericPanel/Components/Cards/DollarBcv';
import BillingStatusCard from '../../components/GenericPanel/Components/Cards/BillingStatusCard';
import AppointmentCard from '../../components/GenericPanel/Components/NortificationCard/AppointmentCard';
import styles from '../../styles/card.module.css';
import Notification from '../../components/GenericPanel/Components/NortificationCard/Notification';
import useNotificationsContext from '../../hooks/useNotificationsContext';

function DoctorSystem() {
  const { notifications, loading: notificationsLoading, error: notificationsError } = useNotificationsContext();

  usePanelHeader({
    menuTitle: "Panel Médico",
    title: "Página del Doctor",
    message: "Estamos trabajando para ofrecerte la mejor experiencia.",
    showDashboardAvatar: true
  });

  return (
    <>
      <hr style={{ border: '0', borderTop: '1px solid #131414', margin: '1.5rem 0' }} />

      <div className={styles.cardContainer}>
        <DollarCard />
        <BillingStatusCard />
        <AppointmentCard />
        {notificationsLoading && <Notification loading={true} />}
        {!notificationsLoading && notificationsError && <Notification error={notificationsError} />}
        {!notificationsLoading && !notificationsError && notifications.length === 0 && <Notification />}
        {!notificationsLoading && !notificationsError && notifications.map((n, idx) => (
          <Notification
            key={n.__key || idx}
            notification={n}
            onNotificationRead={(id) => {
              // Optimistic update (no-op, handled by reload)
              window.dispatchEvent(new CustomEvent('reload-notifications'));
            }}
          />
        ))}
      </div>
    </>
  );
}

export default DoctorSystem;