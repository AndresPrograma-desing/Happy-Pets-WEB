import React from 'react';
import styles from '../ChatPanel.module.css';
import { Inbox } from 'lucide-react';
import SearchInput from '../../../../components/screens/components/Material-UI/Components/Search/Index.jsx';
import ToggleCard from '../../../../components/screens/components/ToggleCard/index.jsx';
import UserAvatar from '../../../../components/screens/components/Profile/Avatar/Index.jsx';

export default function ContactSidebar({
  contactSearch, 
  setContactSearch, 
  filteredConversations, 
  selectedUser, 
  handleSelectConversation, 
  isMobile, 
  showContactsList 
}) {
  return (
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
  );
}