import React, { useEffect, useState } from 'react';
import Loading from '../screens/components/Loading/Index';
import PermissionCheckboxItem from '../screens/components/Checks/Index';
import { getUserPermissions, updateUserPermissions } from '../../services/api';
import { getAllPermissionKeysForRole } from '../GenericPanel/Routes';
import styles from './EditPermissionsForm.module.css';
import { EDIT_PERMISSIONS_TEXT } from './constants';

const NOOP_MENU_OPTIONS = {
  setShowNotificationModal: () => {},
  setShowWhatsAppModal: () => {},
  setShowCreateClientModal: () => {}
};

export default function EditPermissionsForm({ 
  formId, 
  userId, 
  role, 
  onSuccess, 
  onError, 
  onSaveStart, 
  onSaveEnd,
  onSelectionChange
}) {
  const [dataLoading, setDataLoading] = useState(true);
  const [availableKeys, setAvailableKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const keys = getAllPermissionKeysForRole((role || '').toLowerCase(), NOOP_MENU_OPTIONS);
        if (!mounted) return;
        setAvailableKeys(keys);

        const res = await getUserPermissions(userId);
        const permissions = res?.permissions ?? res?.data?.permissions ?? null;
        if (!mounted) return;
        
        const initialSelected = permissions ?? keys.map((k) => k.key);
        setSelectedKeys(initialSelected);

        // Notificamos al padre los totales iniciales cargados
        if (onSelectionChange) {
          onSelectionChange({ total: keys, selected: initialSelected });
        }
      } catch (err) {
        console.error('Error cargando permisos del usuario:', err);
        if (onError) onError(EDIT_PERMISSIONS_TEXT.errorLoad);
      } finally {
        if (mounted) setDataLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId, role]);

  const toggleKey = (key) => {
    setSelectedKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      
      // Notificamos al padre en cada cambio de checkbox
      if (onSelectionChange) {
        onSelectionChange({ total: availableKeys, selected: next });
      }
      return next;
    });
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
      {availableKeys.length === 0 ? (
        <p className={styles.noOptionsText}>{EDIT_PERMISSIONS_TEXT.noOptions}</p>
      ) : (
        <div className={styles.permissionsList}>
          {availableKeys.map(({ key, label }) => (
            <PermissionCheckboxItem
              key={key}
              label={label}
              checked={selectedKeys.includes(key)}
              onChange={() => toggleKey(key)}
              disabled={loading}
            />
          ))}
        </div>
      )}
    </form>
  );
}