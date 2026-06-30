import { useState, useEffect, useCallback } from 'react';
import notificationSignalRService from '../../../services/SignalR';
import { API_BASE } from '../../../services/api/client';

/**
 * Generates a unique ID for push notifications.
 * Uses the current timestamp and a random string.
 * @returns {string} Unique ID
 */
export const generateToastId = () => {
  return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Custom hook para manejar la lógica de notificaciones Push Globales
 * @param {string|number} userId El ID del usuario actual
 * @returns {Object} { notifications, removeNotification }
 */
export const usePushNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const AUTO_DISMISS_TIME = 5000;

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isExiting: true } : notif
      )
    );

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    const handleReceiveNotification = (data) => {
      const newNotif = {
        id: generateToastId(),
        title: data.title || "Nueva Notificación",
        message: data.message || "Tienes una nueva alerta en el sistema.",
        type: data.type || "Info",
        isExiting: false,
      };

      setNotifications((prev) => [...prev, newNotif]);

      setTimeout(() => {
        removeNotification(newNotif.id);
      }, AUTO_DISMISS_TIME);
    };

    if (userId) {
      const baseUrl = API_BASE.replace(/\/api\/?$/, '');
      notificationSignalRService.startConnection(userId, baseUrl);
      notificationSignalRService.onReceiveNotification(handleReceiveNotification);
    }

    return () => {
      notificationSignalRService.offReceiveNotification();
      notificationSignalRService.stopConnection();
    };
  }, [removeNotification, userId]);

  return { notifications, removeNotification };
};
