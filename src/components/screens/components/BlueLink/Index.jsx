import React from 'react';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import styles from './Index.module.css';

export default function BlueLink({ label, url, navigate }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
    } else {
      if (navigate) navigate(url);
    }
  };

  return (
    <ModalTooltip text={`Ir a ${label}`}>
      <a href={url} className={styles.blueLink} onClick={handleClick}>
        {label}
      </a>
    </ModalTooltip>
  );
}