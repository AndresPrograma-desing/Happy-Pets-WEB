import React from 'react';
import GenericPanel from '../../components/GenericPanel/GenericPanel';
import Dashboard from '../../components/Dashboard/Dashboard';
import { getText } from '../../constants';

export default function DashboardPage() {


  return (
    <GenericPanel
      menuTitle="Panel de Administración"
      title="Dashboard"
      message="Resumen de ventas"
      role="admin"
    >
      <div style={{ marginBottom: 24 }}>
        <Dashboard />
      </div>
    </GenericPanel>
  );
}
