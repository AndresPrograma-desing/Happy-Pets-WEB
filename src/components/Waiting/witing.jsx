import React, { useState } from 'react';
import styles from './waiting.module.css';
import { WifiOff, ServerOff } from 'lucide-react';
import { SupportComponent } from '../Support/Index.jsx';
import { FloatingWidget } from '../common/FloatingWidget/FloatingWidget.jsx';
import Button from '../screens/components/Button/index.jsx';
import ToggleCard from '../screens/components/ToggleCard/index.jsx';
import { UserCircle } from 'lucide-react';

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

      <FloatingWidget 
        icon={ServerOff}
        title="Modo Simulación"
        position="top-left"
        buttonTitle="Entrar en Modo Simulación"
      >
        <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#475569' }}>
          Puedes entrar al sistema utilizando datos locales falsos para probar la interfaz.
        </p>

        <ToggleCard 
          title="Credenciales de Prueba" 
          icon={UserCircle} 
          description="Usa estos correos según el rol (la contraseña puede ser cualquiera)."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', marginTop: '10px' }}>
            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>Admin:</strong> <code>admin@happypets.com</code>
            </div>
            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>Doctor:</strong> <code>doctor@happypets.com</code>
            </div>
            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>Secretaria:</strong> <code>secretaria@happypets.com</code>
            </div>
          </div>
        </ToggleCard>

        <div style={{ marginTop: '15px' }}>
          <Button 
            variant="primary"
            fullWidth
            onClick={() => {
              localStorage.setItem('USE_DUMMY_DATA', 'true');
              window.location.reload();
            }}
          >
            Entrar en Modo Simulación
          </Button>
        </div>
      </FloatingWidget>

      <SupportComponent />
    </div>
  );
};

export default ServerErrorState;