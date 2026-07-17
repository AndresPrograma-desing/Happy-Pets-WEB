import React, { useState, useEffect, useMemo } from 'react';
import { getClients, createPetForExistingClient } from '../../../services/api';
import SearchInput from '../../UI/Search/Search';
import AlertModal from '../../../components/AlertModal/AlertModal';
import PetForm from './form/addpetsForm';
import styles from './List.module.css';
import { INITIAL_PET_FORM, preparePetPayload } from './utils';
import GenericPanel from '../../GenericPanel/GenericPanel';
import TableB from '../../screens/components/TableB';
import Button from '../../screens/components/Button/index.jsx';
import Barnner from '../../screens/components/Barnner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  IdCard, 
  FileText, 
  PawPrint, 
  Calendar, 
  Activity, 
  RefreshCw,
  Plus
} from 'lucide-react';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [showPetModal, setShowPetModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [petForm, setPetForm] = useState(INITIAL_PET_FORM);
  const [petSubmitting, setPetSubmitting] = useState(false);
  const [petError, setPetError] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getClients();
      const items = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];
      setClients(items);
    } catch (err) {
      setError(err?.message || 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenAddPet = (clientId) => {
    setSelectedClientId(clientId);
    setPetForm(INITIAL_PET_FORM);
    setPetError('');
    setShowPetModal(true);
  };

  const handleSavePet = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!petForm.nombre || !petForm.especie || !petForm.sexo) {
      setPetError('Nombre, Especie y Sexo son campos obligatorios.');
      return;
    }
    setPetSubmitting(true);
    setPetError('');
    try {
      const payload = preparePetPayload(selectedClientId, petForm);
      await createPetForExistingClient(payload);
      setShowPetModal(false);
      await fetchClients();
    } catch (err) {
      setPetError(err?.message || 'No se pudo registrar la mascota');
    } finally {
      setPetSubmitting(false);
    }
  };

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return clients;
    return clients.filter((c) => {
      const nombreCompleto = `${c.nombre || ''} ${c.apellido || ''}`.toLowerCase();
      const identificacion = (c.identificacion || '').toLowerCase();
      const telefono = (c.telefono || '').toLowerCase();
      const mascotaMatch = (c.mascotas || []).some(m => (m.nombre || '').toLowerCase().includes(query));
      
      return nombreCompleto.includes(query) || identificacion.includes(query) || telefono.includes(query) || mascotaMatch;
    });
  }, [clients, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const pageCount = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, page]);

  const columns = [
    {
      key: 'cliente',
      label: 'Cliente',
      render: (row) => (
        <div className={styles.avatarArea}>
          <div className={styles.avatar}>
            {row.nombre?.charAt(0).toUpperCase()}{row.apellido?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.identitySummary}>
            <div className={styles.clientName}>{row.nombre} {row.apellido}</div>
            <div className={styles.idBadge}>
              <IdCard size={12} /> {row.identificacion || 'S/I'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contacto',
      label: 'Contacto',
      render: (row) => (
        <div className={styles.contactCell}>
          <div className={styles.metaItem}>
            <Phone size={14} /> <span>{row.telefono || '—'}</span>
          </div>
          <div className={styles.metaItem}>
            <Mail size={14} /> <span className={styles.truncatedText}>{row.email || '—'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'mascotas',
      label: 'Mascotas',
      render: (row) => (
        <Barnner icon={PawPrint} type="default">
          {row.mascotas?.length || 0} {row.mascotas?.length === 1 ? 'Mascota' : 'Mascotas'}
        </Barnner>
      )
    }
  ];

  const expandedRowRender = (client) => {
    const tieneMascotas = client.mascotas && client.mascotas.length > 0;
    
    return (
      <div className={styles.expandedContent}>
        <div className={styles.extendedDetails}>
          <div className={styles.fullDetailItem}>
            <MapPin size={14} />
            <div>
              <strong>Dirección:</strong> {client.direccion || 'No especificada'}
            </div>
          </div>
          {client.nota && (
            <div className={styles.fullDetailItem}>
              <FileText size={14} />
              <div>
                <strong>Notas internas:</strong> {client.nota}
              </div>
            </div>
          )}
        </div>

        <div className={styles.petsHeaderRow}>
          <h4 className={styles.sectionTitle}>Pacientes Vinculados</h4>
          <Button 
            color={Button.COLORS.GREEN}
            size={Button.SIZES.MEDIUM}
            variant={Button.VARIANTS.PRIMARY}
            onClick={() => handleOpenAddPet(client.id)}
            icon={Plus}
          >
            Añadir Paciente
          </Button>
        </div>

        {tieneMascotas ? (
          <div className={styles.petsGrid}>
            {client.mascotas.map((pet) => (
              <div key={pet.id} className={styles.petCardRow}>
                <div className={styles.petMainInfo}>
                  <div className={styles.petIconWrapper} data-especie={pet.especie?.toLowerCase()}>
                    <PawPrint size={16} />
                  </div>
                  <div>
                    <h5 className={styles.petName}>{pet.nombre}</h5>
                    <p className={styles.petBreed}>{pet.especie} • {pet.raza || 'Mestizo'}</p>
                  </div>
                </div>

                <div className={styles.petChips}>
                  <span className={styles.chip}>{pet.sexo}</span>
                  {pet.peso && <span className={styles.chip}>{pet.peso} kg</span>}
                  {pet.esterilizado && <span className={`${styles.chip} ${styles.successChip}`}>Esterilizado</span>}
                </div>

                <div className={styles.petActivity}>
                  <div className={styles.activityIndicator}>
                    <Activity size={12} />
                    <span>Consultas: {pet.consultas?.length || 0}</span>
                  </div>
                  <div className={styles.activityIndicator}>
                    <Calendar size={12} />
                    <span>Citas: {pet.citas?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noPetsText}>Este propietario no posee mascotas registradas.</p>
        )}
      </div>
    );
  };

  return (
    <GenericPanel 
      title="Gestión de Clientes" 
      message="Administra la información de los propietarios y el historial clínico de sus mascotas" 
      role="admin" // You might want to get role dynamically later
      showPagination={true}
      paginationCount={pageCount}
      paginationPage={page}
      onPaginationChange={(e, v) => setPage(v)}
    >
      <div className={styles.actionHeader}>
        <div className={styles.searchCenterer}>
          <SearchInput 
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, cédula, teléfono o mascota"
          />
        </div>
        <Button
          color={Button.COLORS.GREEN}
          size={Button.SIZES.MEDIUM}
          variant={Button.VARIANTS.OUTLINE}
          onClick={fetchClients}
          disabled={loading}
          icon={RefreshCw}
          loading={loading}
        >
          Sincronizar
        </Button>
      </div>

      <TableB
        columns={columns}
        data={filteredClients}
        loading={loading}
        error={error}
        emptyIcon={User}
        emptyMessage="No se encontraron clientes registrados en el sistema."
        onRetry={fetchClients}
        rowKey="id"
        expandable={{
          expandedRowRender
        }}
      />

      <AlertModal
        open={showPetModal}
        title="Registrar Nueva Mascota"
        onClose={() => setShowPetModal(false)}
        onConfirm={handleSavePet}
        confirmText={petSubmitting ? "Guardando..." : "Guardar Mascota"}
        cancelText="Cancelar"
      >
        <PetForm 
          petForm={petForm} 
          setPetForm={setPetForm} 
          petError={petError} 
        />
      </AlertModal>
    </GenericPanel>
  );
}