import React from "react";
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  return (
    <div className={styles.buttonIniciarSesion}>
      <button
        onClick={() => navigate('/login')}
      >
        Iniciar Sesión
      </button>
    </div>
  );
}

export default Login;
