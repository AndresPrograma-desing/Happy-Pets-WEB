import React from 'react';
import styles from './index.module.css';

const Barnner = ({ children, icon: Icon, type = 'default', className = '' }) => {
  const typeClass = styles[`badge${type.charAt(0).toUpperCase() + type.slice(1)}`] || styles.badgeDefault;
  
  return (
    <div className={`${styles.badge} ${typeClass} ${className}`}>
      {Icon && <Icon size={14} />}
      <span>{children}</span>
    </div>
  );
};

export default Barnner;
