import React from 'react';
import ChatPanel from '../../features/messaging/components/ChatPanel';

export default function PanelMenssage() {
  // Renderizar el chat en modo standalone para ocupar toda la pantalla
  return <ChatPanel standalone={true} />;
}
