import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styles from './CitasDoctor.module.css';
import PanelCitas from '../PanelCitas/PanelCitas';
import AlertModal from '../AlertModal/AlertModal';
import { CustomerAndPetsForm } from '../../pages/DoctorSystem/CreateCustomerAndPets/CustomerAndPets';
import ToggleCard from '../screens/components/ToggleCard';
import { Calendar, ListCheck, Clock } from 'lucide-react';
import { renderField, formatDate, formatTime, getCitaId, useCitasLogic, CitasModals } from './utils.jsx';
import usePanelHeader from '../GenericPanel/usePanelHeader';
import DrawPanel from '../screens/components/DrawPanel';
import Consultas from '../../pages/DoctorSystem/Consultas/Consultas';
import SearchInput from '../UI/Search/Search';
import HistorialMedico from '../HistorialMedico/Index';
import Switch from '../screens/components/Swich/Index.jsx'; 
import Selector from '../screens/components/Material-UI/Components/Selector/Index.jsx';
import TextField from '../screens/components/Material-UI/Components/TextField/Index.jsx';
import CalendarPicker from '../screens/components/CalendarPicker/Index.jsx';
import HoursPicker from '../screens/components/HoursPicker/Index.jsx';
import Button from '../screens/components/Button/index.jsx';
import { getCitasDetalle, updateCita, getMascotasByUserName } from '../../services/api';
import useCitaStatuses from '../../hooks/GetCitasStatuses.js';
import useCitaTypes from '../../hooks/GetTypesCitas.js';
import ErrorMessage from '../Notification/Error/ErrorMessage.jsx';

const getTodayYYYYMMDD = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getTodayDDMMYYYY = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

function CitasLayout(props) {
    const todayISO = getTodayYYYYMMDD();
    const todayDisplay = getTodayDDMMYYYY();

    const [citasDelDia, setCitasDelDia] = useState(false);
    const [estadoCita, setEstadoCita] = useState('');
    const { statuses: rawStatuses } = useCitaStatuses();
    const { types: rawCitaTypes } = useCitaTypes();
    
    const [citasList, setCitasList] = useState([]);
    const [isFetchingCitas, setIsFetchingCitas] = useState(false);

    const fetchCitasData = useCallback(() => {
        setIsFetchingCitas(true);
        
        getCitasDetalle({
            status: estadoCita,
            date: citasDelDia ? todayISO : undefined,
            allDates: !citasDelDia
        })
        .then(res => {
            const data = Array.isArray(res) ? res : (res?.data || res?.result || []);
            setCitasList(data);
        })
        .catch(console.error)
        .finally(() => setIsFetchingCitas(false));
    }, [estadoCita, citasDelDia, todayISO]);

    useEffect(() => {
        fetchCitasData();
    }, [fetchCitasData]);

    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedCitaForEdit, setSelectedCitaForEdit] = useState(null);
    const [clientPetsOptions, setClientPetsOptions] = useState([]);
    const [editFormValues, setEditFormValues] = useState({
        mascota_id: '',
        mascota_nombre: '',
        doctor_id: '',
        doctor_nombre: '',
        secretaria_id: '',
        fecha_cita: '',
        hora_cita: '',
        motivo: '',
        tipo_cita: '',
        estado: '',
        notas: '',
        cliente_nombre: ''
    });
    const [editNotification, setEditNotification] = useState({ message: '', title: '', variant: 'danger' });
    const [isSavingCita, setIsSavingCita] = useState(false);
    const [isSaveSuccess, setIsSaveSuccess] = useState(undefined);

    const {
        searchTerm,
        setSearchTerm,
        now,
        drawerOpen,
        setDrawerOpen,
        selectedCitaForConsulta,
        localDeletingId,
        showDeleteModal,
        pendingDeleteCita,
        handleDelete,
        cancelDelete,
        confirmDelete,
        showCancelModal,
        pendingCancelCita,
        cancelCancel,
        confirmCancel,
        showCreateClientModal,
        setShowCreateClientModal,
        showCreateClientBadReqModal,
        setShowCreateClientBadReqModal,
        showCreateClientSuccessModal,
        setShowCreateClientSuccessModal,
        createClientError,
        setCreateClientError,
        primaryActionLabelProp,
        primaryActionHandlerProp
    } = useCitasLogic({
        ...props,
        propCitas: citasList,
        propLoading: isFetchingCitas,
        propRefetch: fetchCitasData
    });

    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
    const [selectedMascotaIdForHistory, setSelectedMascotaIdForHistory] = useState(null);
    const [selectedMascotaNombreForHistory, setSelectedMascotaNombreForHistory] = useState('');

    const statusOptions = useMemo(() => {
        if (Array.isArray(rawStatuses) && rawStatuses.length > 0) return rawStatuses;
        return [
            { value: 'programada', label: 'Programada' },
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'en_curso', label: 'En Curso' },
            { value: 'completada', label: 'Completada' },
            { value: 'cancelada', label: 'Cancelada' },
            { value: 'no_asistida', label: 'No Asistida' }
        ];
    }, [rawStatuses]);

    const opcionesEstado = useMemo(() => {
        let base = [{ value: '', label: 'Todas' }, ...statusOptions];
        if (citasDelDia) {
            base.push({ value: todayISO, label: `Día: ${todayDisplay}` });
        }
        return base;
    }, [statusOptions, citasDelDia, todayISO, todayDisplay]);

    const localFilteredCitas = useMemo(() => {
        if (!searchTerm || !searchTerm.trim()) return citasList;
        const lower = searchTerm.toLowerCase();
        return citasList.filter(c => {
            const name = (c.paciente_nombre || c.Mascotum?.nombre || c.mascota?.nombre || '').toLowerCase();
            const phone = (c.telefono || c.cliente?.telefono || '').toLowerCase();
            const reason = (c.motivo || '').toLowerCase();
            const clientName = (c.cliente_nombre || c.cliente?.nombre || '').toLowerCase();
            return name.includes(lower) || phone.includes(lower) || reason.includes(lower) || clientName.includes(lower);
        });
    }, [citasList, searchTerm]);

    const handleViewHistory = (cita) => {
        const mascotaId = cita?.mascota_id || cita?.Mascotum?.id || cita?.mascota?.id;
        const mascotaNombre = cita?.mascota_nombre || cita?.Mascotum?.nombre || cita?.mascota?.nombre || 'Paciente';
        setSelectedMascotaIdForHistory(mascotaId);
        setSelectedMascotaNombreForHistory(mascotaNombre);
        setHistoryDrawerOpen(true);
    };

    const normalizeTipoCita = (str) => {
        if (!str) return 'consulta';
        const s = String(str).toLowerCase().trim();
        if (s.includes('consulta')) return 'consulta';
        if (s.includes('vacuna')) return 'vacunacion';
        if (s.includes('cirug')) return 'cirugia';
        if (s.includes('emerg')) return 'emergencia';
        if (s.includes('segui')) return 'seguimiento';
        return s;
    };

    const handleOpenEdit = (cita) => {
        setSelectedCitaForEdit(cita);
        setEditNotification({ message: '', title: '', variant: 'danger' });
        setIsSavingCita(false);
        setIsSaveSuccess(undefined);

        const mascotaId = String(cita?.mascota_id || cita?.Mascotum?.id || cita?.mascota?.id || '');
        const mascotaNombre = cita?.mascota_nombre || cita?.Mascotum?.nombre || cita?.mascota?.nombre || 'Mascota Actual';
        const clientName = cita?.cliente_nombre || cita?.paciente_nombre || cita?.cliente?.nombre || cita?.cliente?.usuario_nombre || '';
        const doctorName = cita?.doctor_nombre || cita?.doctor?.nombre || 'Doctor Asignado';

        const initialOptions = [];
        if (mascotaId) {
            initialOptions.push({ value: mascotaId, label: mascotaNombre });
        }
        setClientPetsOptions(initialOptions);

        setEditFormValues({
            mascota_id: mascotaId,
            mascota_nombre: mascotaNombre,
            doctor_id: String(cita?.doctor_id || cita?.doctor?.id || ''),
            doctor_nombre: doctorName,
            secretaria_id: String(cita?.secretaria_id || ''),
            fecha_cita: cita?.fecha_cita ? cita.fecha_cita.split('T')[0] : (cita?.fecha ? cita.fecha.split('T')[0] : ''),
            hora_cita: cita?.hora_cita || cita?.hora || '',
            motivo: cita?.motivo || '',
            tipo_cita: normalizeTipoCita(cita?.tipo_cita || cita?.tipo),
            estado: cita?.estado || cita?.status || '',
            notas: cita?.notas || cita?.nota || '',
            cliente_nombre: clientName
        });

        if (clientName) {
            getMascotasByUserName(clientName)
                .then(res => {
                    const list = Array.isArray(res) ? res : (res?.data || res?.result || []);
                    if (list.length > 0) {
                        const fetchedOpts = list.map(p => ({
                            value: String(p.id || p._id),
                            label: `${p.nombre || p.name}${p.especie ? ` (${p.especie})` : ''}`
                        }));
                        const map = new Map();
                        [...initialOptions, ...fetchedOpts].forEach(opt => map.set(opt.value, opt));
                        setClientPetsOptions(Array.from(map.values()));
                    }
                })
                .catch(err => {
                    if (import.meta.env.DEV) console.warn('No se pudieron cargar las mascotas del cliente:', err);
                });
        }

        setEditDrawerOpen(true);
    };

const formatFechaToISO = (str) => {
    if (!str) return null;
    const dateStr = String(str).trim();
    const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
        return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}T00:00:00.000Z`;
    }
    const dmyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmyMatch) {
        const dd = dmyMatch[1].padStart(2, '0');
        const mm = dmyMatch[2].padStart(2, '0');
        const yyyy = dmyMatch[3];
        return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }
    try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
        }
    } catch (e) {
        console.error(e);
    }
    return null;
};

    const handleUpdateSubmit = () => {
        const citaId = getCitaId(selectedCitaForEdit);
        if (!citaId || isSavingCita) return;

        setIsSavingCita(true);
        setIsSaveSuccess(false);
        setEditNotification({ message: '', title: '', variant: 'danger' });

        let cleanHora = (editFormValues.hora_cita || '').trim();
        if (cleanHora) {
            const match12 = cleanHora.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (match12) {
                let h = parseInt(match12[1], 10);
                const m = match12[2];
                const p = (match12[3] || '').toUpperCase();
                if (p === 'PM' && h < 12) h += 12;
                if (p === 'AM' && h === 12) h = 0;
                cleanHora = `${String(h).padStart(2, '0')}:${m}`;
            }
        }

        const payload = {
            mascota_id: Number(editFormValues.mascota_id) || selectedCitaForEdit?.mascota_id || selectedCitaForEdit?.Mascotum?.id || 0,
            doctor_id: Number(editFormValues.doctor_id) || selectedCitaForEdit?.doctor_id || 0,
            secretaria_id: editFormValues.secretaria_id ? Number(editFormValues.secretaria_id) : null,
            fecha_cita: formatFechaToISO(editFormValues.fecha_cita),
            hora_cita: cleanHora || undefined,
            motivo: editFormValues.motivo,
            tipo_cita: normalizeTipoCita(editFormValues.tipo_cita),
            estado: editFormValues.estado,
            notas: editFormValues.notas
        };

        updateCita(citaId, payload)
            .then(() => {
                setIsSavingCita(false);
                setIsSaveSuccess(true);
                setEditNotification({
                    title: '¡Cambios Guardados!',
                    message: 'La cita ha sido actualizada exitosamente.',
                    variant: 'success'
                });
                fetchCitasData();
                setTimeout(() => {
                    setEditDrawerOpen(false);
                }, 1200);
            })
            .catch((err) => {
                setIsSavingCita(false);
                setIsSaveSuccess(undefined);
                console.error('Error al actualizar la cita:', err);
                const msg = err?.data?.error || err?.data?.message || err?.message || 'Error al guardar los cambios en la cita.';
                setEditNotification({
                    title: 'Atención',
                    message: msg,
                    variant: 'danger'
                });
            });
    };

    const {
        titulo = 'Citas',
        descripcion = '',
        deletingId
    } = props;

    usePanelHeader({
        title: titulo || "Panel de Citas",
        message: descripcion || "Administra las citas y pacientes."
    });

    return (
        <>
            <div className={styles.metricsRow}>
              <ToggleCard
                title="Total Citas"
                description={citasList.length}
                icon={ListCheck}
              />      
               <ToggleCard
                title="Hora Actual"
                description={now?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || new Date().toLocaleTimeString()}
                icon={Clock}
              />
            </div>

            <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar por paciente, teléfono o mascota..."
                        label="Buscar Citas"
                    />
                </div>
                
                <div style={{ width: '220px' }}>
                    <Selector
                        label="Estado"
                        options={opcionesEstado}
                        value={estadoCita}
                        onChange={(e) => setEstadoCita(e.target.value)}
                        placeholder="Filtrar por estado"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                        Citas del día
                    </span>
                    <Switch
                        value={citasDelDia}
                        onChange={(val) => setCitasDelDia(val)}
                        activeColor="#088d4f"
                    />
                </div>
            </div>

            <div className={styles.contentWrap}>
                <PanelCitas
                    citas={localFilteredCitas}
                    loading={isFetchingCitas}
                    renderField={renderField}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getCitaId={getCitaId}
                    deletingId={localDeletingId || deletingId}
                    polling={false}
                    primaryActionLabel={primaryActionLabelProp}
                    onPrimaryAction={primaryActionHandlerProp}
                    onDelete={handleDelete}
                    onViewHistory={handleViewHistory}
                    onEdit={handleOpenEdit}
                />
            </div>

            <CitasModals
                showDeleteModal={showDeleteModal}
                pendingDeleteCita={pendingDeleteCita}
                cancelDelete={cancelDelete}
                confirmDelete={confirmDelete}
                showCancelModal={showCancelModal}
                pendingCancelCita={pendingCancelCita}
                cancelCancel={cancelCancel}
                confirmCancel={confirmCancel}
                showCreateClientModal={showCreateClientModal}
                setShowCreateClientModal={setShowCreateClientModal}
                createClientError={createClientError}
                setCreateClientError={setCreateClientError}
                showCreateClientBadReqModal={showCreateClientBadReqModal}
                setShowCreateClientBadReqModal={setShowCreateClientBadReqModal}
                showCreateClientSuccessModal={showCreateClientSuccessModal}
                setShowCreateClientSuccessModal={setShowCreateClientSuccessModal}
                refetch={fetchCitasData}
                CustomerAndPetsForm={CustomerAndPetsForm}
                AlertModal={AlertModal}
            />

            <DrawPanel 
                isOpen={editDrawerOpen} 
                onClose={() => setEditDrawerOpen(false)} 
                title="Editar Cita"
                width="600px"
                showActions={true}
                onConfirm={handleUpdateSubmit}
                confirmText="Guardar Cambios"
                cancelText="Cancelar"
                loading={isSavingCita}
                success={isSaveSuccess}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
                    {editNotification.message && (
                        <ErrorMessage 
                            title={editNotification.title} 
                            message={editNotification.message} 
                            variant={editNotification.variant} 
                        />
                    )}

                    <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                            <strong>Propietario / Cliente:</strong> {editFormValues.cliente_nombre || 'No especificado'}
                        </div>
                        {editFormValues.doctor_nombre && (
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                <strong>Doctor Responsable:</strong> {editFormValues.doctor_nombre}
                            </div>
                        )}
                    </div>

                    {clientPetsOptions.length > 0 ? (
                        <Selector
                            label="Mascota"
                            options={clientPetsOptions}
                            value={editFormValues.mascota_id}
                            onChange={(e) => setEditFormValues(prev => ({ ...prev, mascota_id: e.target.value }))}
                        />
                    ) : (
                        <TextField
                            label="Mascota"
                            value={editFormValues.mascota_nombre || 'Mascota'}
                            disabled
                        />
                    )}

                    <CalendarPicker
                        label="Fecha de Cita"
                        name="fecha_cita"
                        value={editFormValues.fecha_cita}
                        onChange={(e) => setEditFormValues(prev => ({ ...prev, fecha_cita: e.target.value }))}
                        required
                    />

                    <HoursPicker
                        label="Hora de Cita"
                        name="hora_cita"
                        value={editFormValues.hora_cita}
                        onChange={(e) => setEditFormValues(prev => ({ ...prev, hora_cita: e.target.value }))}
                        required
                    />

                    <TextField
                        label="Motivo de la Cita"
                        value={editFormValues.motivo}
                        onChange={(e) => setEditFormValues(prev => ({ ...prev, motivo: e.target.value }))}
                    />

                    <Selector
                        label="Tipo de Cita"
                        options={rawCitaTypes}
                        value={editFormValues.tipo_cita}
                        onChange={(e) => setEditFormValues(prev => ({ ...prev, tipo_cita: e.target.value }))}
                    />

                    <Selector
                        label="Estado de Cita"
                        options={statusOptions}
                        value={editFormValues.estado}
                        onChange={(e) => setEditFormValues(prev => ({ ...prev, estado: e.target.value }))}
                    />

                    <TextField
                        label="Notas Adicionales"
                        value={editFormValues.notas}
                        onChange={(e) => setEditFormValues(prev => ({ ...prev, notas: e.target.value }))}
                    />
                </div>
            </DrawPanel>

            <DrawPanel 
                isOpen={drawerOpen} 
                onClose={() => setDrawerOpen(false)} 
                title={`Consulta Médica - ${selectedCitaForConsulta?.paciente_nombre || selectedCitaForConsulta?.Mascotum?.nombre || selectedCitaForConsulta?.mascota?.nombre || 'Paciente'}`}
                width="850px"
            >
                {selectedCitaForConsulta && drawerOpen && (
                    <Consultas 
                        isDrawer={true} 
                        cita={selectedCitaForConsulta} 
                        onSuccess={() => {
                            setDrawerOpen(false);
                            fetchCitasData();
                        }}
                        onCancel={() => setDrawerOpen(false)}
                    />
                )}
            </DrawPanel>

            <DrawPanel 
                isOpen={historyDrawerOpen} 
                onClose={() => setHistoryDrawerOpen(false)} 
                title={`Historial Clínico - ${selectedMascotaNombreForHistory}`}
                width="850px"
            >
                {selectedMascotaIdForHistory && historyDrawerOpen && (
                    <HistorialMedico 
                        isDrawer={true} 
                        mascotaId={selectedMascotaIdForHistory} 
                    />
                )}
            </DrawPanel>
        </>
    );
}

export default CitasLayout;