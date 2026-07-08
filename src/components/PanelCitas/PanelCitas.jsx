import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePanelCitas from '../../hooks/UsePanelCitas';
import PanelCitasTable from './PanelCitasTable';

function PanelCitas({
    citas: initialCitas, // Citas iniciales que vienen por props
    loading: parentLoading = false,
    deletingId,
    renderField,
    formatDate,
    formatTime,
    getCitaId,
    onDelete,
    // Props opcionales para personalizar la acción primaria (por defecto "Empezar consulta")
    primaryActionLabel,
    onPrimaryAction,
    // Opciones para reutilización: inyectar función de fetch y controlar polling
    fetchCitasFn,
    polling = true,
    pollingInterval = 10000,
}) {
    const navigate = useNavigate();

    // Hook que encapsula la lógica: normalización, estado local y polling
    const { listaCitas, setListaCitas: _setListaCitas, refetch: _refetch, updateCitaLocally: _updateCitaLocally } = usePanelCitas({
        initialCitas,
        getCitaId,
        fetchCitasFn,
        polling,
        pollingInterval,
    });

    const handlePrimaryActionFallback = (cita) => {
        if (typeof onPrimaryAction === 'function') return onPrimaryAction(cita);
        navigate('/consultas/crear', { state: { cita } });
    };

    return (
        <PanelCitasTable
            listaCitas={listaCitas}
            loading={parentLoading}
            deletingId={deletingId}
            renderField={renderField}
            formatDate={formatDate}
            formatTime={formatTime}
            getCitaId={getCitaId}
            onDelete={onDelete}
            primaryActionLabel={primaryActionLabel}
            onPrimaryAction={handlePrimaryActionFallback}
        />
    );
}

export default PanelCitas;
