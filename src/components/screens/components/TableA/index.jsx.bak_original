import React from 'react';
import styles from './index.module.css';
import Loading from '../Loading/Index';
import { AlertCircle, Inbox } from 'lucide-react';
import Button from '../Button';

const TableA = ({ 
  columns = [], 
  data = [], 
  keyExtractor, 
  rowClassName, 
  loading = false, 
  error = null, 
  onRetry,
  emptyIcon: EmptyIcon = Inbox,
  emptyMessage = "No hay datos disponibles" 
}) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 0 }}>
                <div className={styles.tableLoadingContainer}>
                  <Loading size="large" text="" />
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 0 }}>
                <div className={styles.centerSection}>
                  <div className={styles.errorMessage}>
                    <AlertCircle size={32} />
                    <span>{error}</span>
                  </div>
                  {onRetry && (
                    <Button
                      type={"button"}
                      variant={Button.VARIANTS.PRIMARY}
                      size={Button.SIZES.LARGE}
                      color={Button.COLORS.GREEN}
                      onClick={onRetry}>Reintentar</Button>
                  )}
                </div>
              </td>
            </tr>
          ) : (!data || data.length === 0) ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '1.5rem' }}>
                <div className={styles.emptyState}>
                  <EmptyIcon size={48} className={styles.emptyIcon} />
                  <p style={{ margin: 0 }}>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr 
                key={keyExtractor(row)} 
                className={`${styles.row} ${rowClassName ? rowClassName(row) : ''}`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableA;
