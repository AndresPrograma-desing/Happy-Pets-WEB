import React from 'react';
import { getCredencialPdf } from '../../services/api/pdf';
import { getIcon } from '../../assets/icons/ExportIcon/Index';

/**
 * El catálogo de permisos resuelve `icon` como un elemento JSX ya instanciado
 * (ej. `<House />`, vía resolveCatalogIcon) o como un string de ícono custom —
 * la convención que entiende el `renderIcon()` local. El `Sidebar` de
 * anteriority-ui en cambio espera una referencia al componente para
 * instanciarlo él mismo (`icon: House`), así que acá se adapta uno al otro.
 */
function normalizeSidebarIcon(icon) {
  if (!icon) return undefined;
  if (React.isValidElement(icon)) return icon.type;
  if (typeof icon === 'string') {
    const src = getIcon(icon);
    if (!src) return undefined;
    return function AssetIcon({ size = 20 }) {
      return React.createElement('img', { src, alt: '', width: size, height: size });
    };
  }
  return icon;
}

export const syncStorageName = (newName) => {
  try {
    const raw = sessionStorage.getItem('auth_login_data') || localStorage.getItem('auth_login_data');
    if (raw) {
      const authData = JSON.parse(raw);
      if (authData.usuario) authData.usuario.nombre = newName;
      if (authData.user) {
        authData.user.nombre = newName;
        authData.user.name = newName;
      }
      authData.nombre = newName;
      authData.name = newName;
      sessionStorage.setItem('auth_login_data', JSON.stringify(authData));
    }
  } catch (err) {
    console.error('Error sincronizando nombre en storage:', err);
  }
};

/**
 * Filtra los items de menú por búsqueda, les asegura un id estable y
 * calcula cuál queda activo según la ruta actual. Devuelve la forma que
 * espera el prop `groups` de ProSidebar.
 */
export const buildSidebarData = ({ items, searchValue = '', pathname = '' }) => {
  const query = searchValue.toLowerCase();

  const filteredItems = (items || []).filter(it =>
    it.label?.toLowerCase().includes(query) ||
    (it.subItems && it.subItems.some(sub => sub.label?.toLowerCase().includes(query)))
  );

  const filteredItemsWithId = filteredItems.map((it, idx) => ({
    ...it,
    id: it.id || it.path || it.label || `sidebar-item-${idx}`,
    icon: normalizeSidebarIcon(it.icon),
    subItems: it.subItems?.map((sub, sIdx) => ({
      ...sub,
      id: sub.id || sub.path || sub.label || `sub-item-${sIdx}`,
      icon: normalizeSidebarIcon(sub.icon),
    }))
  }));

  const activeItem = filteredItemsWithId.find(it => {
    if (pathname === it.path) return true;
    if (it.subItems && it.subItems.some(sub => pathname === sub.path)) return true;
    return false;
  });

  return {
    groups: [{ title: '', items: filteredItemsWithId }],
    activeId: activeItem ? activeItem.id : ''
  };
};

/**
 * Pide el certificado en PDF del usuario y lo expone como blob URL.
 */
export const generateCertificatePdf = async (userId) => {
  const res = await getCredencialPdf(userId);
  const { blob, filename } = res || {};
  if (!blob) throw new Error('No se pudo obtener el archivo de certificado.');
  return { url: URL.createObjectURL(blob), filename: filename || '' };
};

/**
 * Dispara la descarga de un blob URL ya generado, vía un <a> temporal.
 */
export const triggerFileDownload = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};