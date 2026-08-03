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
