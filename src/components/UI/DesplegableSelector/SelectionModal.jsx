import React, { useState } from 'react';
import styles from './CustomSelect.module.css';

const SelectionModal = ({ title, isOpen, onClose, items, onConfirm, initialSelected = [] }) => {
  const [selectedIds, setSelectedIds] = useState(initialSelected);

  if (!isOpen) return null;

  const toggleItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.content}>
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`${styles.selectionRow} ${selectedIds.includes(item.id) ? styles.activeRow : ''}`}
              onClick={() => toggleItem(item.id)}
            >
              <div className={`${styles.customCheck} ${selectedIds.includes(item.id) ? styles.checked : ''}`}>
                {selectedIds.includes(item.id) && "✓"}
              </div>
              <span>{item.name || item.nombre}</span>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.confirmBtn} onClick={() => { onConfirm(selectedIds); onClose(); }}>
            Confirmar ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionModal;