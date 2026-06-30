import React from 'react';
import styles from './Button.module.css';

export default function Button({
  children,
  icon,
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  style = {},
  small = false,
  onlyIcon = false,
  loading = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.flyBtn} ${small ? styles.small : ''} ${onlyIcon ? styles.onlyIconBtn : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      <div className={styles.svgWrapper1}>
        <div className={styles.svgWrapper}>
          {loading ? (
            <div className={styles.btnSpinner}></div>
          ) : icon ? (
            React.isValidElement(icon) ? icon : <img src={icon} alt="" className={styles.iconElement} />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className={styles.defaultSvg}
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path
                fill="currentColor"
                d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
              ></path>
            </svg>
          )}
        </div>
      </div>
      {!onlyIcon && <span>{children || 'Enviar factura'}</span>}
    </button>
  );
}