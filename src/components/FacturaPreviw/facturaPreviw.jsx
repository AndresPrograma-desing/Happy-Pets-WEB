// InvoiceViewer.jsx
import React from 'react';

// ============================
// ESTILOS Y CONSTANTES (igual que en el generador)
// ============================
const COLORS = {
  primary: '#1B5E20',      // verde oscuro profesional
  primaryLight: '#2E7D32', // verde medio
  accent: '#4CAF50',       // verde vibrante
  accentSoft: '#81C784',   // verde suave
  textDark: '#1F2937',     // casi negro
  textMedium: '#374151',   // gris oscuro
  textLight: '#6B7280',    // gris secundario
  border: '#D1D5DB',       // gris claro
  bgWhite: '#FFFFFF',
  bgLight: '#F9FAFB',
  bgHighlight: '#F0FDF4',   // verde muy claro
};

// Formateadores
const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

const currency = (value) => 
  `$${(Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ============================
// COMPONENTE PRINCIPAL
// ============================
const InvoiceViewer = ({ invoice }) => {
  if (!invoice) {
    return <div className="text-center p-8 text-gray-500">No hay datos de factura</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none">
      {/* Encabezado con dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b" style={{ borderColor: COLORS.border }}>
        {/* Columna izquierda: empresa */}
        <div className="p-6 bg-white">
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>
            Veterinaria Happy Pets
          </h1>
          <p className="text-md mt-1" style={{ color: COLORS.textMedium }}>
            Clínica Veterinaria Especializada
          </p>
          <p className="text-sm mt-3" style={{ color: COLORS.textLight }}>
            Socopó, Barinas
          </p>
          <p className="text-sm" style={{ color: COLORS.textLight }}>
            Tel: (555) 123-4567 · hola@vetclinic.com
          </p>
        </div>

        {/* Columna derecha: factura */}
        <div className="p-6 text-center" style={{ backgroundColor: COLORS.primaryLight }}>
          <h2 className="text-3xl font-bold text-white">FACTURA</h2>
          <p className="text-xl font-semibold text-white mt-1">{invoice.numero_factura}</p>
          <p className="text-sm text-white mt-2">Fecha: {formatDate(invoice.fecha_emision)}</p>
        </div>
      </div>

      {/* Información cliente y mascota (tarjetas verdes claras) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6" style={{ backgroundColor: COLORS.bgHighlight }}>
        <div className="p-3 rounded-md border" style={{ borderColor: COLORS.accentSoft }}>
          <p className="font-bold text-md" style={{ color: COLORS.primary }}>● CLIENTE</p>
          <p className="font-semibold" style={{ color: COLORS.textDark }}>{invoice.cliente_nombre}</p>
          <p className="text-xs" style={{ color: COLORS.textLight }}>ID: {invoice.cliente_id}</p>
        </div>
        <div className="p-3 rounded-md border text-right" style={{ borderColor: COLORS.accentSoft }}>
          <p className="font-bold text-md" style={{ color: COLORS.primary }}>● MASCOTA</p>
          <p className="font-semibold" style={{ color: COLORS.textDark }}>{invoice.mascota_nombre}</p>
          <p className="text-xs" style={{ color: COLORS.textLight }}>ID: {invoice.mascota_id}</p>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto p-6 pt-0">
        <table className="min-w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: COLORS.primary }}>
              {['CÓDIGO', 'PRODUCTO', 'DESCRIPCIÓN', 'CANT.', 'P. UNIT.', 'TOTAL'].map((header, idx) => (
                <th
                  key={idx}
                  className={`px-3 py-2 text-xs font-bold text-white ${idx >= 3 ? 'text-right' : 'text-left'}`}
                  style={{ border: `1px solid ${COLORS.primary}` }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr
                key={idx}
                style={{ backgroundColor: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgLight }}
              >
                <td className="px-3 py-2 text-xs" style={{ color: COLORS.textMedium, border: `1px solid ${COLORS.border}` }}>
                  {item.codigo || '-'}
                </td>
                <td className="px-3 py-2 font-semibold text-sm" style={{ color: COLORS.textDark, border: `1px solid ${COLORS.border}` }}>
                  {item.nombre}
                </td>
                <td className="px-3 py-2 text-xs" style={{ color: COLORS.textLight, border: `1px solid ${COLORS.border}` }}>
                  {item.descripcion}
                </td>
                <td className="px-3 py-2 text-sm text-right" style={{ border: `1px solid ${COLORS.border}` }}>
                  {item.cantidad}
                </td>
                <td className="px-3 py-2 text-sm text-right" style={{ border: `1px solid ${COLORS.border}` }}>
                  {currency(item.precio_unitario)}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-right" style={{ color: COLORS.primary, border: `1px solid ${COLORS.border}` }}>
                  {currency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="flex flex-col items-end px-6 pb-4">
        <div className="w-full md:w-1/2 space-y-1">
          <div className="flex justify-between text-sm">
            <span style={{ color: COLORS.textMedium }}>Subtotal</span>
            <span className="font-semibold">{currency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: COLORS.textMedium }}>IVA (16%)</span>
            <span className="font-semibold">{currency(invoice.iva)}</span>
          </div>
          <div className="flex justify-between pt-2 mt-2 border-t" style={{ borderColor: COLORS.accentSoft }}>
            <span className="font-bold text-lg" style={{ color: COLORS.primary }}>TOTAL</span>
            <span className="font-bold text-lg" style={{ color: COLORS.primaryLight }}>{currency(invoice.total)}</span>
          </div>
          <p className="text-xs italic text-right mt-2" style={{ color: COLORS.textLight }}>
            Método de pago: {invoice.metodo_pago}
          </p>
        </div>
      </div>

      {/* Pie de página */}
      <div className="text-center py-6 border-t" style={{ borderColor: COLORS.border, backgroundColor: COLORS.bgLight }}>
        <p className="text-sm font-semibold" style={{ color: COLORS.primary }}>
          ✨ Gracias por confiar en VetClinic. ✨
        </p>
        <p className="text-xs mt-1" style={{ color: COLORS.textLight }}>
          Si tienes alguna duda, contáctanos a hola@vetclinic.com o al (555) 123-4567
        </p>
        <p className="text-xs italic mt-2" style={{ color: COLORS.textLight }}>
          Este documento es una factura oficial válida para efectos fiscales.
        </p>
      </div>
    </div>
  );
};

export default InvoiceViewer;