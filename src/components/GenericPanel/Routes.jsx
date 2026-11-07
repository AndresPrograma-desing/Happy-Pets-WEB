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
// globales (sin prefijo de rol). Lo que queda acá es puramente ruteo/comportamiento de click.
//
// ROUTE_BY_KEY es un único mapa GLOBAL permissionKey -> { path/onClick/state }, sin duplicar por
// rol. Antes había una lista de rutas por rol (admin/secretaria/doctor) y si una key del catálogo
// no estaba copiada a mano en el bloque del rol del usuario, el permiso se guardaba bien en el
// backend pero jamás aparecía en el sidebar (bug real: a un admin se le asignaba p.ej. "citas.list"
// o "records.view" y no salían, porque esas keys solo estaban mapeadas para secretaria/doctor).
// Con un solo mapa por key, cualquier rol que reciba cualquier key del catálogo la ve resuelta acá
// sin tener que tocar este archivo cada vez que se reparte un permiso distinto.
const buildRouteByKey = ({ setShowNotificationModal, setShowCreateClientModal, setShowCreateUserModal }) => ({
  'projects.view': { path: '/projects' },
  'messages.view': { path: '/panel-mensajes' },
  'users.view': { path: '/administracion/usuarios' },
  'users.create': { onClick: () => setShowCreateUserModal(true) },
  'products.view': { path: '/administracion/productos', state: { view: 'list' } },
  'products.manage': { path: '/administracion/productos', state: { view: 'manage' } },
  'invoices.view': { path: '/recibos' },
  'invoices.manage': { path: '/gestor-facturas' },
  // 'invoices.account' (Cuenta de cliente) no tiene entrada: vive como acción dentro de la
  // pantalla de Clientes (HU-27), no como ítem propio de sidebar.
  'notifications.create': { onClick: () => setShowNotificationModal(true) },
  'clients.view': { path: '/clientes' },
  'clients.create': { onClick: () => setShowCreateClientModal && setShowCreateClientModal(true) },
  'emails.manage': { path: '/administracion/correos' },
  'vaccines.view': { path: '/administracion/vacunas', state: { view: 'list' } },
  'vaccines.manage': { path: '/administracion/vacunas', state: { view: 'manage', openCreate: true } },
  'vaccines.pending': { path: '/administracion/vacunas', state: { view: 'pending' } },
  'vaccines.batches': { path: '/administracion/vacunas', state: { view: 'batches' } },
  'settings.manage': { path: '/administracion/configuracion' },
  'citas.list': { path: '/citas', state: { role: 'secretaria' } },
  'citas.create': { path: '/citas/crear', state: { role: 'secretaria' } },
  'citas.mine': { path: '/citas' },
  'calendar.view': { path: '/calendario', state: { role: 'secretaria' } },
  'recipes.manage': { path: '/doctor/recetas' },
  'records.view': { path: '/doctor/pacientes' },
  'services.view': { path: '/administracion/servicios' },
  'services.manage': { path: '/administracion/servicios' },
  'inventory.view': { path: '/administracion/inventario' },
  'priceHistory.view': { path: '/administracion/historial-precios' },
});

// Ítems "root" de cada panel (Panel/Dashboard): no tienen módulo equivalente en el catálogo de
// permisos, así que llevan label/icon fijos acá y se muestran siempre, sin gating por permiso.
const ROOT_ITEMS_BY_ROLE = {
  user: [{ path: '/', label: 'Inicio', icon: 'Home' }],
  admin: [
    { path: '/administracion', label: 'Panel', icon: 'Home' },
    { path: '/administracion/dashboard', label: 'Dashboard', icon: 'dashboard' },
  ],
  secretaria: [{ path: '/secretaria', label: 'Panel', icon: 'Home' }],
  doctor: [{ path: '/doctor', label: 'Panel', icon: 'Home' }],
};

// Arma la lista de items a resolver para un rol: los root items fijos de ese rol + un item por
// cada key del catálogo que tenga ruta/acción definida en ROUTE_BY_KEY. resolveMenuFromCatalog ya
// se encarga de filtrar por lo que el usuario realmente tiene y de agrupar por módulo.
export const getDefaultMenus = (options) => {
  const routeByKey = buildRouteByKey(options);
  const roots = ROOT_ITEMS_BY_ROLE;
  const keyedItems = Object.entries(routeByKey).map(([permissionKey, route]) => ({ ...route, permissionKey }));

  return Object.keys(roots).reduce((acc, role) => {
    acc[role] = [...roots[role], ...keyedItems];
    return acc;
  }, {});
};

// Cruza los items de ruteo (path/onClick) con el catálogo del backend, agrupado por módulo:
// { [permissionKey]: { key, label, module, moduleLabel, moduleIcon } } (ver usePermissionsCatalog).
// Un item con permissionKey SOLO aparece si esa key tiene entrada en el catálogo Y el usuario la
// tiene asignada (ver filterMenuByPermissions, que corre antes). Los items sin permissionKey
// (root) ya traen su label/icon fijo y pasan siempre.
//
// Varios items quedan agrupados en un mismo `subItems` cuando apuntan al mismo path (son
// vistas/tabs de una misma pantalla, ej. las 4 vistas de vacunas o las 2 de productos); si solo
// una key de ese grupo resuelve, queda como item plano. Items de un mismo módulo pero con paths
// distintos (ej. users.view "/administracion/usuarios" vs users.create que abre un modal) quedan
// planos y separados, igual que en el menú original.
export const resolveMenuFromCatalog = (items, permissionsCatalog) => {
  const catalog = permissionsCatalog || {};

  const rootItems = [];
  const pathGroups = new Map(); // path -> resolved sub-items, en orden de aparición

  items.forEach((item) => {
    if (!item.permissionKey) {
      rootItems.push({ ...item, icon: resolveCatalogIcon(item.icon) });
      return;
    }

    const entry = catalog[item.permissionKey];
    if (!entry) return;

    const resolved = { ...item, id: item.permissionKey, label: entry.label, icon: resolveCatalogIcon(entry.moduleIcon) };
    const groupKey = item.path || item.permissionKey;
    if (!pathGroups.has(groupKey)) pathGroups.set(groupKey, { meta: entry, subItems: [] });
    pathGroups.get(groupKey).subItems.push(resolved);
  });

  const groupedItems = Array.from(pathGroups.values()).map(({ meta, subItems }) => {
    if (subItems.length === 1) return subItems[0];
    return {
      id: `group-${meta.module}`,
      label: meta.moduleLabel,
      icon: resolveCatalogIcon(meta.moduleIcon),
      subItems,
    };
  });

  return [...rootItems, ...groupedItems];
};

// Aplana TODO el catálogo de permisos del sistema en [{ key, label }], sin filtrar por rol.
// Usado en crear usuario / editar permisos de usuario para poder asignar cualquier permiso
// del sistema, no solo los que el menú del rol seleccionado usa.
export const getAllPermissionKeys = (permissionsCatalog = {}) => (
  Object.values(permissionsCatalog || {}).map(({ key, label }) => ({ key, label }))
);
