import React from 'react';
import CountdownBar from '../screens/components/CountdownBar';
import PermissionCheckboxItem from '../screens/components/Checks/Index';
import styles from './UserWizard.module.css';

// Paso de selección de permisos compartido entre el wizard de "Crear usuario" y el de
// "Editar usuario": barra de progreso (seleccionados/total) + lista de checkboxes.
export default function PermissionsStep({
  roleLabel,
  description,
  availableKeys,
  selectedKeys,
  onToggleKey,
  disabled = false,
  active = true,
  noOptionsText = 'Este rol no tiene permisos configurables.'
}) {
  const progress = availableKeys.length > 0 ? (selectedKeys.length / availableKeys.length) * 100 : 0;
  const resolvedDescription = description ?? (
    roleLabel ? <>Selecciona los permisos de <strong>{roleLabel}</strong> para este usuario.</> : null
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <CountdownBar active={active} value={progress} />
      </div>

      {resolvedDescription && (
        <p className={styles.stepDescription}>{resolvedDescription}</p>
      )}

      {availableKeys.length === 0 ? (
        <p className={styles.noOptionsText}>{noOptionsText}</p>
      ) : (
        <div className={styles.permissionsList}>
          {availableKeys.map(({ key, label }) => (
            <PermissionCheckboxItem
              key={key}
              label={label}
              checked={selectedKeys.includes(key)}
              onChange={() => onToggleKey(key)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
