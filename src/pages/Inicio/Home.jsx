import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // si usas react-router-dom
import styles from './styles.module.css';

// Imágenes para el carrusel (reemplaza con tus URLs)
const images = [
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); // hook para redirección

  // Cambio automático de imagen cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginClick = () => {
    navigate('/login'); // redirige a la ruta de login
  };

  return (
    <div className={styles.home}>
      {/* Carrusel de fondo */}
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`${styles.slide} ${idx === currentIndex ? styles.active : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      {/* Overlay oscuro para mejorar legibilidad */}
      <div className={styles.overlay}></div>

      {/* Contenido principal */}
      <div className={styles.content}>
        <h1 className={styles.title}>
          Bienvenido a <span className={styles.highlight}>Happy Pets</span>
        </h1>
        <p className={styles.subtitle}>
          Sistema para optimizar procesos operativos de la Veterinaria Happy Pets
        </p>
        <button onClick={handleLoginClick} className={styles.loginButton}>
          Iniciar sesión
        </button>
      </div>

      {/* Indicadores de slide (opcional) */}
      <div className={styles.indicators}>
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;