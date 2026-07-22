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
  return 'Usuario';
};

export const getDefaultMenus = ({ setShowNotificationModal, setShowWhatsAppModal }) => ({
  user: [
    { label: getText("userInterface.menuItemDashboard"), path: '/', icon: 'house' },
    { label: 'Proyectos', path: '/projects', icon: 'service' },
    { label: 'Mensajes', path: '/panel-menssage', icon: 'message' },
  ],
  admin: [
    { label: getText("generalPanelTexts.titleA"), path: '/AdminSystem', icon: 'adminRole' },
    { label: getText("adminInterface.menuItemDashboard"), path: '/AdminSystem/dashboard', icon: 'dashboard' },
    { label: getText("adminInterface.menuItemUsers"), path: '/AdminSystem/users', icon: 'user' },
    {
      label: getText("adminInterface.menuItemProducts"), icon: 'box',
      subItems: [
        { label: 'Ver productos', path: '/AdminSystem/products', state: { view: 'list' } },
        { label: 'Administrar productos', path: '/AdminSystem/products', state: { view: 'manage' } }
      ]
    },
    { label: getText("adminInterface.menuItemMessages"), path: '/panel-menssage', icon: 'message' },
    { label: 'Ver Recibos', path: '/facturas', icon: 'fileCheck' },
    { label: getText("generalPanelTexts.optionsNavegations.notificationCreated"), icon: <BellPlus />, onClick: () => setShowNotificationModal(true) },
    { label: getText("generalPanelTexts.optionsNavegations.clientList"), path: '/clients', icon: <Users /> },
    { label: 'Plantillas Emails', path: '/AdminSystem/emails', icon: <Mail /> },
    { label: getText("adminInterface.menuItemSettings"), path: '/AdminSystem/settings', icon: 'engranaje' },
  ],
  secretaria: [
    { label: 'Panel', path: '/SecretariaSystem', icon: 'secretariaRole' },
    {
      label: 'Citas', icon: 'calendario',
      subItems: [
        { label: 'Lista de Citas', path: '/citas', state: { role: 'secretaria' } },
        { label: 'Nueva Cita', path: '/citas/crear', state: { role: 'secretaria' } },
        { label: 'Nuevo Usuario', path: '/clientes/crear' }
      ]
    },
    { label: 'Gestion de Recibos', path: '/factura-manager', icon: 'fileText' },
    { label: 'Mensajes', path: '/panel-menssage', icon: 'message' },
    { label: 'Ver Recibos', path: '/facturas', icon: 'fileCheck' },
    { label: 'Gestión de Recetas', path: '/doctor/recetas', icon: 'clipboardPlus' },
    { label: 'Crear Alerta', icon: <BellPlus />, onClick: () => setShowNotificationModal(true) },
    { label: getText("generalPanelTexts.optionsNavegations.clientList"), path: '/clients', icon: <Users /> },
  ],
  doctor: [
    { label: 'Panel Médico', path: '/doctor', icon: 'userCita' },
    { label: 'Mis Citas', path: '/citas', icon: 'calendario' },
    { label: 'Historias Clínicas', path: '/doctor/pacientes', icon: 'fileText' },
    { label: 'Gestión de Recetas', path: '/doctor/recetas', icon: 'clipboardPlus' },
    { label: 'Mensajes', path: '/panel-menssage', icon: 'message' },
    { label: 'Ver Recibos', path: '/facturas', icon: 'fileCheck' },
    // { label: 'Asistente Virtual', path: '/asistente-virtual', icon: <BotIcon />, newTab: true },
    { label: 'Crear Alerta', icon: <BellPlus />, onClick: () => setShowNotificationModal(true) },
  ],
});
