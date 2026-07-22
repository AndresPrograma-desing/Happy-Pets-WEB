import { useState, useEffect, useCallback } from 'react';
import { getNotifications } from '../services/api';
import { getUserId } from '../context/LocalStorage';
import usePolling from './UsePolling';
import PollingSeconds from './PollingSecons';

// Module-level global cache to persist notifications across route transitions without reset/flicker
const globalNotificationsCache = new Map();
const globalKnownKeys = new Map();

function getNotificationKey(item = {}) {
  const createdAt = String(item.created_at || item.createdAt || '');
  const title = String(item.title || item.titulo || '');
  const message = String(item.message || item.mensaje || '');
  const reference = String(item.reference || item.referencia || item.id || item._id || '');
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

  // Initialize state directly from global cache if available to prevent flicker during SPA navigation
  const initialData = userId ? (globalNotificationsCache.get(String(userId)) || []) : [];
  const [notifications, setNotifications] = useState(initialData);
  const [loading, setLoading] = useState(!userId ? false : !globalNotificationsCache.has(String(userId)));
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    if (!globalNotificationsCache.has(String(userId))) {
      setLoading(true);
    }

    try {
      const data = await getNotifications(userId);
      const rawList = Array.isArray(data) ? data : (data?.data || data?.result || []);

      const ordered = sortByDateDesc(rawList);
      const userKeys = globalKnownKeys.get(String(userId)) || new Set();
      const firstLoadDone = globalNotificationsCache.has(String(userId));

      const next = ordered.map((n) => {
        const key = getNotificationKey(n);
        const isNew = firstLoadDone ? !userKeys.has(key) : false;
        return { ...n, __key: key, isNew };
      });

      const updatedKeys = new Set(next.map((n) => n.__key));
      globalKnownKeys.set(String(userId), updatedKeys);
      globalNotificationsCache.set(String(userId), next);

      setNotifications(next);
      setError(null);
    } catch (err) {
      setError(err);
      if (!globalNotificationsCache.has(String(userId))) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
