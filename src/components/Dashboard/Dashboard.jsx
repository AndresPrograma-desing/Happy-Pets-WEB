import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Button,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { BoxIcon, UserCircle, FileText, CircleDollarSign, Download, Filter } from 'lucide-react';
import { fetchDashboardMockData } from './utils';
import Loading from '../screens/components/Loading/Index';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchDashboardMockData();
        setData(result);
        setError(null);
      } catch (err) {
        setError("Error al cargar los datos simulados.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Loading size="large" text="Cargando dashboard..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>
      </Box>
    );
  }

  if (!data) return null;

  const { kpis, chartData, recentOrders } = data;
  const formatCurrency = (val) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(val);

  // Estilos compartidos para las tarjetas (haciendo match con TableB)
  const cardStyle = { 
    borderRadius: 3, // 12px
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
    border: '1px solid #e5e7eb',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const tableColumns = [
    {
      key: 'detail',
      label: 'Detalle de Factura',
      width: '35%',
      render: (row) => (
        <Box>
          <Typography variant="body1" fontWeight="600" color="#111827">
            {row.clientName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Factura #{row.id}
          </Typography>
        </Box>
      )
    },
    {
      key: 'total',
      label: 'Total',
      width: '20%',
      align: 'center',
      render: (row) => (
        <Typography variant="body1" fontWeight="500" color="#111827">
          {formatCurrency(row.amount)}
        </Typography>
      )
    },
    {
      key: 'date',
      label: 'Fecha',
      width: '25%',
      align: 'center',
      render: (row) => {
        const dateObj = new Date(row.date);
        return (
          <Typography variant="body2" color="text.secondary">
            {dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Typography>
        );
      }
    },
    {
      key: 'status',
      label: 'Estado',
      width: '20%',
      align: 'center',
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            fontWeight: '600',
            borderRadius: '4px',
            fontSize: '0.8rem',
            py: 1.5,
            backgroundColor:
              row.status === 'Pagado' ? '#d1fae5' :
                row.status === 'Pendiente' ? '#fef3c7' : '#fee2e2',
            color:
              row.status === 'Pagado' ? '#065f46' :
                row.status === 'Pendiente' ? '#92400e' : '#991b1b',
          }}
        />
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header del Dashboard */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
            Resumen General
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitorea tus métricas clave y el estado de los pedidos recientes.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Filter size={18} />}
            sx={{ borderRadius: 1, textTransform: 'none', borderColor: '#d1d5db', color: '#374151', '&:hover': { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }, py: 1, px: 2 }}
          >
            Filtrar
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            sx={{ borderRadius: 1, textTransform: 'none', backgroundColor: '#111827', '&:hover': { backgroundColor: '#374151' }, py: 1, px: 2 }}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* KPIs Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Ingresos Totales
                  </Typography>
                  <CircleDollarSign size={20} color="#6b7280" />
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                  {formatCurrency(kpis.totalRevenue)}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: kpis.revenueGrowthPct >= 0 ? '#10b981' : '#ef4444', fontWeight: '500', mt: 2, display: 'inline-block' }}>
                {kpis.revenueGrowthPct >= 0 ? '+' : ''}{kpis.revenueGrowthPct}% vs mes anterior
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Pedidos
                  </Typography>
                  <BoxIcon size={20} color="#6b7280" />
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                  {kpis.totalOrders}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: kpis.ordersGrowthPct >= 0 ? '#10b981' : '#ef4444', fontWeight: '500', mt: 2, display: 'inline-block' }}>
                {kpis.ordersGrowthPct >= 0 ? '+' : ''}{kpis.ordersGrowthPct}% vs mes anterior
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Clientes
                  </Typography>
                  <UserCircle size={20} color="#6b7280" />
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                  {kpis.totalClients}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: kpis.clientsGrowthPct >= 0 ? '#10b981' : '#ef4444', fontWeight: '500', mt: 2, display: 'inline-block' }}>
                {kpis.clientsGrowthPct >= 0 ? '+' : ''}{kpis.clientsGrowthPct}% vs mes anterior
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tasa de Pagos
                  </Typography>
                  <FileText size={20} color="#6b7280" />
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                  {kpis.paidRatePct}%
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '500', mt: 2, display: 'inline-block' }}>
                Facturas canceladas exitosamente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Gráfico Simulado */}
        <Grid item xs={12}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 4, pb: 3 }}>
                <Typography variant="h5" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                  Ingresos Mensuales
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resumen detallado de las ventas del año en curso
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ px: 0, py: 4 }}>
                <Box sx={{ height: 350, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', pb: 0, borderBottom: '2px solid #f3f4f6' }}>
                  {chartData.map((d, i) => {
                    const maxVal = Math.max(...chartData.map(c => c.revenue));
                    const heightPct = (d.revenue / maxVal) * 100;
                    const isCurrentMonth = i === new Date().getMonth();
                    return (
                      <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', px: { xs: 0.5, sm: 1, md: 2 } }}>
                        <Box sx={{
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          width: '100%',
                          pb: 2,
                          position: 'relative'
                        }}>
                          <Box sx={{
                            width: '100%',
                            maxWidth: '60px',
                            height: `${heightPct}%`,
                            backgroundColor: isCurrentMonth ? '#111827' : '#e5e7eb',
                            borderRadius: '2px 2px 0 0',
                            transition: 'height 0.4s ease',
                            '&:hover': { backgroundColor: isCurrentMonth ? '#1f2937' : '#d1d5db' }
                          }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: isCurrentMonth ? '#111827' : '#6b7280', fontWeight: isCurrentMonth ? '600' : '500', mt: 1 }}>
                          {d.month}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 4, pb: 3 }}>
                <Typography variant="h5" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                  Pedidos Recientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Historial de las últimas transacciones registradas en el sistema
                </Typography>
              </Box>
              <Divider />
              <TableContainer component={Box} sx={{ width: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 650, width: '100%' }} aria-label="pedidos recientes">
                  <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                    <TableRow>
                      {tableColumns.map((col) => (
                        <TableCell 
                          key={col.key} 
                          align={col.align || 'left'}
                          sx={{ 
                            color: '#6b7280', 
                            fontWeight: '600', 
                            fontSize: '0.8125rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            width: col.width,
                            borderBottom: '1px solid #e5e7eb',
                            py: 2
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((row) => (
                      <TableRow 
                        key={row.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: '#f9fafb' },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        {tableColumns.map((col) => (
                          <TableCell 
                            key={col.key} 
                            align={col.align || 'left'}
                            sx={{ borderBottom: '1px solid #f3f4f6', py: 2 }}
                          >
                            {col.render ? col.render(row) : row[col.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}