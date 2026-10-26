import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { getUsers, getUserMessages } from '../../../services/api';
import { fetchUserProfile } from '../../../redux/slices/userSlice';
import { extractList, normalizeUser, normalizeMessage } from './utils';

export function useConversations({ propUserId, contactSearch }) {
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [status, setStatus] = useState({ users: true, convs: true });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (propUserId) {
          setCurrentUser({ id: String(propUserId), name: `Usuario ${propUserId}` });
        } else {
          const data = await dispatch(fetchUserProfile()).unwrap();
          if (!mounted) return;
          setCurrentUser(normalizeUser(data));
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      }
    })();
    return () => { mounted = false; };
  }, [propUserId, dispatch]);

  const usersById = useMemo(() => {
    const map = new Map(users.map(u => [u.id, u]));
    if (currentUser?.id) map.set(currentUser.id, currentUser);
    return map;
  }, [users, currentUser]);

  const loadConversationsAndUsers = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const [rawUsers, rawMsgs] = await Promise.all([getUsers(), getUserMessages(currentUser.id)]);
      const userList = extractList(rawUsers).map(normalizeUser).filter(u => u.id && u.id !== currentUser.id);
      setUsers(userList);

      const msgItems = extractList(rawMsgs);
      const convMap = new Map();
      userList.forEach(u => convMap.set(u.id, { id: u.id, name: u.name, avatarUrl: u.avatarUrl, lastMessage: '', lastAt: '', unread: 0 }));

      msgItems.forEach(raw => {
        const m = normalizeMessage(raw);
        const otherId = m.from === currentUser.id ? m.to : m.from;
        if (!otherId || otherId === currentUser.id) return;
        const entry = convMap.get(otherId);
        if (!entry) return;
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

  useEffect(() => {
    if (currentUser?.id) {
      loadConversationsAndUsers();
    }
  }, [currentUser?.id, loadConversationsAndUsers]);

  const filteredConversations = useMemo(() => {
    const term = (contactSearch || '').toLowerCase();
    return conversations.filter(c => c.name.toLowerCase().includes(term) || c.id.includes(term));
  }, [conversations, contactSearch]);

  return {
    currentUser,
    users,
    usersById,
    conversations,
    filteredConversations,
    status,
    loadConversationsAndUsers
  };
}
