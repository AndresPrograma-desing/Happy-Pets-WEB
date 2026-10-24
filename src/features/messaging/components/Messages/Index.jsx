import React from 'react';
import { ChatWindow } from 'anteriority-ui';

export default function MessageThread({
  selectedContact,
  messages,
  currentUser,
  isTyping,
  status,
  isMobile,
  showContactsList,
  handleBackToList,
  handleSend
}) {
  return (
    <ChatWindow
      messages={messages}
      currentUser={currentUser}
      selectedContact={selectedContact}
      isTyping={isTyping}
      onSend={handleSend}
      showHeader={true}
      isMobile={isMobile}
      showContactsList={showContactsList}
      handleBackToList={handleBackToList}
      isLoading={status.msgs}
      placeholder="Escribe tu respuesta aquí..."
    />
  );
}