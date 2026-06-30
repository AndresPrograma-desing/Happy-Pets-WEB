import React from 'react';
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
                <input
                    ref={searchInputRef}
                    placeholder="Buscar por paciente, teléfono, mascota o motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid var(--line)' }}
                />
            </div>

            {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando citas...</div>}

            {!loading && !error && (
                <div className={styles.contentWrap}>
                    <PanelCitas
                        citas={searchTerm.trim() !== '' ? filteredCitas : citas}
                        renderField={renderField}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        getCitaId={getCitaId}
                        deletingId={localDeletingId || deletingId}
                        polling={false}
                        primaryActionLabel={primaryActionLabelProp}
                        onPrimaryAction={primaryActionHandlerProp}
                        onDelete={handleDelete}
                    />
                </div>
            )}

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
        </GenericPanel>
    );
}

export default CitasLayout;
