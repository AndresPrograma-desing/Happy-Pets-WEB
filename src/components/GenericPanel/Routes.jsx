import { resolveCatalogIcon } from '../../utils/lucideIcon';

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

// Filtra los items del sidebar según las claves de permiso que tiene otorgadas el usuario.
// Los items sin permissionKey (root, siempre visibles) se muestran pase lo que pase. Los que
// requieren permiso (planos o dentro de un grupo) solo se muestran una vez que /Auth/me cargó
// el array de permisos; si todavía no cargó (permissions null/undefined), se ocultan.
export const filterMenuByPermissions = (items, permissions) => {
  const hasPermissions = Array.isArray(permissions);
  return items.reduce((acc, item) => {
    if (item.subItems) {
      if (!hasPermissions) return acc;
      const visibleSubItems = item.subItems.filter((sub) => !sub.permissionKey || permissions.includes(sub.permissionKey));
      if (visibleSubItems.length > 0) acc.push({ ...item, subItems: visibleSubItems });
      return acc;
    }
    if (!item.permissionKey) {
      acc.push(item);
      return acc;
    }
    if (hasPermissions && permissions.includes(item.permissionKey)) acc.push(item);
    return acc;
  }, []);
};

// Este archivo ya NO define texto ni ícono de ningún item con permissionKey: eso vive en el
// catálogo de permisos del backend (GET /Permissions/permission), agrupado por módulo y con keys
// globales (sin prefijo de rol). Lo que queda acá es puramente ruteo/comportamiento de click,
// indexado por esa misma key — ver resolveMenuFromCatalog.
//
// Los items sin permissionKey (los "root" de cada panel: Panel/Dashboard) no tienen módulo
// equivalente en el catálogo, así que llevan label/icon fijos acá y se muestran siempre,
// sin gating por permiso.
//
// Un módulo se agrupa en `subItems` solo cuando sus permisos apuntan al mismo path (son
// vistas/tabs de una misma pantalla, ej. vacunas o productos). Si apuntan a paths distintos
// quedan como items planos separados, igual que antes.
export const getDefaultMenus = ({ setShowNotificationModal, setShowWhatsAppModal, setShowCreateClientModal, setShowCreateUserModal }) => ({
  user: [
    { path: '/', label: 'Inicio', icon: 'Home' },
    { path: '/projects', permissionKey: 'projects.view' },
    { path: '/panel-menssage', permissionKey: 'messages.view' },
  ],
  admin: [
    { path: '/AdminSystem', label: 'Panel', icon: 'Home' },
    { path: '/AdminSystem/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/AdminSystem/users', permissionKey: 'users.view' },
    { onClick: () => setShowCreateUserModal(true), permissionKey: 'users.create' },
    {
      subItems: [
        { path: '/AdminSystem/products', state: { view: 'list' }, permissionKey: 'products.view' },
        { path: '/AdminSystem/products', state: { view: 'manage' }, permissionKey: 'products.manage' },
      ],
    },
    { path: '/panel-menssage', permissionKey: 'messages.view' },
    { path: '/facturas', permissionKey: 'invoices.view' },
    { onClick: () => setShowNotificationModal(true), permissionKey: 'notifications.create' },
    { path: '/clients', permissionKey: 'clients.view' },
    { path: '/AdminSystem/emails', permissionKey: 'emails.manage' },
    {
      subItems: [
        { path: '/AdminSystem/vaccines', state: { view: 'list' }, permissionKey: 'vaccines.view' },
        { path: '/AdminSystem/vaccines', state: { view: 'manage', openCreate: true }, permissionKey: 'vaccines.manage' },
        { path: '/AdminSystem/vaccines', state: { view: 'pending' }, permissionKey: 'vaccines.pending' },
        { path: '/AdminSystem/vaccines', state: { view: 'batches' }, permissionKey: 'vaccines.batches' },
      ],
    },
    { path: '/AdminSystem/settings', permissionKey: 'settings.manage' },
  ],
  secretaria: [
    { path: '/SecretariaSystem', label: 'Panel', icon: 'Home' },
    { path: '/citas', state: { role: 'secretaria' }, permissionKey: 'citas.list' },
    { path: '/citas/crear', state: { role: 'secretaria' }, permissionKey: 'citas.create' },
    { onClick: () => setShowCreateClientModal && setShowCreateClientModal(true), permissionKey: 'clients.create' },
    { path: '/calendar', state: { role: 'secretaria' }, permissionKey: 'calendar.view' },
    { path: '/factura-manager', permissionKey: 'invoices.manage' },
    { path: '/panel-menssage', permissionKey: 'messages.view' },
    { path: '/facturas', permissionKey: 'invoices.view' },
    {
      subItems: [
        { path: '/AdminSystem/vaccines', state: { view: 'list' }, permissionKey: 'vaccines.view' },
        { path: '/AdminSystem/vaccines', state: { view: 'manage', openCreate: true }, permissionKey: 'vaccines.manage' },
        { path: '/AdminSystem/vaccines', state: { view: 'pending' }, permissionKey: 'vaccines.pending' },
        { path: '/AdminSystem/vaccines', state: { view: 'batches' }, permissionKey: 'vaccines.batches' },
      ],
    },
    { path: '/doctor/recetas', permissionKey: 'recipes.manage' },
    { onClick: () => setShowNotificationModal(true), permissionKey: 'notifications.create' },
    { path: '/clients', permissionKey: 'clients.view' },
  ],
  doctor: [
    { path: '/doctor', label: 'Panel', icon: 'Home' },
    { path: '/citas', permissionKey: 'citas.mine' },
    { path: '/calendar', permissionKey: 'calendar.view' },
    { path: '/doctor/pacientes', permissionKey: 'records.view' },
    { path: '/doctor/recetas', permissionKey: 'recipes.manage' },
    {
      subItems: [
        { path: '/AdminSystem/vaccines', state: { view: 'list' }, permissionKey: 'vaccines.view' },
        { path: '/AdminSystem/vaccines', state: { view: 'manage', openCreate: true }, permissionKey: 'vaccines.manage' },
        { path: '/AdminSystem/vaccines', state: { view: 'pending' }, permissionKey: 'vaccines.pending' },
        { path: '/AdminSystem/vaccines', state: { view: 'batches' }, permissionKey: 'vaccines.batches' },
      ],
    },
    { path: '/panel-menssage', permissionKey: 'messages.view' },
    { path: '/facturas', permissionKey: 'invoices.view' },
    { onClick: () => setShowNotificationModal(true), permissionKey: 'notifications.create' },
  ],
});

// Cruza los items de ruteo (path/onClick) con el catálogo del backend, agrupado por módulo:
// { [permissionKey]: { key, label, module, moduleLabel, moduleIcon } } (ver usePermissionsCatalog).
// Un item con permissionKey SOLO aparece si esa key tiene entrada en el catálogo. Los items sin
// permissionKey (root) ya traen su label/icon fijo y pasan siempre. Los grupos con subItems
// resuelven cada subitem por su propia key y toman el label/icono del módulo para el header del
// grupo; si ningún subitem resuelve, el grupo entero se descarta.
export const resolveMenuFromCatalog = (items, permissionsCatalog) => {
  const catalog = permissionsCatalog || {};

  return items.reduce((acc, item) => {
    if (item.subItems) {
      const resolvedSubItems = item.subItems.reduce((subAcc, sub) => {
        const entry = catalog[sub.permissionKey];
        if (!entry) return subAcc;
        subAcc.push({ ...sub, id: sub.permissionKey, label: entry.label, icon: resolveCatalogIcon(entry.moduleIcon) });
        return subAcc;
      }, []);
      if (resolvedSubItems.length === 0) return acc;
      const groupMeta = catalog[resolvedSubItems[0].id];
      acc.push({
        id: `group-${groupMeta.module}`,
        label: groupMeta.moduleLabel,
        icon: resolveCatalogIcon(groupMeta.moduleIcon),
        subItems: resolvedSubItems,
      });
      return acc;
    }

    if (!item.permissionKey) {
      acc.push({ ...item, icon: resolveCatalogIcon(item.icon) });
      return acc;
    }

    const entry = catalog[item.permissionKey];
    if (!entry) return acc;
    acc.push({ ...item, id: item.permissionKey, label: entry.label, icon: resolveCatalogIcon(entry.moduleIcon) });
    return acc;
  }, []);
};

// Aplana el menú de un rol (incluyendo lo agrupado en subItems) en [{ key, label }] para la UI
// de selección de permisos (crear usuario / editar permisos). Solo incluye claves que existan
// en el catálogo.
export const getAllPermissionKeysForRole = (role, options = {}, permissionsCatalog = {}) => {
  const defaultMenus = getDefaultMenus(options);
  const items = defaultMenus[role] || [];
  const catalog = permissionsCatalog || {};

  const collect = (list) => list.reduce((acc, item) => {
    if (item.subItems) return acc.concat(collect(item.subItems));
    const entry = item.permissionKey ? catalog[item.permissionKey] : null;
    if (entry) acc.push({ key: item.permissionKey, label: entry.label });
    return acc;
  }, []);

  return collect(items);
};

// Aplana TODO el catálogo de permisos del sistema en [{ key, label }], sin filtrar por rol.
// Usado en crear usuario / editar permisos de usuario para poder asignar cualquier permiso
// del sistema, no solo los que el menú del rol seleccionado usa.
export const getAllPermissionKeys = (permissionsCatalog = {}) => (
  Object.values(permissionsCatalog || {}).map(({ key, label }) => ({ key, label }))
);
