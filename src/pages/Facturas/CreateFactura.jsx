import React from 'react';
import FacturaDownloader from '../../components/FacturaDownloader/FacturaDownloader';

export default function CreateFactura() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Crear Factura</h2>
      <p>Ingresa el ID de la cita y descarga la factura en formato DOCX.</p>
      <div style={{ marginTop: 12 }}>
        <FacturaDownloader />
      </div>
    </div>
  );
}
