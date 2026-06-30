import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import AlertModal from '../../../components/AlertModal/AlertModal';
import { createCita, searchClients, getUsers, getSecretarias } from '../../../services/api';
import styles from './CreatedCita.module.css';
import { Calendar, ArrowLeft } from 'lucide-react';
import SelectModal from '../../../components/ClientSelect/SelectModal';
import ModalTooltip from '../../../components/ModalTooltip/ModalTooltip';
import CustomDatePicker from '../../../components/UI/CalendarComponent/CustomDatePicker';
import CustomTimePicker from '../../../components/UI/HoursComponent/CustomTimePicker';
import CustomSelect from '../../../components/UI/DesplegableSelector/CustomSelect';
import { normalizeUserMascotaResults } from './utils';
import GenericPanel from '../../../components/GenericPanel/GenericPanel';

export default function CreatedCita() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    
    const roleFromState = String(location.state?.role || '').toLowerCase();
    const roleFromQuery = String(searchParams.get('role') || '').toLowerCase();
    const activeRole = roleFromState || roleFromQuery || 'doctor';
    const isSecretariaFlow = activeRole.includes('secret');
    
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [doctores, setDoctores] = useState([]);
    const [query, setQuery] = useState('');
    const [selectedCliente, setSelectedCliente] = useState(null);

    const [form, setForm] = useState({
        mascota_id: '',
        doctor_id: '',
        secretaria_id: '',
        fecha_cita: '',
        hora_cita: '',
        motivo: '',
        tipo_cita: 'consulta general',
        estado: 'programada',
        notas: '',
        metodo_pago: 'efectivo',
    });

    const [submitting, setSubmitting] = useState(false);
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [error, setError] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [doctorName, setDoctorName] = useState('');
    const [secretariaName, setSecretariaName] = useState('');
    const [mascotaDisplayName, setMascotaDisplayName] = useState('');

    useEffect(() => {
    if (!showSelectModal) return;
    
    const name = query.trim();
    if (name.length < 2) {
        setClientes([]);
        return;
    }
    
    let cancelled = false;
    
    const t = setTimeout(async () => {
        try {
            setLookupLoading(true);
            const res = await searchClients(name); 
            
            if (cancelled) return;
            
            setClientes(normalizeUserMascotaResults(res));
        } catch (err) {
            if (!cancelled) setError(err?.message || 'No se pudieron cargar usuarios por nombre');
        } finally {
            if (!cancelled) setLookupLoading(false);
        }
    }, 250);
    
    return () => {
        cancelled = true;
        clearTimeout(t);
    };
}, [query, showSelectModal]);

    useEffect(() => {
        let cancelled = false;
        const loadNames = async () => {
            try {
                const data = await getUsers();
                const list = Array.isArray(data) ? data : data?.data || data?.items || data?.rows || [];
                const users = list.map((u) => {
                    const id = u?.id ?? u?._id ?? u?.ID ?? u?.user_id;
                    const nombre = u?.nombre ?? u?.name ?? '';
                    const apellido = u?.apellido ?? u?.last_name ?? '';
                    const rol = String(u?.rol ?? u?.role ?? u?.tipo_rol ?? '').toLowerCase();
                    return { id, fullName: `${nombre} ${apellido}`.trim() || String(nombre || ''), rol };
                });

                if (cancelled) return;

                const doctorsList = users.filter((u) => u.rol.includes('doctor'));
                setDoctores(doctorsList);
                if (isSecretariaFlow && !form.doctor_id && doctorsList.length > 0) {
                    setForm((prev) => ({ ...prev, doctor_id: String(doctorsList[0].id || '') }));
                }

                const doctor = users.find((u) => String(u.id) === String(form.doctor_id));
                const secretaria = users.find((u) => String(u.id) === String(form.secretaria_id));

                if (doctor?.fullName) setDoctorName(doctor.fullName);
                if (secretaria?.fullName) setSecretariaName(secretaria.fullName);
            } catch (err) {
                if (import.meta.env.DEV) console.error('loadNames failed', err);
            }
        };

        if (form.doctor_id || isSecretariaFlow) loadNames();
        return () => { cancelled = true; };
    }, [form.doctor_id, form.secretaria_id, isSecretariaFlow]);

    useEffect(() => {
        let cancelled = false;
        const loadSecretarias = async () => {
            try {
                const res = await getSecretarias();
                const list = Array.isArray(res) ? res : res?.data || res?.items || res?.rows || res?.secretarias || [];
                if (cancelled) return;
                if (list.length) {
                    const first = list[0];
                    const id = first?.id ?? first?._id ?? first?.ID ?? first?.secretaria_id ?? '';
                    setForm((prev) => ({ ...prev, secretaria_id: String(id) }));
                    const nombre = (first?.nombre || first?.name || first?.fullName || first?.usuario_nombre) || '';
                    if (nombre) setSecretariaName(nombre);
                }
            } catch (e) {
                console.error('Error loading secretarias:', e);
            }
        };
        if (form.doctor_id) loadSecretarias();
        return () => { cancelled = true; };
    }, [form.doctor_id]);

    useEffect(() => {
        if (!showSelectModal) return;
        const name = query.trim();
        if (name.length < 2) {
            setClientes([]);
            return;
        }
        let cancelled = false;
        const t = setTimeout(async () => {
            try {
                setLookupLoading(true);
                const res = await searchClients(name);
                if (cancelled) return;
                setClientes(normalizeUserMascotaResults(res));
            } catch (err) {
                if (!cancelled) setError(err?.message || 'No se pudieron cargar usuarios por nombre');
            } finally {
                if (!cancelled) setLookupLoading(false);
            }
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [query, showSelectModal]);

    const handleSelectMascota = (cliente, mascota) => {
        setSelectedCliente(cliente);
        setMascotaDisplayName(`${mascota.nombre} (${cliente.fullName})`);
        setForm((prev) => ({ ...prev, mascota_id: mascota.id }));
        setShowSelectModal(false);
        setQuery('');
        setClientes([]);
    };

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setShowErrorModal(false);
        try {
            if (isSecretariaFlow && !form.doctor_id) {
                throw new Error('Selecciona un doctor para la cita.');
            }
            if (!form.doctor_id) {
                throw new Error('Doctor ID no disponible en la sesión actual.');
            }
            if (!form.mascota_id) {
                setError('Seleccione un cliente y mascota antes de crear la cita.');
                setShowErrorModal(true);
                return;
            }
            if (!form.fecha_cita) {
                setError('Selecciona la fecha de la cita.');
                setShowErrorModal(true);
                return;
            }
            if (!form.hora_cita) {
                setError('Selecciona la hora de la cita.');
                setShowErrorModal(true);
                return;
            }
            if (!String(form.motivo || '').trim()) {
                setError('El motivo de la cita es obligatorio.');
                setShowErrorModal(true);
                return;
            }

            const payload = {
                mascota_id: Number(form.mascota_id),
                doctor_id: Number(form.doctor_id),
                secretaria_id: Number(form.secretaria_id) || null,
                fecha_cita: form.fecha_cita,
                hora_cita: String(form.hora_cita || '').trim(),
                motivo: String(form.motivo || '').trim(),
                tipo_cita: form.tipo_cita,
                estado: 'programada',
                notas: form.notas,
                metodo_pago: String(form.metodo_pago || 'efectivo'),
            };
            await createCita(payload);
            setError('');
            setShowErrorModal(false);
            setShowSuccessModal(true);
        } catch (err) {
            const msg = err?.message || 'No se pudo crear la cita';
            setError(msg);
            setShowErrorModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <GenericPanel 
            title="Agendar nueva cita" 
            message="Registra los detalles de la consulta, paciente y doctor responsable."
            role={activeRole}
        >
            <div className={styles.formWrapper}>
                <div className={styles.formHeaderActions}>
                    <button type="button" className={styles.backBtn} onClick={() => navigate('/citas', { state: { role: location.state?.role ?? 'doctor' } })}>
                        <ArrowLeft size={16} /> Volver a citas
                    </button>
                </div>

                <form className={styles.modernCard} onSubmit={handleSubmit}>
                {error && <div className={styles.error}>{error}</div>}

                <SelectModal
                    open={showSelectModal}
                    onClose={() => { setShowSelectModal(false); setQuery(''); setClientes([]); }}
                    onSelectMascota={handleSelectMascota}
                    clients={clientes}
                    query={query}
                    setQuery={setQuery}
                    loading={lookupLoading}
                />

                <div className={styles.rowThree}>
                    <div className={styles.group}>
                        <label className={styles.label}>Mascota</label>
                        <ModalTooltip text="Haz clic para seleccionar cliente y mascota." placement="right">
                            <input
                                className={styles.input}
                                value={mascotaDisplayName}
                                readOnly
                                placeholder="Seleccione un cliente para asociar mascota"
                                style={{ cursor: 'pointer', background: 'white' }}
                                onClick={() => setShowSelectModal(true)}
                            />
                        </ModalTooltip>
                    </div>
                    <div className={styles.group}>
                        {isSecretariaFlow ? (
                            <CustomSelect
                                label="Doctor"
                                options={doctores.map((d) => ({
                                    id: String(d.id),
                                    name: d.fullName || `Doctor ${d.id}`
                                }))}
                                value={form.doctor_id}
                                placeholder="Selecciona un doctor"
                                onChange={(selectedId) => {
                                    handleChange({
                                        target: { name: 'doctor_id', value: selectedId }
                                    });
                                }}
                            />
                        ) : (
                            <>
                                <label className={styles.label}>Doctor</label>
                                <input
                                    className={styles.input}
                                    value={doctorName || (form.doctor_id ? `Doctor ${form.doctor_id}` : '')}
                                    readOnly
                                    placeholder={loadingDoctor ? 'Cargando doctor...' : 'Doctor cargado de sesión'}
                                />
                            </>
                        )}
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Secretaria</label>
                        <input
                            className={styles.input}
                            value={secretariaName || (form.secretaria_id ? `Secretaria ${form.secretaria_id}` : '')}
                            readOnly
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Fecha de cita</label>
                        <CustomDatePicker
                            label="Fecha de cita"
                            name="fecha_cita"
                            value={form.fecha_cita}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Hora de cita</label>
                        <CustomTimePicker
                            label="Hora de cita"
                            name="hora_cita"
                            value={form.hora_cita}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Tipo de cita</label>
                        <input className={styles.input} name="tipo_cita" value={form.tipo_cita} onChange={handleChange} required />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Motivo</label>
                        <input className={styles.input} name="motivo" value={form.motivo} onChange={handleChange} required />
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Notas</label>
                    <textarea className={styles.textarea} name="notas" value={form.notas} onChange={handleChange} />
                </div>

                <div className={styles.group}>
                    <ModalTooltip text="Selecciona el método de pago acordado para esta cita." placement="top">
                        <CustomSelect
                            label="Método de pago"
                            name="metodo_pago"
                            options={[
                                { id: 'efectivo', name: 'Efectivo' },
                                { id: 'pago_movil', name: 'Pago Móvil' },
                                { id: 'transferencia', name: 'Transferencia' },
                                { id: 'No definido', name: 'No definido' },
                            ]}
                            value={form.metodo_pago}
                            onChange={(selectedId) => setForm((prev) => ({ ...prev, metodo_pago: selectedId }))}
                            placeholder="Selecciona método de pago"
                            style={{ width: '100%' }}
                        />
                    </ModalTooltip>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.secondary} onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className={styles.primary} disabled={submitting}>{submitting ? 'Creando...' : 'Crear cita'}</button>
                </div>
            </form>
            </div>

            <AlertModal
                open={showSuccessModal}
                title="Cita creada"
                message="La cita fue creada correctamente"
                onClose={() => {
                    setShowSuccessModal(false);
                    navigate('/citas', { state: { role: location.state?.role ?? 'doctor' } });
                }}
                cancelText="Cerrar"
            />

            <AlertModal
                open={showErrorModal}
                title="Error al crear cita"
                message={error}
                onClose={() => setShowErrorModal(false)}
                cancelText="Cerrar"
            />
        </GenericPanel>
    );
}