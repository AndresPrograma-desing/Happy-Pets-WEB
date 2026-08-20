import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../../../services/api';
import { CONFIG } from './constants';

export function useNowGrodSession(isOpen) {
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Redirection states
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const fetchToken = useCallback(async () => {
    setLoading(true);
    setError('');
    setTokenData(null);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const data = await api.externalNowGrosWeb();
      if (data && data.token) {
        setTokenData(data);
        const expiresSec = data.expires_in || CONFIG.DEFAULT_EXPIRE_SEC;
        setTimeLeft(expiresSec);

        // Start countdown timer
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        throw new Error('La respuesta del servidor no contiene un token válido.');
      }
    } catch (err) {
      console.error('Error fetching NowGrod token:', err);
      setError('No se pudo establecer la sesión con NowGrod.ia. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const startRedirect = useCallback((onComplete) => {
    setIsRedirecting(true);
    setProgress(0);

    const duration = CONFIG.REDIRECT_DURATION_MS;
    const intervalTime = CONFIG.REDIRECT_INTERVAL_MS;
    const step = 100 / (duration / intervalTime);

    if (progressRef.current) clearInterval(progressRef.current);

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressRef.current);
          if (onComplete) onComplete();
          setIsRedirecting(false);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);
  }, []);

  // Fetch token when popover opens, clean up on close
  useEffect(() => {
    if (isOpen) {
      fetchToken();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTokenData(null);
      setError('');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, fetchToken]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  return {
    loading,
    tokenData,
    error,
    timeLeft,
    isRedirecting,
    progress,
    fetchToken,
    startRedirect,
  };
}