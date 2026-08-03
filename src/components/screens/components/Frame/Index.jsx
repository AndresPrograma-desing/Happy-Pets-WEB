import React from 'react';
import { createPortal } from 'react-dom';
import styles from './Index.module.css';
import Loading from '../Loading/Index';

function Frame({ title, icon, content, error, children, className = '', isModal = false, onClose, isLoading = false }) {
    const frameContent = (
        <div className={`${styles.frameCard} ${className}`} onClick={(e) => e.stopPropagation()}>
            {(title || icon) && (
                <div className={styles.headerContainer}>
                    {title && <h3 className={styles.frameTitle}>{title}</h3>}
                    {icon && <div className={styles.iconContainer}>{icon}</div>}
                </div>
            )}
            {content && <p className={styles.description}>{content}</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}
            <div className={styles.bodyContainer}>
                {isLoading && (
                    <div className={styles.loadingOverlay}>
                        <Loading 
                            size="giant" 
                        />
                    </div>
                )}
                <div className={isLoading ? styles.hiddenContent : ''}>
                    {children}
                </div>
            </div>
        </div>
    );

    if (isModal) {
        return createPortal(
            <div className={styles.modalOverlay} onClick={onClose}>
                {frameContent}
            </div>,
            document.body
        );
    }

    return frameContent;
}

export default Frame;
