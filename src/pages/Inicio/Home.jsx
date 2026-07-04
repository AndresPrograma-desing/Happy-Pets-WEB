import React from 'react';
import styles from './styles.module.css';
import LoginForm from '../../components/auth/LoginForm';
import Carrussel from '../../components/Carrussel/carrussel';
import { SupportComponent } from '../../components/Support/Index.jsx';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.leftSection}>
        <div className={styles.header}>
          <h1 className={styles.title}>Happy Pet's</h1>
          <div className={styles.subtitleWrapper}>
            <h2 className={styles.subtitle}>BIENVENIDO</h2>
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