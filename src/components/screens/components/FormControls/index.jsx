import React from 'react';
import styles from './FormControls.module.css';

export function FormCard({ icon: Icon, title, children, headerActions }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                    {Icon && <Icon size={20} className={styles.cardIcon} />}
                    <h3>{title}</h3>
                </div>
                {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
            </div>
            <div className={styles.cardContent}>
                {children}
            </div>
        </div>
    );
}

export function FormInput({ label, icon: Icon, ...props }) {
    return (
        <div className={styles.inputGroup}>
            {label && (
                <label className={styles.label}>
                    {Icon && <Icon size={14} />} {label}
                </label>
            )}
            <input className={styles.input} {...props} />
        </div>
    );
}

export function FormTextArea({ label, icon: Icon, ...props }) {
    return (
        <div className={styles.inputGroup}>
            {label && (
                <label className={styles.label}>
                    {Icon && <Icon size={14} />} {label}
                </label>
            )}
            <textarea className={styles.textarea} {...props} />
        </div>
    );
}
