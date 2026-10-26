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
  AlertCircle,
  Syringe
} from 'lucide-react';
import ModalTooltip from '../../../components/ModalTooltip/ModalTooltip';
import { FormCard, FormInput, FormTextArea } from '../../../components/screens/components/FormControls';
import Button from '../../../components/screens/components/Button';
import MultilinePlaceholder from '../../../components/screens/components/Material-UI/Components/MultilinePlaceholder/index';
import Input from '../../../components/screens/components/Input/Index';
import Selector from '../../../components/screens/components/Material-UI/Components/Selector/Index';
import TextField from '../../../components/screens/components/Material-UI/Components/TextField/Index';

function Consultas({ isDrawer = false, cita: propCita, onSuccess, onCancel }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const cita = propCita || state?.cita || {};
  const defaultCitaId = cita?.id || cita?.ID || state?.citaId || null;
  const defaultDoctorId = cita?.doctor_id || cita?.doctor?.id || state?.doctorId || null;
  const defaultMascotaId = cita?.mascota_id || cita?.Mascotum?.id || cita?.mascota?.id || state?.mascotaId || null;
  const defaultMascotaNombre = cita?.Mascotum?.nombre || cita?.mascota?.nombre || state?.mascotaNombre || 'Paciente';

  const defaultServicioPrecio = cita?.servicio_precio ?? cita?.ServicioPrecio ?? '';

  const [form, setForm] = useState({
    cita_id: defaultCitaId,
    mascota_id: defaultMascotaId,
    doctor_id: defaultDoctorId,
    consulta_price: defaultServicioPrecio !== '' ? String(defaultServicioPrecio) : '',
    peso_actual: '',
    temperatura: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    receta: '',
    observaciones: '',
    productos: [],
    vacunas: [],
  });

  const NO_PRODUCT_LABEL = 'no se usaron productos';
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showBadReqModal, setShowBadReqModal] = useState(false);
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingVaccines(true);
    api.getVaccines({ active: true, pageSize: 100 })
      .then((res) => {
        if (!active) return;
        setVaccines(Array.isArray(res) ? res : (res?.items || []));
      })
      .catch((err) => console.error('Error cargando vacunas:', err))
      .finally(() => { if (active) setLoadingVaccines(false); });
    return () => { active = false; };
  }, []);

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

  const addVacuna = () => {
    setForm((s) => ({
      ...s,
      vacunas: [...s.vacunas, {
        vaccine_id: '',
        vaccine_batch_id: '',
        application_date: new Date().toISOString().slice(0, 10),
        weight_at_application: '',
        dose: '',
        next_dose_date_override: '',
        clinical_observations: '',
        _batches: [],
        _loadingBatches: false,
      }],
    }));
  };

  const updateVacuna = (idx, key, value) => {
    setForm((s) => {
      const copy = [...s.vacunas];
      copy[idx] = { ...copy[idx], [key]: value };
      return { ...s, vacunas: copy };
    });
  };

  const removeVacuna = (idx) => {
    setForm((s) => ({ ...s, vacunas: s.vacunas.filter((_, i) => i !== idx) }));
  };

  const handleVacunaVaccineChange = async (idx, vaccineId) => {
    setForm((s) => {
      const copy = [...s.vacunas];
      copy[idx] = { ...copy[idx], vaccine_id: vaccineId, vaccine_batch_id: '', _batches: [] };
      return { ...s, vacunas: copy };
    });
    if (!vaccineId) return;
    updateVacuna(idx, '_loadingBatches', true);
    try {
      const res = await api.getVaccineBatches(vaccineId, { active: true, pageSize: 100 });
      const list = Array.isArray(res) ? res : (res?.items || []);
      updateVacuna(idx, '_batches', list.filter((b) => !b.is_expired));
    } catch (err) {
      console.error('Error cargando lotes de vacuna:', err);
    } finally {
      updateVacuna(idx, '_loadingBatches', false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.mascota_id || !form.sintomas.trim() || !form.diagnostico.trim()) {
      setShowBadReqModal(true);
      return;
    }
    setShowConfirmSaveModal(true);
  };

  const submitConfirmed = async () => {
    setShowConfirmSaveModal(false);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        peso_actual: parseFloat(form.peso_actual) || null,
        temperatura: parseFloat(form.temperatura) || null,
        consulta_price: parseFloat(form.consulta_price) || 0,
        productos: form.productos.map(p => ({
          ...p,
          producto_id: Number(p.producto_id),
          cantidad: Number(p.cantidad)
        })),
        vacunas: form.vacunas
          .filter(v => v.vaccine_id && v.vaccine_batch_id)
          .map(v => ({
            vaccine_id: Number(v.vaccine_id),
            vaccine_batch_id: Number(v.vaccine_batch_id),
            application_date: v.application_date,
            weight_at_application: v.weight_at_application ? Number(v.weight_at_application) : null,
            dose: v.dose || '',
            next_dose_date_override: v.next_dose_date_override || null,
            clinical_observations: v.clinical_observations || '',
          }))
      };

      await api.createConsulta(payload);
      
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
          <Button 
            variant={Button.VARIANTS.BACK} 
            onClick={() => (onCancel ? onCancel() : navigate(-1))}
          >
            Volver
          </Button>
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
            <FormInput
              label={`Precio de Consulta (USD)${cita?.servicio_nombre || cita?.ServicioNombre ? ` — ${cita.servicio_nombre || cita.ServicioNombre}` : ''}`}
              name="consulta_price"
              type="number"
              step="0.01"
              value={form.consulta_price}
              onChange={handleChange}
              placeholder="0.00"
            />
          </FormCard>

          <FormCard icon={ClipboardList} title="Evaluación Médica">
            <FormTextArea
              label="Síntomas"
              name="sintomas"
              value={form.sintomas}
              onChange={handleChange}
              placeholder="Describa los síntomas reportados..."
              required
            />
            <FormTextArea
              label="Diagnóstico"
              name="diagnostico"
              value={form.diagnostico}
              onChange={handleChange}
              placeholder="Resultado de la evaluación..."
              required
            />
            <FormTextArea
              label="Tratamiento"
              name="tratamiento"
              value={form.tratamiento}
              onChange={handleChange}
              placeholder="Plan de acción..."
            />
            <FormTextArea
              label="Recipe"
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
              <ModalTooltip text="Agregar un producto o medicamento a esta consulta" placement="top">
                <Button type="button" variant="ghost" circle onClick={addProducto} icon={PlusCircle} color="primary" />
              </ModalTooltip>
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
                      <Input
                        className={styles.qtyInput}
                        type="number"
                        value={p.cantidad}
                        label="Cantidad"
                        onChange={(e) => updateProducto(idx, 'cantidad', e.target.value)}
                      />
                    </div>

                    <Button 
                    type="button" 
                    variant="ghost" 
                    color="error" 
                    circle 
                    onClick={() => removeProducto(idx)} 
                    icon={Trash2} 
                    title="Quitar" 
                    />
                  </div>

                  {p.producto_nombre !== NO_PRODUCT_LABEL && (
                    <div className={styles.productDetailsGrid}>
                      <div className={styles.group}>
                        <Input 
                          className={styles.subInput}
                          placeholder="Dosis (ej: 2ml)" 
                          value={p.dosis} 
                          label="Dosis (ej: 2ml)" 
                          onChange={(e) => updateProducto(idx, 'dosis', e.target.value)} 
                        />
                      </div>
                      <div className={styles.group}>
                        <Input 
                          className={styles.subInput}
                          placeholder="Vía (ej: Oral, IM)" 
                          value={p.via_administracion} 
                          label="Vía (ej: Oral, IM)" 
                          onChange={(e) => updateProducto(idx, 'via_administracion', e.target.value)} 
                        />
                      </div>
                      <div className={styles.group}>
                        <Input 
                          className={styles.subInput}
                          placeholder="Frecuencia (ej: c/8h)" 
                          value={p.frecuencia} 
                          label="Frecuencia (ej: c/8h)" 
                          onChange={(e) => updateProducto(idx, 'frecuencia', e.target.value)} 
                        />
                      </div>
                      <div className={styles.group}>
                        <Input 
                          className={styles.subInput}
                          placeholder="Duración (ej: 5 días)" 
                          value={p.duracion} 
                          label="Duración (ej: 5 días)" 
                          onChange={(e) => updateProducto(idx, 'duracion', e.target.value)} 
                        />
                      </div>
                      <div className={styles.fullWidth}>
                        <MultilinePlaceholder 
                          label="Instrucciones adicionales para el dueño..."
                          value={p.instrucciones} 
                          onChange={(e) => updateProducto(idx, 'instrucciones', e.target.value)} 
                          rows={2}
                          size="small"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FormCard>

          <FormCard
            icon={Syringe}
            title="Vacunas Aplicadas"
            headerActions={
              <ModalTooltip text="Registrar la aplicación de una vacuna en esta consulta" placement="top">
                <Button type="button" variant="ghost" circle onClick={addVacuna} icon={PlusCircle} color="primary" />
              </ModalTooltip>
            }
          >
            <div className={styles.productsList}>
              {form.vacunas.length === 0 && (
                <p className={styles.emptyMsg}>No hay vacunas registradas en esta consulta.</p>
              )}
              {form.vacunas.map((v, idx) => (
                <div key={idx} className={styles.productCard}>
                  <div className={styles.productMainRow}>
                    <div className={styles.flexGrow}>
                      <label className={styles.miniLabel}>Vacuna</label>
                      <Selector
                        placeholder="Selecciona una vacuna"
                        value={v.vaccine_id}
                        onChange={(e) => handleVacunaVaccineChange(idx, e.target.value)}
                        loading={loadingVaccines}
                        options={vaccines.map((vac) => ({ value: String(vac.id), label: vac.name }))}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      color="error"
                      circle
                      onClick={() => removeVacuna(idx)}
                      icon={Trash2}
                      title="Quitar"
                    />
                  </div>

                  <div className={styles.productDetailsGrid}>
                    <div className={styles.group}>
                      <label className={styles.miniLabel}>Lote</label>
                      <Selector
                        placeholder={v.vaccine_id ? 'Selecciona un lote' : 'Selecciona primero una vacuna'}
                        value={v.vaccine_batch_id}
                        onChange={(e) => updateVacuna(idx, 'vaccine_batch_id', e.target.value)}
                        loading={v._loadingBatches}
                        options={(v._batches || []).map((b) => ({ value: String(b.id), label: `${b.batch_number} — ${b.laboratory}` }))}
                      />
                    </div>
                    <div className={styles.group}>
                      <TextField
                        label="Fecha de Aplicación"
                        type="date"
                        value={v.application_date}
                        onChange={(e) => updateVacuna(idx, 'application_date', e.target.value)}
                        maxDate={new Date()}
                      />
                    </div>
                    <div className={styles.group}>
                      <TextField
                        label="Peso al Aplicar (kg)"
                        type="number"
                        inputProps={{ step: '0.01' }}
                        value={v.weight_at_application}
                        onChange={(e) => updateVacuna(idx, 'weight_at_application', e.target.value)}
                      />
                    </div>
                    <div className={styles.group}>
                      <Input
                        className={styles.subInput}
                        placeholder="Dosis"
                        value={v.dose}
                        label="Dosis"
                        onChange={(e) => updateVacuna(idx, 'dose', e.target.value)}
                      />
                    </div>
                    <div className={styles.group}>
                      <TextField
                        label="Próxima Dosis (Opcional)"
                        type="date"
                        value={v.next_dose_date_override}
                        onChange={(e) => updateVacuna(idx, 'next_dose_date_override', e.target.value)}
                        minDate={v.application_date}
                      />
                    </div>
                    <div className={styles.fullWidth}>
                      <MultilinePlaceholder
                        label="Observaciones clínicas sobre la aplicación..."
                        value={v.clinical_observations}
                        onChange={(e) => updateVacuna(idx, 'clinical_observations', e.target.value)}
                        rows={2}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FormCard>

          <div className={styles.actionCard}>
            <Button
              type="submit"
              disabled={submitting}
              icon={Save}
              fullWidth
              size="large"
            >
              Guardar Consulta
            </Button>
          </div>
        </div>
      </form>

      <AlertModal open={showBadReqModal} 
        title="Atención" 
        message="Debe completar los datos obligatorios de la consulta."
        onClose={() => setShowBadReqModal(false)}
         />
      <AlertModal 
        open={showConfirmSaveModal} 
        title="Confirmar" 
        message="¿Desea cerrar esta consulta y actualizar el historial?" 
        onConfirm={submitConfirmed} 
        onClose={() => setShowConfirmSaveModal(false)} 
        />
    </div>
  );
}

export default Consultas;