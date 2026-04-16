import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './ShowQR.module.css';

const ShowQR = ({ url, facturaId, NameClient, onClose }) => {
  if (!url) return null;
  return (
    <div className={styles.showqrOverlay}>
      <div className={styles.showqrModal}>
        <button className={styles.showqrCloseBtn} onClick={onClose}>&times;</button>
        <h3>Escanear para ver/descargar PDF</h3>
        <QRCodeCanvas value={url} size={200} level="H" includeMargin={true} />
        <p className={styles.showqrFacturaId}>ID Factura: <b>{facturaId}</b></p>
        <p className={styles.showqrNameClient}>Nombre del Cliente: <b>{NameClient}</b></p>
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.showqrDownloadLink}>Descargar PDF</a>
      </div>
    </div>
  );
};

export default ShowQR;