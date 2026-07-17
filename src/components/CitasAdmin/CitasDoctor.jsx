import React, { useState } from 'react';
import styles from './CitasDoctor.module.css';
import PanelCitas from '../PanelCitas/PanelCitas';
import AlertModal from '../AlertModal/AlertModal';
import { CustomerAndPetsForm } from '../../pages/DoctorSystem/CreateCustomerAndPets/CustomerAndPets';
import ToggleCard from '../screens/components/ToggleCard';
import { Calendar, ListCheck, Clock } from 'lucide-react';
import { renderField, formatDate, formatTime, getCitaId, useCitasLogic, CitasModals } from './utils.jsx';
import GenericPanel from '../GenericPanel/GenericPanel';
import DrawPanel from '../screens/components/DrawPanel';
import Consultas from '../../pages/DoctorSystem/Consultas/Consultas';
import SearchInput from '../UI/Search/Search';
import HistorialMedico from '../HistorialMedico/Index';

function CitasLayout(props) {
    const {
        role,
        citas,
        loading,
        error,
        refetch,
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
    } = useCitasLogic(props);

    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
    const [selectedMascotaIdForHistory, setSelectedMascotaIdForHistory] = useState(null);
    const [selectedMascotaNombreForHistory, setSelectedMascotaNombreForHistory] = useState('');

    const handleViewHistory = (cita) => {
        const mascotaId = cita?.mascota_id || cita?.Mascotum?.id || cita?.mascota?.id;
        const mascotaNombre = cita?.mascota_nombre || cita?.Mascotum?.nombre || cita?.mascota?.nombre || 'Paciente';
        setSelectedMascotaIdForHistory(mascotaId);
        setSelectedMascotaNombreForHistory(mascotaNombre);
        setHistoryDrawerOpen(true);
    };

    const {
        titulo = 'Citas',
        descripcion = '',
        deletingId
    } = props;

    return (
        <GenericPanel 
            title={titulo || "Panel de Citas"} 
            message={descripcion || "Administra las citas y pacientes."}
            role={role}
        >

            <div className={styles.metricsRow}>
              <ToggleCard
                title="Total Citas"
                description={totalCitas}
                icon={ListCheck}
              />      
               <ToggleCard
                title="Hora Actual"
                description={now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                icon={Clock}
              />
            </div>

            <div style={{ padding: '0.5rem 1rem' }}>
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar por paciente, teléfono, mascota o motivo..."
                    label="Buscar Citas"
                />
            </div>

            <div className={styles.contentWrap}>
                <PanelCitas
                    citas={searchTerm.trim() !== '' ? filteredCitas : citas}
                    loading={loading}
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
                refetch={refetch}
                CustomerAndPetsForm={CustomerAndPetsForm}
                AlertModal={AlertModal}
            />

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
                            if (typeof refetch === 'function') refetch();
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
        </GenericPanel>
    );
}

export default CitasLayout;
