import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styles from './Dashboard.module.css';
import { getFacturas } from '../../services/api';
import usePolling from '../../hooks/UsePolling';
import { BoxIcon, UserCircle,FileText,TriangleAlert, CircleDollarSign } from 'lucide-react';
import { getText } from '../../constants';
import { useCurrency } from '../../hooks/moneyType';

const MONTH_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function extractAmount(f) {
  if (!f) return 0;
  const cand = ['total', 'total_facturado', 'subtotal', 'importe', 'monto', 'valor', 'precio_total', 'amount'];
  for (const k of cand) {
    const val = f[k];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      const num = Number(val);
      if (!Number.isNaN(num)) return num;
      if (typeof val === 'string') {
        const cleaned = val.replace(/[^0-9.,-]/g, '').replace(/,/g, '.');
        const p = parseFloat(cleaned);
        if (!Number.isNaN(p)) return p;
      }
    }
  }
  if (Array.isArray(f.items) && f.items.length) {
    return f.items.reduce((s, it) => s + (Number(it.total) || 0), 0);
  }
  return 0;
}

export default function Dashboard() {
  const { currency } = useCurrency();
  const formatCurrency = useCallback((v) => {
    const n = Number(v || 0);
    try {
      return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-VE', { 
        style: 'currency', 
        currency: currency || 'VES', 
        maximumFractionDigits: 0 
      }).format(n);
    } catch (err) {
      console.error("Error en formato:", err);
      return (currency === 'VES' ? 'Bs. ' : '$ ') + n.toLocaleString();
    }
  }, [currency]);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('mes');

  const fetchFacturas = useCallback(async () => {
    try {
      const res = await getFacturas();
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (Array.isArray(res?.data)) arr = res.data;
      else if (Array.isArray(res?.result)) arr = res.result;
      else if (Array.isArray(res?.facturas)) arr = res.facturas;
      else arr = [];
      setFacturas(arr);
      setError(null);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFacturas();
  }, []);

  const pollinController = 5000;
  usePolling(fetchFacturas, pollinController, true);

  const ordersCount = facturas.length;
  const paidFacturas = useMemo(() => facturas.filter(f => String(f.estado_pago || f.estado || '').toLowerCase().includes('pag')), [facturas]);
  const totalRevenue = useMemo(() => paidFacturas.reduce((s, f) => s + extractAmount(f), 0), [paidFacturas]);
  const uniqueClients = useMemo(() => {
    const s = new Set(facturas.map(f => String(f.cliente_id || f.cliente?.id || f.cliente_nombre || f.cliente || '')));
    if (s.has('')) s.delete('');
    return s.size;
  }, [facturas]);
  const paidRate = useMemo(() => {
    const paid = paidFacturas.length;
    return facturas.length ? Math.round((paid / facturas.length) * 100) : 0;
  }, [paidFacturas, facturas]);

  const monthlyTotals = useMemo(() => {
    const arr = new Array(12).fill(0);
    facturas.forEach(f => {
      const dRaw = f.fecha_emision || f.created_at || f.fecha || f.fecha_registro;
      const d = dRaw ? new Date(dRaw) : null;
      const m = d && !isNaN(d) ? d.getMonth() : 0;
      if (String(f.estado_pago || f.estado || '').toLowerCase().includes('pag')) {
        arr[m] += extractAmount(f) || 0;
      }
    });
    return arr;
  }, [facturas]);

  const recent = facturas.slice(0, 6);

  function computeGrowthForPeriod(periodKey) {
    const now = new Date();
    if (periodKey === 'mes') {
      const thisM = now.getMonth();
      const prevM = (thisM + 11) % 12;
      const thisVal = monthlyTotals[thisM] || 0;
      const prevVal = monthlyTotals[prevM] || 0;
      const pct = prevVal ? Math.round(((thisVal - prevVal) / prevVal) * 100) : (thisVal ? 100 : 0);
      return { thisVal, prevVal, pct };
    }
    if (periodKey === 'anio') {
      const y = now.getFullYear();
      const totalsByYear = {};
      facturas.forEach(f => {
        const dRaw = f.fecha_emision || f.created_at || f.fecha || f.fecha_registro;
        const d = dRaw ? new Date(dRaw) : null;
        if (!d || isNaN(d)) return;
        const year = d.getFullYear();
        if (!String(f.estado_pago || f.estado || '').toLowerCase().includes('pag')) return;
        totalsByYear[year] = (totalsByYear[year] || 0) + extractAmount(f);
      });
      const thisVal = totalsByYear[y] || 0;
      const prevVal = totalsByYear[y - 1] || 0;
      const pct = prevVal ? Math.round(((thisVal - prevVal) / prevVal) * 100) : (thisVal ? 100 : 0);
      return { thisVal, prevVal, pct };
    }
    if (periodKey === 'dia') {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const fmt = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const map = {};
      facturas.forEach(f => {
        const dRaw = f.fecha_emision || f.created_at || f.fecha || f.fecha_registro;
        const d = dRaw ? new Date(dRaw) : null;
        if (!d || isNaN(d)) return;
        if (!String(f.estado_pago || f.estado || '').toLowerCase().includes('pag')) return;
        const k = fmt(d);
        map[k] = (map[k] || 0) + extractAmount(f);
      });
      const thisVal = map[fmt(today)] || 0;
      const prevVal = map[fmt(yesterday)] || 0;
      const pct = prevVal ? Math.round(((thisVal - prevVal) / prevVal) * 100) : (thisVal ? 100 : 0);
      return { thisVal, prevVal, pct };
    }
    return { thisVal: 0, prevVal: 0, pct: 0 };
  }

  const growth = computeGrowthForPeriod(period);

  if (loading && facturas.length === 0) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loaderContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando datos del panel...</p>
        </div>
      </div>
    );
  }

  if (error && facturas.length === 0) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            { <TriangleAlert size={24} color="#fff" /> || '⚠️' }
          </div>
          <h3>Error al cargar datos</h3>
          <p>{error}</p>
          <button onClick={fetchFacturas} className={styles.retryBtn}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.topbar}>
        <div className={styles.pageTitle}>Panel de Ventas</div>
        <div className={styles.topbarRight}>
          <div className={styles.badge}>Conectado</div>
          <div className={styles.periodSelector}>
            <button className={`${styles.periodBtn} ${period === 'dia' ? styles.active : ''}`} onClick={() => setPeriod('dia')}>Día</button>
            <button className={`${styles.periodBtn} ${period === 'mes' ? styles.active : ''}`} onClick={() => setPeriod('mes')}>Mes</button>
            <button className={`${styles.periodBtn} ${period === 'anio' ? styles.active : ''}`} onClick={() => setPeriod('anio')}>Año</button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}></div>
            <div className={styles.kpiInfo}>
              <div className={styles.kpiLabel}>
                <CircleDollarSign size={24} color="#fff" /> Ingresos Totales</div>
              <div className={styles.kpiValue}>{formatCurrency(totalRevenue)}</div>
              <div className={`${styles.kpiDelta} ${growth.pct >= 0 ? styles.up : styles.down}`}>
                {growth.pct >= 0 ? '▲' : '▼'} {Math.abs(growth.pct)}%
              </div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}><BoxIcon size={24} color="#fff" /></div>
            <div className={styles.kpiInfo}>
              <div className={styles.kpiLabel}>Pedidos</div>
              <div className={styles.kpiValue}>{ordersCount}</div>
              <div className={`${styles.kpiDelta} ${styles.up}`}>
                ▲ {ordersCount > 0 ? Math.round(ordersCount / 10) : 0}%
              </div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}><UserCircle size={24} color="#fff" /></div>
            <div className={styles.kpiInfo}>
              <div className={styles.kpiLabel}>Clientes</div>
              <div className={styles.kpiValue}>{uniqueClients}</div>
              <div className={`${styles.kpiDelta} ${styles.down}`}>
                ▼ {uniqueClients > 0 ? Math.round(uniqueClients / 20) : 0}%
              </div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}><FileText size={24} color="#fff" /></div>
            <div className={styles.kpiInfo}>
              <div className={styles.kpiLabel}>Facturas Pagadas</div>
              <div className={styles.kpiValue}>{paidRate}%</div>
              <div className={`${styles.kpiDelta} ${styles.up}`}>
                ▲ {paidRate}%
              </div>
            </div>
          </div>
        </div>

        <div className={styles.chartRow}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Ingresos por Mes</div>
                <div className={styles.cardSubtitle}>Resumen mensual (facturas pagadas)</div>
              </div>
              <span className={styles.tag}>{getText('MoneysName.MONEYTIPE')}</span>
            </div>
            <div className={styles.chartContainer}>
              <svg className={styles.chartSvg} viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
                {monthlyTotals.map((val, i) => {
                  const W = 600;
                  const H = 160;
                  const paddingX = 10;
                  const barW = (W - paddingX * 2) / monthlyTotals.length;
                  const max = Math.max(...monthlyTotals) || 1;
                  const barH = (val / max) * (H - 30);
                  const x = paddingX + i * barW + barW * 0.15;
                  const bw = barW * 0.7;
                  const y = H - barH;
                  const isCurrentMonth = i === new Date().getMonth();
                  return (
                    <g key={i} className={styles.barGroup}>
                      <rect
                        x={x}
                        y={y}
                        width={bw}
                        height={barH}
                        rx="4"
                        className={`${styles.bar} ${isCurrentMonth ? styles.currentMonthBar : ''}`}
                      />
                      <text x={x + bw / 2} y={H + 12} textAnchor="middle" fontSize="15" fill="#000000" fontFamily="DM Mono, monospace">
                        {MONTH_LABELS[i]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Pedidos Recientes</div>
                <div className={styles.cardSubtitle}>Últimas facturas registradas</div>
              </div>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Factura</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((f, idx) => (
                    <tr key={f.factura_id ?? f.id ?? idx}>
                      <td className={styles.invoiceNumber}>#{f.numero_factura ?? (f.id ?? '—')}</td>
                      <td>{f.cliente_nombre ?? f.cliente?.nombre ?? 'Consumidor'}</td>
                      <td className={styles.amountCell}>{formatCurrency(extractAmount(f))}</td>
                      <td>
                        <span className={`${styles.statusPill} ${String(f.estado_pago ?? f.estado ?? '').toLowerCase().includes('pag') ? styles.paid : styles.pending}`}>
                          {f.estado_pago ?? f.estado ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan="4" className={styles.emptyState}>No hay facturas recientes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}