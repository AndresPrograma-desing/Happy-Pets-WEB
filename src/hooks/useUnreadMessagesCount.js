import { useState, useEffect, useCallback } from 'react';
import { getUserId } from '../context/LocalStorage';
import { getUserMessages } from '../services/api';
import usePolling from './UsePolling';
import PollingSeconds from './PollingSecons';

// Module-level global cache to persist unread count across route transitions without reset/flicker
const globalUnreadCountCache = new Map();

export default function useUnreadMessagesCount() {
  const userId = getUserId();
  const initialCount = userId ? (globalUnreadCountCache.get(String(userId)) ?? 0) : 0;
  const [count, setCount] = useState(initialCount);

  const loadUnreadCount = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }
    try {
      const data = await getUserMessages(userId);
      const list = Array.isArray(data) ? data : (data?.data || data?.items || data?.result || []);
      const unread = list.filter((m) => {
        const to = String(m.to ?? m.receiver ?? m.para ?? m.receptorId ?? m.receptor ?? m.destino ?? '');
        const read = Boolean(m.read ?? m.leido ?? m.is_read ?? m.isRead ?? false);
        return (to === String(userId) || to.toLowerCase() === 'all' || to.toLowerCase() === 'todos') && !read;
      });
      const newCount = unread.length;
      globalUnreadCountCache.set(String(userId), newCount);
      setCount(newCount);
    } catch (err) {
      console.error('Error cargando mensajes no leídos:', err);
    }
  }, [userId]);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  usePolling(loadUnreadCount, PollingSeconds(), !!userId);

  return count;
}
