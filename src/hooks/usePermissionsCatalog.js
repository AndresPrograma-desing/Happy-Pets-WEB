import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPermissionsCatalog } from '../services/api';

let cachedModules = null;
let inFlightPromise = null;

// El catálogo llega agrupado por módulo: { modules: [{ module, label, icon, permissions:[{key,label}] }], roles: [...] }.
// `.roles` no se usa acá (ver useRoles/rolesSlice, que ya cubre esa lista).
const extractModules = (res) => {
  if (Array.isArray(res)) return res;
  return res?.modules ?? [];
};

export default function usePermissionsCatalog() {
  const [modules, setModules] = useState(cachedModules || []);
  const [loading, setLoading] = useState(!cachedModules);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (cachedModules) {
      setModules(cachedModules);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!inFlightPromise) {
        inFlightPromise = getPermissionsCatalog();
      }
      const res = await inFlightPromise;
      const list = extractModules(res);
      cachedModules = list;
      setModules(list);
    } catch (err) {
      inFlightPromise = null;
      setError(err?.message || 'Error al cargar el catálogo de permisos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    cachedModules = null;
    inFlightPromise = null;
    return load();
  }, [load]);

  // Aplana modules[].permissions[] a un mapa por key, adjuntando el label/icono del módulo padre
  // (el catálogo nuevo solo trae ícono a nivel de módulo, no por permiso individual).
  const byKey = useMemo(() => (
    modules.reduce((acc, mod) => {
      (mod?.permissions || []).forEach((perm) => {
        if (!perm?.key) return;
        acc[perm.key] = {
          key: perm.key,
          label: perm.label,
          module: mod.module,
          moduleLabel: mod.label,
          moduleIcon: mod.icon,
        };
      });
      return acc;
    }, {})
  ), [modules]);

  return { modules, byKey, loading, error, refetch };
}
