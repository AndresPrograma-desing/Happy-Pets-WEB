import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import styles from './CreatedUser.module.css';
import { createUser, updateUserPermissions } from '../../services/api';
import { applyServerErrorsToForm } from '../../utils/apiErrors';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import { getAllPermissionKeys } from '../../components/GenericPanel/Routes';
import usePermissionsCatalog from '../../hooks/usePermissionsCatalog';
import TextField from '../../components/screens/components/Material-UI/Components/TextField/Index';
import Selector from '../../components/screens/components/Material-UI/Components/Selector/Index';
import CountdownBar from '../../components/screens/components/CountdownBar';
import PermissionsStep from '../../components/UserWizard/PermissionsStep';
import WizardActions from '../../components/UserWizard/WizardActions';

const EyeIcon = ({ visible }) => (
  visible ? (
    <img
      src={getIcon('eye')}
      alt="Mostrar contraseña"
      style={{ ...styles.icon, filter: 'invert(0)', color: '#111', width: 18, height: 18 }}
    />
  ) : (
    <img
      src={getIcon('eyeOff')}
      alt="Ocultar contraseña"
      style={{ ...styles.icon, filter: 'invert(0)', color: '#111', width: 18, height: 18 }}
    />
  )
);

const ROLE_OPTIONS = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'admin', label: 'Administrador' },
  { value: 'secretaria', label: 'Secretaria' }
];

function CreatedUser({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [createdUserId, setCreatedUserId] = useState(null);
  const [createdUserRoleLabel, setCreatedUserRoleLabel] = useState('');
  const [availableKeys, setAvailableKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const { byKey: permissionsCatalog } = usePermissionsCatalog();

  const { register, handleSubmit, formState: { errors }, reset, setError, clearErrors, control, watch } = useForm({
    defaultValues: { rol: 'doctor' }
  });

  const watchedValues = watch(['nombre', 'apellido', 'email', 'password']);
  const filledFieldsCount = [
    watchedValues[0]?.trim(),
    watchedValues[1]?.trim(),
    watchedValues[2]?.trim(),
    watchedValues[3]
  ].filter((val) => !!val).length;
  const step1Progress = (filledFieldsCount / 4) * 100;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const resetWizard = () => {
    reset({ rol: 'doctor' });
    setStep(1);
    setMessage(null);
    setShowPassword(false);
    setCreatedUserId(null);
    setCreatedUserRoleLabel('');
    setAvailableKeys([]);
    setSelectedKeys([]);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleBack = () => {
    setMessage(null);
    setStep(1);
  };

  const goToPermissionsStep = async (data) => {
    setMessage(null);
    if (createdUserId) {
      // El usuario ya se creó en un paso anterior (venimos de "Atrás"); no reenviamos el alta.
      setStep(2);
      return;
    }
    setLoadingCreate(true);
    try {
      const res = await createUser({
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        rol: data.rol,
      });
      const newId = res?.id;
      if (!newId) {
        throw new Error('El usuario se creó, pero el servidor no devolvió su id. No se pueden asignar permisos.');
      }
      const keys = getAllPermissionKeys(permissionsCatalog);
      setAvailableKeys(keys);
      setSelectedKeys(keys.map((k) => k.key));
      setCreatedUserId(newId);
      setCreatedUserRoleLabel(ROLE_OPTIONS.find((r) => r.value === data.rol)?.label || data.rol);
      setStep(2);
    } catch (err) {
      const { applied, general } = applyServerErrorsToForm(err, { setError, clearErrors });
      if (applied) {
        if (general?.length) setMessage({ type: 'error', text: general.join('\n') });
      } else {
        setMessage({ type: 'error', text: err.body?.message || err.message || 'Error al crear el usuario' });
      }
    } finally {
      setLoadingCreate(false);
    }
  };

  const toggleKey = (key) => {
    setSelectedKeys((prev) => (
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    ));
  };

  const handleFinish = async () => {
    setMessage(null);
    setLoadingFinish(true);
    try {
      await updateUserPermissions(createdUserId, selectedKeys);
      setMessage({ type: 'success', text: 'Usuario creado con sus permisos' });
      setTimeout(() => handleClose(), 800);
    } catch (err) {
      setMessage({ type: 'error', text: `El usuario fue creado, pero no se pudieron guardar los permisos: ${err.body?.message || err.message}` });
    } finally {
      setLoadingFinish(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {step === 1 && (
        <form id="createUserForm" onSubmit={handleSubmit(goToPermissionsStep)} autoComplete="off">
          <div style={{ marginBottom: '20px' }}>
            <CountdownBar active={isOpen} value={step1Progress} />
          </div>

          <div className={styles.field}>
            <TextField
              label="Nombre"
              placeholder="Nombre"
              {...register('nombre', { required: 'Requerido', minLength: { value: 2, message: 'Mínimo 2' } })}
              error={errors.nombre?.message}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <TextField
              label="Apellido"
              placeholder="Apellido"
              {...register('apellido', { required: 'Requerido', minLength: { value: 2, message: 'Mínimo 2' } })}
              error={errors.apellido?.message}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <TextField
              label="Correo electrónico"
              placeholder="Correo electrónico"
              {...register('email', { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Inválido' } })}
              error={errors.email?.message}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.passwordWrapper} style={{ position: 'relative' }}>
              <TextField
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                placeholder="Contraseña"
                {...register('password', { required: 'Requerida', minLength: { value: 6, message: 'Mínimo 6' } })}
                error={errors.password?.message}
                autoComplete="new-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <EyeIcon visible={showPassword} />
                      </button>
                    )
                  }
                }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <Controller
              name="rol"
              control={control}
              defaultValue="doctor"
              render={({ field }) => (
                <Selector
                  label="Rol"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={ROLE_OPTIONS}
                />
              )}
            />
          </div>

          {message && (
            <div className={`${styles.message} ${message.type === 'error' ? styles.errorMsg : styles.successMsg}`}>
              {message.text}
            </div>
          )}

          <WizardActions
            backLabel="Cancelar"
            onBack={handleClose}
            confirmLabel="Siguiente"
            confirmType="submit"
            formId="createUserForm"
            loading={loadingCreate}
          />
        </form>
      )}

      {step === 2 && (
        <div>
          <PermissionsStep
            roleLabel={createdUserRoleLabel}
            availableKeys={availableKeys}
            selectedKeys={selectedKeys}
            onToggleKey={toggleKey}
            disabled={loadingFinish}
            active={isOpen}
          />

          {message && (
            <div className={`${styles.message} ${message.type === 'error' ? styles.errorMsg : styles.successMsg}`}>
              {message.text}
            </div>
          )}

          <WizardActions
            backLabel="Atrás"
            onBack={handleBack}
            confirmLabel="Crear"
            onConfirm={handleFinish}
            loading={loadingFinish}
          />
        </div>
      )}
    </>
  );
}

export default CreatedUser;
