import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import styles from './Index.module.css'; 

export default function CopyableText({ text }) {

  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();  
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar el texto: ', err);
    }
  };

  return (
    <ModalTooltip text={copied ? "¡Copiado!" : "Haga clic para copiar"}>
      <span className={styles.copyableContainer} onClick={handleCopy}>
        <span className={styles.copyableText}>{text}</span>
        {copied ? (
          <Check size={14} className={styles.copyIconSuccess} />
        ) : (
          <Copy size={14} className={styles.copyIcon} />
        )}
      </span>
    </ModalTooltip>
  );
}