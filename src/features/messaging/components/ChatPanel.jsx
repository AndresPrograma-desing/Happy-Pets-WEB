import React from 'react';
import styles from './ChatPanel.module.css';
import GenericPanel from '../../../components/GenericPanel/GenericPanel';
import { useMessaging, getInitials } from '../logic/index.js';
import { Send, Search, User, Mail, Inbox } from 'lucide-react';
import ToggleCard from '../../../components/screens/components/ToggleCard';
import PlaceholderButton from '../../../components/screens/components/PlaceholderButton';

export default function ChatPanel({ currentUserId, pollInterval = 3000 }) {
  const {
    currentUser,
    selectedUser,
    messages,
    messageInput,
    setMessageInput,
    contactSearch,
    setContactSearch,
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
        
        {/* Left Sidebar (Inbox List) */}
        <aside className={`${styles.inboxSidebar} ${isMobile && !showContactsList ? styles.hideOnMobile : ''}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.searchWrap}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar en la bandeja..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className={styles.conversationList}>
            {status.convs && <div className={styles.loadingState}>Cargando mensajes...</div>}
            
            {filteredConversations.length === 0 && !status.convs && (
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
                <div className={styles.convAvatar}>{getInitials(conv.name)}</div>
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
                  {selectedContact ? getInitials(selectedContact.name) : <User size={24} />}
                </div>
                <div className={styles.threadInfo}>
                  <h2 className={styles.threadName}>{selectedContact?.name || 'Contacto seleccionado'}</h2>
                  <span className={styles.threadEmail}>{selectedContact?.raw?.email || `ID: ${selectedContact?.id}`}</span>
                </div>
              </header>

              <div className={styles.threadMessages} ref={messagesWrapRef} onScroll={handleMessagesScroll}>
                {status.msgs && <div className={styles.loadingState}>Cargando hilo...</div>}
                
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
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.threadComposer}>
                <PlaceholderButton
                  icon={Send}
                  placeholder="Escribe tu respuesta aquí..."
                  buttonText="Enviar"
                  inputType="text"
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

      </div>
    </GenericPanel>
  );
}
