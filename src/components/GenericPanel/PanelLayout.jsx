import React, { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import GenericPanel from './GenericPanel';
import { DEFAULT_HEADER } from './usePanelHeader';
import { NotificationsProvider } from '../../context/NotificationsContext';

// Layout persistente: se monta una sola vez por sesión de navegación autenticada.
// Las páginas hijas (via <Outlet>) controlan el header/paginación con usePanelHeader().
export default function PanelLayout() {
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const outletContext = useMemo(() => ({ setHeader }), []);

  return (
    <NotificationsProvider>
      <GenericPanel {...header}>
        <Outlet context={outletContext} />
      </GenericPanel>
    </NotificationsProvider>
  );
}
