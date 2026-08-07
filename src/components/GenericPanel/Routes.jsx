import React from 'react';
import { Link2, BellPlus, Users, BotIcon, Mail } from 'lucide-react';
import { getText } from '../../constants';

export const getUserRole = () => {
  try {
    const raw = sessionStorage.getItem('auth_login_data') || localStorage.getItem('auth_login_data');
    if (raw) {
      const data = JSON.parse(raw);
      return data?.rol?.toLowerCase() || data?.user?.rol?.toLowerCase() || data?.usuario?.rol?.toLowerCase() || null;
    }
  } catch (e) {
    console.error('Error parsing auth_login_data', e);
  }
  return null;
};

export const getDisplayRoleName = (role) => {
  if (role === 'admin') return 'Administrador';
  if (role === 'doctor') return 'Doctor';
  if (role === 'secretaria') return 'Secretaria';
  if (role === 'client') return 'Cliente';
  return 'Usuario';
};

// Lee el array de permisos del usuario guardado por GenericPanel al cargar /Auth/me.
// null/undefined => sin override, se debe mostrar el menú completo del rol (fallback).
export const getUserPermissions = () => {
  try {
    const raw = sessionStorage.getItem('user_permissions') || localStorage.getItem('user_permissions');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing user_permissions', e);
  }
  return null;
};

// Filtra los items (y sub-items) del sidebar según las claves de permiso otorgadas.
// Si permissions es null/undefined, devuelve los items sin cambios (fallback al menú del rol).
export const filterMenuByPermissions = (items, permissions) => {
  if (!permissions) return items;

  return items.reduce((acc, item) => {
    if (item.subItems && item.subItems.length > 0) {
      const allowedSubItems = item.subItems.filter(
        (sub) => !sub.permissionKey || permissions.includes(sub.permissionKey)
      );
      if (allowedSubItems.length > 0) {
        acc.push({ ...item, subItems: allowedSubItems });
      }
      return acc;
    }

    if (!item.permissionKey || permissions.includes(item.permissionKey)) {
      acc.push(item);
    }
    return acc;
  }, []);
};

// Aplana el menú de un rol en [{ key, label }] para construir la UI de administración de permisos.
export const getAllPermissionKeysForRole = (role, options = {}) => {
  const defaultMenus = getDefaultMenus(options);
  const items = defaultMenus[role] || [];

  return items.reduce((acc, item) => {
    if (item.subItems && item.subItems.length > 0) {
      item.subItems.forEach((sub) => {
        if (sub.permissionKey) acc.push({ key: sub.permissionKey, label: `${item.label} - ${sub.label}` });
      });
      return acc;
    }
    if (item.permissionKey) acc.push({ key: item.permissionKey, label: item.label });
    return acc;
  }, []);
};

export const getDefaultMenus = ({ setShowNotificationModal, setShowWhatsAppModal, setShowCreateClientModal }) => ({
  user: [
    { label: getText("userInterface.menuItemDashboard"), path: '/', icon: 'house', permissionKey: 'user.dashboard' },
    { label: 'Proyectos', path: '/projects', icon: 'service', permissionKey: 'user.projects' },
    { label: 'Mensajes', path: '/panel-menssage', icon: 'message', permissionKey: 'user.messages' },
  ],
  admin: [
    { label: getText("generalPanelTexts.titleA"), path: '/AdminSystem', icon: 'adminRole', permissionKey: 'admin.panel' },
    { label: getText("adminInterface.menuItemDashboard"), path: '/AdminSystem/dashboard', icon: 'dashboard', permissionKey: 'admin.dashboard' },
    { label: getText("adminInterface.menuItemUsers"), path: '/AdminSystem/users', icon: 'user', permissionKey: 'admin.users' },
    {
      label: getText("adminInterface.menuItemProducts"), icon: 'box',
      subItems: [
        { label: 'Ver productos', path: '/AdminSystem/products', state: { view: 'list' }, permissionKey: 'admin.products.view' },
        { label: 'Administrar productos', path: '/AdminSystem/products', state: { view: 'manage' }, permissionKey: 'admin.products.manage' }
      ]
    },
    { label: getText("adminInterface.menuItemMessages"), path: '/panel-menssage', icon: 'message', permissionKey: 'admin.messages' },
    { label: 'Ver Recibos', path: '/facturas', icon: 'fileCheck', permissionKey: 'admin.invoices.view' },
    { label: getText("generalPanelTexts.optionsNavegations.notificationCreated"), icon: <BellPlus />, onClick: () => setShowNotificationModal(true), permissionKey: 'admin.notifications.create' },
    { label: getText("generalPanelTexts.optionsNavegations.clientList"), path: '/clients', icon: <Users />, permissionKey: 'admin.clients' },
    { label: 'Plantillas Emails', path: '/AdminSystem/emails', icon: <Mail />, permissionKey: 'admin.emails' },
    { label: getText("adminInterface.menuItemSettings"), path: '/AdminSystem/settings', icon: 'engranaje', permissionKey: 'admin.settings' },
  ],
  secretaria: [
    { label: 'Panel', path: '/SecretariaSystem', icon: 'secretariaRole', permissionKey: 'secretaria.panel' },
    {
      label: 'Citas', icon: 'calendario',
      subItems: [
        { label: 'Lista de Citas', path: '/citas', state: { role: 'secretaria' }, permissionKey: 'secretaria.citas.list' },
        { label: 'Nueva Cita', path: '/citas/crear', state: { role: 'secretaria' }, permissionKey: 'secretaria.citas.create' },
        { label: 'Nuevo Cliente', onClick: () => setShowCreateClientModal && setShowCreateClientModal(true), permissionKey: 'secretaria.citas.newClient' }
      ]
    },
    { label: 'Calendario', path: '/calendar', state: { role: 'secretaria' }, icon: 'calendario', permissionKey: 'secretaria.calendar' },
    { label: 'Gestion de Recibos', path: '/factura-manager', icon: 'fileText', permissionKey: 'secretaria.invoices.manage' },
    { label: 'Mensajes', path: '/panel-menssage', icon: 'message', permissionKey: 'secretaria.messages' },
    { label: 'Ver Recibos', path: '/facturas', icon: 'fileCheck', permissionKey: 'secretaria.invoices.view' },
    { label: 'Gestión de Recetas', path: '/doctor/recetas', icon: 'clipboardPlus', permissionKey: 'secretaria.recipes' },
    { label: 'Crear Alerta', icon: <BellPlus />, onClick: () => setShowNotificationModal(true), permissionKey: 'secretaria.notifications.create' },
    { label: getText("generalPanelTexts.optionsNavegations.clientList"), path: '/clients', icon: <Users />, permissionKey: 'secretaria.clients' },
  ],
  doctor: [
    { label: 'Panel Médico', path: '/doctor', icon: 'userCita', permissionKey: 'doctor.panel' },
    { label: 'Mis Citas', path: '/citas', icon: 'calendario', permissionKey: 'doctor.citas' },
    { label: 'Calendario', path: '/calendar', icon: 'calendario', permissionKey: 'doctor.calendar' },
    { label: 'Historias Clínicas', path: '/doctor/pacientes', icon: 'fileText', permissionKey: 'doctor.records' },
    { label: 'Gestión de Recetas', path: '/doctor/recetas', icon: 'clipboardPlus', permissionKey: 'doctor.recipes' },
    { label: 'Mensajes', path: '/panel-menssage', icon: 'message', permissionKey: 'doctor.messages' },
    { label: 'Ver Recibos', path: '/facturas', icon: 'fileCheck', permissionKey: 'doctor.invoices.view' },
    // { label: 'Asistente Virtual', path: '/asistente-virtual', icon: <BotIcon />, newTab: true },
    { label: 'Crear Alerta', icon: <BellPlus />, onClick: () => setShowNotificationModal(true), permissionKey: 'doctor.notifications.create' },
  ],
});
