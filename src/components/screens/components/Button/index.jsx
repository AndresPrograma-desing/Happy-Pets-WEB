import React from 'react';
import styles from './index.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  active = false,
  fullWidth = false,
  icon: Icon,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[size] || styles.medium;
  const activeClass = active ? styles.active : '';
  const fullWidthClass = fullWidth ? styles.fullWidth : '';

  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${sizeClass} ${activeClass} ${fullWidthClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <span className={styles.iconWrapper}><Icon size={size === 'small' ? 14 : size === 'large' ? 20 : 16} /></span>}
      {children}
    </button>
  );
};

export default Button;
