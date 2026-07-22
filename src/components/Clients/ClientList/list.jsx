import React, { useState, useEffect, useMemo } from 'react';
import { getClients, createPetForExistingClient, deleteClient, updateClient, updatePet, deletePet } from '../../../services/api';
import SearchInput from '../../UI/Search/Search';
import AlertModal from '../../../components/AlertModal/AlertModal';
import PetForm from './form/addpetsForm';
import DrawPanel from '../../screens/components/DrawPanel';
import styles from './List.module.css';
import { INITIAL_PET_FORM, preparePetPayload } from './utils';
import GenericPanel from '../../GenericPanel/GenericPanel';
import TableB from '../../screens/components/TableB';
import Button from '../../screens/components/Button/index.jsx';
import Barnner from '../../screens/components/Barnner';
import MenuPopover from '../../screens/components/Material-UI/Components/MenuPopover/index.jsx';
import ErrorMessage from '../../Notification/Error/ErrorMessage.jsx';
import Input from '../../screens/components/Input/Index.jsx';
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
  Plus,
  Trash2,
  Settings,
  Pencil
} from 'lucide-react';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // State for Add Pet
  const [showPetModal, setShowPetModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [petForm, setPetForm] = useState(INITIAL_PET_FORM);
  const [petSubmitting, setPetSubmitting] = useState(false);
  const [petError, setPetError] = useState('');

  // State for Edit Client
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    identificacion: '',
    nota: ''
  });
  const [clientSubmitting, setClientSubmitting] = useState(false);
  const [clientEditError, setClientEditError] = useState('');
  const [clientEditSuccess, setClientEditSuccess] = useState(undefined);

  // State for Edit Pet
  const [showEditPetModal, setShowEditPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [editPetForm, setEditPetForm] = useState(INITIAL_PET_FORM);
  const [editPetSubmitting, setEditPetSubmitting] = useState(false);
  const [editPetError, setEditPetError] = useState('');
  const [editPetSuccess, setEditPetSuccess] = useState(undefined);

  // State for Delete Client
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State for Delete Pet
  const [showDeletePetModal, setShowDeletePetModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [deletePetLoading, setDeletePetLoading] = useState(false);

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

  // --- Add Pet ---
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

  // --- Edit Client ---
  const handleOpenEditClient = (client) => {
    setSelectedClient(client);
    setClientForm({
      nombre: client.nombre || '',
      apellido: client.apellido || '',
      email: client.email || '',
      telefono: client.telefono || '',
      direccion: client.direccion || '',
      identificacion: client.identificacion || '',
      nota: client.nota || ''
    });
    setClientEditError('');
    setClientEditSuccess(undefined);
    setShowEditClientModal(true);
  };

  const handleSaveEditClient = async () => {
    if (!clientForm.nombre || !clientForm.apellido || !clientForm.email) {
      setClientEditError('Nombre, Apellido y Email son campos obligatorios.');
      return;
    }
    setClientSubmitting(true);
    setClientEditSuccess(false);
    setClientEditError('');
    try {
      const payload = {
        nombre: clientForm.nombre.trim(),
        apellido: clientForm.apellido.trim(),
        email: clientForm.email.trim(),
        telefono: clientForm.telefono?.trim() || null,
        direccion: clientForm.direccion?.trim() || null,
        identificacion: clientForm.identificacion?.trim() || null,
        nota: clientForm.nota?.trim() || null
      };
      await updateClient(selectedClient.id, payload);
      setClientEditSuccess(true);
      setClientEditError('¡Datos del cliente actualizados con éxito!');
      await fetchClients();
      setTimeout(() => {
        setShowEditClientModal(false);
      }, 1200);
    } catch (err) {
      setClientEditSuccess(undefined);
      setClientEditError(err?.message || 'No se pudieron guardar los cambios del cliente');
    } finally {
      setClientSubmitting(false);
    }
  };

  // --- Edit Pet ---
  const handleOpenEditPet = (pet) => {
    setSelectedPet(pet);
    setEditPetForm({
      nombre: pet.nombre || '',
      especie: pet.especie || '',
      raza: pet.raza || '',
      color: pet.color || '',
      sexo: pet.sexo || '',
      fechaNacimiento: pet.fechaNacimiento ? pet.fechaNacimiento.split('T')[0] : '',
      peso: pet.peso || '',
      identeficacionMascota: pet.identeficacionMascota || '',
      alergias: pet.alergias || '',
      condicionesMedicas: pet.condicionesMedicas || '',
      esterilizado: Boolean(pet.esterilizado)
    });
    setEditPetError('');
    setEditPetSuccess(undefined);
    setShowEditPetModal(true);
  };

  const handleSaveEditPet = async () => {
    if (!editPetForm.nombre || !editPetForm.especie || !editPetForm.sexo) {
      setEditPetError('Nombre, Especie y Sexo son campos obligatorios.');
      return;
    }
    setEditPetSubmitting(true);
    setEditPetSuccess(false);
    setEditPetError('');
    try {
      const payload = {
        nombre: editPetForm.nombre.trim(),
        especie: editPetForm.especie.trim(),
        raza: editPetForm.raza?.trim() || null,
        color: editPetForm.color?.trim() || null,
        sexo: editPetForm.sexo.trim(),
        fecha_nacimiento: editPetForm.fechaNacimiento || null,
        peso: editPetForm.peso ? Number(editPetForm.peso) : null,
        identeficacion_mascota: editPetForm.identeficacionMascota?.trim() || null,
        alergias: editPetForm.alergias?.trim() || 'Ninguna',
        condiciones_medicas: editPetForm.condicionesMedicas?.trim() || 'Sano',
        esterilizado: Boolean(editPetForm.esterilizado)
      };
      await updatePet(selectedPet.id, payload);
      setEditPetSuccess(true);
      setEditPetError('¡Datos de la mascota actualizados con éxito!');
      await fetchClients();
      setTimeout(() => {
        setShowEditPetModal(false);
      }, 1200);
    } catch (err) {
      setEditPetSuccess(undefined);
      setEditPetError(err?.message || 'No se pudieron guardar los cambios de la mascota');
    } finally {
      setEditPetSubmitting(false);
    }
  };

  // --- Delete Client ---
  const handleOpenDeleteClient = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteClient(clientToDelete.id);
      setShowDeleteModal(false);
      setClientToDelete(null);
      await fetchClients();
    } catch (err) {
      setError(err?.message || 'Error al eliminar el cliente');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenDeletePet = (pet) => {
    setPetToDelete(pet);
    setShowDeletePetModal(true);
  };

  const handleConfirmDeletePet = async () => {
    if (!petToDelete) return;
    setDeletePetLoading(true);
    try {
      await deletePet(petToDelete.id);
      setShowDeletePetModal(false);
      setPetToDelete(null);
      await fetchClients();
    } catch (err) {
      setError(err?.message || 'Error al eliminar la mascota');
      setShowDeletePetModal(false);
    } finally {
      setDeletePetLoading(false);
    }
  };

  // --- Menu Popover Builder ---
  const getMenuActionsItem = (client) => {
    const subItems = [
      {
        label: 'Añadir Paciente',
        onClick: () => handleOpenAddPet(client.id)
      },
      {
        label: 'Editar Cliente',
        onClick: () => handleOpenEditClient(client)
      }
    ];

    if (client.mascotas && client.mascotas.length > 0) {
      client.mascotas.forEach(pet => {
        subItems.push({
          label: `Editar Mascota (${pet.nombre})`,
          onClick: () => handleOpenEditPet(pet)
        });
        subItems.push({
          label: `Eliminar Mascota (${pet.nombre})`,
          onClick: () => handleOpenDeletePet(pet)
        });
      });
    }

    subItems.push({
      label: 'Eliminar Cliente',
      onClick: () => handleOpenDeleteClient(client)
    });

    return {
      label: 'Acciones',
      icon: Settings,
      subItems
    };
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <MenuPopover 
              item={getMenuActionsItem(client)} 
              styles={styles} 
              renderIcon={(icon, css) => <Settings size={16} className={css} />} 
              onNavigate={(subItem) => {
                if (subItem.onClick) subItem.onClick();
              }} 
            />
          </div>
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
                  <Button
                    variant={Button.VARIANTS.GHOST}
                    size={Button.SIZES.SMALL}
                    onClick={() => handleOpenEditPet(pet)}
                    icon={Pencil}
                    title="Editar datos de esta mascota"
                  >
                    Editar
                  </Button>
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
      role="admin"
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
        data={paginatedClients}
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

      {/* DrawPanel: Agregar Mascota */}
      <DrawPanel
        isOpen={showPetModal}
        title="Registrar Nueva Mascota"
        onClose={() => setShowPetModal(false)}
        showActions={true}
        onConfirm={handleSavePet}
        confirmText={petSubmitting ? "Guardando..." : "Guardar Mascota"}
        cancelText="Cancelar"
        loading={petSubmitting}
      >
        <PetForm 
          petForm={petForm} 
          setPetForm={setPetForm} 
          petError={petError} 
        />
      </DrawPanel>

      {/* DrawPanel: Editar Cliente */}
      <DrawPanel
        isOpen={showEditClientModal}
        title="Editar Datos del Cliente"
        onClose={() => setShowEditClientModal(false)}
        showActions={true}
        onConfirm={handleSaveEditClient}
        confirmText="Guardar Cambios"
        cancelText="Cancelar"
        loading={clientSubmitting}
        success={clientEditSuccess}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
          {clientEditError && (
            <ErrorMessage 
              title={clientEditSuccess ? "¡Actualización Exitosa!" : "Atención"} 
              message={clientEditError} 
              variant={clientEditSuccess ? "success" : "danger"} 
            />
          )}
          <Input 
            label="Nombre" 
            value={clientForm.nombre} 
            onChange={(e) => setClientForm(prev => ({ ...prev, nombre: e.target.value }))} 
            required 
          />
          <Input 
            label="Apellido" 
            value={clientForm.apellido} 
            onChange={(e) => setClientForm(prev => ({ ...prev, apellido: e.target.value }))} 
            required 
          />
          <Input 
            label="Correo Electrónico" 
            value={clientForm.email} 
            onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))} 
            required 
          />
          <Input 
            label="Teléfono" 
            value={clientForm.telefono} 
            onChange={(e) => setClientForm(prev => ({ ...prev, telefono: e.target.value }))} 
          />
          <Input 
            label="Identificación / Cédula" 
            value={clientForm.identificacion} 
            onChange={(e) => setClientForm(prev => ({ ...prev, identificacion: e.target.value }))} 
          />
          <Input 
            label="Dirección" 
            value={clientForm.direccion} 
            onChange={(e) => setClientForm(prev => ({ ...prev, direccion: e.target.value }))} 
          />
          <Input 
            label="Notas Internas" 
            value={clientForm.nota} 
            onChange={(e) => setClientForm(prev => ({ ...prev, nota: e.target.value }))} 
          />
        </div>
      </DrawPanel>

      {/* DrawPanel: Editar Mascota */}
      <DrawPanel
        isOpen={showEditPetModal}
        title={`Editar Mascota - ${selectedPet?.nombre || ''}`}
        onClose={() => setShowEditPetModal(false)}
        showActions={true}
        onConfirm={handleSaveEditPet}
        confirmText="Guardar Cambios"
        cancelText="Cancelar"
        loading={editPetSubmitting}
        success={editPetSuccess}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
          {editPetError && (
            <ErrorMessage 
              title={editPetSuccess ? "¡Actualización Exitosa!" : "Atención"} 
              message={editPetError} 
              variant={editPetSuccess ? "success" : "danger"} 
            />
          )}
          <PetForm 
            petForm={editPetForm} 
            setPetForm={setEditPetForm} 
            petError="" 
          />
        </div>
      </DrawPanel>

      <AlertModal
        open={showDeleteModal}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar al cliente ${clientToDelete?.nombre} ${clientToDelete?.apellido}?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
        confirmText={deleteLoading ? "Eliminando..." : "Eliminar"}
        cancelText="Cancelar"
      />

      <AlertModal
        open={showDeletePetModal}
        title="Confirmar eliminación de mascota"
        message={`¿Estás seguro de que deseas eliminar la mascota ${petToDelete?.nombre}? Se eliminará permanentemente su historial clínico, citas y consultas asociadas.`}
        onConfirm={handleConfirmDeletePet}
        onClose={() => setShowDeletePetModal(false)}
        confirmText={deletePetLoading ? "Eliminando..." : "Eliminar"}
        cancelText="Cancelar"
      />
    </GenericPanel>
  );
}