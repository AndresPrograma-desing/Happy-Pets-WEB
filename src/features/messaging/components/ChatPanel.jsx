import React from 'react';
import styles from './ChatPanel.module.css';
import GenericPanel from '../../../components/GenericPanel/GenericPanel';
import { useMessaging, getInitials } from '../logic/index.js';
import { Send, Search, User, Mail, Inbox } from 'lucide-react';
import ToggleCard from '../../../components/screens/components/ToggleCard';
import PlaceholderButton from '../../../components/screens/components/PlaceholderButton';
import SearchInput from '../../../components/UI/Search/Search';
import UserAvatar from '../../../components/screens/components/Profile/Avatar/Index.jsx';
import Loading from '../../../components/screens/components/Loading/Index.jsx';

const renderMessageContent = (content) => {
  if (typeof content !== 'string') return content;
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const cleanText = part.slice(2, -2);
      return <strong key={index} className={styles.greenHighlight}>{cleanText}</strong>;
    }
    return part;
  });
};

export default function ChatPanel({ currentUserId, pollInterval = 3000 }) {
  const {
    currentUser,
    selectedUser,
    messages,
    messageInput,
    setMessageInput,
    contactSearch,
    setContactSearch,
    isTyping,
    status,
    isMobile,
    showContactsList,
    filteredConversations,
    selectedContact,
    messagesEndRef,
    messagesWrapRef,
    handleSelectConversation,
    handleBackToList,
    handleMessagesScroll,
    handleSend
  } = useMessaging({ currentUserId, pollInterval });

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
            {/* Left Sidebar (Inbox List) */}
            <aside className={`${styles.inboxSidebar} ${isMobile && !showContactsList ? styles.hideOnMobile : ''}`}>
              <div className={styles.sidebarHeader}>
                <SearchInput
                  value={contactSearch}
                  onChange={setContactSearch}
                  placeholder="Buscar en la bandeja..."
                  label="Buscar"
                />
              </div>

              <div className={styles.conversationList}>
                {filteredConversations.length === 0 && (
                  <div style={{ padding: '2rem 1rem' }}>
                    <ToggleCard
                      icon={Inbox}
                      title="Bandeja vacía"
                      description="No tienes mensajes."
                    />
                  </div>
                )}

                {filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    className={`${styles.convItem} ${selectedUser === conv.id ? styles.activeConv : ''}`}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <div className={styles.convAvatar}>
                      <UserAvatar
                        src={conv.avatarUrl}
                        name={conv.name}
                        size={42}
                        editable={false}
                        viewable={true}
                        isActive={conv.activo}
                      />
                    </div>
                    <div className={styles.convDetails}>
                      <div className={styles.convHeader}>
                        <span className={styles.convName}>{conv.name}</span>
                        <span className={styles.convDate}>
                          {conv.lastAt ? new Date(conv.lastAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <div className={styles.convPreview}>
                        <span className={styles.previewText}>{conv.lastMessage || 'Haz clic para iniciar chat'}</span>
                        {conv.unread > 0 && <span className={styles.unreadBadge}>{conv.unread}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            {/* Right Area (Message Thread) */}
            <main className={`${styles.messageThread} ${isMobile && showContactsList ? styles.hideOnMobile : ''}`}>
              {selectedUser ? (
                <>
                  <header className={styles.threadHeader}>
                    {isMobile && (
                      <button className={styles.backBtn} onClick={handleBackToList}>
                        ← Volver
                      </button>
                    )}
                    <div className={styles.threadAvatar}>
                      {selectedContact ? (
                        <UserAvatar
                          src={selectedContact.avatarUrl}
                          name={selectedContact.name}
                          size={50}
                          editable={false}
                        />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div className={styles.threadInfo}>
                      <h2 className={styles.threadName}>{selectedContact?.name || 'Contacto seleccionado'}</h2>
                      <span className={styles.threadEmail}>{selectedContact?.raw?.email || `ID: ${selectedContact?.id}`}</span>
                    </div>
                  </header>

                  <div className={styles.threadMessages} ref={messagesWrapRef} onScroll={handleMessagesScroll}>
                    {status.msgs && <Loading size="medium" text="Cargando hilo..." />}

                    {messages.map((m, idx) => {
                      const isMe = m.from === currentUser?.id;
                      const showHeader = idx === 0 || messages[idx - 1].from !== m.from;

                      return (
                        <div key={m.id} className={`${styles.messageBlock} ${isMe ? styles.messageMe : styles.messageThem}`}>
                          {showHeader && (
                            <div className={styles.messageAuthor}>
                              {isMe ? 'Yo' : (selectedContact?.name || 'Usuario')}
                              <span className={styles.messageTime}>
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                          <div className={styles.messageBubble}>
                            {renderMessageContent(m.content)}
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className={`${styles.messageBlock} ${styles.messageThem}`}>
                        <div className={styles.messageAuthor}>
                          Asistente GROQ (IA)
                        </div>
                        <div className={styles.messageBubble} style={{ fontStyle: 'italic', opacity: 0.8 }}>
                          Escribiendo respuesta...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className={styles.threadComposer}>
                    <PlaceholderButton
                      icon={Send}
                      placeholder="Escribe tu respuesta aquí..."
                      buttonText="Enviar"
                      inputType="text"
                      multiline={true}
                      onSavePromise={async (val) => {
                        await handleSend(val);
                      }}
                      successMessage="Enviado correctamente"
                      errorMessage="Error al enviar"
                      clearOnSuccess={true}
                    />
                  </div>
                </>
              ) : (
                <div className={styles.noSelection}>
                  <ToggleCard
                    icon={Mail}
                    title="Ningún chat seleccionado"
                    description="Selecciona una conversación de tu bandeja de entrada."
                  />
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </GenericPanel>
  );
}
