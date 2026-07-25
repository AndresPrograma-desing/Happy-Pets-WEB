import React from 'react';
import styles from './Index.module.css';

export default function GreenHighlight({ children }) {
    return <strong className={styles.greenHighlight}>{children}</strong>;
}