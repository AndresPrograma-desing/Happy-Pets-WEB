import React from 'react';
import useNotifications from '../hooks/useNotifications';
import { NotificationsContext } from './notificationsContextInstance';

// Envuelve useNotifications() una sola vez por sesión de panel (en PanelLayout)
// para que TopBar y las páginas de dashboard no dupliquen el fetch/polling.
export function NotificationsProvider({ children }) {
  const value = useNotifications();
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
