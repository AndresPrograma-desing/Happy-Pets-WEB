import React, { forwardRef } from 'react';
import styles from './index.module.css';

const Input = forwardRef(({ label, id, className = '', containerClassName = '', error, ...props }, ref) => {
    return (
        <div className={`${styles.inputGroup} ${containerClassName}`}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={id}
                ref={ref}
                className={`${styles.input} ${error ? styles.inputError : ''} ${className}`}
                {...props}
            />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
