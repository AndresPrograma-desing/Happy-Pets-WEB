// utils.js
// Archivo de utilidades y datos falsos (mock) para la maqueta del Dashboard

/**
 * MOCK DATA
 * Estas estructuras representan los datos que se esperan del backend
 * en los nuevos servicios.
 */

export const mockKPIs = {
    totalRevenue: 15420.50,
    revenueGrowthPct: 12.5,
    totalOrders: 145,
    ordersGrowthPct: 5.2,
    totalClients: 89,
    clientsGrowthPct: -2.1,
    paidRatePct: 85
  };
  
  export const mockChartData = [
    { month: 'Ene', revenue: 1200 },
    { month: 'Feb', revenue: 2100 },
    { month: 'Mar', revenue: 1800 },
    { month: 'Abr', revenue: 2400 },
    { month: 'May', revenue: 2800 },
    { month: 'Jun', revenue: 1900 },
    { month: 'Jul', revenue: 3200 },
    { month: 'Ago', revenue: 3800 },
    { month: 'Sep', revenue: 3100 },
    { month: 'Oct', revenue: 4100 },
    { month: 'Nov', revenue: 4500 },
    { month: 'Dic', revenue: 5200 }
  ];
  
  export const mockRecentOrders = [
    {
      id: "1045",
      clientName: "Juan Pérez",
      amount: 250.00,
      status: "Pagado",
      date: "2026-07-05T10:30:00Z"
    },
    {
      id: "1044",
      clientName: "María García",
      amount: 125.50,
      status: "Pendiente",
      date: "2026-07-05T09:15:00Z"
    },
    {
      id: "1043",
      clientName: "Carlos López",
      amount: 450.00,
      status: "Pagado",
      date: "2026-07-04T16:45:00Z"
    },
    {
      id: "1042",
      clientName: "Ana Martínez",
      amount: 85.00,
      status: "Cancelado",
      date: "2026-07-04T14:20:00Z"
    },
    {
      id: "1041",
      clientName: "Roberto Gómez",
      amount: 320.00,
      status: "Pagado",
      date: "2026-07-03T11:10:00Z"
    }
  ];
  
  /**
   * UTILIDADES
   * Funciones para simular llamadas al backend
   */
  
  export const fetchDashboardMockData = async () => {
    // Simulamos un retraso de red
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          kpis: mockKPIs,
          chartData: mockChartData,
          recentOrders: mockRecentOrders
        });
      }, 1000);
    });
  };
