import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getProfile, getUsers, getUserMessages, 
  getConversation, sendMessage, markMessageAsRead 
} from '../../../services/api';

// --- Utils ---
export const extractList = (data) => {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.data) ? data.data : 
         Array.isArray(data?.result) ? data.result : 
         Array.isArray(data?.items) ? data.items : [];
};

export const normalizeUser = (user) => {
  const id = user?.id ?? user?.userId ?? user?.usuarioId ?? user?.Id ?? '';
  const nombre = user?.nombre ?? user?.name ?? user?.first_name ?? user?.firstName ?? '';
  const apellido = user?.apellido ?? user?.last_name ?? user?.lastName ?? '';
  const fullName = `${String(nombre).trim()} ${String(apellido).trim()}`.trim() || 
                   user?.username || user?.email || `Usuario ${id}`;
  return { id: String(id), name: fullName, rol: user?.rol ?? user?.role ?? '', raw: user };
};

export const normalizeMessage = (msg) => ({
  id: msg.id ?? msg._id ?? msg.messageId ?? msg.mensajeId ?? Math.random().toString(36),
  from: String(msg.from ?? msg.sender ?? msg.de ?? msg.emisorId ?? msg.emisor ?? ''),
  to: String(msg.to ?? msg.receiver ?? msg.para ?? msg.receptorId ?? msg.receptor ?? ''),
  content: msg.content ?? msg.text ?? msg.body ?? msg.mensaje ?? msg.contenido ?? '',
  createdAt: msg.createdAt ?? msg.created_at ?? msg.fecha ?? new Date().toISOString(),
  read: Boolean(msg.read ?? msg.leido ?? false),
  raw: msg,
});

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
};

// --- Hook ---
export function useMessaging({ currentUserId: propUserId, pollInterval = 3000 } = {}) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState({ users: true, convs: true, msgs: false, sending: false });
  
  const pollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesWrapRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const lastMessageIdRef = useRef(null);
  
  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [showContactsList, setShowContactsList] = useState(true);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectConversation = useCallback((userId) => {
    setSelectedUser(userId);
    if (isMobile) setShowContactsList(false);
  }, [isMobile]);

  const handleBackToList = useCallback(() => {
    setShowContactsList(true);
  }, []);

  const isUserAtBottom = useCallback(() => {
    const el = messagesWrapRef.current;
    if (!el) return true;
    const threshold = 150;
    return (el.scrollHeight - el.scrollTop - el.clientHeight) <= threshold;
  }, []);

  const handleMessagesScroll = useCallback(() => {
    isAtBottomRef.current = isUserAtBottom();
  }, [isUserAtBottom]);

  // Load Profile
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (propUserId) {
          setCurrentUser({ id: String(propUserId), name: `Usuario ${propUserId}` });
        } else {
          const profile = await getProfile();
          if (!mounted) return;
          const normalized = normalizeUser(profile?.data || profile?.user || profile);
          setCurrentUser(normalized);
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      }
    })();
    return () => { mounted = false; };
  }, [propUserId]);

  const usersById = useMemo(() => {
    const map = new Map(users.map(u => [u.id, u]));
    if (currentUser?.id) map.set(currentUser.id, currentUser);
    return map;
  }, [users, currentUser]);

  // Initial Data Load (Users & Conversations)
  const loadConversationsAndUsers = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const [rawUsers, rawMsgs] = await Promise.all([getUsers(), getUserMessages(currentUser.id)]);
      const userList = extractList(rawUsers).map(normalizeUser).filter(u => u.id && u.id !== currentUser.id);
      setUsers(userList);

      const msgItems = extractList(rawMsgs);
      const convMap = new Map();
      userList.forEach(u => convMap.set(u.id, { id: u.id, name: u.name, lastMessage: '', lastAt: '', unread: 0 }));

      msgItems.forEach(raw => {
        const m = normalizeMessage(raw);
        const otherId = m.from === currentUser.id ? m.to : m.from;
        if (!otherId || otherId === currentUser.id) return;
        const entry = convMap.get(otherId) || { id: otherId, name: `Usuario ${otherId}`, unread: 0 };
        if (!entry.lastAt || new Date(m.createdAt) > new Date(entry.lastAt)) {
          entry.lastAt = m.createdAt;
          entry.lastMessage = m.content;
        }
        if (m.to === currentUser.id && !m.read) entry.unread++;
        convMap.set(otherId, entry);
      });

      const sorted = Array.from(convMap.values()).sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
      setConversations(sorted);
      setStatus(prev => ({ ...prev, convs: false, users: false }));
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
    }
  }, [currentUser?.id]);

  // Load Messages for a user
  const loadMessages = useCallback(async (otherId, markRead = true) => {
    if (!otherId || !currentUser?.id) return;
    setStatus(prev => ({ ...prev, msgs: true }));
    try {
      const raw = await getConversation(currentUser.id, otherId);
      const normalized = extractList(raw).map(normalizeMessage).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(normalized);
      
      if (markRead) {
        const unread = normalized.filter(m => m.to === currentUser.id && !m.read);
        if (unread.length) {
          await Promise.allSettled(unread.map(m => markMessageAsRead(m.id)));
          setMessages(prev => prev.map(m => 
            m.to === currentUser.id && !m.read ? { ...m, read: true } : m
          ));
        }
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          if (messagesWrapRef.current) messagesWrapRef.current.scrollTop = messagesWrapRef.current.scrollHeight;
          isAtBottomRef.current = true;
        }, 50);
      }
    } catch (err) {
      console.error('Error cargando mensajes:', err);
    } finally {
      setStatus(prev => ({ ...prev, msgs: false }));
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      loadConversationsAndUsers();
    }
  }, [currentUser?.id, loadConversationsAndUsers]);

  useEffect(() => {
    if (selectedUser && currentUser?.id) {
      loadMessages(selectedUser, true);
    }
  }, [selectedUser, currentUser?.id, loadMessages]);

  // Polling
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const poll = async () => {
      await loadConversationsAndUsers();
      if (selectedUser) {
        try {
          const raw = await getConversation(currentUser.id, selectedUser);
          const normalized = extractList(raw).map(normalizeMessage).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setMessages(normalized);
          const newUnread = normalized.filter(m => m.to === currentUser.id && !m.read);
          if (newUnread.length) {
            await Promise.allSettled(newUnread.map(m => markMessageAsRead(m.id)));
            setMessages(prev => prev.map(m => 
              m.to === currentUser.id && !m.read ? { ...m, read: true } : m
            ));
          }
        } catch (err) {
          console.error('Polling messages error:', err);
        }
      }
    };

    pollRef.current = setInterval(poll, pollInterval);
    return () => clearInterval(pollRef.current);
  }, [currentUser?.id, selectedUser, pollInterval, loadConversationsAndUsers]);

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

  // Send message
  const handleSend = async (textParam = null) => {
    const text = (textParam !== null ? textParam : messageInput).trim();
    if (!text || !selectedUser || status.sending) return;
    setStatus(prev => ({ ...prev, sending: true }));
    try {
      const payload = { emisorId: currentUser.id, receptorId: selectedUser, contenido: text };
      const response = await sendMessage(payload);
      const newMsg = normalizeMessage(response || payload);
      setMessages(prev => [...prev, newMsg]);
      setMessageInput('');
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (messagesWrapRef.current) messagesWrapRef.current.scrollTop = messagesWrapRef.current.scrollHeight;
        isAtBottomRef.current = true;
      }, 50);
      
      await loadConversationsAndUsers();
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      alert('No se pudo enviar el mensaje');
    } finally {
      setStatus(prev => ({ ...prev, sending: false }));
    }
  };

  const filteredConversations = useMemo(() => {
    const term = contactSearch.toLowerCase();
    return conversations.filter(c => c.name.toLowerCase().includes(term) || c.id.includes(term));
  }, [conversations, contactSearch]);

  const selectedContact = selectedUser ? usersById.get(selectedUser) : null;

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
  };
}
