import React, { useState, useEffect } from 'react';
import styles from './carrussel.module.css';
import { CAROUSEL_IMAGES } from './constants';

const Carrussel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length);
    }, 5000); // Cambia de imagen cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.carouselContainer}>
      {CAROUSEL_IMAGES.map((img, idx) => (
        <div
          key={idx}
          className={`${styles.slide} ${idx === currentIndex ? styles.active : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
    </div>
  );
};

export default Carrussel;
