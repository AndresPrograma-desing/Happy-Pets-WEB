import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import LoginForm from '../../components/auth/LoginForm';
import Carrussel from '../../components/Carrussel/carrussel';
import { SupportComponent } from '../../components/Support/Index.jsx';
import Loading from '../../components/screens/components/Loading/Index';
import { CAROUSEL_IMAGES } from '../../components/Carrussel/constants';
import { HOME_TEXT } from './constants';

const Home = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all(
      CAROUSEL_IMAGES.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve(url);
          img.onerror = () => resolve(url);
        });
      })
    ).then(() => {
      if (mounted) setImagesLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  if (!imagesLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#f8fafc' }}>
        <Loading size="giant" text={HOME_TEXT.loading} />
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.leftSection}>
        <div className={styles.header}>
          <h1 className={styles.title}>{HOME_TEXT.title}</h1>
          <div className={styles.subtitleWrapper}>
            <h2 className={styles.subtitle}>{HOME_TEXT.subtitle}</h2>
          </div>
        </div>
        <div className={styles.formWrapper}>
          <LoginForm />
        </div>
      </div>
      <div className={styles.rightSection}>
        <Carrussel />
      </div>
      <SupportComponent />
    </div>
  );
};

export default Home;