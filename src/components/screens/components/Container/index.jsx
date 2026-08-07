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
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
  ...props 
}) {
  return (
    <div className={`${styles.containerCard} ${className}`} {...props}>
      {children}
      {showPagination && (
        <div className={styles.paginationContainer}>
          <Paginador 
            count={paginationCount} 
            page={paginationPage} 
            onChange={onPaginationChange} 
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
            {...paginationProps}
          />
        </div>
      )}
    </div>
  );
}
