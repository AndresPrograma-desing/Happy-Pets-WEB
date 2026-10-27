import { useEffect, useRef } from 'react';

/**
 * @param {Function} callback
 * @param {number|null} delay i
 * @param {boolean} [active=true]
 */

function usePolling(callback, delay , active = true) {
    const saveCallback = useRef(() => {});
    const lastFiredAtRef = useRef(0);

    useEffect(() => {
        saveCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!active || delay == null) return;

        // React StrictMode ejecuta setup->cleanup->setup de forma síncrona en desarrollo,
        // lo que duplicaba este fetch inicial. Un cambio real de `active`/`delay` (ej. al
        // reanudar el polling) siempre ocurre bastante después, así que el umbral solo
        // filtra ese doble-montaje sincrónico sin afectar los re-disparos legítimos.
        const now = Date.now();
        if (now - lastFiredAtRef.current > 50) {
            lastFiredAtRef.current = now;
            saveCallback.current();
        }

        const id = setInterval(() => {
            saveCallback.current();
        }, delay);

        return () => clearInterval(id);
    }, [delay, active]);
}

export default usePolling;
