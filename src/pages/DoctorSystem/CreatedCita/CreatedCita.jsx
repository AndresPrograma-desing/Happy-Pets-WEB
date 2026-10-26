import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import AlertModal from '../../../components/AlertModal/AlertModal';
import { createCita, searchClients, getUsers, getSecretarias, checkDoctorAvailability, getServices } from '../../../services/api';
import styles from './CreatedCita.module.css';
import { Calendar, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import SelectModal from '../../../components/ClientSelect/SelectModal';
import ModalTooltip from '../../../components/ModalTooltip/ModalTooltip';
import CalendarPicker from '../../../components/screens/components/CalendarPicker/Index';
import HoursPicker from '../../../components/screens/components/HoursPicker/Index';
import CustomSelect from '../../../components/UI/DesplegableSelector/CustomSelect';
import { normalizeUserMascotaResults } from './utils';
import usePanelHeader from '../../../components/GenericPanel/usePanelHeader';
import MultilinePlaceholder from '../../../components/screens/components/Material-UI/Components/MultilinePlaceholder/index';
import TextField from '../../../components/screens/components/Material-UI/Components/TextField/Index';
import Selector from '../../../components/screens/components/Material-UI/Components/Selector/Index';
import Button from '../../../components/screens/components/Button';
import Barnner from '../../../components/screens/components/Barnner';

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
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);

    const [form, setForm] = useState({
        mascota_id: '',
        doctor_id: location.state?.doctor_id || '',
        secretaria_id: location.state?.secretaria_id || '',
        fecha_cita: location.state?.fecha_cita || '',
        hora_cita: location.state?.hora_cita || '',
        motivo: '',
        servicio_id: '',
        estado: 'programada',
        notas: '',
        metodo_pago: 'efectivo',
        autoagendar: false,
    });

    useEffect(() => {
        let active = true;
        setLoadingServices(true);
        getServices({ active: true, pageSize: 100 })
            .then((res) => {
                if (!active) return;
                const list = Array.isArray(res) ? res : (res?.items || []);
                setServices(list);
            })
            .catch((err) => console.error('Error cargando servicios:', err))
            .finally(() => { if (active) setLoadingServices(false); });
        return () => { active = false; };
    }, []);

    // Cargar doctor_id de la sesión si es rol doctor y no viene de location.state
    useEffect(() => {
        if (!isSecretariaFlow && !form.doctor_id) {
            const sessionDoctorId = sessionStorage.getItem('doctor_id') || localStorage.getItem('doctor_id') || '';
            if (sessionDoctorId) {
                setForm(prev => ({ ...prev, doctor_id: String(sessionDoctorId) }));
            }
        }
    }, [isSecretariaFlow]);


    const [submitting, setSubmitting] = useState(false);
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [error, setError] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [doctorName, setDoctorName] = useState('');
    const [secretariaName, setSecretariaName] = useState('');
    const [mascotaDisplayName, setMascotaDisplayName] = useState('');

    const [availabilityMessage, setAvailabilityMessage] = useState('');
    const [availabilityStatus, setAvailabilityStatus] = useState(null); // 'free' | 'busy' | null
    const [suggestedTime, setSuggestedTime] = useState('');

    useEffect(() => {
        const { doctor_id, fecha_cita, hora_cita } = form;
        if (!doctor_id || !fecha_cita || !hora_cita) {
            setAvailabilityMessage('');
            setAvailabilityStatus(null);
            setSuggestedTime('');
            return;
        }

        let cancelled = false;

        const check = async () => {
            try {
                const res = await checkDoctorAvailability({
                    doctorId: Number(doctor_id),
                    date: fecha_cita,
                    time: hora_cita
                });

                if (cancelled) return;

                if (res?.isOccupied || res?.IsOccupied) {
                    setAvailabilityStatus('busy');
                    setAvailabilityMessage(res?.message || res?.Message || 'El horario está ocupado.');
                    setSuggestedTime(res?.suggestedNextAvailableTime || res?.SuggestedNextAvailableTime || '');
                } else {
                    setAvailabilityStatus('free');
                    setAvailabilityMessage(res?.message || res?.Message || 'Horario disponible.');
                    setSuggestedTime('');
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Error checking availability:', err);
                    setAvailabilityStatus(null);
                    setAvailabilityMessage('');
                    setSuggestedTime('');
                }
            }
        };

        const t = setTimeout(check, 300); // Debounce de 300ms
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [form.doctor_id, form.fecha_cita, form.hora_cita]);

    const handleAutoagendarClick = () => {
        if (suggestedTime) {
            setForm((prev) => ({
                ...prev,
                hora_cita: suggestedTime
            }));
        }
    };

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
            if (!form.servicio_id) {
                setError('Selecciona el servicio de la cita.');
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
                servicio_id: form.servicio_id ? Number(form.servicio_id) : null,
                estado: 'programada',
                notas: form.notas,
                metodo_pago: String(form.metodo_pago || 'efectivo'),
                autoagendar: form.autoagendar
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

    usePanelHeader({
        title: "Agendar nueva cita",
        message: "Registra los detalles de la consulta, paciente y doctor responsable."
    });

    return (
        <>
            <div className={styles.formWrapper}>

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

                    <div className={styles.row}>
                        <div className={styles.group}>
                            <ModalTooltip text="Haz clic para seleccionar cliente y mascota." placement="right">
                                <TextField
                                    label="Mascota"
                                    value={mascotaDisplayName}
                                    readOnly
                                    placeholder="Seleccione un cliente para asociar mascota"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowSelectModal(true)}
                                />
                            </ModalTooltip>
                        </div>
                        <div className={styles.group}>
                            {isSecretariaFlow ? (
                                <Selector
                                    label="Doctor"
                                    options={doctores.map((d) => ({
                                        value: String(d.id),
                                        label: d.fullName || `Doctor ${d.id}`
                                    }))}
                                    value={form.doctor_id}
                                    placeholder="Selecciona un doctor"
                                    onChange={(e) => {
                                        handleChange({
                                            target: { name: 'doctor_id', value: e.target.value }
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
                    </div>

                    <div className={styles.row}>
                        <div className={styles.group}>
                            <CalendarPicker
                                label="Fecha de cita"
                                name="fecha_cita"
                                value={form.fecha_cita}
                                onChange={handleChange}
                                required
                                minDate={new Date()}
                            />
                        </div>
                        <div className={styles.group}>
                            <HoursPicker
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
                            <Selector
                                label="Servicio"
                                options={services.map((s) => ({
                                    value: String(s.id),
                                    label: s.nombre + (s.precio ? ` — USD ${Number(s.precio).toFixed(2)}` : '')
                                }))}
                                value={form.servicio_id}
                                loading={loadingServices}
                                placeholder="Selecciona un servicio"
                                onChange={(e) => setForm(prev => ({ ...prev, servicio_id: e.target.value }))}
                                required
                            />
                        </div>
                        <div className={styles.group}>
                            <TextField
                                label="Motivo"
                                name="motivo"
                                value={form.motivo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.group} style={{ marginBottom: '1.5rem' }}>
                        <MultilinePlaceholder
                            label="Notas"
                            name="notas"
                            value={form.notas}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.group} style={{ marginBottom: '1.5rem' }}>
                        <ModalTooltip text="Selecciona el método de pago acordado para esta cita." placement="top">
                            <Selector
                                label="Método de pago"
                                options={[
                                    { value: 'efectivo', label: 'Efectivo' },
                                    { value: 'pago_movil', label: 'Pago Móvil' },
                                    { value: 'transferencia', label: 'Transferencia' },
                                    { value: 'No definido', label: 'No definido' },
                                ]}
                                value={form.metodo_pago}
                                onChange={(e) => setForm((prev) => ({ ...prev, metodo_pago: e.target.value }))}
                                placeholder="Selecciona método de pago"
                            />
                        </ModalTooltip>
                    </div>

                    {availabilityMessage && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Barnner
                                type={availabilityStatus === 'free' ? 'success' : 'danger'}
                                icon={availabilityStatus === 'free' ? Check : AlertTriangle}
                                className={styles.fullWidthBanner}
                            >
                                {availabilityMessage}
                            </Barnner>
                        </div>
                    )}

                    {availabilityStatus === 'busy' && suggestedTime && (
                        <div className={styles.group} style={{ marginBottom: '1.5rem' }}>
                            <Button
                                type="button"
                                onClick={handleAutoagendarClick}
                                variant={Button.VARIANTS.PRIMARY}
                                color="green"
                                ToolTip="Haz clic para reasignar automáticamente la cita al siguiente horario sugerido que está libre."
                                style={{ width: 'fit-content' }}
                            >
                                Autoagendar a las {suggestedTime}
                            </Button>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <Button
                            onClick={() => navigate(-1)}
                            variant={Button.VARIANTS.BACK}
                            borderColor="var(--border-gray-low)"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant={Button.VARIANTS.CREATE}
                        >
                            Crear cita
                        </Button>
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
        </>
    );
}