import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChatPanel.module.css';
import GenericPanel from '../../../components/GenericPanel/GenericPanel';
import { useMessaging } from '../logic/index.js';
import { Mail } from 'lucide-react';
import ToggleCard from '../../../components/screens/components/ToggleCard';
import Loading from '../../../components/screens/components/Loading/Index.jsx';

// Importación de submódulos locales y helpers de formato
import ContactSidebar from '../components/ContactsSedevar/Index.jsx';
import MessageThread from '../components/Messages/Index.jsx';
import CopyableText from '../../../components/screens/components/CopyText/Index.jsx'; 
import GreenHighlight from '../../../components/screens/components/GreenHighlight/Index.jsx';
import BlueLink from '../../../components/screens/components/BlueLink/Index.jsx';

export default function ChatPanel({ currentUserId, pollInterval = 3000 }) {
  const navigate = useNavigate();
  const messagingProps = useMessaging({ currentUserId, pollInterval });
  const { currentUser, selectedUser, status } = messagingProps;

  // Analizador sintáctico de texto enriquecido integrado en el flujo de renderizado
  const renderMessageContent = (content) => {
    if (typeof content !== 'string') return content;
    const parts = content.split(/(\*\*[^*]+\*\*|\$[^\$]+\$|\([^)]+\))/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <GreenHighlight key={index}>{part.slice(2, -2)}</GreenHighlight>;
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const rawContent = part.slice(1, -1).trim();
        let label = rawContent, url = rawContent;
        if (rawContent.includes('|')) {
          const segments = rawContent.split('|');
          label = segments[0].trim();
          url = segments[1].trim();
        }
        return <BlueLink key={index} label={label} url={url} navigate={navigate} />;
      }
      if (part.startsWith('(') && part.endsWith(')')) {
        return <CopyableText key={index} text={part.slice(1, -1)} />;
      }
      return part;
    });
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