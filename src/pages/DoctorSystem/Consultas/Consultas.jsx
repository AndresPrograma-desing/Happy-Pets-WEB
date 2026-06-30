import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import styles from './Consulta.module.css';
import AgreeProduct from '../../../components/ProductList/AgreeProduct/AgreeProduct';
import AlertModal from '../../../components/AlertModal/AlertModal';
import { 
  Stethoscope, 
  Thermometer, 
  Weight, 
  ClipboardList, 
  Pill, 
  Save, 
  ArrowLeft,
  Trash2,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import ModalTooltip from '../../../components/ModalTooltip/ModalTooltip';
import { FormCard, FormInput, FormTextArea } from '../../../components/screens/components/FormControls';

function Consultas({ isDrawer = false, cita: propCita, onSuccess, onCancel }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const cita = propCita || state?.cita || {};
  const defaultCitaId = cita?.id || cita?.ID || state?.citaId || null;
  const defaultDoctorId = cita?.doctor_id || cita?.doctor?.id || state?.doctorId || null;
  const defaultMascotaId = cita?.mascota_id || cita?.Mascotum?.id || cita?.mascota?.id || state?.mascotaId || null;
  const defaultMascotaNombre = cita?.Mascotum?.nombre || cita?.mascota?.nombre || state?.mascotaNombre || 'Paciente';

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

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      cita_id: defaultCitaId,
      mascota_id: defaultMascotaId,
      doctor_id: defaultDoctorId
    }));
  }, [defaultCitaId, defaultMascotaId, defaultDoctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const addProducto = () => {
    setForm((s) => ({
      ...s,
      productos: [...s.productos, {
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
      }],
    }));
  };

  const addNoProducto = () => {
    setForm((s) => ({
      ...s,
      productos: [{
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
      }],
    }));
  };

  const setSelectedProduct = (idx, product) => {
    setForm((s) => {
      const copy = [...s.productos];
      copy[idx] = {
        ...copy[idx],
        producto_id: product?.id || '',
        producto_nombre: product?.nombre || '',
        precio_unitario: Number(product?.precio || 0),
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmSaveModal(true);
  };

  const submitConfirmed = async () => {
    setShowConfirmSaveModal(false);
    setSubmitting(true);
    try {
      if (!form.mascota_id || form.productos.length === 0) {
        setShowBadReqModal(true);
        return;
      }
      const payload = {
        ...form,
        peso_actual: parseFloat(form.peso_actual) || null,
        temperatura: parseFloat(form.temperatura) || null,
        productos: form.productos.map(p => ({
          ...p,
          producto_id: Number(p.producto_id),
          cantidad: Number(p.cantidad)
        }))
      };

      await api.request('/consultas/create', { method: 'POST', body: payload });
      
      if (form.cita_id) await api.updateCitaEstado(Number(form.cita_id), 'completada');
      
      if (onSuccess) onSuccess();
      else navigate('/citas');
    } catch (err) {
      setError(err?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={isDrawer ? styles.drawerWrapper : styles.pageWrapper}>
      {!isDrawer && (
        <header className={styles.mainHeader}>
          <div className={styles.headerTitle}>
            <div className={styles.iconCircle}><Stethoscope size={24} /></div>
            <div>
              <h1>Consulta Clinical</h1>
              <p>Paciente: <strong>{defaultMascotaNombre}</strong> • ID Cita: #{form.cita_id}</p>
            </div>
          </div>
          <button type="button" onClick={() => (onCancel ? onCancel() : navigate(-1))} className={styles.btnBack}>
            <ArrowLeft size={18} /> Volver
          </button>
        </header>
      )}

      <form onSubmit={handleSubmit} className={isDrawer ? styles.drawerGrid : styles.mainGrid}>
        <div className={styles.columnContainer}>
          <FormCard icon={Thermometer} title="Signos Vitales">
            <div className={styles.vitalSignsRow}>
              <FormInput
                label="Peso (kg)"
                icon={Weight}
                name="peso_actual"
                type="number"
                step="0.1"
                value={form.peso_actual}
                onChange={handleChange}
                placeholder="0.0"
              />
              <FormInput
                label="Temperatura (°C)"
                icon={Thermometer}
                name="temperatura"
                type="number"
                step="0.1"
                value={form.temperatura}
                onChange={handleChange}
                placeholder="38.0"
              />
            </div>
          </FormCard>

          <FormCard icon={ClipboardList} title="Evaluación Médica">
            <FormTextArea
              label="Síntomas"
              name="sintomas"
              value={form.sintomas}
              onChange={handleChange}
              placeholder="Describa los síntomas reportados..."
            />
            <FormTextArea
              label="Diagnóstico"
              name="diagnostico"
              value={form.diagnostico}
              onChange={handleChange}
              placeholder="Resultado de la evaluación..."
            />
            <FormTextArea
              label="Tratamiento"
              name="tratamiento"
              value={form.tratamiento}
              onChange={handleChange}
              placeholder="Plan de acción..."
            />
            <FormTextArea
              label="Receta"
              name="receta"
              value={form.receta}
              onChange={handleChange}
              placeholder="Medicamentos para casa..."
            />
          </FormCard>
        </div>

        <div className={styles.columnContainer}>
          <FormCard 
            icon={Pill} 
            title="Insumos Aplicados"
            headerActions={
              <>
                <ModalTooltip text="Agregar un producto o medicamento a esta consulta" placement="top">
                  <button type="button" onClick={addProducto} className={styles.iconBtn}><PlusCircle size={20} /></button>
                </ModalTooltip>
                <ModalTooltip text="Indicar que no se usaron productos o medicamentos en esta consulta" placement="top">
                  <button type="button" onClick={addNoProducto} className={styles.textBtn}>No usar</button>
                </ModalTooltip>
              </>
            }
          >
            <div className={styles.productsList}>
              {form.productos.length === 0 && (
                <p className={styles.emptyMsg}>No hay productos o insumos registrados en esta consulta.</p>
              )}
              {form.productos.map((p, idx) => (
                <div key={idx} className={styles.productCard}>
                  <div className={styles.productMainRow}>
                    <div className={styles.flexGrow}>
                      <label className={styles.miniLabel}>Producto / Insumo</label>
                      <AgreeProduct
                        value={p.producto_id}
                        initialLabel={p.producto_nombre}
                        placeholder="Buscar producto..."
                        onSelect={(prod) => setSelectedProduct(idx, prod)}
                      />
                    </div>

                    <div className={styles.qtyContainer}>
                      <label className={styles.miniLabel}>Cant.</label>
                      <input
                        className={styles.qtyInput}
                        type="number"
                        min="1"
                        value={p.cantidad}
                        onChange={(e) => updateProducto(idx, 'cantidad', e.target.value)}
                      />
                    </div>

                    <button type="button" onClick={() => removeProducto(idx)} className={styles.btnDelete} title="Quitar">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {p.producto_nombre !== NO_PRODUCT_LABEL && (
                    <div className={styles.productDetailsGrid}>
                      <div className={styles.group}>
                        <input 
                          className={styles.subInput}
                          placeholder="Dosis (ej: 2ml)" 
                          value={p.dosis} 
                          onChange={(e) => updateProducto(idx, 'dosis', e.target.value)} 
                        />
                      </div>
                      <div className={styles.group}>
                        <input 
                          className={styles.subInput}
                          placeholder="Vía (ej: Oral, IM)" 
                          value={p.via_administracion} 
                          onChange={(e) => updateProducto(idx, 'via_administracion', e.target.value)} 
                        />
                      </div>
                      <div className={styles.group}>
                        <input 
                          className={styles.subInput}
                          placeholder="Frecuencia (ej: c/8h)" 
                          value={p.frecuencia} 
                          onChange={(e) => updateProducto(idx, 'frecuencia', e.target.value)} 
                        />
                      </div>
                      <div className={styles.group}>
                        <input 
                          className={styles.subInput}
                          placeholder="Duración (ej: 5 días)" 
                          value={p.duracion} 
                          onChange={(e) => updateProducto(idx, 'duracion', e.target.value)} 
                        />
                      </div>
                      <div className={styles.fullWidth}>
                        <textarea 
                          className={styles.subInput}
                          placeholder="Instrucciones adicionales para el dueño..." 
                          value={p.instrucciones} 
                          onChange={(e) => updateProducto(idx, 'instrucciones', e.target.value)} 
                          rows="1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FormCard>

          <div className={styles.actionCard}>
            {error && <div className={styles.errorBox}><AlertCircle size={16} /> {error}</div>}
            <button type="submit" disabled={submitting} className={styles.btnFinish}>
              <Save size={20} /> {submitting ? 'Guardando...' : 'Finalizar Consulta'}
            </button>
          </div>
        </div>
      </form>

      <AlertModal open={showBadReqModal} title="Atención" message="Debe completar los datos obligatorios y productos." onClose={() => setShowBadReqModal(false)} />
      <AlertModal open={showConfirmSaveModal} title="Confirmar" message="¿Desea cerrar esta consulta y actualizar el historial?" onConfirm={submitConfirmed} onClose={() => setShowConfirmSaveModal(false)} />
    </div>
  );
}

export default Consultas;