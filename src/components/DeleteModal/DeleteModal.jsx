import React, { useState } from 'react';
import styles from './DeleteModal.module.css';
import { getIcon } from '../../assets/icons/ExportIcon/Index';

export default function ModalConfirmacion({ 
  triggerText = "Eliminar", 
  title = "Confirmar acción", 
  description = "Ingrese el nombre para confirmar:", 
  placeholder = "Nombre del producto",
  confirmText = "Confirmar",
  onConfirm, 
  onSuccess  
}) {
  const [show, setShow] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const open = () => { 
    setInputValue(''); 
    setFeedback({ type: '', msg: '' }); 
    setShow(true); 
  };
  
  const close = () => { 
    setShow(false); 
    setLoading(false); 
    setFeedback({ type: '', msg: '' });
  };

  const handleAction = async () => {
    if (!inputValue.trim()) {
      setFeedback({ type: 'error', msg: 'Este campo es obligatorio' });
      return;
    }

    setLoading(true);
    setFeedback({ type: 'info', msg: 'Procesando...' });

    try {
      // Ejecutamos la función que recibimos por props
      const res = await onConfirm(inputValue.trim());
      
      if (res.success) {
        setFeedback({ type: 'success', msg: res.message || 'Operación exitosa' });
        setTimeout(() => {
          close();
          if (typeof onSuccess === 'function') onSuccess();
        }, 1500);
      } else {
        setFeedback({ type: 'error', msg: res.message });
        setLoading(false);
      }
    } catch (e) {
        console.error('Error en handleAction:', e);
      setLoading(false);
      setFeedback({ type: 'error', msg: 'Error inesperado en el servidor' });
    }
  };

  return (
    <>
      <button className={styles.triggerBtn} onClick={open}>
        <img src={getIcon('trash')} alt="" className={styles.trashIcon} aria-hidden="true"/>
        {triggerText}</button>

      {show && (
        <div className={styles.modalOverlay} onMouseDown={close}>
          <div className={styles.modal} onMouseDown={e => e.stopPropagation()}>
            <h3>{title}</h3>
            
            {feedback.msg && (
              <div className={`${styles.alert} ${styles[feedback.type]}`}>
                {feedback.msg}
              </div>
            )}

            <p>{description}</p>
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={placeholder}
              className={styles.inputField}
              disabled={loading || feedback.type === 'success'}
              autoFocus
            />

            <div className={styles.actions}>
              <button className={styles.secondary} onClick={close} disabled={loading}>
                Cancelar
              </button>
              <button 
                className={styles.primary} 
                onClick={handleAction} 
                disabled={loading || feedback.type === 'success'}
              >
                {loading ? 'Cargando...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}