import React from 'react';
import MenuHamburguesa from './MenuHamburguesa/MenuHamburguesa';
import styles from './GenericPanel.module.css';

function GenericPanel({ title, message }) {
  return (
    <div className={styles['admin-root']}>
      <MenuHamburguesa />
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  );
}

export default GenericPanel;