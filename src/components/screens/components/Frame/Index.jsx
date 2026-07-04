import React from 'react';
import styles from './Index.module.css';

function Frame({ title, error, children, className = '' }) {
    return (
        <div className={`${styles.frameCard} ${className}`}>
            {title && <h3 className={styles.frameTitle}>{title}</h3>}
            {error && <p className={styles.errorMessage}>{error}</p>}
            {children}
        </div>
    );
}

export default Frame;
