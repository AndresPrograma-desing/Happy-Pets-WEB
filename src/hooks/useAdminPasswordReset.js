import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

export default function useAdminPasswordReset() {
  const [requestLoading, setRequestLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState('Idle'); // Idle, Pending, Accepted, Completed
  const [pendingList, setPendingList] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  
  const pollingInterval = useRef(null);

  const clearError = () => setError(null);

  const fetchPendingList = useCallback(async () => {
    console.log("-> fetchPendingList called");
    setFetchLoading(true);
    try {
      const data = await api.getPendingResets();
      console.log("-> fetchPendingList data:", data);
      setPendingList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener reseteos pendientes:", err);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  // Paso 1: Solicitar el reseteo
  const requestPasswordReset = async (email) => {
    setRequestLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.requestPasswordReset(email);
      setStatus('Pending');
      startPolling(email);
      return true;
    } catch (err) {
      setError(err?.message || 'Error al solicitar el reseteo de contraseña');
      return false;
    } finally {
      setRequestLoading(false);
    }
  };

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  // Paso 2: Polling
  const checkStatus = useCallback(async (email) => {
    try {
      const res = await api.getResetStatus(email);
      const data = res?.data ?? res;
      if (data) {
        setActiveTicket(data);
        const currentStatus = data.status;
        if (currentStatus === 'Accepted') {
          setStatus('Accepted');
          stopPolling();
        } else if (currentStatus === 'None') {
          setStatus('Idle');
          stopPolling();
        }
      }
    } catch (err) {
      console.error("Error al consultar el estado del ticket:", err);
    }
  }, [stopPolling]);

  const startPolling = useCallback((email) => {
    stopPolling();
    checkStatus(email);
    // Iniciar polling cada 5 segundos
    pollingInterval.current = setInterval(() => {
      checkStatus(email);
    }, 5000);
  }, [stopPolling, checkStatus]);

  // Paso 3: Asignar nueva clave
  const assignNewPassword = async (email, newPassword) => {
    setPwdLoading(true);
    setError(null);
    try {
      await api.assignNewPassword(email, newPassword);
      setSuccess(true);
      setStatus('Completed');
      return true;
    } catch (err) {
      setError(err?.message || 'Error al asignar la nueva contraseña');
      return false;
    } finally {
      setPwdLoading(false);
    }
  };

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => stopPolling();
  }, []);

  const resetResetState = useCallback(() => {
    setSuccess(false);
    setStatus('Idle');
    setError(null);
    setActiveTicket(null);
  }, []);

  return {
    requestPasswordReset,
    assignNewPassword,
    requestLoading,
    pwdLoading,
    error,
    success,
    status,
    pendingList,
    fetchLoading,
    clearError,
    setStatus,
    stopPolling,
    fetchPendingList,
    startPolling,
    activeTicket,
    setActiveTicket,
    resetResetState
  };
}
