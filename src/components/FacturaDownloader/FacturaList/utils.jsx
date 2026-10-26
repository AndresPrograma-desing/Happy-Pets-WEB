import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Send, FileText, QrCode, CheckSquare, Square } from 'lucide-react';
import ModalTooltip from '../../ModalTooltip/ModalTooltip';
import Button from '../../screens/components/Button';
import Barnner from '../../screens/components/Barnner';
import { TEXT_FACTURAS_LIST } from './constants';
import styles from './facturas.module.css';
import { getFacturas, updateFacturaEstadoPago } from '../../../services/api';
import usePolling from '../../../hooks/UsePolling';
import PollingSeconds from '../../../hooks/PollingSecons';
import { getText } from '../../../constants';

export function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatCurrency(n) {
  return new Intl.NumberFormat('es-US', { 
    style: 'currency', 
    currency: getText("MoneysName.MONEYTIPE") 
  }).format(Number(n || 0));
}

export function useFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const firstLoadDoneRef = useRef(false);

  const load = useCallback(async (opts = {}) => {
    const { force = false } = opts;
    if (force || !firstLoadDoneRef.current) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await getFacturas();
      const items = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];
      setFacturas(items || []);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      if (!firstLoadDoneRef.current) firstLoadDoneRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  usePolling(load, PollingSeconds());

  return { facturas, loading, error, refreshing, load };
}

export function useFacturasCalculadas(facturas, filterEstado, pdfOnly, searchTerm) {
  const visibleFacturas = useMemo(() => {
    let filtered = Array.isArray(facturas) ? facturas : [];

    const target = String(filterEstado || '').toLowerCase().trim();
    if (target && target !== 'todos') {
      filtered = filtered.filter((f) => {
        const s = String(f?.estado_pago || 'pendiente').toLowerCase().trim();
        return s === target;
      });
    }
    
    if (pdfOnly) {
      filtered = filtered.filter((f) => f?.url_docx && typeof f.url_docx === 'string' && f.url_docx.startsWith('http'));
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((f) => 
        f.numero_factura?.toString().includes(query) ||
        f.cliente_nombre?.toLowerCase().includes(query) ||
        f.mascota_nombre?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [facturas, filterEstado, pdfOnly, searchTerm]);

  const totalFacturado = useMemo(() => visibleFacturas.reduce((acc, curr) => acc + (curr.total || 0), 0), [visibleFacturas]);
  const pendientes = useMemo(() => visibleFacturas.filter((f) => f.estado_pago === 'pendiente').length, [visibleFacturas]);

  return { visibleFacturas, totalFacturado, pendientes };
}

export async function handleActualizarPago(facturaId, setEstado, setLoading) {
  setLoading(true);
  try {
    await updateFacturaEstadoPago(facturaId, 'pagada');
    setEstado('pagada');
  } catch (err) {
    console.error(err);
    alert('No se pudo actualizar el estado de pago.');
  } finally {
    setLoading(false);
  }
}

export const EMAIL_TYPE_RECIBO = 25;

function PagoToggle({ metodo, estadoPago, facturaId, onPaymentUpdate }) {
  const [estado, setEstado] = useState(estadoPago);
  const [loading, setLoading] = useState(false);
  const isPagada = estado === 'pagada';

  return (
    <span className={styles.capitalize} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {metodo}
      <button
        type="button"
        className={styles.squareBtn}
        aria-label={isPagada ? 'Recibo pagado' : TEXT_FACTURAS_LIST.tooltips.markPaid}
        onClick={() => {
          if (!isPagada && !loading) {
            handleActualizarPago(facturaId, (newEstado) => {
              setEstado(newEstado);
              if (onPaymentUpdate) onPaymentUpdate(newEstado);
            }, setLoading);
          }
        }}
        disabled={isPagada || loading}
        style={{ padding: 0, background: 'none', border: 'none', cursor: isPagada || loading ? 'default' : 'pointer' }}
      >
        <ModalTooltip text={isPagada ? 'Recibo pagado' : TEXT_FACTURAS_LIST.tooltips.markPaid}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {isPagada ? <CheckSquare size={18} color="#10b981" /> : <Square size={18} color="#4a5568" />}
          </span>
        </ModalTooltip>
      </button>
    </span>
  );
}

export function getFacturasColumns({
  onSendEmail,
  sendingId,
  onShowQR,
  onPaymentUpdate
}) {
  return [
    {
      label: 'FACTURA',
      key: 'factura',
      width: '15%',
      render: (f) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#1a202c' }}>#{f.numero_factura}</div>
          <small style={{ color: '#718096' }}>{formatDate(f.fecha_emision)}</small>
        </div>
      )
    },
    {
      label: 'PROPIETARIO',
      key: 'cliente_nombre',
      width: '20%',
      render: (f) => f.cliente_nombre
    },
    {
      label: 'PACIENTE',
      key: 'mascota_nombre',
      width: '15%',
      render: (f) => f.mascota_nombre
    },
    {
      label: 'TOTAL',
      key: 'total',
      width: '10%',
      render: (f) => <span style={{ fontWeight: 600 }}>{formatCurrency(f.total)}</span>
    },
    {
      label: 'ESTADO',
      key: 'estado_pago',
      width: '10%',
      type: 'badge',
      badgeType: (f) => f.estado_pago === 'pagada' ? 'success' : 'warning',
      render: (f) => f.estado_pago || 'Pendiente'
    },
    {
      label: 'ACCIONES',
      key: 'actions',
      width: '15%',
      align: 'right',
      render: (f) => {
        const id = f.factura_id ?? f.id;
        const isUrlValid = f.url_docx?.startsWith('http');
        const isSending = sendingId === id;

        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <ModalTooltip text={!isUrlValid ? 'PDF no disponible' : isSending ? 'Enviando...' : TEXT_FACTURAS_LIST.tooltips.sendEmail}>
              <div style={{ display: 'inline-block' }}>
                <Button
                  variant="ghost"
                  color="#2563eb"
                  size="medium"
                  circle
                  onClick={(e) => { e.stopPropagation(); onSendEmail(f); }}
                  disabled={isSending || !isUrlValid}
                  icon={Send}
                />
              </div>
            </ModalTooltip>

            <ModalTooltip text={isUrlValid ? TEXT_FACTURAS_LIST.tooltips.downloadPdf : 'PDF no disponible'}>
              <div style={{ display: 'inline-block' }}>
                <Button
                  variant="ghost"
                  color="#16a34a"
                  size="medium"
                  circle
                  onClick={(e) => { e.stopPropagation(); window.open(f.url_docx, '_blank'); }}
                  disabled={!isUrlValid}
                  icon={FileText}
                />
              </div>
            </ModalTooltip>
          </div>
        );
      }
    }
  ];
}

export function getFacturasExpandable({ onShowQR, onPaymentUpdate }) {
  return {
    rowExpandable: () => true,
    expandedRowRender: (f) => {
      const id = f.factura_id ?? f.id;
      const isUrlValid = f.url_docx?.startsWith('http');

      return (
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Atendido por</p>
              <p style={{ margin: '4px 0 0 0', color: '#0f172a', fontWeight: 500 }}>{f.doctor_nombre}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Método de Pago</p>
              <div style={{ marginTop: '4px' }}>
                <PagoToggle metodo={f.metodo_pago} estadoPago={f.estado_pago} facturaId={id} onPaymentUpdate={(newEstado) => onPaymentUpdate(id, newEstado)} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <ModalTooltip text={isUrlValid ? TEXT_FACTURAS_LIST.tooltips.showQR : 'QR no disponible'}>
                 <div style={{ display: 'inline-block' }}>
                   <Button
                     variant="outline"
                     color="#475569"
                     size="small"
                     onClick={(e) => { e.stopPropagation(); isUrlValid && onShowQR(f.url_docx, id, f.cliente_nombre, f.mascota_nombre); }}
                     disabled={!isUrlValid}
                     icon={QrCode}
                   >
                     QR
                   </Button>
                 </div>
               </ModalTooltip>
            </div>
          </div>

          <div className={styles.itemsSection} style={{ margin: 0 }}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>Producto / Servicio</th>
                  <th>Cant.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(f.items || []).map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.nombre}</td>
                    <td>{it.cantidad}</td>
                    <td>{formatCurrency(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };
}