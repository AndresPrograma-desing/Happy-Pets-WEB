import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './Search.module.css';

export default function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.inputField}
      />
      {value && (
        <button 
          className={styles.clearButton} 
          onClick={() => onChange('')}
          type="button"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}