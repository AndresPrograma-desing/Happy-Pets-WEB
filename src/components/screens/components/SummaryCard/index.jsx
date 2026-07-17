import React, { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import styles from './index.module.css';
import Button from '../Button/index';

const SummaryCard = ({ title, text, enableCopy = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={styles.iaSummaryCard}>
      <div className={styles.iaSummaryHeader}>
        <Sparkles size={24} />
        <h3>{title}</h3>
        {enableCopy && (
          <Button 
            onClick={handleCopy}
            variant="ghost"
            color={copied ? "green" : "#64748b"}
            circle
            size="small"
            icon={copied ? Check : Copy}
            style={{ marginLeft: 'auto' }}
            ToolTip={copied ? "¡Copiado!" : "Copiar contenido"}
          />
        )}
      </div>
      <p className={styles.iaSummaryText}>{text}</p>
    </div>
  );
};

export default SummaryCard;
