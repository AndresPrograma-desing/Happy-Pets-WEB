import React, { useEffect, useState } from 'react';
import './FacturaLocal.module.css'; // <--- Importamos el CSS aquí
import api from '../../services/api'; // Asegúrate de tener tu servicio API configurado

const VistaFactura = ({ idCita }) => {
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFactura = async () => {
      try {
        setLoading(true);
        const res = await api.request(`/Facturas/cita/${idCita}`, { method: 'GET' });
        if (!res.ok) throw new Error("Error al conectar con la API");
        const data = await res.json();
        setFactura(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (idCita) fetchFactura();
  }, [idCita]);

  if (loading) return <div className="text-center">Cargando factura...</div>;
  if (error) return <div className="text-center" style={{color: 'red'}}>{error}</div>;
  if (!factura) return null;

  return (
    <div className="factura-container">
      {/* Cabecera */}
      <header className="factura-header">
        <div className="logo-seccion">
          <h1>HAPPY PETS</h1>
          <p>Cuidado profesional para tu mascota</p>
        </div>
        <div className="info-seccion">
          <h2>FACTURA</h2>
          <p><strong>N°:</strong> {factura.numero_factura}</p>
          <p><strong>Fecha:</strong> {new Date(factura.fecha_emision).toLocaleDateString()}</p>
        </div>
      </header>

      {/* Datos del Cliente y Mascota */}
      <section className="grid-detalles">
        <div className="bloque-info">
          <h3>Propietario</h3>
          <p><strong>{factura.cliente_nombre}</strong></p>
          <p>ID: {factura.cliente_id}</p>
        </div>
        <div className="bloque-info">
          <h3>Paciente</h3>
          <p><strong>{factura.mascota_nombre}</strong></p>
          <p>Atendido por: {factura.doctor_nombre}</p>
        </div>
      </section>

      {/* Detalle de Productos/Servicios */}
      <table className="tabla-factura">
        <thead>
          <tr>
            <th>Cód.</th>
            <th>Descripción</th>
            <th className="text-center">Cant.</th>
            <th className="text-right">Precio</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {factura.items.map((item, i) => (
            <tr key={i}>
              <td>{item.codigo}</td>
              <td>
                <span className="item-nombre">{item.nombre}</span>
                <span className="item-desc">{item.descripcion}</span>
              </td>
              <td className="text-center">{item.cantidad}</td>
              <td className="text-right">${item.precio_unitario.toFixed(2)}</td>
              <td className="text-right">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <section className="seccion-totales">
        <div className="tabla-totales">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Subtotal:</span>
            <span>${factura.subtotal.toFixed(2)}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', color: '#718096'}}>
            <span>Descuento:</span>
            <span>-${factura.descuento.toFixed(2)}</span>
          </div>
          <hr />
          <div className="fila-total" style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>TOTAL:</span>
            <span>${factura.total.toFixed(2)}</span>
          </div>
          
          <span className={`estado-label ${factura.estado_pago === 'factura_pendiente' ? 'pendiente' : 'pagado'}`}>
            {factura.estado_pago.replace('_', ' ')}
          </span>
        </div>
      </section>

      <footer className="footer-factura">
        <p>Documento generado por el sistema administrativo Happy Pets.</p>
        <p>Gracias por su visita.</p>
      </footer>
    </div>
  );
};

export default VistaFactura;