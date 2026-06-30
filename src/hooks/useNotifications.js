import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications } from '../services/api';
import { getUserId } from '../context/LocalStorage';
import usePolling from './UsePolling';
import PollingSeconds from './PollingSecons';

function getNotificationKey(item = {}) {
  const createdAt = String(item.created_at || item.createdAt || '');
  const title = String(item.title || '');
  const message = String(item.message || '');
  const reference = String(item.reference || item.id || item._id || '');
  return `${createdAt}|${title}|${message}|${reference}`;
}

function sortByDateDesc(list = []) {
  return [...list].sort((a, b) => {
    const aTime = new Date(a?.created_at || a?.createdAt || 0).getTime();
    const bTime = new Date(b?.created_at || b?.createdAt || 0).getTime();
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  });
}

export default function useNotifications() {
  const userId = getUserId();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const firstLoadDoneRef = useRef(false);
  const knownKeysRef = useRef(new Set());

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      knownKeysRef.current = new Set();
      firstLoadDoneRef.current = false;
      return;
    }

    if (!firstLoadDoneRef.current) setLoading(true);

    try {
      const data = await getNotifications(userId);
      const rawList = Array.isArray(data) ? data : [];
      const ordered = sortByDateDesc(rawList);

      const next = ordered.map((n) => {
        const key = getNotificationKey(n);
        const isNew = firstLoadDoneRef.current ? !knownKeysRef.current.has(key) : false;
        return { ...n, __key: key, isNew };
      });

      knownKeysRef.current = new Set(next.map((n) => n.__key));
      firstLoadDoneRef.current = true;
      setNotifications(next);
      setError(null);
    } catch (err) {
      setError(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Listen for reload-notifications event to force reload
  useEffect(() => {
    const handler = () => loadNotifications();
    window.addEventListener('reload-notifications', handler);
    return () => window.removeEventListener('reload-notifications', handler);
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  usePolling(loadNotifications, PollingSeconds(), !!userId);

  return { notifications, loading, error };
}
