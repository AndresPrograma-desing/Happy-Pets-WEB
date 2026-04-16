import React from 'react';
import styles from '../../components/GeneralStyles/ButtonsMenu.module.css';
import MenuHamburguesa from '../../components/MenuHamburguesa/MenuHamburguesa';
import cuStyles from '../AdminSystem/CreatedUser.module.css'; // Para que los botones se vean iguales
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/Notification/Notification';
import { getIcon } from '../../assets/icons/ExportIcon/Index';

function DoctorSystem() {
  const navigate = useNavigate();

  return (
    <div className={styles['admin-root']}>
      {/* Reutilizamos el Menú, pero con contenido para el Doctor */}
      <Notification title="¡Bienvenido al Panel!" message="Panel del Doctor cargado correctamente." duration={3000} />

      <MenuHamburguesa menuTitle="Panel Médico">
        
        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/citas', { state: { role: 'doctor' } })}
          >
          Mis Citas
          </button>
        </div>

        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/doctor/pacientes')}
          >
       Historias Clínicas
          </button>
        </div>

        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/doctor/recetas')}
          >
          Generar Receta
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
        

      </MenuHamburguesa>

      {/* Contenido principal de la página del Doctor */}
      <div className={styles.contentCenter}>
        <h1>Página del Doctor</h1>
        <p>Estamos trabajando para ofrecerte la mejor experiencia.</p>
      </div>
    </div>
  );
}

export default DoctorSystem;