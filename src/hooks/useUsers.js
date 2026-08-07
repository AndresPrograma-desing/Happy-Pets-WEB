import { useState, useEffect, useCallback } from 'react';
import { users } from '../services/api';

/**
 * Custom hook to fetch and manage user listings.
 * @param {boolean} autoFetch - Whether to automatically fetch users when the hook mounts.
 */
export default function useUsers(autoFetch = false) {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await users();
      setUsersList(data || []);
    } catch (err) {
      setError(err?.message || "Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [autoFetch, fetchUsers]);

  return {
    usersList,
    loading,
    error,
    fetchUsers
  };
}
