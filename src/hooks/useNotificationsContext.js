import { useContext } from 'react';
import { NotificationsContext } from '../context/notificationsContextInstance';

export default function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return ctx;
}
