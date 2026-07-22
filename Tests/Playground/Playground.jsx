import React, { useState } from 'react';
import Container from '../../src/components/screens/components/Container/index.jsx'; 
import styles from './Index.module.css';

export default function Playground({ registry = {}, ...props }) {
  // Tomamos las llaves del registro para el selector
  const componentKeys = Object.keys(registry);
  const [selectedKey, setSelectedKey] = useState(componentKeys[0] || '');

  // Obtenemos el componente activo
  const SelectedComponent = registry[selectedKey];

  return (
    <div className={styles.playgroundWrapper}>
      <div className={styles.playgroundHeader}>
        <h3 className={styles.playgroundTitle}>🛠️ Entorno de Pruebas (Component Playground)</h3>
        
        {/* Selector de componentes de prueba */}
        {componentKeys.length > 0 && (
          <select 
            className={styles.playgroundSelect}
            value={selectedKey} 
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {componentKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        )}
      </div>
      
      {/* Container original intacto aplicando estilos de lienzo */}
      <Container className={styles.playgroundCanvas} {...props}>
        <div className={styles.playgroundGrid}>
          {SelectedComponent ? (
            <SelectedComponent />
          ) : (
            <p className={styles.playgroundEmpty}>No hay ningún componente de prueba registrado.</p>
          )}
        </div>
      </Container>
    </div>
  );
}