import React from 'react';
import styles from './Index.module.css';

function Frame({ title, icon, content, error, children, className = '' }) {
    return (
        <div className={`${styles.frameCard} ${className}`}>
            {(title || icon) && (
                <div className={styles.headerContainer}>
                    {title && <h3 className={styles.frameTitle}>{title}</h3>}
                    {icon && <div className={styles.iconContainer}>{icon}</div>}
                </div>
            )}
            {content && <p className={styles.description}>{content}</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}
            {children}
        </div>
    );
}

export default Frame;
