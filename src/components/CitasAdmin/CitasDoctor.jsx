import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CitasDoctor.module.css';
import PanelCitas from '../PanelCitas/PanelCitas';
import SpinerLoader from '../SpinerLoader/SpinerLoader';
import useGetCitas from '../../hooks/GetCitas';
import usePolling from '../../hooks/UsePolling';
import AlertModal from '../AlertModal/AlertModal';
import { deleteCita, deleteCitaAlt, updateCitaEstado } from '../../services/api';
import plusIcon from '../../assets/icons/plus.svg';
import { CustomerAndPetsForm } from '../../pages/DoctorSystem/CreateCustomerAndPets/CustomerAndPets';
import { useSearchCitas } from '../../hooks/searchCitas';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import { get } from 'react-hook-form';

function CitasLayout({ 
    titulo = 'Citas',
    descripcion = '',
    citas: propCitas,
    loading: propLoading,
    error: propError,
    refetch: propRefetch,
    // Props de acción para el botón principal
    labelBotonPrincipal,
    accionBotonPrincipal,
    // Props para la acción dentro de la tabla (Empezar o Cancelar)
    labelAccionTabla,
    onAccionTabla,
    deletingId,
    // Opciones de polling
    polling = true,
    pollingInterval = 20000,
    // role override (optional)
    role: propRole,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const role = propRole || location.state?.role || 'doctor';

    // Si el padre no inyecta datos, usamos el hook para obtener citas
const { citas: hookCitas, loading: hookLoading, error: hookError, refetch: hookRefetch } = useGetCitas();

    const citas = useMemo(() => (propCitas ?? hookCitas ?? []), [propCitas, hookCitas]);
    const loading = propLoading ?? hookLoading;
    const error = propError ?? hookError;
    const refetch = propRefetch ?? hookRefetch;

    // Polling centralizado desde el layout (evita que PanelCitas haga su propio polling)
    usePolling(refetch, pollingInterval, !!polling);

    const { searchMode, toggleSearchMode, searchTerm, setSearchTerm, searchInputRef, filtredCitas } = useSearchCitas(citas);
    // Deletion state
    const [localDeletingId, setLocalDeletingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteCita, setPendingDeleteCita] = useState(null);
    const [localError, setLocalError] = useState('');
    // Cancel (primary action for secretaria)
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [pendingCancelCita, setPendingCancelCita] = useState(null);
    const [cancelError, setCancelError] = useState('');
    // Create cliente (secretaria)
    const [showCreateClientModal, setShowCreateClientModal] = useState(false);
    const [showCreateClientBadReqModal, setShowCreateClientBadReqModal] = useState(false);
    const [showCreateClientSuccessModal, setShowCreateClientSuccessModal] = useState(false);
    const [createClientError, setCreateClientError] = useState(null);

    const filteredCitas = filtredCitas;

    const totalCitas = Array.isArray(citas) ? citas.length : 0;
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const defaultLabel = labelBotonPrincipal ?? (role === 'secretaria' ? 'Crear cita' : 'Buscar citas');
    const defaultAction = accionBotonPrincipal ?? (() => {
        if (role === 'secretaria') {
            navigate('/citas/crear', { state: { role } });
            return;
        }
        // Doctor: toggle search mode
        toggleSearchMode();
    });

    const iconElement = (
        role === 'secretaria'
            ? <img src={plusIcon} alt="" className={styles.actionIcon} />
            : <img src={getIcon('search')} alt="" className={styles.actionIcon} />
    );

    const renderField = (cita, keys) => {
        for (const k of keys) {
            if (cita[k]) {
                let val = cita[k];
                if (typeof val === 'string' && (k === 'estado' || k === 'status')) {
                    const raw = val.trim();
                    if (raw === 'en_curso') return 'En curso';
                    if (raw === 'no_asistida') return 'No asistida';
                    return raw.replace(/_/g, ' ').trim();
                }
                if (val && typeof val === 'object') {
                    return `${val.nombre || val.name || ''} ${val.apellido || ''}`.trim() || '—';
                }
                return val;
            }
        }
        return '—';
    };

    const formatDate = (iso) => {
        if (!iso) return '—';
        try {
            const d = new Date(iso);
            return d.toLocaleDateString();
        } catch (err) {
            if (import.meta.env.DEV) console.error('formatDate failed', err);
            return iso;
        }
    };

    const formatTime = (time, fallback) => {
        if (time) return String(time).slice(0,5);
        if (fallback) {
            try {
                const d = new Date(fallback);
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (err) {
                if (import.meta.env.DEV) console.error('formatTime fallback failed', err);
                return fallback;
            }
        }
        return '—';
    };

    const getCitaId = (cita) => cita?.id ?? cita?._id ?? cita?.ID;

    const handleDelete = (cita) => {
        const citaId = getCitaId(cita);
        if (!citaId) {
            setLocalError('No se pudo eliminar: la cita no tiene un ID válido.');
            return;
        }

        setPendingDeleteCita({ cita, citaId, paciente: renderField(cita, ['paciente_nombre', 'paciente', 'patient', 'nombre', 'name']) });
        setShowDeleteModal(true);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setPendingDeleteCita(null);
    };

    const confirmDelete = async () => {
        if (!pendingDeleteCita) return;
        const { citaId } = pendingDeleteCita;

        setLocalDeletingId(citaId);
        setLocalError('');
        setShowDeleteModal(false);

        try {
            try {
                await deleteCita(citaId);
                if (typeof refetch === 'function') await refetch();
                return;
            } catch (err) {
                console.warn('delete direct failed, trying alt delete', err);
            }

            try {
                await deleteCitaAlt(citaId);
                if (typeof refetch === 'function') await refetch();
                return;
            } catch (errAlt) {
                console.warn('alt delete failed, trying update estado', errAlt);
            }

            try {
                await updateCitaEstado(citaId, 'cancelada');
                if (typeof refetch === 'function') await refetch();
            } catch (updateErr) {
                console.error('fallback error', updateErr);
                setLocalError('No se pudo eliminar ni marcar la cita');
            }
        } catch (err) {
            setLocalError(err?.message || 'No se pudo eliminar la cita.');
        } finally {
            setLocalDeletingId(null);
            setPendingDeleteCita(null);
        }
    };

    // Cancel (primary action for secretaria) handlers
    const handleCancelClick = (cita) => {
        const citaId = getCitaId(cita);
        if (!citaId) {
            setCancelError('No se pudo cancelar: la cita no tiene un ID válido.');
            return;
        }
        setPendingCancelCita({ cita, citaId, paciente: renderField(cita, ['paciente_nombre', 'paciente', 'patient', 'nombre', 'name']) });
        setShowCancelModal(true);
    };

    const cancelCancel = () => {
        setShowCancelModal(false);
        setPendingCancelCita(null);
        setCancelError('');
    };

    const confirmCancel = async () => {
        if (!pendingCancelCita) return;
        const { citaId } = pendingCancelCita;

        setLocalDeletingId(citaId);
        setCancelError('');
        setShowCancelModal(false);

        try {
            await updateCitaEstado(citaId, 'cancelada');
            if (typeof refetch === 'function') await refetch();
        } catch (err) {
            setCancelError(err?.message || 'No se pudo cancelar la cita.');
        } finally {
            setLocalDeletingId(null);
            setPendingCancelCita(null);
        }
    };

    const primaryActionLabelProp = labelAccionTabla ?? (role === 'secretaria' ? 'Cancelar consulta' : undefined);
    const primaryActionHandlerProp = onAccionTabla ?? (role === 'secretaria' ? (cita) => handleCancelClick(cita) : undefined);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div>
                    <h1 className={styles.title}>{titulo}</h1>
                    {descripcion && <p className={styles.intro}>{descripcion}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className={styles.backButton} onClick={() => { if (role === 'secretaria') navigate('/SecretariaSystem'); else navigate('/doctor'); }}>
                      <img src={getIcon('house')} alt="house" className={styles.houseIcon} />
                        Volver
                    </button>
                    <button type="button" className={styles.refreshButton} onClick={() => refetch()}>
                        <img src={getIcon('rotate')} alt="rotate" className={styles.houseIcon} />
                        Actualizar
                    </button>
                    {role === 'secretaria' && (
                        <button
                            type="button"
                            className={styles.refreshButton}
                            onClick={() => {
                                setCreateClientError(null);
                                setShowCreateClientBadReqModal(false);
                                setShowCreateClientSuccessModal(false);
                                setShowCreateClientModal(true);
                            }}
                        >
                            <img src={getIcon('user')} alt="user" className={styles.houseIcon} />
                            Crear usuario
                        </button>
                    )}
                    <button type="button" className={styles.backButton} onClick={defaultAction}>
                      
                        {iconElement} {defaultLabel}
                    </button>
                </div>
            </div>

            <div className={styles.metricsRow}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total de citas</span>
                    <strong className={styles.metricValue}>{totalCitas}</strong>
                </div>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Hora actual</span>
                    <strong className={styles.metricValue}>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
                </div>
            </div>

            {searchMode && (
                <div style={{ padding: '0.5rem 1rem' }}>
                    <input
                        ref={searchInputRef}
                        placeholder="Buscar por paciente, teléfono, mascota o motivo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid var(--line)' }}
                    />
                </div>
            )}

            {loading && <SpinerLoader />}

            {!loading && !error && (
                <div className={styles.contentWrap}>
                    <PanelCitas
                        citas={searchMode ? filteredCitas : citas}
                        renderField={renderField}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        getCitaId={getCitaId}
                        deletingId={localDeletingId || deletingId}
                        // evitar poll interno: lo controlamos desde este layout
                        polling={false}
                        primaryActionLabel={primaryActionLabelProp}
                        onPrimaryAction={primaryActionHandlerProp}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            <AlertModal
                open={showDeleteModal}
                title="¿Desea eliminar esta cita?"
                message={pendingDeleteCita ? `Confirme que desea eliminar la cita de ${pendingDeleteCita.paciente}.` : 'Confirme la eliminación.'}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />

            <AlertModal
                open={showCancelModal}
                title="¿Desea cancelar esta cita?"
                message={pendingCancelCita ? `Confirme que desea cancelar la cita de ${pendingCancelCita.paciente}.` : 'Confirme la cancelación.'}
                onClose={cancelCancel}
                onConfirm={confirmCancel}
                confirmText="Cancelar cita"
                cancelText="Mantener"
            />

            {/* Crear cliente - solo secretaria */}
            <AlertModal
                open={showCreateClientModal}
                title="Crear usuario"
                message={createClientError || 'Crea un nuevo usuario rapidamente'}
                onClose={() => setShowCreateClientModal(false)}
                hideActions={true}
            >
                <CustomerAndPetsForm
                    onCreated={() => {
                        if (typeof refetch === 'function') refetch();
                        setShowCreateClientModal(false);
                        setShowCreateClientBadReqModal(false);
                        setShowCreateClientSuccessModal(true);
                    }}
                    onCancel={() => setShowCreateClientModal(false)}
                    onError={(err) => {
                        const isBadRequest = err?.status === 400 || err?.response?.status === 400 || /bad request/i.test(err?.message || '');
                        setCreateClientError(err || null);
                        if (isBadRequest) {
                            setShowCreateClientModal(false);
                            setShowCreateClientBadReqModal(true);
                            return;
                        }
                    }}
                />
            </AlertModal>

            <AlertModal
                open={showCreateClientBadReqModal}
                title="No se pudo completar el registro."
                message={createClientError || 'Verifique los datos del cliente y la mascota, e intente nuevamente.'}
                onClose={() => setShowCreateClientBadReqModal(false)}
                cancelText="Cerrar"
            />

            <AlertModal
                open={showCreateClientSuccessModal}
                title="Cliente y mascota creados"
                message="El cliente y su mascota se crearon correctamente"
                onClose={() => setShowCreateClientSuccessModal(false)}
                cancelText="Cerrar"
            />
        </div>
    );
}

export default CitasLayout;
