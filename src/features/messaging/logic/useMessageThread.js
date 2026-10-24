import { useState, useEffect, useRef, useCallback } from 'react';
import { getConversation, sendMessage, markMessageAsRead } from '../../../services/api';
import { extractList, normalizeMessage } from './utils';

export function useMessageThread({ currentUserId, selectedUser, pollInterval, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [status, setStatus] = useState({ msgs: false, sending: false });

  const pollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesWrapRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const lastMessageIdRef = useRef(null);

  const isUserAtBottom = useCallback(() => {
    const el = messagesWrapRef.current;
    if (!el) return true;
    const threshold = 150;
    return (el.scrollHeight - el.scrollTop - el.clientHeight) <= threshold;
  }, []);

  const handleMessagesScroll = useCallback(() => {
    isAtBottomRef.current = isUserAtBottom();
  }, [isUserAtBottom]);

  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      if (messagesWrapRef.current) messagesWrapRef.current.scrollTop = messagesWrapRef.current.scrollHeight;
      isAtBottomRef.current = true;
    }, 50);
  }, []);

  const loadMessages = useCallback(async (otherId, markRead = true) => {
    if (!otherId || !currentUserId) return;

    setStatus(prev => ({ ...prev, msgs: true }));
    try {
      const raw = await getConversation(currentUserId, otherId);
      const normalized = extractList(raw).map(normalizeMessage).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(normalized);

      if (markRead) {
        const unread = normalized.filter(m => m.to === currentUserId && !m.read);
        if (unread.length) {
          await Promise.allSettled(unread.map(m => markMessageAsRead(m.id)));
          setMessages(prev => prev.map(m =>
            m.to === currentUserId && !m.read ? { ...m, read: true } : m
          ));
        }
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error cargando mensajes:', err);
    } finally {
      setStatus(prev => ({ ...prev, msgs: false }));
    }
  }, [currentUserId, scrollToBottom]);

  useEffect(() => {
    if (selectedUser && currentUserId) {
      loadMessages(selectedUser, true);
    } else {
      setMessages([]);
    }
  }, [selectedUser, currentUserId, loadMessages]);

  // Polling de la conversación activa
  useEffect(() => {
    if (!currentUserId || !selectedUser) return;

    const poll = async () => {
      try {
        const raw = await getConversation(currentUserId, selectedUser);
        const normalized = extractList(raw).map(normalizeMessage).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(normalized);
        const newUnread = normalized.filter(m => m.to === currentUserId && !m.read);
        if (newUnread.length) {
          await Promise.allSettled(newUnread.map(m => markMessageAsRead(m.id)));
          setMessages(prev => prev.map(m =>
            m.to === currentUserId && !m.read ? { ...m, read: true } : m
          ));
        }
      } catch (err) {
        console.error('Polling messages error:', err);
      }
    };

    pollRef.current = setInterval(poll, pollInterval);
    return () => clearInterval(pollRef.current);
  }, [currentUserId, selectedUser, pollInterval]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMsgId = messages[messages.length - 1].id;

    // Solo auto-scrollear si llegó un mensaje NUEVO y estamos en el fondo
    if (lastMsgId !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastMsgId;
      if (isAtBottomRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSend = async (textParam = null) => {
    const text = (textParam !== null ? textParam : messageInput).trim();
    if (!text || !selectedUser || status.sending) return;

    setStatus(prev => ({ ...prev, sending: true }));
    try {
      const payload = { emisorId: currentUserId, receptorId: selectedUser, contenido: text };
      const response = await sendMessage(payload);
      const newMsg = normalizeMessage(response || payload);
      setMessages(prev => [...prev, newMsg]);
      setMessageInput('');
      scrollToBottom();
      await onMessageSent?.();
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      alert('No se pudo enviar el mensaje');
    } finally {
      setStatus(prev => ({ ...prev, sending: false }));
    }
  };

  return {
    messages,
    messageInput,
    setMessageInput,
    status,
    messagesEndRef,
    messagesWrapRef,
    handleMessagesScroll,
    handleSend
  };
}
