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
import { BoxIcon, UserCircle, FileText, CircleDollarSign, Download, Filter, Calendar } from 'lucide-react';
import { getDashboardStats } from '../../services/api/Dashboard';
import Loading from '../screens/components/Loading/Index';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await getDashboardStats();
        setData(result);
        setError(null);
      } catch (err) {
        setError("Error al cargar los datos del panel.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Loading 
    size="large" 
    variant="bars"  // O box o default
    phrases={["Cargando Dashboard", "Calculando Datos"]} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>
      </Box>
    );
  }

  if (!data) return null;

  const kpis = {
    totalRevenue: data.total_ganancias || 0,
    totalCitas: data.total_citas || 0,
    totalClients: data.total_clientes || 0,
    totalMascotas: data.total_mascotas || 0,
  };

  const chartData = (data.ganancias_mensuales && data.ganancias_mensuales.length > 0)
    ? data.ganancias_mensuales
    : [
        { month: 'Ene', revenue: 0 }, { month: 'Feb', revenue: 0 }, { month: 'Mar', revenue: 0 },
        { month: 'Abr', revenue: 0 }, { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
        { month: 'Jul', revenue: 0 }, { month: 'Ago', revenue: 0 }, { month: 'Sep', revenue: 0 },
        { month: 'Oct', revenue: 0 }, { month: 'Nov', revenue: 0 }, { month: 'Dic', revenue: 0 }
      ];

  const ultimasCitas = data.ultimas_citas || [];

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
      label: 'Detalle de Cita',
      width: '35%',
      render: (row) => (
        <Box>
          <Typography variant="body1" fontWeight="600" color="#111827">
            {row.cliente_nombre} - {row.mascota_nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {row.motivo}
          </Typography>
        </Box>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      width: '20%',
      align: 'center',
      render: (row) => (
        <Typography variant="body1" fontWeight="500" color="#111827" sx={{ textTransform: 'capitalize' }}>
          {row.tipo_cita}
        </Typography>
      )
    },
    {
      key: 'date',
      label: 'Fecha y Hora',
      width: '25%',
      align: 'center',
      render: (row) => {
        return (
          <Typography variant="body2" color="text.secondary">
            {row.fecha_cita} a las {row.hora_cita}
          </Typography>
        );
      }
    },
    {
      key: 'status',
      label: 'Estado',
      width: '20%',
      align: 'center',
      render: (row) => {
        const est = (row.estado || '').toLowerCase();
        let bg = '#e5e7eb';
        let col = '#374151';
        if (est === 'completada') { bg = '#d1fae5'; col = '#065f46'; }
        else if (est === 'programada' || est === 'en_curso') { bg = '#fef3c7'; col = '#92400e'; }
        else if (est === 'cancelada' || est === 'no_asistida') { bg = '#fee2e2'; col = '#991b1b'; }
        
        return (
          <Chip
            label={(row.estado || '').replace('_', ' ').toUpperCase()}
            size="small"
            sx={{
              fontWeight: '600',
              borderRadius: '4px',
              fontSize: '0.8rem',
              py: 1.5,
              backgroundColor: bg,
              color: col,
            }}
          />
        )
      }
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
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '500', mt: 2, display: 'inline-block' }}>
                Total acumulado
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
                    Total Citas
                  </Typography>
                  <Calendar size={20} color="#6b7280" />
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                  {kpis.totalCitas}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '500', mt: 2, display: 'inline-block' }}>
                Citas registradas
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
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '500', mt: 2, display: 'inline-block' }}>
                Clientes registrados
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
                    Total Mascotas
                  </Typography>
                  <BoxIcon size={20} color="#6b7280" />
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                  {kpis.totalMascotas}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '500', mt: 2, display: 'inline-block' }}>
                Mascotas registradas
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
                  Citas Recientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Historial de las últimas citas registradas en el sistema
                </Typography>
              </Box>
              <Divider />
              <TableContainer component={Box} sx={{ width: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 650, width: '100%' }} aria-label="citas recientes">
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
                    {ultimasCitas.map((row) => (
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