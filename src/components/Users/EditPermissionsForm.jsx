import React, { useEffect, useState } from 'react';
import Loading from '../screens/components/Loading/Index';
import PermissionsStep from '../UserWizard/PermissionsStep';
import { getUserPermissions, updateUserPermissions } from '../../services/api';
import { getAllPermissionKeys } from '../GenericPanel/Routes';
import usePermissionsCatalog from '../../hooks/usePermissionsCatalog';
import styles from './EditPermissionsForm.module.css';
import { EDIT_PERMISSIONS_TEXT } from './constants';

export default function EditPermissionsForm({
  formId,
  userId,
  onSuccess,
  onError,
  onSaveStart,
  onSaveEnd
}) {
  const [dataLoading, setDataLoading] = useState(true);
  // null = todavía no se cargó nada del servidor para este usuario (distinto de "cargó y no
  // tiene permisos", que es []). Mientras sea null no se renderiza el checklist.
  const [selectedKeys, setSelectedKeys] = useState(null);
  const [loading, setLoading] = useState(false);
  const { byKey: permissionsCatalog } = usePermissionsCatalog();
  const availableKeys = getAllPermissionKeys(permissionsCatalog);

  // Carga los permisos actuales del usuario UNA sola vez por userId. No depende del catálogo:
  // si dependiera de `permissionsCatalog` (objeto recalculado cuando el catálogo termina de
  // cargar), este efecto se repetiría y volvería a pisar `selectedKeys` con lo guardado en el
  // servidor, descartando cualquier tilde que el usuario ya hubiera hecho en el checklist.
  useEffect(() => {
    let mounted = true;
    setDataLoading(true);
    setSelectedKeys(null);
    (async () => {
      try {
        const res = await getUserPermissions(userId);
        const permissions = res?.permissions ?? res?.data?.permissions ?? null;
        if (!mounted) return;

        setSelectedKeys(permissions);
      } catch (err) {
        console.error('Error cargando permisos del usuario:', err);
        if (onError) onError(EDIT_PERMISSIONS_TEXT.errorLoad);
      } finally {
        if (mounted) setDataLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  // Usuario sin registro de permisos todavía (permissions == null del backend): por defecto
  // se le muestra/asigna todo el catálogo, una vez que el catálogo ya cargó.
  useEffect(() => {
    if (!dataLoading && selectedKeys === null && availableKeys.length > 0) {
      setSelectedKeys(availableKeys.map((k) => k.key));
    }
  }, [dataLoading, selectedKeys, availableKeys]);

  const toggleKey = (key) => {
    setSelectedKeys((prev) => (
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    if (onSaveStart) onSaveStart();
    try {
      await updateUserPermissions(userId, selectedKeys);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error al guardar los permisos:', err);
      if (onError) onError(err?.message || EDIT_PERMISSIONS_TEXT.errorSave);
    } finally {
      setLoading(false);
      if (onSaveEnd) onSaveEnd();
    }
  };

  if (dataLoading || selectedKeys === null) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" text={EDIT_PERMISSIONS_TEXT.loading} />
      </div>
    );
  }

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate>
      <PermissionsStep
        description={EDIT_PERMISSIONS_TEXT.description}
        noOptionsText={EDIT_PERMISSIONS_TEXT.noOptions}
        availableKeys={availableKeys}
        selectedKeys={selectedKeys}
        onToggleKey={toggleKey}
        disabled={loading}
      />
    </form>
  );
}