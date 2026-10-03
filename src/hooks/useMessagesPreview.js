import { useCallback, useState } from 'react';
import { getUserId } from '../context/LocalStorage';
import { getUserMessages, getUsers } from '../services/api';
import { extractList, normalizeMessage, normalizeUser } from '../features/messaging/logic';

// Vista previa liviana de los mensajes recibidos, usada por el modal del TopBar.
// Se carga bajo demanda (al abrir el modal) en vez de en cada montaje del TopBar.
export default function useMessagesPreview() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [rawMessages, rawUsers] = await Promise.all([getUserMessages(userId), getUsers()]);
      const usersById = new Map(extractList(rawUsers).map(normalizeUser).map((u) => [u.id, u]));

      const received = extractList(rawMessages)
        .map(normalizeMessage)
        .filter((m) => m.to === String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((m) => ({ ...m, sender: usersById.get(m.from) || null }));

      setMessages(received);
    } catch (err) {
      console.error('Error cargando vista previa de mensajes:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, loading, error, load };
}
