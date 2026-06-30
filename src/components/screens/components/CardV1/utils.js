import { ShieldAlert, AlertTriangle, Info, Bell } from 'lucide-react';

/**
 * Utility configuration for mapping priority strings/numbers to their visual representation.
 */
export const priorityConfig = {
  '3': { color: '#ef4444', label: 'ALTA', icon: ShieldAlert },
  'alta': { color: '#ef4444', label: 'ALTA', icon: ShieldAlert },
  '2': { color: '#f59e42', label: 'MEDIA', icon: AlertTriangle },
  'media': { color: '#f59e42', label: 'MEDIA', icon: AlertTriangle },
  '1': { color: '#22c55e', label: 'BAJA', icon: Info },
  'baja': { color: '#22c55e', label: 'BAJA', icon: Info },
};

/**
 * Returns priority data (color, label, icon) for a given priority value.
 * @param {string|number} priority - The priority to evaluate.
 * @returns {Object} { color, label, icon }
 */
export const getPriorityData = (priority) => {
  const key = String(priority || '').toLowerCase();
  return priorityConfig[key] || { color: '#64748b', label: 'ALERTAS', icon: Bell };
};

/**
 * Calculates the color representing how soon an appointment is.
 * @param {string} horaCitaStr - Time in "HH:MM:SS" or "HH:MM" format.
 * @returns {string} HEX color code.
 */
export const getAppointmentColorByTime = (horaCitaStr) => {
  if (!horaCitaStr) return '#94a3b8'; // gray default

  const now = new Date();
  const parts = horaCitaStr.split(':').map(Number);
  const hours = parts[0];
  const minutes = parts[1];
  const seconds = parts[2] || 0;
  
  const appointmentTime = new Date(now);
  appointmentTime.setHours(hours, minutes, seconds, 0);

  const diffMs = appointmentTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return '#ef4444'; // past (red)
  if (diffHours <= 1) return '#ef4444'; // less than 1 hour (red)
  if (diffHours <= 4) return '#eab308'; // less than 4 hours (yellow)
  return '#22c55e'; // more than 4 hours (green)
};
