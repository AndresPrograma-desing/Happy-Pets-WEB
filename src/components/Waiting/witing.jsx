import React from 'react';
import styles from './waiting.module.css';
import { WifiOff } from 'lucide-react';

const ServerErrorState = () => {
  return (
    <div className={styles.wordSearchContainer}>
      
      <div className={styles.iconWrapper}>
        <WifiOff size={48} color="#ef4444" />
        </div>

      <h2 className={styles.gameTitle}>
        Sin conexión al Servidor
        </h2>
        
      <p className={styles.errorMessage}>
        Servidor no disponible en este momento. Por favor, comprueba tu conexión e inténtalo de nuevo.
      </p>
      
    </div>
  );
};

export default ServerErrorState;