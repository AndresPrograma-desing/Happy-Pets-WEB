import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export const DEFAULT_HEADER = {
  title: undefined,
  message: undefined,
  menuTitle: 'Panel',
  menuItems: undefined,
  showDashboardAvatar: false,
  showPagination: false,
  paginationCount: 10,
  paginationPage: 1,
  onPaginationChange: undefined,
  paginationProps: {},
  pageSize: undefined,
  pageSizeOptions: undefined,
  onPageSizeChange: undefined
};

// Permite que cada página, renderizada dentro de <Outlet> de PanelLayout,
// controle el título/mensaje/paginación que muestra GenericPanel sin volver a montarlo.
// Pasar `null`/`false` como config (ej. componentes reutilizados como vista embebida
// dentro de un drawer) hace que no toque el header del layout.
export default function usePanelHeader(config) {
  const { setHeader } = useOutletContext();

  useEffect(() => {
    if (!config) return;
    setHeader({ ...DEFAULT_HEADER, ...config });
  });
}
