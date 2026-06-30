import React, { useState } from 'react';
import GenericPanel from '../../components/GenericPanel/GenericPanel';
import CreatedUser from './CreatedUser';
import { getText } from '../../constants';
import DollarCard from '../../components/GenericPanel/Components/Cards/DollarBcv';
import BillingStatusCard from '../../components/GenericPanel/Components/Cards/BillingStatusCard';
import Notification from '../../components/GenericPanel/Components/NortificationCard/Notification';
import styles from '../../styles/card.module.css';
import { BellPlus, BotIcon, Link2, Users } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import AlertModal from '../../components/AlertModal/AlertModal';
import NotificationForm from '../../components/NotificationForm/NotificationForm';
import WhatsAppStatusModal from '../../components/WSMessage/components/WhatsAppStatusModal';
import ClientList from '../../components/Clients/ClientList/list';

function AdminSystem() {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

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

      <AlertModal
        open={showWhatsAppModal}
        title="Vinculación de WhatsApp"
        onClose={() => setShowWhatsAppModal(false)}
        hideActions={true}
      >
        <WhatsAppStatusModal />
      </AlertModal>
    </>
  );
}

export default AdminSystem;