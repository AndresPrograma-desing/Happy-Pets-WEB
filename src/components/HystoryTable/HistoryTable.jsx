import React from 'react';

export default function HistoryTable({ title = 'Historial', data = [], stylesModule }) {
  const styles = stylesModule || {};

  return (
    <div className={styles.historyContainer || ''}>
      <h4 className={styles.historyTitle || ''}>{title}</h4>
      <div className={styles.excelWrapper || ''}>
        <table className={styles.excelTable || ''}>
          <thead>
            <tr>
              <th>PRECIO</th>
              <th>DESCRIPCIÓN / NOMBRE</th>
              <th>STOCK</th>
              <th>HORA</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((h) => (
                <tr key={h.id} className={h.deleted ? (styles.deletedRow || '') : ''}>
                  <td className={styles.colPrice || ''}>{h.precio ?? h.price ?? ''}</td>
                  <td>{h.nombre || h.name || h.descripcion || ''}</td>
                  <td className={styles.colStock || ''}>{h.stock ?? ''}</td>
                  <td className={styles.colTime || ''}>{h.fecha_registro || ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 12 }}>
                  No hay registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
