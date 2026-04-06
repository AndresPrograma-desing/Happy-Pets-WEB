import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import styles from './ChatPanel.module.css';
import { getIcon } from '../../../assets/icons/ExportIcon/Index.js';
import { useNavigate } from 'react-router-dom';
import { 
  getProfile, getUsers, getUserMessages, 
  getConversation, sendMessage, markMessageAsRead 
} from '../../../services/api';

// --- Utilidades (sin cambios) ---
const extractList = (data) => {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.data) ? data.data : 
         Array.isArray(data?.result) ? data.result : 
         Array.isArray(data?.items) ? data.items : [];
};

const normalizeUser = (user) => {
  const id = user?.id ?? user?.userId ?? user?.usuarioId ?? user?.Id ?? '';
  const nombre = user?.nombre ?? user?.name ?? user?.first_name ?? user?.firstName ?? '';
  const apellido = user?.apellido ?? user?.last_name ?? user?.lastName ?? '';
  const fullName = `${String(nombre).trim()} ${String(apellido).trim()}`.trim() || 
                   user?.username || user?.email || `Usuario ${id}`;
  return { id: String(id), name: fullName, rol: user?.rol ?? user?.role ?? '', raw: user };
};

const normalizeMessage = (msg) => ({
  id: msg.id ?? msg._id ?? msg.messageId ?? msg.mensajeId ?? Math.random().toString(36),
  from: String(msg.from ?? msg.sender ?? msg.de ?? msg.emisorId ?? msg.emisor ?? ''),
  to: String(msg.to ?? msg.receiver ?? msg.para ?? msg.receptorId ?? msg.receptor ?? ''),
  content: msg.content ?? msg.text ?? msg.body ?? msg.mensaje ?? msg.contenido ?? '',
  createdAt: msg.createdAt ?? msg.created_at ?? msg.fecha ?? new Date().toISOString(),
  read: Boolean(msg.read ?? msg.leido ?? false),
  raw: msg,
});

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
};

// --- Componente principal ---
export default function ChatPanel({ currentUserId: propUserId, pollInterval = 3000, standalone = false }) {
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
  const textareaRef = useRef(null);
  
  // Estado para responsive tipo WhatsApp
  const [isMobile, setIsMobile] = useState(false);
  const [showContactsList, setShowContactsList] = useState(true); // true = lista visible, false = chat visible

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // En móvil, cuando se selecciona un chat, ocultar lista y mostrar chat
  const handleSelectConversation = useCallback((userId) => {
    setSelectedUser(userId);
    if (isMobile) setShowContactsList(false);
  }, [isMobile]);

  // Volver a la lista de contactos (móvil)
  const handleBackToList = useCallback(() => {
    setShowContactsList(true);
  }, []);

  // Auto-ajuste del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  // Detectar si el usuario está en el fondo del listado de mensajes
  const isUserAtBottom = useCallback(() => {
    const el = messagesWrapRef.current;
    if (!el) return true;
    const threshold = 150; // px de tolerancia desde el final
    return (el.scrollHeight - el.scrollTop - el.clientHeight) <= threshold;
  }, []);

  const handleMessagesScroll = useCallback(() => {
    isAtBottomRef.current = isUserAtBottom();
  }, [isUserAtBottom]);

  // Cargar perfil
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

  // Mapa usuarios por ID
  const usersById = useMemo(() => {
    const map = new Map(users.map(u => [u.id, u]));
    if (currentUser?.id) map.set(currentUser.id, currentUser);
    return map;
  }, [users, currentUser]);

  // Cargar lista de usuarios y conversaciones (sin polling aquí)
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

  // Cargar mensajes de una conversación y marcar como leídos
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
          // Actualizar estado local de leídos
          setMessages(prev => prev.map(m => 
            m.to === currentUser.id && !m.read ? { ...m, read: true } : m
          ));
        }
        // Si el usuario abrió el chat (markRead === true) forzar scroll al final
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

  // Cargar datos iniciales una sola vez
  useEffect(() => {
    if (currentUser?.id) {
      loadConversationsAndUsers();
    }
  }, [currentUser?.id, loadConversationsAndUsers]);

  // Cuando se selecciona un usuario, cargar sus mensajes (y marcar como leídos)
  useEffect(() => {
    if (selectedUser && currentUser?.id) {
      loadMessages(selectedUser, true);
    }
  }, [selectedUser, currentUser?.id, loadMessages]);

  // Polling: actualizar conversaciones y mensajes del chat activo silenciosamente
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const poll = async () => {
      await loadConversationsAndUsers();
      if (selectedUser) {
        // Recargar mensajes sin mostrar loading ni marcar como leídos (solo actualizar)
        try {
          const raw = await getConversation(currentUser.id, selectedUser);
          const normalized = extractList(raw).map(normalizeMessage).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setMessages(normalized);
          // Marcar nuevos no leídos (si los hay) sin recargar todo
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

  // Auto-scroll al final de los mensajes SOLO si el usuario está en el fondo
  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Enviar mensaje
  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text || !selectedUser || status.sending) return;
    setStatus(prev => ({ ...prev, sending: true }));
    try {
      const payload = { emisorId: currentUser.id, receptorId: selectedUser, contenido: text };
      const response = await sendMessage(payload);
      const newMsg = normalizeMessage(response || payload);
      setMessages(prev => [...prev, newMsg]);
      setMessageInput('');
      // Forzar scroll al enviar (el usuario acabó de escribir)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (messagesWrapRef.current) messagesWrapRef.current.scrollTop = messagesWrapRef.current.scrollHeight;
        isAtBottomRef.current = true;
      }, 50);
      // Actualizar conversaciones para que aparezca el último mensaje
      await loadConversationsAndUsers();
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      alert('No se pudo enviar el mensaje');
    } finally {
      setStatus(prev => ({ ...prev, sending: false }));
    }
  };

  // Filtrado de conversaciones
  const filteredConversations = useMemo(() => {
    const term = contactSearch.toLowerCase();
    return conversations.filter(c => c.name.toLowerCase().includes(term) || c.id.includes(term));
  }, [conversations, contactSearch]);

  const selectedContact = selectedUser ? usersById.get(selectedUser) : null;

  // Navegación a inicio según rol
  const goHome = useCallback(() => {
    const role = String(currentUser?.rol || '').toLowerCase();
    if (role.includes('doctor')) return navigate('/doctor');
    if (role.includes('secret') || role.includes('secretaria')) return navigate('/SecretariaSystem');
    if (role.includes('admin') || role.includes('administrador')) return navigate('/AdminSystem');
    return navigate('/inicio');
  }, [currentUser, navigate]);

  return (
    <div className={`${styles.root} ${standalone ? styles.standalone : ''}`}>
      {/* Sidebar (lista de contactos) - se oculta en móvil cuando showContactsList es false */}
      <aside 
        className={`${styles.sidebar} ${isMobile && !showContactsList ? styles.hideOnMobile : ''}`} 
        aria-label="Lista de conversaciones"
      >
        <div className={styles.sideHeader}>
          <div className={styles.userAvatar}>
            {currentUser?.name ? getInitials(currentUser.name) : <img src={getIcon('user')} alt="Usuario" className={styles.userIcon} />}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{currentUser?.name || 'Usuario'}</div>
            <div className={styles.userId}>ID: {currentUser?.id}</div>
          </div>
          <button className={styles.homeBtn} onClick={goHome} aria-label="Volver al inicio">
            <img src={getIcon('house')} alt="Inicio" className={styles.houseSvg} />
          </button>
        </div>

        <div className={styles.searchNew}>
          <span className={styles.searchIcon}>
            <img src={getIcon('search')} alt="" className={styles.searchSvg} />
          </span>
          <input
            className={styles.searchInput}
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            placeholder="Buscar contacto..."
            aria-label="Buscar contacto"
          />
        </div>

        <div className={styles.conversationsList}>
          {status.convs && <div className={styles.loading}>Cargando conversaciones...</div>}
          {filteredConversations.length === 0 && !status.convs && (
            <div className={styles.emptyState}>
              <span><img src={getIcon('mailOpen')} alt="" className={styles.mailOpenSvg} /></span>
              <p>No hay contactos</p>
            </div>
          )}
          {filteredConversations.map(conv => (
            <button 
              key={conv.id} 
              className={`${styles.convItem} ${selectedUser === conv.id ? styles.active : ''}`} 
              onClick={() => handleSelectConversation(conv.id)}
              aria-current={selectedUser === conv.id ? 'true' : 'false'}
            >
              <div className={styles.convAvatar}>{getInitials(conv.name)}</div>
              <div className={styles.convContent}>
                <div className={styles.convTitle}>{conv.name}</div>
                <div className={styles.convMeta}>
                  <span className={styles.convLast}>{conv.lastMessage || 'Nuevo chat'}</span>
                  {conv.unread > 0 && <span className={styles.badge}>{conv.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Área de chat - se oculta en móvil cuando showContactsList es true */}
      <main className={`${styles.chatArea} ${isMobile && showContactsList ? styles.hideOnMobile : ''}`}>
        <div className={styles.chatHeader}>
          {/* Botón de retroceso solo en móvil y cuando el chat está visible */}
          {isMobile && !showContactsList && (
            <button className={styles.backBtn} onClick={handleBackToList} aria-label="Volver a contactos">
              <img src={getIcon('arrowBack')} alt="Volver" className={styles.arrowBackSvg} />
            </button>
          )}
          <div className={styles.chatUserInfo}>
            <div className={styles.chatAvatar}>
              {selectedContact ? getInitials(selectedContact.name) : (
                <img src={getIcon('message')} alt="" className={styles.messageSvg} />
              )}
            </div>
            <div className={styles.chatTitle}>
              {selectedContact?.name || 'Selecciona un chat'}
              {selectedContact && <span className={styles.onlineStatus}>●</span>}
            </div>
          </div>
          {isTyping && selectedContact && <div className={styles.typingIndicator}>Escribiendo...</div>}
          <button className={styles.homeBtn} onClick={goHome} aria-label="Volver al inicio">
            <img src={getIcon('house')} alt="Inicio" className={styles.houseSvg} />
          </button>
        </div>

        <div className={styles.messagesWrap} ref={messagesWrapRef} onScroll={handleMessagesScroll}>
          <div className={styles.messagesList}>
            {status.msgs && <div className={styles.loadingMessages}>Cargando mensajes...</div>}
            {messages.map(m => (
              <div 
                key={m.id} 
                className={`${styles.messageItem} ${m.from === currentUser?.id ? styles.outgoing : styles.incoming}`}
              >
                <div className={styles.messageBubble}>
                  <div className={styles.messageContent}>{m.content}</div>
                  <div className={styles.messageTime}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && !status.msgs && selectedUser && (
              <div className={styles.emptyMessages}>
                <span><img src={getIcon('message')} alt="No messages" className={styles.messageSvg} /></span>
                <p>No hay mensajes aún. ¡Envía el primero!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className={styles.inputWrap}>
          <textarea
            ref={textareaRef}
            className={styles.textInput}
            disabled={!selectedUser}
            placeholder={selectedUser ? "Escribe un mensaje..." : "Selecciona un contacto"}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            rows={1}
            aria-label="Mensaje"
          />
          <button 
            className={styles.sendBtn} 
            onClick={handleSend} 
            disabled={!selectedUser || status.sending || !messageInput.trim()}
            aria-label="Enviar mensaje"
          >
            {status.sending ? 
              <img src={getIcon('hourglass')} alt="Enviando..." className={styles.hourglassSvg} /> :
              <img src={getIcon('send')} alt="Enviar" className={styles.sendSvg} />
            }
          </button>
        </div>
      </main>
    </div>
  );
}
