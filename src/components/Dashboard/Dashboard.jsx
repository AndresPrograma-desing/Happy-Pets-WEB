import React, { useEffect, useState } from 'react';
import {
  CircleDollarSign,
  Calendar,
  UserCircle,
  PawPrint,
  Download,
  Filter,
  DollarSign,
  Banknote,
  TrendingDown,
  Receipt,
} from 'lucide-react';
import { getDashboardStats } from '../../services/api/Dashboard';
import { downloadDashboardExcel } from '../../services/api/Excel';
import { DASHBOARD_TEXT } from '../../constants/TEXT';
import Loading from '../screens/components/Loading/Index';
import CardV1 from '../screens/components/CardV1';
import TableB from '../screens/components/TableB';
import Button from '../screens/components/Button';
import BarChart from '../screens/components/BarChart';
import DrawPanel from '../screens/components/DrawPanel';
import Filters from './components/Filters';
import StatusBreakdown from './components/StatusBreakdown';
import Alerts from './components/Alerts';
import {
  formatCurrency,
  buildRevenueChartData,
  getAppointmentStatusBadgeType,
  formatAppointmentStatusLabel,
  getStatusBreakdown,
  buildFilterParams,
  getCurrencyCode,
} from './utils';
import styles from './Dashboard.module.css';

const CURRENCY_META = {
  USD: { icon: DollarSign, label: DASHBOARD_TEXT.currencyLabelUsd },
  VES: { icon: Banknote, label: DASHBOARD_TEXT.currencyLabelVes },
};

const DEFAULT_FILTERS = { period: null, status: 'all' };

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await getDashboardStats(
          buildFilterParams({ period: appliedFilters.period, status: appliedFilters.status })
        );
        setData(result);
        setError(null);
      } catch {
        setError(DASHBOARD_TEXT.errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [appliedFilters.period, appliedFilters.status]);

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const { blob, filename } = await downloadDashboardExcel(buildFilterParams(appliedFilters));
      if (!blob) throw new Error(DASHBOARD_TEXT.exportErrorMessage);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'dashboard.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(DASHBOARD_TEXT.exportErrorMessage);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <Loading size="large" variant="bars" phrases={DASHBOARD_TEXT.loadingPhrases} />;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const kpis = {
    totalRevenue: data.total_ganancias || 0,
    totalLosses: data.total_perdidas || 0,
    totalFacturas: data.total_facturas || 0,
    totalCitas: data.total_citas || 0,
    totalClients: data.total_clientes || 0,
    totalMascotas: data.total_mascotas || 0,
  };

  const currencyCode = getCurrencyCode(data.money_type);
  const currencyMeta = CURRENCY_META[currencyCode];

  const chartData = buildRevenueChartData(data.ganancias_mensuales);
  const latestPeriodIndex = chartData.length - 1;

  const ultimasCitas = data.ultimas_citas || [];
  const statusBreakdown = getStatusBreakdown(data.citas_por_estado);
  const lowStockProducts = data.productos_bajo_stock || [];
  const recentAlerts = data.alertas_recientes || [];

  const kpiCards = [
    {
      icon: CircleDollarSign,
      badgeText: DASHBOARD_TEXT.kpiRevenue,
      badgeBgColor: '#f0fdf4',
      badgeTextColor: '#16a34a',
      value: formatCurrency(kpis.totalRevenue, currencyCode),
      footer: currencyMeta.label,
      footerIcon: currencyMeta.icon,
    },
    {
      icon: TrendingDown,
      badgeText: DASHBOARD_TEXT.kpiLosses,
      badgeBgColor: '#fef2f2',
      badgeTextColor: '#dc2626',
      value: formatCurrency(kpis.totalLosses, currencyCode),
      footer: DASHBOARD_TEXT.kpiLossesFooter,
    },
    {
      icon: Receipt,
      badgeText: DASHBOARD_TEXT.kpiInvoices,
      badgeBgColor: '#f5f3ff',
      badgeTextColor: '#7c3aed',
      value: kpis.totalFacturas,
      footer: DASHBOARD_TEXT.kpiInvoicesFooter,
    },
    {
      icon: Calendar,
      badgeText: DASHBOARD_TEXT.kpiAppointments,
      badgeBgColor: '#eff6ff',
      badgeTextColor: '#3b82f6',
      value: kpis.totalCitas,
      footer: DASHBOARD_TEXT.kpiAppointmentsFooter,
    },
    {
      icon: UserCircle,
      badgeText: DASHBOARD_TEXT.kpiClients,
      badgeBgColor: '#fdf4ff',
      badgeTextColor: '#a21caf',
      value: kpis.totalClients,
      footer: DASHBOARD_TEXT.kpiClientsFooter,
    },
    {
      icon: PawPrint,
      badgeText: DASHBOARD_TEXT.kpiPets,
      badgeBgColor: '#fff7ed',
      badgeTextColor: '#c2410c',
      value: kpis.totalMascotas,
      footer: DASHBOARD_TEXT.kpiPetsFooter,
    },
  ];

  const tableColumns = [
    {
      key: 'detail',
      label: DASHBOARD_TEXT.columnDetail,
      width: '35%',
      render: (row) => (
        <div className={styles.appointmentDetail}>
          <span className={styles.appointmentName}>{row.cliente_nombre} - {row.mascota_nombre}</span>
          <span className={styles.appointmentReason}>{row.motivo}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: DASHBOARD_TEXT.columnType,
      align: 'center',
      render: (row) => <span className={styles.appointmentType}>{row.tipo_cita}</span>,
    },
    {
      key: 'date',
      label: DASHBOARD_TEXT.columnDate,
      align: 'center',
      render: (row) => (
        <span className={styles.appointmentDate}>{row.fecha_cita} a las {row.hora_cita}</span>
      ),
    },
    {
      key: 'status',
      label: DASHBOARD_TEXT.columnStatus,
      align: 'center',
      type: 'badge',
      badgeType: (row) => getAppointmentStatusBadgeType(row.estado),
      render: (row) => formatAppointmentStatusLabel(row.estado),
    },
  ];

  const lowStockColumns = [
    {
      key: 'codigo',
      label: DASHBOARD_TEXT.lowStockColumnCode,
      width: '15%',
      render: (row) => <span className={styles.appointmentReason}>{row.codigo}</span>,
    },
    {
      key: 'nombre',
      label: DASHBOARD_TEXT.lowStockColumnProduct,
      width: '40%',
      render: (row) => <span className={styles.appointmentName}>{row.nombre}</span>,
    },
    {
      key: 'stock',
      label: DASHBOARD_TEXT.lowStockColumnStock,
      align: 'center',
      type: 'badge',
      badgeType: (row) => (row.stock === 0 ? 'danger' : 'warning'),
      render: (row) => `${row.stock} / ${row.stock_minimo}`,
    },
    {
      key: 'precio_venta',
      label: DASHBOARD_TEXT.lowStockColumnPrice,
      align: 'right',
      render: (row) => formatCurrency(row.precio_venta, currencyCode),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>{DASHBOARD_TEXT.title}</h1>
          <p className={styles.headerSubtitle}>{DASHBOARD_TEXT.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.headerActionsGroup}>
            <Button variant={Button.VARIANTS.OUTLINE} icon={Filter} onClick={handleOpenFilters}>
              {DASHBOARD_TEXT.filterButton}
            </Button>
            <Button
              variant={Button.VARIANTS.PRIMARY}
              color={Button.COLORS.BLACK}
              icon={Download}
              disabled={exporting}
              onClick={handleExport}
            >
              {exporting ? DASHBOARD_TEXT.exportingLabel : DASHBOARD_TEXT.exportButton}
            </Button>
          </div>
          {exportError && <span className={styles.exportError}>{exportError}</span>}
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {kpiCards.map((kpi) => (
          <CardV1
            key={kpi.badgeText}
            badgeIcon={kpi.icon}
            badgeText={kpi.badgeText}
            badgeBgColor={kpi.badgeBgColor}
            badgeTextColor={kpi.badgeTextColor}
            secondaryText={kpi.value}
            footerIcon={kpi.footerIcon}
            footerContent={<span>{kpi.footer}</span>}
          />
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{DASHBOARD_TEXT.statusBreakdownTitle}</h2>
          <p className={styles.panelSubtitle}>{DASHBOARD_TEXT.statusBreakdownSubtitle}</p>
        </div>
        <div className={styles.chartBody}>
          <StatusBreakdown
            breakdown={statusBreakdown}
            emptyMessage={DASHBOARD_TEXT.statusBreakdownEmptyMessage}
          />
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{DASHBOARD_TEXT.chartTitle}</h2>
          <p className={styles.panelSubtitle}>{DASHBOARD_TEXT.chartSubtitle}</p>
        </div>
        <div className={styles.chartBody}>
          <BarChart
            data={chartData}
            valueFormatter={(value) => formatCurrency(value, currencyCode)}
            highlightIndex={latestPeriodIndex}
            emptyMessage={DASHBOARD_TEXT.chartEmptyMessage}
          />
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{DASHBOARD_TEXT.lowStockTitle}</h2>
          <p className={styles.panelSubtitle}>{DASHBOARD_TEXT.lowStockSubtitle}</p>
        </div>
        <TableB
          columns={lowStockColumns}
          data={lowStockProducts}
          rowKey="id"
          emptyMessage={DASHBOARD_TEXT.lowStockEmptyMessage}
        />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{DASHBOARD_TEXT.alertsTitle}</h2>
          <p className={styles.panelSubtitle}>{DASHBOARD_TEXT.alertsSubtitle}</p>
        </div>
        <div className={styles.chartBody}>
          <Alerts alerts={recentAlerts} emptyMessage={DASHBOARD_TEXT.alertsEmptyMessage} />
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{DASHBOARD_TEXT.tableTitle}</h2>
          <p className={styles.panelSubtitle}>{DASHBOARD_TEXT.tableSubtitle}</p>
        </div>
        <TableB
          columns={tableColumns}
          data={ultimasCitas}
          rowKey="id"
          emptyMessage={DASHBOARD_TEXT.tableEmptyMessage}
        />
      </div>

      <DrawPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={DASHBOARD_TEXT.filterDrawerTitle}
        description={DASHBOARD_TEXT.filterDrawerDescription}
        width="420px"
        showActions
        onConfirm={handleApplyFilters}
        confirmText={DASHBOARD_TEXT.filterApplyButton}
        cancelText={DASHBOARD_TEXT.filterCancelButton}
      >
        <Filters
          period={draftFilters.period}
          onPeriodChange={(period) => setDraftFilters((f) => ({ ...f, period }))}
          status={draftFilters.status}
          onStatusChange={(status) => setDraftFilters((f) => ({ ...f, status }))}
          onClear={() => setDraftFilters(DEFAULT_FILTERS)}
        />
      </DrawPanel>
    </div>
  );
}
