import React, { useState } from 'react';
import GenericPanel from '../../components/GenericPanel/GenericPanel';
import DollarCard from '../../components/GenericPanel/Components/Cards/DollarBcv';
import BillingStatusCard from '../../components/GenericPanel/Components/Cards/BillingStatusCard';
import AppointmentCard from '../../components/GenericPanel/Components/NortificationCard/AppointmentCard';
import AlertModal from '../../components/AlertModal/AlertModal';
import NotificationForm from '../../components/NotificationForm/NotificationForm';
import styles from '../../styles/card.module.css';
import Notification from '../../components/GenericPanel/Components/NortificationCard/Notification';
import { BellPlus, BotIcon } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

function DoctorSystem() {
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
        menuTitle="Panel Médico"
        title="Página del Doctor"
        message="Estamos trabajando para ofrecerte la mejor experiencia."
        role="doctor"
      >
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
      </GenericPanel>

      {/* MODAL DINÁMICO (FORMULARIO / ÉXITO) */}
      <AlertModal
        open={showNotificationModal}
        title={isSuccess ? "¡Operación Exitosa!" : "Nueva Alerta de Control"}
        onClose={handleCloseModal}
        hideActions={!isSuccess} // Muestra las acciones (botón OK) sólo cuando es éxito
        confirmText="Entendido"
      >
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '500' }}>
              La notificación ha sido enviada y registrada en el sistema correctamente.
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

export default DoctorSystem;