import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import ButtonBase from '@mui/material/ButtonBase';
import styles from './Index.module.css';

import ModalTooltip from '../../../ModalTooltip/ModalTooltip';

export default function PermissionCheckboxItem({ label, checked, onChange, disabled }) {
  return (
    <ButtonBase
      component="div"
      className={`${styles.itemContainer} ${checked ? styles.checked : ''}`}
      onClick={!disabled ? onChange : undefined}
      disabled={disabled}
      focusRipple
    >
        <ModalTooltip  text={label}>
      <Checkbox
        checked={checked}
        disabled={disabled}
        disableRipple
        tabIndex={-1}
      />
      </ModalTooltip>
     
        <span className={styles.label}>{label}</span>

    </ButtonBase>
  );
}
