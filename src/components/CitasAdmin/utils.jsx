import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useGetCitas from '../../hooks/GetCitas';
import usePolling from '../../hooks/UsePolling';
import { useSearchCitas } from '../../hooks/searchCitas';
import { deleteCita, deleteCitaAlt, updateCitaEstado } from '../../services/api';
import DrawPanel from '../screens/components/DrawPanel/index';

export const renderField = (cita, keys) => {
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

export const formatDate = (value) => {
    if (value == null || value === '') return '—';
    return String(value);
};

export const formatTime = (time, fallback) => {
    if (time) return String(time).slice(0,5);
    if (fallback) {
        try {
            const d = new Date(fallback);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (err) {
            return fallback;
        }
    }
    return '—';
};

export const getCitaId = (cita) => cita?.id ?? cita?._id ?? cita?.ID;

export function useCitasLogic({ 
    propCitas, 
    propLoading, 
    propError, 
    propRefetch, 
    propRole, 
    polling, 
    pollingInterval, 
    labelAccionTabla, 
    onAccionTabla 
}) {
    const location = useLocation();
    const role = propRole || location.state?.role || 'doctor';

    const { citas: hookCitas, loading: hookLoading, error: hookError, refetch: hookRefetch } = useGetCitas();

    const citas = useMemo(() => (propCitas ?? hookCitas ?? []), [propCitas, hookCitas]);
    const loading = propLoading ?? hookLoading;
    const error = propError ?? hookError;
    const refetch = propRefetch ?? hookRefetch;

    usePolling(refetch, pollingInterval, !!polling);

    const { searchMode, toggleSearchMode, searchTerm, setSearchTerm, searchInputRef, filtredCitas } = useSearchCitas(citas);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCitaForConsulta, setSelectedCitaForConsulta] = useState(null);

    const [localDeletingId, setLocalDeletingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteCita, setPendingDeleteCita] = useState(null);
    const [localError, setLocalError] = useState('');

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [pendingCancelCita, setPendingCancelCita] = useState(null);
    const [cancelError, setCancelError] = useState('');

    const [showCreateClientModal, setShowCreateClientModal] = useState(false);
    const [showCreateClientBadReqModal, setShowCreateClientBadReqModal] = useState(false);
    const [showCreateClientSuccessModal, setShowCreateClientSuccessModal] = useState(false);
    const [createClientError, setCreateClientError] = useState(null);

    const totalCitas = Array.isArray(citas) ? citas.length : 0;
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

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

    const handleStartConsulta = (cita) => {
        setSelectedCitaForConsulta(cita);
        setDrawerOpen(true);
    };

    const primaryActionLabelProp = labelAccionTabla ?? (role === 'secretaria' ? 'Cancelar consulta' : 'Empezar consulta');
    const primaryActionHandlerProp = onAccionTabla ?? (role === 'secretaria' ? (cita) => handleCancelClick(cita) : handleStartConsulta);

    const filteredCitas = filtredCitas;

    return {
        role,
        citas,
        loading,
        error,
        refetch,
        searchMode,
        toggleSearchMode,
        searchTerm,
        setSearchTerm,
        searchInputRef,
        filteredCitas,
        totalCitas,
        now,
        
        drawerOpen,
        setDrawerOpen,
        selectedCitaForConsulta,

        localDeletingId,
        showDeleteModal,
        pendingDeleteCita,
        localError,
        handleDelete,
        cancelDelete,
        confirmDelete,

        showCancelModal,
        pendingCancelCita,
        cancelError,
        handleCancelClick,
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
    };
}

export function CitasModals({
    showDeleteModal,
    pendingDeleteCita,
    cancelDelete,
    confirmDelete,
    showCancelModal,
    pendingCancelCita,
    cancelCancel,
    confirmCancel,
    showCreateClientModal,
    setShowCreateClientModal,
    createClientError,
    setCreateClientError,
    showCreateClientBadReqModal,
    setShowCreateClientBadReqModal,
    showCreateClientSuccessModal,
    setShowCreateClientSuccessModal,
    refetch,
    CustomerAndPetsForm,
    AlertModal
}) {
    return (
        <>
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

            <DrawPanel
                isOpen={showCreateClientModal}
                title="Crear cliente y mascota"
                onClose={() => setShowCreateClientModal(false)}
                width="600px"
                showActions={false}
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
                        setShowCreateClientModal(false);
                        if (isBadRequest) {
                            setShowCreateClientBadReqModal(true);
                        }
                    }}
                />
            </DrawPanel>

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
        </>
    );
}
