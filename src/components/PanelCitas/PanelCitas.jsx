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
    onEdit,
    primaryActionLabel,
    onPrimaryAction,
    fetchCitasFn,
    polling = true,
    pollingInterval = 10000,
    onViewHistory,
    paginationPage,
    paginationCount,
    onPaginationChange,
    pageSize,
    onPageSizeChange,
    pageSizeOptions,
}) {
    const navigate = useNavigate();

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
            onEdit={onEdit}
            primaryActionLabel={primaryActionLabel}
            onPrimaryAction={handlePrimaryActionFallback}
            onViewHistory={onViewHistory}
            paginationPage={paginationPage}
            paginationCount={paginationCount}
            onPaginationChange={onPaginationChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
        />
    );
}

export default PanelCitas;
