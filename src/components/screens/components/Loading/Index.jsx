import React, { useState, useEffect } from 'react';
import styles from './Index.module.css';

const Loading = ({ text = "", phrases = [], size = 'medium', className = '' }) => {
  const [currentText, setCurrentText] = useState(text);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!phrases || phrases.length === 0) {
      setCurrentText(text);
      return;
    }

    setCurrentText(phrases[0]);

    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % phrases.length;
          setCurrentText(phrases[nextIndex]);
          return nextIndex;
        });
        setFade(true);
      }, 200);

    }, 3000);

    return () => clearInterval(interval);
  }, [phrases, text]);

  return (
    <div className={`${styles.loadingContainer} ${styles[size]} ${className}`}>
      <div className={styles.spinner}></div>
      {currentText && (
        <span className={`${styles.text} ${fade ? styles.fadeIn : styles.fadeOut}`}>
          {currentText}
        </span>
      )}
    </div>
  );
};

export default Loading;