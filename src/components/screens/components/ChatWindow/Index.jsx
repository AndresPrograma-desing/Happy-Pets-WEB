import React, { useState, useEffect, useRef } from 'react';
import Popover from '@mui/material/Popover';
import { User, HelpCircle, Bold, Link, Copy, Send } from 'lucide-react';
import styles from './Index.module.css';

// Reusable screen components
import UserAvatar from '../Profile/Avatar/Index.jsx';
import Loading from '../Loading/Index.jsx';
import CopyableText from '../CopyText/Index.jsx'; 
import GreenHighlight from '../GreenHighlight/Index.jsx';
import BlueLink from '../BlueLink/Index.jsx';

export default function ChatWindow({
  messages = [],
  currentUser = {},
  selectedContact = {},
  isTyping = false,
  onSend,
  showHeader = true,
  isMobile = false,
  showContactsList = false,
  handleBackToList,
  isLoading = false,
  placeholder = "Escribe tu mensaje aquí..."
}) {
  const [inputText, setInputText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const chatMessagesRef = useRef(null);

  const lastScrolledContactIdRef = useRef(null);

  // Auto scroll to bottom when messages update, but respect user's scroll position
  useEffect(() => {
    if (chatMessagesRef.current && !isLoading && messages.length > 0) {
      const container = chatMessagesRef.current;
      
      // Check if user is already near the bottom (within a threshold of 150px)
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      
      // Check if this is the first scroll/load for this contact
      const isFirstLoadForContact = lastScrolledContactIdRef.current !== selectedContact?.id;
      
      // Check if the last message was sent by the current user
      const lastMessage = messages[messages.length - 1];
      const lastMessageIsMe = lastMessage && lastMessage.from === currentUser?.id;

      // Always scroll to bottom if:
      // 1. First time loading messages for this contact (including component mount)
      // 2. The user was already scrolled to the bottom
      // 3. The last message was sent by the current user
      if (isFirstLoadForContact || isAtBottom || lastMessageIsMe) {
        const timer = setTimeout(() => {
          if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
          }
        }, 60);
        lastScrolledContactIdRef.current = selectedContact?.id;
        return () => clearTimeout(timer);
      }
    }
  }, [messages, isTyping, selectedContact?.id, currentUser?.id, isLoading]);

  const handleOpenFormats = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseFormats = () => {
    setAnchorEl(null);
  };

  const openFormats = Boolean(anchorEl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (trimmed && onSend) {
      setInputText('');
      await onSend(trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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
        return <BlueLink key={index} label={label} url={url} navigate={() => {}} />;
      }
      if (part.startsWith('(') && part.endsWith(')')) {
        return <CopyableText key={index} text={part.slice(1, -1)} />;
      }
      return part;
    });
  };

  return (
    <div className={styles.chatWindowContainer}>
      {showHeader && (
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
                size={40}
                editable={false}
                viewable={true}
              />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className={styles.threadInfo}>
            <h2 className={styles.threadName}>{selectedContact?.name || 'Contacto'}</h2>
            <span className={styles.threadEmail}>{selectedContact?.raw?.email || `ID: ${selectedContact?.id}`}</span>
          </div>
        </header>
      )}

      <div className={styles.chatMessages} ref={chatMessagesRef}>
        {isLoading && <Loading size="medium" text="Cargando hilo..." />}

        {messages.map((m) => {
          const isMe = m.from === currentUser?.id;
          return (
            <div key={m.id} className={`${styles.messageRow} ${isMe ? styles.messageMe : styles.messageThem}`}>
              <div className={styles.messageBubble}>
                {renderMessageContent(m.content)}
              </div>
              <span className={styles.messageTime}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className={`${styles.messageRow} ${styles.messageThem}`}>
            <div className={styles.messageBubble}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.threadComposer}>
        {/* Formats Helper */}
        <div className={styles.formatsHelperContainer}>
          <button
            type="button"
            onClick={handleOpenFormats}
            className={`${styles.formatsBtn} ${openFormats ? styles.formatsActive : ''}`}
          >
            <HelpCircle size={14} style={{ marginRight: '4px' }} />
            Formas de escribir
          </button>

          <Popover
            open={openFormats}
            anchorEl={anchorEl}
            onClose={handleCloseFormats}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            slotProps={{ paper: { className: styles.popoverPaper } }}
          >
            <div className={styles.formatsDropdownMenu}>
              <div className={styles.formatMenuTitle}>Guía de formatos rápidos:</div>
              <ul className={styles.formatList}>
                <li>
                  <Bold size={13} className={styles.formatMenuIcon} />
                  <span>Resaltado verde: <code>**texto**</code></span>
                </li>
                <li>
                  <Link size={13} className={styles.formatMenuIcon} />
                  <span>Enlaces web: <code>$Texto opcional|https://url.com$</code></span>
                </li>
                <li>
                  <Copy size={13} className={styles.formatMenuIcon} />
                  <span>Bloque copiable: <code>(texto a copiar)</code></span>
                </li>
              </ul>
            </div>
          </Popover>
        </div>

        <form onSubmit={handleSubmit} className={styles.chatComposerForm}>
          <textarea
            className={styles.composerInput}
            placeholder={placeholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button 
            type="submit" 
            className={styles.sendBtn} 
            disabled={isTyping || !inputText.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
