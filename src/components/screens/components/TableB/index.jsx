import React, { useState } from 'react';
import styles from './index.module.css';
import { AlertCircle, Inbox, ChevronDown, ChevronUp } from 'lucide-react';
import Barnner from '../Barnner';
import Button from '../Button';
import Loading from '../Loading/Index';

const TableB = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyIcon: EmptyIcon = Inbox,
  emptyMessage = "No hay datos disponibles.",
  onRetry,
  expandable,
  rowKey = 'id',
  rowClassName
}) => {
  const [expandedKeys, setExpandedKeys] = useState({});

  const toggleExpand = (key) => {
    setExpandedKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.modernTable}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={col.key || idx} 
                style={{ textAlign: col.align || 'left' }}
              >
                {col.label}
              </th>
            ))}
            {expandable && <th className={styles.expandHeader}></th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (expandable ? 1 : 0)} style={{ padding: 0 }}>
                <div className={styles.tableLoadingContainer}>
                  <Loading size="large" text="" />
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length + (expandable ? 1 : 0)} style={{ padding: 0 }}>
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
              <td colSpan={columns.length + (expandable ? 1 : 0)} style={{ padding: 0 }}>
                <div className={styles.emptyState}>
                  <EmptyIcon size={48} className={styles.emptyIcon} />
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const key = row[rowKey] || rowIndex;
              const isExpanded = !!expandedKeys[key];
              const canExpand = expandable?.rowExpandable ? expandable.rowExpandable(row) : true;

              return (
              <React.Fragment key={key}>
                <tr 
                  className={`${styles.tableRow} ${isExpanded ? styles.rowExpanded : ''} ${rowClassName ? rowClassName(row, rowIndex) : ''}`}
                  onClick={() => canExpand && toggleExpand(key)}
                  style={{ cursor: canExpand ? 'pointer' : 'default' }}
                >
                  {columns.map((col, colIndex) => (
                    <td 
                      key={col.key || colIndex}
                      style={{ textAlign: col.align || 'left', width: col.width }}
                    >
                      {col.type === 'actions' && col.actions ? (
                        <div className={styles.actionButtons} style={{ justifyContent: col.align || 'flex-start' }}>
                          {col.actions.map((act, actIdx) => (
                            <Button 
                              key={actIdx} 
                              variant={Button.VARIANTS.PRIMARY}
                              size={Button.SIZES.LARGE}
                              color={Button.COLORS.GREEN}
                              onClick={(e) => { e.stopPropagation(); act.onClick(row); }}
                              disabled={act.disabled ? act.disabled(row) : false}
                            >
                              {act.label}
                              {act.icon && <img src={act.icon} alt={act.label} className={`${styles.actionIcon} ${act.invertIcon ? styles.actionIconInvert : ''}`} />}
                            </Button>
                          ))}
                        </div>
                      ) : col.type === 'badge' ? (
                        <Barnner 
                          type={col.badgeType ? col.badgeType(row) : undefined} 
                          className={col.badgeClass ? col.badgeClass(row) : ''}
                        >
                          {col.render ? col.render(row, rowIndex) : row[col.key]}
                        </Barnner>
                      ) : col.render ? (
                        col.render(row, rowIndex)
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}
                  {expandable && (
                    <td className={styles.expandCell}>
                      {canExpand ? (
                        <div className={styles.expandIconWrapper}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      ) : null}
                    </td>
                  )}
                </tr>
                {expandable && isExpanded && (
                  <tr className={styles.expandedContentRow}>
                    <td colSpan={columns.length + 1} className={styles.expandedContentCell}>
                      <div className={styles.expandedWrapper}>
                        {expandable.expandedRowRender(row, rowIndex)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          }))}
        </tbody>
      </table>
    </div>
  );
};

export default TableB;
