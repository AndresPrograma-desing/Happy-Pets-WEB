import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Index.module.css';

// Reusing existing components per your instructions
import Container from '../src/components/screens/components/Container/index';
import Button from '../src/components/screens/components/Button/index';
import SearchInput from '../src/components/UI/Search/Search';
import TableA from '../src/components/screens/components/TableA';
import Barnner from '../src/components/screens/components/Barnner';
import Loading from '../src/components/screens/components/Loading/Index';
import ContactsPanel from './Components/ContactsPanel/Index.jsx';
import AsistentChat from './Components/AsistentChat/Index.jsx';

// Icons
import { Search, PawPrint, Calendar, FileText, BookUser } from 'lucide-react';

// Texts
import { TEXT_PORTAL } from './Constants';

// API and utilities
import api from '../src/services/api/index';
import ClientPanel from './Components/ClientsPanel/ClientPanel.jsx';
import { isDummyModeActive } from '../config/config';
import { calculateAge, formatDate, formatHour } from './utils';

export default function PortalClientes() {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  // Real data state
  const [clientName, setClientName] = useState('');
  const [mascotas, setMascotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [activeTab, setActiveTab] = useState('pets'); // 'pets', 'appointments', 'recipes'
  const [verifiedIdentifier, setVerifiedIdentifier] = useState(null);
  const [searchError, setSearchError] = useState('');

  const clientMenuItems = [
    {
      id: 'pets',
      label: 'Mis Mascotas',
      icon: <PawPrint size={18} />
    },
    {
      id: 'appointments',
      label: 'Mis Citas',
      icon: <Calendar size={18} />
    },
    {
      id: 'recipes',
      label: 'Mis Recetas',
      icon: <FileText size={18} />
    }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('auth_login_data');
    localStorage.removeItem('auth_login_data');
    setSearched(false);
    setSearchValue('');
    setSearchError('');
    setMascotas([]);
    setCitas([]);
    setRecetas([]);
    setClientName('');
    setActiveTab('pets');
    setVerifiedIdentifier(null);
    navigate('/portal-cliente');
  };

  // Única fuente de datos del portal: valida el identificador (cédula/email) y arma
  // toda la información del cliente a partir de ahí, sin volver a pedir el mismo dato.
  const loadPortalData = async (identifier) => {
    const basicInfo = await api.getClientPortalData(identifier);
    if (!basicInfo || !basicInfo.id) {
      throw new Error(TEXT_PORTAL.security.errorMessage);
    }

    // Endpoint real de mascotas del cliente — /Clients/validate solo se usa para
    // validar la identidad del cliente, no como fuente de datos de sus mascotas.
    const clientPetsResponse = await api.getClientMascotas(basicInfo.id);
    const clientPets = Array.isArray(clientPetsResponse) ? clientPetsResponse : (clientPetsResponse?.data ?? clientPetsResponse?.result ?? []);

    let detailedMascotas = [];
    let gatheredRecetas = [];

    if (clientPets && clientPets.length > 0) {
      const historyPromises = clientPets.map(pet =>
        api.getMedicalHistory(pet.id).catch(err => {
          console.error(`Error loading history for pet ${pet.id}:`, err);
          return null;
        })
      );
      const histories = await Promise.all(historyPromises);

      clientPets.forEach((pet, idx) => {
        const h = histories[idx];
        const petObj = {
          id: pet.id,
          nombre: pet.nombre,
          especie: pet.especie || '—',
          raza: pet.raza || '—',
          fechaNacimiento: pet.fecha_nacimiento || null,
          color: pet.color || '—'
        };
        detailedMascotas.push(petObj);

        if (h?.consultas) {
          h.consultas.forEach(c => {
            if (c.receta && c.receta.trim() !== '') {
              gatheredRecetas.push({
                id: c.id,
                fecha: c.fecha_consulta || c.createdAt,
                mascota: petObj.nombre,
                doctor: c.doctor_nombre,
                prescripcion: c.receta
              });
            }
          });
        }
      });
    }

    let gatheredCitas = [];
    try {
      const citasResponse = await api.getCitasByCliente(basicInfo.id);
      const rawCitas = Array.isArray(citasResponse) ? citasResponse : (citasResponse?.data ?? citasResponse?.result ?? []);
      gatheredCitas = rawCitas.map(app => ({
        id: app.id,
        mascota: app.mascota_name || 'Mascota',
        fecha: app.fecha_cita,
        hora: app.hora_cita,
        motivo: app.motivo,
        estado: app.estado
      }));
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }

    setMascotas(detailedMascotas);
    setCitas(gatheredCitas);
    setRecetas(gatheredRecetas);
    setClientName(`${basicInfo.nombre || ''} ${basicInfo.apellido || ''}`.trim());

    return basicInfo;
  };

  useEffect(() => {
    const checkCachedClient = async () => {
      try {
        const raw = sessionStorage.getItem('auth_login_data') || localStorage.getItem('auth_login_data');
        if (raw) {
          const sessionData = JSON.parse(raw);
          const userRole = (sessionData?.rol || sessionData?.role ||
                            sessionData?.user?.rol || sessionData?.user?.role ||
                            sessionData?.usuario?.rol || sessionData?.usuario?.role || '').toLowerCase();

          if (userRole === 'client' || userRole === 'cliente') {
            const identifier = sessionData?.email || sessionData?.correo ||
              sessionData?.identificacion || sessionData?.cedula ||
              sessionData?.user?.email || sessionData?.user?.correo ||
              sessionData?.user?.identificacion || sessionData?.user?.cedula ||
              sessionData?.usuario?.email || sessionData?.usuario?.correo ||
              sessionData?.usuario?.identificacion || sessionData?.usuario?.cedula;

            if (identifier) {
              setInitialLoading(true);
              const trimmedIdentifier = identifier.trim();
              const basicInfo = await loadPortalData(trimmedIdentifier);
              if (basicInfo) {
                setVerifiedIdentifier(trimmedIdentifier);
                setSearched(true);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading client session from cache:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    checkCachedClient();
  }, []);

  // Fetch updated data when switching tabs for real-time syncing
  useEffect(() => {
    if (searched && verifiedIdentifier) {
      loadPortalData(verifiedIdentifier).catch(err => {
        console.error('Error refreshing portal data on tab change:', err);
      });
    }
  }, [activeTab]);

  const handleSearch = async () => {
    if (!searchValue.trim() || loading) return;
    setSearchError('');
    setLoading(true);

    try {
      const identifier = searchValue.trim();
      await loadPortalData(identifier);
      setVerifiedIdentifier(identifier);
      setSearched(true);
    } catch (error) {
      console.error('Error loading portal data:', error);
      setSearchError(error.message || TEXT_PORTAL.security.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columnsMascotas = [
    { header: 'Nombre', render: (row) => <strong style={{ color: '#0f172a' }}>{row.nombre}</strong> },
    { header: 'Especie', accessor: 'especie' },
    { header: 'Raza', accessor: 'raza' },
    { header: 'Edad', render: (row) => row.edad || calculateAge(row.fechaNacimiento) }
  ];

  const columnsCitas = [
    { header: 'Mascota', render: (row) => <strong style={{ color: '#0f172a' }}>{row.mascota || row.mascota_nombre}</strong> },
    { header: 'Fecha', render: (row) => formatDate(row.fecha || row.fecha_cita) },
    { header: 'Hora', render: (row) => formatHour(row.hora || row.hora_cita) },
    { header: 'Motivo', accessor: 'motivo' },
    {
      header: 'Estado',
      render: (row) => (
        <Barnner type={(row.estado === 'Completada' || row.estado?.toLowerCase() === 'completada') ? 'success' : 'warning'}>
          {row.estado}
        </Barnner>
      )
    }
  ];

  const columnsRecetas = [
    { header: 'Fecha', render: (row) => formatDate(row.fecha || row.fecha_consulta || row.createdAt) },
    { header: 'Mascota', render: (row) => <strong style={{ color: '#0f172a' }}>{row.mascota || row.mascota_nombre}</strong> },
    { header: 'Doctor', render: (row) => row.doctor || row.doctor_nombre || '—' },
    { header: 'Prescripción', render: (row) => row.prescripcion || row.receta || '—' }
  ];

  if (searched) {
    return (
      <ClientPanel
        menuTitle="Portal Clientes"
        title={`Bienvenido, ${clientName}`}
        message="Consulta el estado de tus mascotas, citas y recetas."
        menuItems={clientMenuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      >
        <div className={styles.resultsSection}>
          {activeTab === 'pets' && (
            <div>
              <h2 className={styles.sectionTitle}>
                <PawPrint size={24} color="#0ea5e9" />
                {TEXT_PORTAL.tabs.pets}
              </h2>
              <TableA
                columns={columnsMascotas}
                data={mascotas}
                keyExtractor={(row) => row.id}
              />
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h2 className={styles.sectionTitle}>
                <Calendar size={24} color="#f59e0b" />
                {TEXT_PORTAL.tabs.appointments}
              </h2>
              <TableA
                columns={columnsCitas}
                data={citas}
                keyExtractor={(row) => row.id}
              />
            </div>
          )}

          {activeTab === 'recipes' && (
            <div>
              <h2 className={styles.sectionTitle}>
                <FileText size={24} color="#10b981" />
                {TEXT_PORTAL.tabs.recipes}
              </h2>
              <TableA
                columns={columnsRecetas}
                data={recetas}
                keyExtractor={(row) => row.id}
              />
            </div>
          )}
        </div>
        <AsistentChat />
      </ClientPanel>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {initialLoading && (
        <div className={styles.fullPageLoader}>
          <Loading size="giant" text="Cargando Portal del Cliente..." />
        </div>
      )}

      <Container className={styles.portalContainer} showPagination={false}>
        <div className={styles.topBar}>
          <Button
            variant="ghost"
            color={Button.COLORS.BLUE}
            icon={BookUser}
            onClick={() => setShowContacts(true)}
          >
            {TEXT_PORTAL.contacts.buttonLabel}
          </Button>
        </div>

        {isDummyModeActive() && (
          <div className={styles.mockBanner}>
            Modo Maqueta: La búsqueda es simulada y los datos mostrados son de prueba.
          </div>
        )}

        <div className={styles.header}>
          <img src="/HappyPetsLogo.png" alt="Happy Pets Logo" className={styles.logo} />
          <h1 className={styles.title}>{TEXT_PORTAL.title}</h1>
          <p className={styles.subtitle}>{TEXT_PORTAL.subtitle}</p>
        </div>

        {searchError && (
          <div style={{ maxWidth: '700px', margin: '0 auto 1.5rem auto' }}>
            <Barnner type="danger">{searchError}</Barnner>
          </div>
        )}

        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder={TEXT_PORTAL.searchPlaceholder}
              onSearch={handleSearch}
              className={styles.searchInput}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleSearch}
            variant={Button.VARIANTS.PRIMARY}
            color={Button.COLORS.BLUE}
            icon={Search}
            className={styles.searchButton}
            disabled={loading}
          >
            {TEXT_PORTAL.searchButton}
          </Button>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
            <Loading size="medium" phrases={['Validando identificación...', 'Cargando información...']} />
          </div>
        )}
      </Container>

      <ContactsPanel
        isOpen={showContacts}
        onClose={() => setShowContacts(false)}
      />

      <AsistentChat />
    </div>
  );
}
