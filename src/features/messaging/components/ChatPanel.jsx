import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChatPanel.module.css';
import GenericPanel from '../../../components/GenericPanel/GenericPanel';
import { useMessaging } from '../logic/index.js';
import { Mail } from 'lucide-react';
import ToggleCard from '../../../components/screens/components/ToggleCard';
import Loading from '../../../components/screens/components/Loading/Index.jsx';

import ContactSidebar from '../components/ContactsSedevar/Index.jsx';
import MessageThread from '../components/Messages/Index.jsx';
import { renderFormattedText } from '../../../components/screens/components/GreenHighlight/utils.jsx';

export default function ChatPanel({ currentUserId, pollInterval = 3000 }) {
  const navigate = useNavigate();
  const messagingProps = useMessaging({ currentUserId, pollInterval });
  const { currentUser, selectedUser, status } = messagingProps;

  const renderMessageContent = (content) => {
    return renderFormattedText(content, navigate);
  };

  return (
    <GenericPanel
      title="Mensajes"
      message="Revisa tu bandeja de entrada y comunícate con otros usuarios."
      role={currentUser?.rol?.toLowerCase() || 'user'}
      menuTitle="Bandeja de Entrada"
    >
      <div className={styles.emailContainer}>
        {status.convs || status.users ? (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Loading size="large" text="Cargando mensajes..." />
          </div>
        ) : (
          <>
            <ContactSidebar {...messagingProps} />

            {selectedUser ? (
              <MessageThread 
                {...messagingProps} 
                renderMessageContent={renderMessageContent} 
              />
            ) : (
              <div className={styles.noSelection}>
                <ToggleCard
                  icon={Mail}
                  title="Ningún chat seleccionado"
                  description="Selecciona una conversación de tu bandeja de entrada."
                />
              </div>
            )}
          </>
        )}
      </div>
    </GenericPanel>
  );
}