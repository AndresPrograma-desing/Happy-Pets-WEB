import styles from '../../components/GeneralStyles/ButtonsMenu.module.css';
import MenuHamburguesa from '../../components/MenuHamburguesa/MenuHamburguesa';
import CreatedUser from './CreatedUser'; // Asegura que la ruta sea correcta
import cuStyles from './CreatedUser.module.css'; // Estilos del botón de usuario
import { useNavigate } from 'react-router-dom';

function AdminSystem() {
  const navigate = useNavigate();

  return (
    <div className={styles['admin-root']}>
      {/* 1. Pasamos el título y los botones como "children" al menú */}
      <MenuHamburguesa menuTitle="Panel de Administración">
        
        <div className={styles.menuItem}>
          <CreatedUser />
        </div>

        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/AdminSystem/products')}
          >
            Ver productos
          </button>
        </div>

        <div className={styles.menuItem}>
          <button 
            className={cuStyles.openBtn} 
            onClick={() => navigate('/AdminSystem/products/manage')}
          >
            Administrar productos
          </button>
        </div>

        

      </MenuHamburguesa>

      {/* 2. Contenido principal de la página */}
      <div className={styles.contentCenter}>
        <h1>Página del Administrador</h1>
        <p>Estamos trabajando para ofrecerte la mejor experiencia. Por favor, vuelve más tarde.</p>
      </div>
    </div>
  );
}

export default AdminSystem;