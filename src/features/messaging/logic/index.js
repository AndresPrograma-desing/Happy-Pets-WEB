import { useState, useMemo } from 'react';
import { useConversations } from './useConversations';
import { useMessageThread } from './useMessageThread';
import { useResponsiveChat } from './useResponsiveChat';

export { extractList, normalizeUser, normalizeMessage, getInitials } from './utils';

// --- Hook ---
export function useMessaging({ currentUserId: propUserId, pollInterval = 3000 } = {}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [contactSearch, setContactSearch] = useState('');

  const {
    currentUser,
    users,
    usersById,
    conversations,
    filteredConversations,
    status: conversationsStatus,
    loadConversationsAndUsers
  } = useConversations({ propUserId, contactSearch });

  const {
    isMobile,
    showContactsList,
    handleSelectConversation: wrapSelectConversation,
    handleBackToList
  } = useResponsiveChat();

  const handleSelectConversation = wrapSelectConversation(setSelectedUser);

  const {
    messages,
    messageInput,
    setMessageInput,
    status: threadStatus,
    messagesEndRef,
    messagesWrapRef,
    handleMessagesScroll,
    handleSend
  } = useMessageThread({
    currentUserId: currentUser?.id,
    selectedUser,
    pollInterval,
    onMessageSent: loadConversationsAndUsers
  });

  const status = useMemo(() => ({
    users: conversationsStatus.users,
    convs: conversationsStatus.convs,
    msgs: threadStatus.msgs,
    sending: threadStatus.sending
  }), [conversationsStatus, threadStatus]);

  const selectedContact = useMemo(() => (
    selectedUser ? usersById.get(selectedUser) : null
  ), [selectedUser, usersById]);

  return {
    currentUser,
    users,
    conversations,
    selectedUser,
    messages,
    messageInput,
    setMessageInput,
    contactSearch,
    setContactSearch,
    isTyping: false,
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
  };
}
