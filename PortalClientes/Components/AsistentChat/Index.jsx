import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bot } from 'lucide-react';
import styles from './Index.module.css';

// Reusing existing premium components
import DrawPanel from '../../../src/components/screens/components/DrawPanel/index';
import ChatWindow from '../../../src/components/screens/components/ChatWindow/Index';

// Centralized API import
import { grop, getUsers } from '../../../src/services/api';

export default function AsistentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [botAvatarUrl, setBotAvatarUrl] = useState(() => {
    return localStorage.getItem('hp_assistant_avatar_url') || null;
  });
  const [botName, setBotName] = useState(() => {
    return localStorage.getItem('hp_assistant_name') || 'Asistente Groq IA';
  });

  // Initialize messages history from localStorage, or start with greeting
  const [botMessages, setBotMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_portal_bot_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading bot messages from localStorage:', e);
    }
    return [
      {
        id: 'init-msg',
        from: 'groq-ia',
        content: '¡Hola! Soy el **Asistente NowGrod.ia** de Happy Pets. ¿En qué puedo ayudarte hoy con tus mascotas?',
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Save messages history on change
  useEffect(() => {
    try {
      localStorage.setItem('hp_portal_bot_messages', JSON.stringify(botMessages));
    } catch (e) {
      console.error('Error saving bot messages to localStorage:', e);
    }
  }, [botMessages]);

  // Load Assistant User Profile (name and avatarUrl) from database
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getUsers();
        const userList = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
        const groqUser = userList.find(u => 
          u.rol?.toLowerCase() === 'assistant' || 
          u.email === 'groq@happy-pets.dev' || 
          u.correo === 'groq@happy-pets.dev'
        );
        if (mounted && groqUser) {
          const avatar = groqUser.avatarUrl || groqUser.avatar_url || groqUser.avatar;
          const name = groqUser.nombre || groqUser.name;
          if (avatar) {
            setBotAvatarUrl(avatar);
            localStorage.setItem('hp_assistant_avatar_url', avatar);
          }
          if (name) {
            setBotName(name);
            localStorage.setItem('hp_assistant_name', name);
          }
        }
      } catch (err) {
        console.error('Error fetching Groq user profile:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Show "Pregúntame algo" invite bubble periodically when closed
  useEffect(() => {
    if (isOpen) {
      setShowInvite(false);
      return;
    }

    // Show initial invite bubble after 3.5s
    const initialTimer = setTimeout(() => {
      setShowInvite(true);
    }, 3500);

    // Recurrent schedule: every 40s show bubble for 8s
    const interval = setInterval(() => {
      setShowInvite(true);
      setTimeout(() => {
        setShowInvite(false);
      }, 8000);
    }, 40000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isOpen]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowInvite(false);
    sessionStorage.setItem('hp_portal_bot_invite_shown', 'true');
  };

  const handleDismissInvite = (e) => {
    e.stopPropagation();
    setShowInvite(false);
    sessionStorage.setItem('hp_portal_bot_invite_shown', 'true');
  };

  const handleSendToBot = async (textToSend) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText) return;

    // 1. Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      from: 'client-user',
      content: trimmedText,
      createdAt: new Date().toISOString()
    };
    setBotMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Prepare history context format
      const history = botMessages.map(m => ({
        role: m.from === 'client-user' ? 'user' : 'assistant',
        content: m.content
      }));

      // Call API
      const response = await grop(trimmedText, history);
      
      const answerText = response?.respuesta || 
                         response?.response || 
                         response?.result || 
                         response?.data || 
                         (typeof response === 'string' ? response : JSON.stringify(response)) || 
                         'No pude procesar tu solicitud.';

      const botReply = {
        id: `bot-${Date.now()}`,
        from: 'groq-ia',
        content: answerText,
        createdAt: new Date().toISOString()
      };

      setBotMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error('Error communicating with Groq IA API:', err);
      const backendErrorMsg = (typeof err?.body === 'string' && err.body) || 
                              err?.body?.error || 
                              err?.body?.message || 
                              err?.message || 
                              'Lo siento, hubo un problema al obtener una respuesta de la IA. Inténtalo de nuevo.';
      
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        from: 'groq-ia',
        content: backendErrorMsg,
        createdAt: new Date().toISOString()
      };
      setBotMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return createPortal(
    <>
      {/* Floating Widget Area */}
      <div className={styles.floatingBotContainer}>
        {showInvite && (
          <div className={styles.askMeBubble} onClick={handleOpenChat}>
            ¡Hola! ¿Tienes dudas? ¡Pregúntame algo! 💬
            <button className={styles.askMeBubbleClose} onClick={handleDismissInvite}>×</button>
          </div>
        )}
        <button 
          onClick={handleOpenChat}
          className={styles.floatingBotBtn}
          title="Consultar con Asistente IA"
        >
          {botAvatarUrl ? (
            <img 
              src={botAvatarUrl} 
              alt={botName} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
            />
          ) : (
            <Bot size={30} />
          )}
        </button>
      </div>

      {/* IA Chat Assistant Sidebar Draw Panel */}
      <DrawPanel
        isOpen={isOpen}
        title="Asistente Virtual IA"
        onClose={() => setIsOpen(false)}
        width="450px"
        showActions={false}
        className={styles.botChatModalFrame}
      >
        <ChatWindow
          messages={botMessages}
          currentUser={{ id: 'client-user' }}
          selectedContact={{
            id: 'groq-ia',
            name: botName,
            avatarUrl: botAvatarUrl
          }}
          isTyping={isTyping}
          onSend={handleSendToBot}
          showHeader={false}
          placeholder="Escribe tu pregunta aquí..."
        />
      </DrawPanel>
    </>,
    document.body
  );
}
