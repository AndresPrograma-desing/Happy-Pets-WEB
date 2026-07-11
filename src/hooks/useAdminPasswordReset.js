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

  // Paso 2: Polling
  const checkStatus = async (email) => {
    try {
      const res = await api.getResetStatus(email);
      // The API returns { email: "...", status: "Pending" | "Accepted" | "Completed" }
      const currentStatus = res?.status || res?.data?.status;
      if (currentStatus === 'Accepted') {
        setStatus('Accepted');
        stopPolling();
      }
    } catch (err) {
      console.error("Error al consultar el estado del ticket:", err);
    }
  };

  const startPolling = (email) => {
    stopPolling();
    // Iniciar polling cada 5 segundos
    pollingInterval.current = setInterval(() => {
      checkStatus(email);
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

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
    startPolling
  };
}
