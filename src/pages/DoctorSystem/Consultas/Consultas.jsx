import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import styles from './Consulta.module.css';
import AgreeProduct from '../../../components/ProductList/AgreeProduct/AgreeProduct';
import AlertModal from '../../../components/AlertModal/AlertModal';

function Consultas() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 1. Extracción de datos de la cita recibida por navegación
  const cita = state?.cita || {};
  
  const defaultCitaId = cita?.id || cita?.ID || state?.citaId || null;
  const defaultDoctorId = cita?.doctor_id || cita?.doctor?.id || state?.doctorId || null;
  const defaultMascotaId = 
    cita?.mascota_id || 
    cita?.Mascotum?.id || 
    cita?.mascota?.id || 
    state?.mascotaId || 
    null;

  const defaultMascotaNombre =
    cita?.Mascotum?.nombre ||
    cita?.mascota?.nombre ||
    cita?.mascota_nombre ||
    state?.mascotaNombre ||
    'Sin nombre';

  const [form, setForm] = useState({
    cita_id: defaultCitaId,
    mascota_id: defaultMascotaId,
    doctor_id: defaultDoctorId,
    fecha_consulta: new Date().toISOString(),
    peso_actual: '',
    temperatura: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    receta: '',
    observaciones: '',
    productos: [],
  });

  const NO_PRODUCT_LABEL = 'no se usaron productos';


  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showBadReqModal, setShowBadReqModal] = useState(false);
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);

  const closeBadReqModal = () => setShowBadReqModal(false);

  // Sincronización para asegurar que los IDs se carguen al entrar
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      cita_id: defaultCitaId,
      mascota_id: defaultMascotaId,
      doctor_id: defaultDoctorId
    }));
  }, [defaultCitaId, defaultMascotaId, defaultDoctorId]);

  // Manejadores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const addProducto = () => {
    setForm((s) => ({
      ...s,
      productos: [
        ...s.productos,
        {
          producto_id: '',
          producto_nombre: '',
          cantidad: 1,
          precio_unitario: 0,
          dosis: '',
          via_administracion: '',
          frecuencia: '',
          duracion: '',
          instrucciones: '',
          aplicado_por: s.doctor_id || '',
        },
      ],
    }));
  };

  const addNoProducto = () => {
    setForm((s) => ({
      ...s,
      productos: [
        ...s.productos,
        {
          producto_id: 0,
          producto_nombre: NO_PRODUCT_LABEL,
          cantidad: 0,
          precio_unitario: '0.00',
          dosis: NO_PRODUCT_LABEL,
          via_administracion: NO_PRODUCT_LABEL,
          frecuencia: NO_PRODUCT_LABEL,
          duracion: NO_PRODUCT_LABEL,
          instrucciones: NO_PRODUCT_LABEL,
          aplicado_por: s.doctor_id || 0,
        },
      ],
    }));
  };

  const setSelectedProduct = (idx, product) => {
    const pId = product?.id || product?._id || product?.ID || '';
    const pNombre = product?.nombre || product?.name || '';
    const pPrecio = Number(product?.precio || 0);

    setForm((s) => {
      const copy = [...s.productos];
      copy[idx] = {
        ...copy[idx],
        producto_id: pId,
        producto_nombre: pNombre,
        precio_unitario: pPrecio,
      };
      return { ...s, productos: copy };
    });
  };

  const updateProducto = (idx, key, value) => {
    setForm((s) => {
      const copy = [...s.productos];
      copy[idx] = { ...copy[idx], [key]: value };
      return { ...s, productos: copy };
    });
  };

  const removeProducto = (idx) => {
    setForm((s) => ({ ...s, productos: s.productos.filter((_, i) => i !== idx) }));
  };

  // Abre el modal de confirmación al intentar enviar
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmSaveModal(true);
  };

  // Envío confirmado por el usuario
  const submitConfirmed = async () => {
    setShowConfirmSaveModal(false);
    setSubmitting(true);
    setError(null);

    try {
      if (!form.mascota_id) {
        setShowBadReqModal(true);
        setError(null);
        setSubmitting(false);
        return;
      }
        // Requerir al menos un producto (puede ser el marcador "no se usaron productos")
        if (!Array.isArray(form.productos) || form.productos.length === 0) {
          setShowBadReqModal(true);
          setError('Debe agregar al menos un producto o seleccionar "No usar productos".');
          setSubmitting(false);
          return;
        }
      const payload = {
        ...form,
        cita_id: Number(form.cita_id),
        mascota_id: Number(form.mascota_id),
        doctor_id: Number(form.doctor_id),
        peso_actual: parseFloat(form.peso_actual) || null,
        temperatura: parseFloat(form.temperatura) || null,
        productos: form.productos.map((p) => {
          // Si es el marcador de "no se usaron productos", enviar campos de relleno
          if (String(p.producto_nombre) === NO_PRODUCT_LABEL) {
            return {
              ...p,
              producto_id: Number(p.producto_id) || 0,
              cantidad: Number(p.cantidad) || 0,
              precio_unitario: String(p.precio_unitario || '0.00'),
              dosis: p.dosis || NO_PRODUCT_LABEL,
              via_administracion: p.via_administracion || NO_PRODUCT_LABEL,
              frecuencia: p.frecuencia || NO_PRODUCT_LABEL,
              duracion: p.duracion || NO_PRODUCT_LABEL,
              instrucciones: p.instrucciones || NO_PRODUCT_LABEL,
              aplicado_por: Number(p.aplicado_por || form.doctor_id) || 0,
            };
          }

          return {
            ...p,
            producto_id: Number(p.producto_id) || null,
            cantidad: Number(p.cantidad) || 1,
            precio_unitario: Number(p.precio_unitario) || 0,
            aplicado_por: Number(p.aplicado_por || form.doctor_id) || null,
          };
        }),
      };

      await api.request('/consultas/create', { method: 'POST', body: payload });
      // Reducir stock de productos usados en la consulta (si corresponde)
      try {
        const decreaseTasks = (payload.productos || [])
          .filter(p => p && Number(p.producto_id) && Number(p.cantidad) > 0 && String(p.producto_nombre) !== NO_PRODUCT_LABEL)
          .map((p) => api.decreaseProductStock(Number(p.producto_id), Number(p.cantidad)));

        if (decreaseTasks.length) {
          const results = await Promise.allSettled(decreaseTasks);
          const rejected = results.filter(r => r.status === 'rejected');
          if (rejected.length) {
            console.warn('Algunos decrementos de stock fallaron:', rejected);
          }
        }
      } catch (e) {
        console.warn('Error al intentar disminuir stock de productos:', e);
      }
      
      // Marcar la cita como completada usando el endpoint /citas/:id/estado
      try {
        if (form.cita_id) await api.updateCitaEstado(Number(form.cita_id), 'completada');
      } catch (e) {
        console.warn('No se pudo actualizar estado de la cita a completada:', e);
      }
      navigate(-1);
    } catch (err) {
      const isBadRequest = err?.response?.status === 400 || /bad request/i.test(err?.message || '');
      if (isBadRequest) {
        // Mostrar modal específico para Bad Request
        setShowBadReqModal(true);
        setError(null);
      } else {
        setError(err?.message || 'Error al crear la consulta');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmSave = () => submitConfirmed();

  return (
    <div className={styles.container}>
      <div className={styles.debugInfo}>
        📌 Cita: {form.cita_id} | Mascota: {form.mascota_id} - {defaultMascotaNombre}
      </div>

      <AlertModal
        open={showBadReqModal}
        title="La consulta requiere todos los campos"
        message="Por favor complete los campos obligatorios antes de finalizar la consulta."
        onClose={closeBadReqModal}
        cancelText="Cerrar"
      />

      <AlertModal
        open={showConfirmSaveModal}
        title="¿Desea guardar la cita?"
        message="Confirme para guardar la consulta en el historial." 
        onClose={() => setShowConfirmSaveModal(false)}
        onConfirm={confirmSave}
        confirmText="Guardar"
        cancelText="Cancelar"
      />

      <h2 className={styles.title}>Nueva Consulta Médica</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorText}>{error}</div>}

        {/* --- Bloque 1: Signos Vitales --- */}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Peso Actual (kg)</label>
            <input 
                className={styles.input} 
                name="peso_actual" 
                type="number" 
                step="0.1"
                value={form.peso_actual} 
                onChange={handleChange} 
                placeholder="0.00"
            />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Temperatura (°C)</label>
            <input 
                className={styles.input} 
                name="temperatura" 
                type="number" 
                step="0.1"
                value={form.temperatura} 
                onChange={handleChange} 
                placeholder="38.5"
            />
          </div>
        </div>

        {/* --- Bloque 2: Evaluación --- */}
        <div className={styles.group}>
          <label className={styles.label}>Síntomas</label>
          <textarea className={styles.textarea} name="sintomas" value={form.sintomas} onChange={handleChange} />
        </div>

        <div className={styles.clinicalGrid}>
          <div className={styles.group}>
            <label className={styles.label}>Diagnóstico</label>
            <textarea className={styles.textarea} name="diagnostico" value={form.diagnostico} onChange={handleChange} />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Tratamiento</label>
            <textarea className={styles.textarea} name="tratamiento" value={form.tratamiento} onChange={handleChange} />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Receta Médica</label>
            <textarea className={styles.textarea} name="receta" value={form.receta} onChange={handleChange} />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Observaciones Adicionales</label>
            <textarea className={styles.textarea} name="observaciones" value={form.observaciones} onChange={handleChange} />
          </div>
        </div>

        {/* --- Bloque 3: Productos y Medicamentos --- */}
        <div className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h3>Productos y Aplicaciones</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className={styles.btnAdd} onClick={addProducto}>
                + Agregar Producto
              </button>
              <button type="button" className={styles.btnSecondary} onClick={addNoProducto}>
                No usar productos
              </button>
            </div>
          </div>

          {form.productos.map((p, idx) => (
            <div key={idx} className={styles.productCard}>
              <div className={styles.productMainGrid}>
                <div className={styles.group}>
                  <label className={styles.label}>Buscar Producto</label>
                  <AgreeProduct
                    value={p.producto_id}
                    initialLabel={p.producto_nombre || ''}
                    onSelect={(prod) => setSelectedProduct(idx, prod)}
                  />
                </div>
                <div className={styles.group}>
                  <label className={styles.label}>Cant.</label>
                  <input 
                    className={styles.input} 
                    type="number" 
                    value={p.cantidad} 
                    onChange={(e) => updateProducto(idx, 'cantidad', e.target.value)} 
                  />
                </div>
                <div className={styles.group}>
                  <label className={styles.label}>Precio</label>
                  <input className={styles.input} value={p.precio_unitario} readOnly disabled />
                </div>
              </div>

              <div className={styles.productDetailsGrid}>
                <input placeholder="Dosis (ej: 2ml)" value={p.dosis} onChange={(e) => updateProducto(idx, 'dosis', e.target.value)} />
                <input placeholder="Vía (ej: Oral)" value={p.via_administracion} onChange={(e) => updateProducto(idx, 'via_administracion', e.target.value)} />
                <input placeholder="Frecuencia" value={p.frecuencia} onChange={(e) => updateProducto(idx, 'frecuencia', e.target.value)} />
                <input placeholder="Duración" value={p.duracion} onChange={(e) => updateProducto(idx, 'duracion', e.target.value)} />
              </div>

              <button type="button" className={styles.btnDelete} onClick={() => removeProducto(idx)}>
                Quitar producto
              </button>
            </div>
          ))}
        </div>

        {/* --- Botones de Acción --- */}
        <div className={styles.rowActions}>
          <button type="submit" className={styles.btnPrimary} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Finalizar Consulta'}
          </button>
          <button type="button" className={styles.btnTertiary} onClick={() => navigate('/citas', { state: { role: 'doctor' } })}>
            Volver a Citas
          </button>
          <button type="button" className={styles.btnSecondary} onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default Consultas;