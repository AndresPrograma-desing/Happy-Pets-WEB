import React, { useEffect, useRef, useState } from 'react';
import { Loading } from 'anteriority-ui';
import styles from './index.module.css';
import { TEXTS } from '../../constants';
import { SDK_SCRIPT_ID, CONTAINER_ID, INITIAL_IFRAME_HEIGHT } from './constants';

function loadSdkScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.getElementById(SDK_SCRIPT_ID);
        if (existing) {
            if (window.ContextHubLogin) {
                resolve();
            } else {
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', reject);
            }
            return;
        }

        const script = document.createElement('script');
        script.id = SDK_SCRIPT_ID;
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

function ContextHubLoginFrame({ onSuccess, onError, isLoading = false }) {
    const containerRef = useRef(null);
    const widgetRef = useRef(null);
    const [sdkReady, setSdkReady] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        const baseUrl = import.meta.env.VITE_CONTEXTHUB_URL;
        const clientKey = import.meta.env.VITE_CONTEXTHUB_CLIENT_KEY;

        if (!baseUrl || !clientKey) {
            setLoadError(true);
            onError?.({ error: 'missing_config' });
            return;
        }

        let cancelled = false;

        loadSdkScript(`${baseUrl.replace(/\/$/, '')}/sdk-login.js`)
            .then(() => {
                if (cancelled || !containerRef.current || !window.ContextHubLogin) return;

                widgetRef.current = window.ContextHubLogin.mount(containerRef.current, {
                    clientKey,
                    width: '100%',
                    height: INITIAL_IFRAME_HEIGHT,
                    onSuccess: (result) => {
                        onSuccess?.(result);
                    },
                    onError: (err) => {
                        onError?.(err);
                    },
                });
                setSdkReady(true);
            })
            .catch(() => {
                if (!cancelled) {
                    setLoadError(true);
                    onError?.({ error: 'sdk_load_failed' });
                }
            });

        return () => {
            cancelled = true;
            widgetRef.current?.unmount?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.wrapper}>
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <Loading size="giant" phrases={['Cargando', '.', '..', '...']} />
                </div>
            )}
            {!sdkReady && !loadError && (
                <div className={styles.loadingCard}>
                    <div className={styles.spinner} />
                    <p>{TEXTS.contextHubLoading}</p>
                </div>
            )}
            {loadError && (
                <div className={styles.loadingCard}>
                    <p>{TEXTS.contextHubLoadError}</p>
                </div>
            )}
            <div
                id={CONTAINER_ID}
                ref={containerRef}
                className={`${sdkReady ? styles.iframeContainer : styles.hidden} ${isLoading ? styles.hiddenContent : ''}`}
            />
        </div>
    );
}

export default ContextHubLoginFrame;
