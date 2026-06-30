import React, { useState } from 'react';
import GenericPanel from '../../components/GenericPanel/GenericPanel';
import DollarCard from '../../components/GenericPanel/Components/Cards/DollarBcv';
import styles from '../../styles/card.module.css';
import BillingStatusCard from '../../components/GenericPanel/Components/Cards/BillingStatusCard';
import Notification from '../../components/GenericPanel/Components/NortificationCard/Notification';
import useNotifications from '../../hooks/useNotifications';
import { BellPlus } from 'lucide-react';
import AlertModal from '../../components/AlertModal/AlertModal';
import NotificationForm from '../../components/NotificationForm/NotificationForm';

function SecretariaSystem() {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { notifications, loading: notificationsLoading, error: notificationsError } = useNotifications();

  const handleSuccessSubmit = () => {
    setIsSuccess(true);
  };

  const handleCloseModal = () => {
    setShowNotificationModal(false);
    setIsSuccess(false);
  };

  return (
    <>
      <GenericPanel
        menuTitle="Panel de la Secretaria"
        title="Página de la Secretaria"
        message="Estamos trabajando para ofrecerte la mejor experiencia."
        role="secretaria"
      >
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
                  // Optimistic update (no-op, handled by reload)
                  window.dispatchEvent(new CustomEvent('reload-notifications'));
                }}
              />
            ))}
        </div>
      </GenericPanel>

      <AlertModal
        open={showNotificationModal}
        title={isSuccess ? "Operacion Exitosa" : "Nueva Alerta de Control"}
        onClose={handleCloseModal}
        hideActions={!isSuccess}
        confirmText="Entendido"
      >
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '500' }}>
              La notificacion ha sido enviada y registrada en el sistema correctamente.
            </p>
          </div>
        ) : (
          <NotificationForm
            onSuccess={handleSuccessSubmit}
            onClose={handleCloseModal}
          />
        )}
      </AlertModal>
    </>
  );
}

export default SecretariaSystem;