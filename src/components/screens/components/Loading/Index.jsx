import React, { useState, useEffect } from 'react';
import styles from './Index.module.css';

const Loading = ({ text = "", phrases = [], size = 'medium', variant = 'default', className = '' }) => {
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
      }, 250);

    }, 3500);

    return () => clearInterval(interval);
  }, [phrases, text]);

  const renderLoader = () => {
    switch (variant) {
      case 'bars':
        return <div className={styles.loaderBars}></div>;
      case 'bounce':
        return <div className={styles.loaderBounce}></div>;
      case 'box':
        return <div className={styles.loaderBox}></div>;
      case 'default':
      default:
        return (
          <div className={styles.spinnerWrapper}>
            <svg className={styles.spinner} viewBox="0 0 50 50">
              <circle
                className={styles.spinnerCircle}
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`${styles.loadingContainer} ${styles[size]} ${className}`}>
      {renderLoader()}
      {currentText && (
        <span className={`${styles.text} ${fade ? styles.fadeIn : styles.fadeOut}`}>
          {currentText}
        </span>
      )}
    </div>
  );
};

export default Loading;