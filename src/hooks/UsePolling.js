import { useEffect, useRef } from 'react';

/**
 * @param {Function} callback
 * @param {number|null} delay i
 * @param {boolean} [active=true]
 */

function usePolling(callback, delay, active = true) {
    const saveCallback = useRef(() => {});

    useEffect(() => {
        saveCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!active || delay == null) return;

        saveCallback.current();

        const id = setInterval(() => {
            saveCallback.current();
        }, delay);

        return () => clearInterval(id);
    }, [delay, active]);
}

export default usePolling;
