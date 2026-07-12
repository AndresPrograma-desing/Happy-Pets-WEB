import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import styles from './CreatedUser.module.css';
import { createUser } from '../../services/api';
import { applyServerErrorsToForm } from '../../utils/apiErrors';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import DrawPanel from '../../components/screens/components/DrawPanel/index';
import TextField from '../../components/screens/components/Material-UI/Components/TextField/Index';
import Selector from '../../components/screens/components/Material-UI/Components/Selector/Index';
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

function CreatedUser() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset, setError, clearErrors, control } = useForm({
    defaultValues: { rol: 'doctor' }
  });

  useEffect(() => {
    if (open && firstInputRef.current) firstInputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleClose = () => {
    reset({ rol: 'doctor' });
    setMessage(null);
    setShowPassword(false);
    setOpen(false);
  };

  const onSubmit = async (data) => {
    setMessage(null);
    setLoading(true);
    try {
      await createUser({
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        rol: data.rol,
      });
      setMessage({ type: 'success', text: 'Usuario creado' });
      setTimeout(() => handleClose(), 800);
    } catch (err) {
      const { applied, general } = applyServerErrorsToForm(err, { setError, clearErrors });
      if (applied) {
        if (general?.length) setMessage({ type: 'error', text: general.join('\n') });
      } else {
        setMessage({ type: 'error', text: err.body?.message || 'Error al crear' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className={styles.openBtn} onClick={() => { reset(); setMessage(null); setOpen(true); }}>
        + Crear usuario
      </button>

      <DrawPanel
        isOpen={open}
        onClose={handleClose}
        title="Nuevo usuario"
        width="400px"
        showActions={true}
        onConfirm={handleSubmit(onSubmit)}
        confirmText="Crear"
        cancelText="Cancelar"
        loading={loading}
        formId="createUserForm"
      >
        <form id="createUserForm" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
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
                InputProps={{
                  endAdornment: (
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <EyeIcon visible={showPassword} />
                    </button>
                  )
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
                  options={[
                    { value: 'doctor', label: 'Doctor' },
                    { value: 'admin', label: 'Administrador' },
                    { value: 'secretaria', label: 'Secretaria' }
                  ]}
                />
              )}
            />
          </div>

          {message && (
            <div className={`${styles.message} ${message.type === 'error' ? styles.errorMsg : styles.successMsg}`}>
              {message.text}
            </div>
          )}
        </form>
      </DrawPanel>
    </>
  );
}

export default CreatedUser;