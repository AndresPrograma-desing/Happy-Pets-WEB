import React from 'react';
import usePanelHeader from '../../components/GenericPanel/usePanelHeader';
import Dashboard from '../../components/Dashboard/Dashboard';

export default function DashboardPage() {
  usePanelHeader({
    menuTitle: "Panel de Administración",
    title: "Dashboard",
    message: "Resumen de ventas"
  });

  return (
    <div style={{ marginBottom: 24 }}>
      <Dashboard />
    </div>
  );
}
