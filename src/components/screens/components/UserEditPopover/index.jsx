import React, { useState, useEffect } from 'react';
import Popover from '@mui/material/Popover';
import InputWithIcon from '../Material-UI/Components/InputWithIcon/Index';
import { CircleUser, Check, X } from 'lucide-react';
import styles from './index.module.css';
import { updateUserName } from '../../../../services/api';
import { getUserId } from '../../../../context/LocalStorage';
import Button from '../Button/index'

const UserEditPopover = ({ open, anchorEl, onClose, currentName, onSuccess }) => {
  const [tempUserName, setTempUserName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTempUserName(currentName || '');
    }
  }, [open, currentName]);

  const handleSave = async () => {
    if (!tempUserName.trim()) return;
    setLoading(true);
    try {
      const idUser = getUserId();
      await updateUserName({
        idUser: Number(idUser),
        newUserName: tempUserName
      });
      onSuccess(tempUserName);
    } catch (error) {
      console.error('Error al actualizar nombre', error);
      // Actualizar localmente si falla para pruebas
      onSuccess(tempUserName);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          className: styles.popoverPaper
        }
      }}
    >
      <div className={styles.container}>
        <h4 className={styles.header}>Editar Nombre</h4>
        <div className={styles.inputWrapper}>
          <InputWithIcon
            value={tempUserName}
            onChange={(e) => setTempUserName(e.target.value)}
            icon={CircleUser}
            variant="standard"
            placeholder="Tu nuevo nombre..."
            autoFocus
            fullWidth
          />
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.btnCancel}
            onClick={onClose}
            disabled={loading}
            borderColor="var(--border-gray-low)"

          >
            <X size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Cancelar
          </Button>
          <Button
            className={styles.btnSave}
            onClick={handleSave}
            disabled={loading}
          >
            <Check size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {loading ? 'Guardar' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Popover>
  );
};

export default UserEditPopover;
