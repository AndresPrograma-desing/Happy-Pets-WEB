import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Copy, Check, Loader2, X, ExternalLink, Clock } from 'lucide-react';

import { TEXTS, CONFIG } from './constants';
import { formatTime, getTargetUrl } from './utils';
import { useNowGrodSession } from './useNowGrodSession';
import styles from './Index.module.css';

export default function NowGrod() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef(null);
  const copyTimeoutRef = useRef(null);

  const {
    loading,
    tokenData,
    error,
    timeLeft,
    isRedirecting,
    progress,
    fetchToken,
    startRedirect,
  } = useNowGrodSession(isOpen);

  // Cerrar popover con click exterior
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Limpieza del feedback de copiado
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const targetUrl = getTargetUrl(tokenData?.token);
    if (!targetUrl) return;

    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);

      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(
        () => setCopied(false),
        CONFIG.COPY_FEEDBACK_DURATION_MS
      );
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  }, [tokenData?.token]);

  const handleRedirect = useCallback(() => {
    const targetUrl = getTargetUrl(tokenData?.token);
    setIsOpen(false);

    startRedirect(() => {
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    });
  }, [tokenData?.token, startRedirect]);

  const currentUrl = getTargetUrl(tokenData?.token);

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Botón Disparador */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={styles.triggerBtn}
        aria-label={TEXTS.tooltip}
        aria-expanded={isOpen}
      >
        <Bot size={18} />
      </button>

      {/* Tooltip */}
      {!isOpen && <span className={styles.tooltip}>{TEXTS.tooltip}</span>}

      {/* Popover Card */}
      {isOpen && (
        <div className={styles.popover} role="dialog" aria-modal="true">
          <div className={styles.popoverHeader}>
            <h4 className={styles.popoverTitle}>{TEXTS.title}</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={styles.closeBtn}
              aria-label={TEXTS.close}
            >
              <X size={14} />
            </button>
          </div>

          <div className={styles.popoverBody}>
            {loading && (
              <div className={styles.loadingContainer}>
                <Loader2 size={24} className={styles.spinner} />
                <span>{TEXTS.loading}</span>
              </div>
            )}

            {error && (
              <div className={styles.errorContainer}>
                <p className={styles.errorText}>{error}</p>
                <button type="button" onClick={fetchToken} className={styles.retryBtn}>
                  {TEXTS.btnRetry}
                </button>
              </div>
            )}

            {!loading && !error && tokenData && (
              <>
                {timeLeft === 0 ? (
                  <div className={styles.errorContainer}>
                    <p className={styles.errorText}>{TEXTS.expired}</p>
                    <button type="button" onClick={fetchToken} className={styles.retryBtn}>
                      {TEXTS.btnRenew}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.copyContainer}>
                      <input
                        type="text"
                        readOnly
                        value={currentUrl}
                        className={styles.urlInput}
                        onFocus={(e) => e.target.select()}
                      />
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
                        title={TEXTS.copyTitle}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>

                    <p className={styles.timerText}>
                      <Clock size={12} />
                      {TEXTS.timerPrefix}
                      <span className={styles.timerHighlight}>
                        {formatTime(timeLeft)}
                      </span>
                    </p>

                    <button
                      type="button"
                      onClick={handleRedirect}
                      className={styles.actionBtn}
                    >
                      {TEXTS.btnGo}
                      <ExternalLink size={14} />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay Modal (Portal) */}
      {isRedirecting &&
        createPortal(
          <div className={styles.overlay}>
            <div className={styles.modalContainer}>
              <h3 className={styles.modalTitle}>{TEXTS.redirectTitle}</h3>
              <p className={styles.modalSubtitle}>{TEXTS.redirectSubtitle}</p>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}