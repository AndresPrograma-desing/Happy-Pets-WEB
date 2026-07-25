import React from 'react';
import { Calendar } from 'lucide-react';
import styles from './index.module.css';

export default function DateTag({ date, bgColor, textColor, iconColor, style = {} }) {
  if (!date) return null;

  let formattedDate = '';
  try {
    formattedDate = new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    formattedDate = String(date);
  }

  const customStyles = {
    backgroundColor: bgColor || 'var(--tag-bg, #f1f5f9)',
    color: textColor || 'var(--tag-text, #475569)',
    ...style
  };

  return (
    <div className={styles.tag} style={customStyles}>
      <Calendar size={14} color={iconColor || textColor || 'var(--tag-text, #475569)'} />
      <span>{formattedDate}</span>
    </div>
  );
}
