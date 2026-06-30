import { useState, useEffect, useCallback, useRef } from 'react';
import { DEV_URL_API } from '../../config/config';

export function useHealthCheck() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isBackendAlive, setIsBackendAlive] = useState(true);

  const isMountedRef = useRef(true);
  const controllerRef = useRef(null);

  const HEALTH_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_HEALTH_URL)
    ? import.meta.env.VITE_HEALTH_URL
    : `${DEV_URL_API.baseURL}/Health`;


  const checkBackend = useCallback(async () => {
    try {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 8000);

      const res = await fetch(HEALTH_URL, { 
        method: 'GET', 
        signal: controller.signal,
        headers: {
          'X-Tunnel-Skip-AntiPhishing-Page': 'true',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      clearTimeout(timeoutId);

      if (isMountedRef.current) {
        const contentType = res.headers.get("content-type") || "";
        const isHtml = contentType.includes("text/html");
        
        const isAlive = res.ok && !isHtml;
        setIsBackendAlive(isAlive);
        
        if (isAlive) setIsOnline(true);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setIsBackendAlive(false);
    }
  }, [HEALTH_URL]);

  useEffect(() => {
        
    if (typeof window === 'undefined') return;

    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);

    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);

    isMountedRef.current = true;

    Promise.resolve().then(checkBackend);

    const interval = setInterval(checkBackend, 10000);

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
      clearInterval(interval);
      isMountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [checkBackend]);

  return { isOnline, isBackendAlive };
}

export default useHealthCheck;