import React from 'react';
import styles from '../../components/GeneralStyles/ButtonsMenu.module.css';
import MenuHamburguesa from '../../components/MenuHamburguesa/MenuHamburguesa';
import cuStyles from '../AdminSystem/CreatedUser.module.css'; // Para que los botones se vean iguales
import { useNavigate } from 'react-router-dom';
import FacturaDownloader from '../../components/FacturaDownloader/FacturaDownloader';
import Notification from '../../components/Notification/Notification';
import { getIcon } from '../../assets/icons/ExportIcon/Index';

function DoctorSystem() {
  const navigate = useNavigate();

  return (
    <div className={styles['admin-root']}>

      <Notification title="¡Bienvenido al Panel!" message="Panel de la Secretaria cargado correctamente." duration={3000} />
      {/* Reutilizamos el Menú, pero con contenido para la Secretaria */}
      <MenuHamburguesa menuTitle="Panel de la Secretaria">
        
        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/citas', { state: { role: 'secretaria' } })}
          >
              <img src={getIcon('userCita')} alt="Ver Citas" />
          Ver Citas
          </button>
        </div>

        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/factura-manager')}
          >
            <img src={getIcon('fileText')} alt="Crear Factura" />
            Crear Factura
          </button>
        </div>

        <div className={styles.menuItem}>
          <button
            className={cuStyles.openBtn}
            onClick={() => navigate('/facturas')}
          >
            <img src={getIcon('fileCheck')} alt="Ver Facturas" />
            Ver Facturas
          </button>
        </div>

        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/doctor/recetas')}
          >
            <img src={getIcon('clipboardPlus')} alt="Generar Reportes" />
          Generar Reportes
          </button>
        </div>

      </MenuHamburguesa>

  
      <div className={styles.contentCenter}>
        <h1>Página de la Secretaria</h1>
        <p>Estamos trabajando para ofrecerte la mejor experiencia.</p>
      </div>
    </div>
  );
}

export default DoctorSystem;