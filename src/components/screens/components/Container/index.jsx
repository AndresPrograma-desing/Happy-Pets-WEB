import React from 'react';
import styles from './index.module.css';
import Paginador from '../Material-UI/Components/Paginador';

export default function Container({ 
  children, 
  className = '', 
  showPagination = false,
  paginationCount = 10,
  paginationPage = 1,
  onPaginationChange,
  paginationProps = {},
  ...props 
}) {
  return (
    <div className={`${styles.containerCard} ${className}`} {...props}>
      {children}
      {showPagination && (
        <Paginador 
          count={paginationCount} 
          page={paginationPage} 
          onChange={onPaginationChange} 
          {...paginationProps}
        />
      )}
    </div>
  );
}
