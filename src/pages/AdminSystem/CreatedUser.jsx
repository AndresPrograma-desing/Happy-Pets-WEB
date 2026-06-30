import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styles from './CreatedUser.module.css';
import { createUser } from '../../services/api';
import { applyServerErrorsToForm } from '../../utils/apiErrors';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
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

  const { register, handleSubmit, formState: { errors }, reset, setError, clearErrors } = useForm({
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

      {open && (
        <div className={styles.overlay} ref={overlayRef} onClick={(e) => e.target === overlayRef.current && handleClose()}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h3>Nuevo usuario
                <img src={getIcon('user')} alt="" 
                style={{ width: 18, height: 18, marginLeft: 8 }}/>
              </h3>
              <button onClick={handleClose} className={styles.closeBtn}>×</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.field}>
                <input
                  placeholder="Nombre"
                  {...register('nombre', { required: 'Requerido', minLength: { value: 2, message: 'Mínimo 2' } })}
                  ref={(e) => { register('nombre').ref(e); firstInputRef.current = e; }}
                />
                {errors.nombre && <span className={styles.error}>{errors.nombre.message}</span>}
              </div>

              <div className={styles.field}>
                <input placeholder="Apellido" {...register('apellido', { required: 'Requerido', minLength: { value: 2, message: 'Mínimo 2' } })} />
                {errors.apellido && <span className={styles.error}>{errors.apellido.message}</span>}
              </div>

              <div className={styles.field}>
                <input placeholder="Correo electrónico" {...register('email', { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Inválido' } })} />
                {errors.email && <span className={styles.error}>{errors.email.message}</span>}
              </div>

              <div className={styles.field}>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    {...register('password', { required: 'Requerida', minLength: { value: 6, message: 'Mínimo 6' } })}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
                {errors.password && <span className={styles.error}>{errors.password.message}</span>}
              </div>

              <div className={styles.field}>
                <select {...register('rol')}>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Administrador</option>
                  <option value="secretaria">Secretaria</option>
                </select>
              </div>

              {message && (
                <div className={`${styles.message} ${message.type === 'error' ? styles.errorMsg : styles.successMsg}`}>
                  {message.text}
                </div>
              )}

              <div className={styles.actions}>
                <button type="button" onClick={handleClose} disabled={loading}>Cancelar</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatedUser;