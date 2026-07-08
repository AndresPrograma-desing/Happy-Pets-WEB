import { useState, useEffect, useCallback, useRef } from 'react';
import { DEV_URL_API, isDummyModeActive } from '../../config/config';

export function useHealthCheck() {
  const isDummy = isDummyModeActive();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isBackendAlive, setIsBackendAlive] = useState(isDummy ? true : true);
  const [actualBackendAlive, setActualBackendAlive] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // true until the first check completes

  const isMountedRef = useRef(true);
  const controllerRef = useRef(null);
  const hasCheckedOnceRef = useRef(false);

  const HEALTH_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_HEALTH_URL)
    ? import.meta.env.VITE_HEALTH_URL
    : `${DEV_URL_API.baseURL}/Health`;


  const checkBackend = useCallback(async () => {
    // First check waits up to 60s (backend may be warming up on reload).
    // Subsequent polling checks use the standard 8s.
    const timeoutMs = hasCheckedOnceRef.current ? 8000 : 60000;

    try {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

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
        setActualBackendAlive(isAlive);
        if (!isDummy) {
          setIsBackendAlive(isAlive);
        }
        
        if (isAlive) setIsOnline(true);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setActualBackendAlive(false);
      if (!isDummy) {
        setIsBackendAlive(false);
      }
    } finally {
      // Mark the first check as done so the router can make decisions
      if (isMountedRef.current && !hasCheckedOnceRef.current) {
        hasCheckedOnceRef.current = true;
        setIsChecking(false);
      }
    }
  }, [HEALTH_URL, isDummy]);

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

  return { isOnline, isBackendAlive, actualBackendAlive, isDummy, isChecking };
}

export default useHealthCheck;