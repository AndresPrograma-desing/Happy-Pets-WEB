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
  const [availableKeys, setAvailableKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const { byKey: permissionsCatalog } = usePermissionsCatalog();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const keys = getAllPermissionKeys(permissionsCatalog);
        if (!mounted) return;
        setAvailableKeys(keys);

        const res = await getUserPermissions(userId);
        const permissions = res?.permissions ?? res?.data?.permissions ?? null;
        if (!mounted) return;
        
        const initialSelected = permissions ?? keys.map((k) => k.key);
        setSelectedKeys(initialSelected);
      } catch (err) {
        console.error('Error cargando permisos del usuario:', err);
        if (onError) onError(EDIT_PERMISSIONS_TEXT.errorLoad);
      } finally {
        if (mounted) setDataLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId, permissionsCatalog]);

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

  if (dataLoading) {
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