/**
 * Filtra los grupos de menú y sus elementos basándose en un término de búsqueda.
 */
export function filterMenuGroups(groups, query) {
  if (!groups || !Array.isArray(groups)) return [];
  if (!query) return groups;

  const lowercaseQuery = query.toLowerCase();

  return groups
    .map((group) => {
      const filteredItems = (group.items || []).filter((item) => {
        const matchesLabel = item.label?.toLowerCase().includes(lowercaseQuery);
        // También buscamos en subItems si existieran
        const matchesSubItems = item.subItems?.some(sub => 
          sub.label?.toLowerCase().includes(lowercaseQuery)
        );
        return matchesLabel || matchesSubItems;
      });

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);
}

/**
 * Determina si un evento de teclado corresponde al atajo Ctrl/Cmd+B para
 * colapsar o expandir el sidebar.
 */
export function isSidebarToggleShortcut(event) {
  return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b';
}

/**
 * Invierte el estado de colapso del sidebar y lo persiste en localStorage.
 * Usado tanto por el botón de toggle como por el atajo de teclado.
 */
export function toggleSidebarCollapsed(prevCollapsed) {
  const next = !prevCollapsed;
  localStorage.setItem('sidebar_collapsed', String(next));
  return next;
}

/**
 * Retorna la inicial (mayúscula) de un texto, usada para generar avatares.
 */
export function getInitial(value) {
  if (!value) return '?';
  const trimmed = String(value).trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

/**
 * Retorna la clase CSS correspondiente al tipo de badge de la opción del menú.
 */
export function getBadgeClass(styles, badgeType) {
  if (!styles || !badgeType) return '';
  
  switch (badgeType) {
    case 'post':
      return styles.badgePost;
    case 'get':
      return styles.badgeGet;
    case 'put':
      return styles.badgePut;
    case 'delete':
      return styles.badgeDelete;
    case 'info':
    default:
      return styles.badgeInfo;
  }
}
