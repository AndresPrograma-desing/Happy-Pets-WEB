/* Main container with fingerprint bottom */
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styles from './CreatedUser.module.css';
import { createUser } from '../../services/api';
import { applyServerErrorsToForm } from '../../utils/apiErrors';

function CreatedUser() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const overlayRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset, setError, clearErrors } = useForm();

  const onSubmit = async (data) => {
    setMessage(null);
    setLoading(true);
    try {
      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: data.password,
        rol: data.rol,
      };
      await createUser(payload);
      setMessage('Usuario creado correctamente');
      reset();
      setTimeout(() => setOpen(false), 800);
    } catch (err) {
      // Intentamos mapear errores por campo al formulario
      const { applied, general } = applyServerErrorsToForm(err, { setError, clearErrors });
      if (applied) {
        if (general && general.length) setMessage(general.join('\n'));
      } else {
        const serverMsg = err.body?.message || err.message || '';
        const isForbidden = err.status === 403 || /forbidden/i.test(serverMsg);
        setMessage(isForbidden ? 'Rol inválido para el usuario' : (serverMsg || 'Error al crear usuario'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) {
        reset({ rol: 'doctor' });
        setMessage(null);
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, reset]);

  // Close when clicking on overlay background
  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      reset({ rol: 'doctor' });
      setMessage(null);
      setOpen(false);
    }
  };

  return (
    <div>
      <button
        className={styles.openBtn}
        onClick={() => {
          reset({ rol: 'doctor' });
          setMessage(null);
          setOpen(true);
        }}
      >Crear usuario</button>

      {open && (
        <div ref={overlayRef} className={styles.overlay} role="dialog" aria-modal="true" onMouseDown={onOverlayClick}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h3>Nuevo usuario</h3>
              <button
                className={styles.close}
                onClick={() => {
                  reset({ rol: 'doctor' });
                  setMessage(null);
                  setOpen(false);
                }}
                aria-label="Cerrar"
              >×</button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <label>Nombre</label>
              <input {...register('nombre', { required: 'Requerido', placeholder: 'Nombre' })} />
              {errors.nombre && <p className={styles.error}>{errors.nombre.message}</p>}

              <label>Apellido</label>
              <input {...register('apellido', { required: 'Requerido', placeholder: 'Apellido' })} />
              {errors.apellido && <p className={styles.error}>{errors.apellido.message}</p>}

              <label>Correo</label>
              <input {...register('email', { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' }, placeholder: 'Correo' })} />
              {errors.email && <p className={styles.error}>{errors.email.message}</p>}

              <label>Contraseña</label>
              <input type="password" {...register('password', { required: 'Requerido', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} placeholder="Contraseña" />
              {errors.password && <p className={styles.error}>{errors.password.message}</p>}

              <label>Rol</label>
              <select {...register('rol', { required: true })} defaultValue="doctor">
                <option value="doctor">Doctor</option>
                <option value="admin">Administrador</option>
                <option value="secretaria">Secretaria</option>
              </select>

              {message && <p className={styles.msg}>{message}</p>}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => {
                    reset({ rol: 'doctor' });
                    setMessage(null);
                    setOpen(false);
                  }}
                >Cancelar</button>
                <button type="submit" className={styles.primary} disabled={loading}>{loading ? 'Creando...' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatedUser;
