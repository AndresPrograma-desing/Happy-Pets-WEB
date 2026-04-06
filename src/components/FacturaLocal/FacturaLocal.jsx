
import React, { useEffect, useState } from 'react';
import styles from './FacturaLocal.module.css';
import api from '../../services/api';

const VistaFactura = ({ idCita }) => {
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (str) => {
    if (!str) return '—';
    try {
      return new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return String(str);
    }
  };

  const currency = (value) => `$${(Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  useEffect(() => {
    const fetchFactura = async () => {
      try {
        setLoading(true);
        const data = await api.request(`/Facturas/cita/${idCita}`, { method: 'GET' });
        setFactura(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (idCita) fetchFactura();
  }, [idCita]);

  if (loading) return <div className={styles.loadingSpinner}>Cargando factura...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;
  if (!factura) return null;

  return (
    <div className={styles.facturaContainer}>
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <h1>HAPPY PETS</h1>
          <h2>Cuidado profesional para tu mascota</h2>
          <div className={styles.brandDetails}>Dirección · Teléfono · correo@ejemplo.com</div>
        </div>

        <div className={styles.invoiceBadge}>
          <div className="invoiceTitle">FACTURA</div>
          <div className="invoiceNumber">#{factura.numero_factura || factura.id || 'S/N'}</div>
          <div className="invoiceDate">Fecha: {formatDate(factura.fecha_emision)}</div>
        </div>
      </header>

      <section className={styles.gridDetalles}>
        <div className={styles.bloqueInfo}>
          <div className={styles.cardTitle}>CLIENTE</div>
          <div className="cardContent">
            <b>{factura.cliente_nombre || 'Consumidor Final'}</b>
            <span>ID: {factura.cliente_id || 'N/A'}</span>
          </div>
        </div>

        <div className={styles.bloqueInfo}>
          <div className={styles.cardTitle}>MASCOTA</div>
          <div className="cardContent" style={{ textAlign: 'right' }}>
            <b>{factura.mascota_nombre || 'N/A'}</b>
            <span>ID: {factura.mascota_id || 'N/A'}</span>
          </div>
        </div>
      </section>

      <table className={styles.tablaFactura}>
        <thead>
          <tr>
            <th>CÓDIGO</th>
            <th>PRODUCTO</th>
            <th>DESCRIPCIÓN</th>
            <th className={styles.textRight}>CANT.</th>
            <th className={styles.textRight}>P. UNIT.</th>
            <th className={styles.textRight}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(factura.items) ? factura.items : []).map((item, i) => {
            const qty = Number(item?.cantidad ?? item?.qty ?? 1) || 0;
            const price = Number(item?.precio_unitario ?? item?.precio ?? item?.price ?? 0) || 0;
            const total = Number(item?.total ?? (qty * price)) || 0;
            return (
              <tr key={i}>
                <td style={{ color: 'var(--text-medium)' }}>{item?.codigo ?? item?.id ?? '-'}</td>
                <td>
                  <span className={styles.itemNombre}>{item?.nombre ?? item?.producto_nombre ?? 'Producto'}</span>
                  <span className={styles.itemDesc}>{item?.descripcion ?? item?.detalle ?? ''}</span>
                </td>
                <td className={styles.textCenter}>{qty}</td>
                <td className={styles.textRight}>{currency(price)}</td>
                <td className={styles.textRight}>{currency(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.seccionTotales}>
        <div className={styles.paymentMethod}>Método de pago: {factura.metodo_pago ?? 'Pendiente'}</div>
        <div className={styles.tablaTotales}>
          <div>
            <span>Subtotal</span>
            <span>{currency(factura.subtotal ?? factura.sub_total ?? 0)}</span>
          </div>
          <div>
            <span>IVA</span>
            <span>{currency(factura.iva ?? 0)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>TOTAL</span>
            <span>{currency(factura.total ?? 0)}</span>
          </div>

          <span className={`${styles.estadoLabel} ${factura.estado_pago === 'factura_pendiente' ? styles.pendiente : styles.pagado}`}>
            {(factura.estado_pago || '').replace('_', ' ') || 'Sin estado'}
          </span>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Documento generado por el sistema administrativo Happy Pets.</p>
        <p>Gracias por su visita.</p>
      </footer>
    </div>
  );
};

export default VistaFactura;