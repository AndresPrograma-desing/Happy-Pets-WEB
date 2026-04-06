import React from 'react';
import styles from '../../components/GeneralStyles/ButtonsMenu.module.css';
import MenuHamburguesa from '../../components/MenuHamburguesa/MenuHamburguesa';
import cuStyles from '../AdminSystem/CreatedUser.module.css'; // Para que los botones se vean iguales
import { useNavigate } from 'react-router-dom';
import FacturaDownloader from '../../components/FacturaDownloader/FacturaDownloader';

function DoctorSystem() {
  const navigate = useNavigate();

  return (
    <div className={styles['admin-root']}>
      {/* Reutilizamos el Menú, pero con contenido para la Secretaria */}
      <MenuHamburguesa menuTitle="Panel de la Secretaria">
        
        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/citas', { state: { role: 'secretaria' } })}
          >
          Ver Citas
          </button>
        </div>

        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/factura-manager')}
          >
            Crear Factura
          </button>
        </div>

        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/doctor/recetas')}
          >
          Generar Reportes
          </button>
        </div>

      </MenuHamburguesa>

      {/* Contenido principal de la página del Doctor */}
      <div className={styles.contentCenter}>
        <h1>Página de la Secretaria</h1>
        <p>Estamos trabajando para ofrecerte la mejor experiencia.</p>
      </div>
    </div>
  );
}

export default DoctorSystem;