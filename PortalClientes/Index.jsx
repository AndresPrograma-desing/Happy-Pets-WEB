import React, { useState, useEffect } from 'react';
import styles from './Index.module.css';

// Reusing existing components per your instructions
import Container from '../src/components/screens/components/Container/index';
import Button from '../src/components/screens/components/Button/index';
import SearchInput from '../src/components/UI/Search/Search';
import TableA from '../src/components/screens/components/TableA';
import Barnner from '../src/components/screens/components/Barnner';
import Loading from '../src/components/screens/components/Loading/Index';
import ContactsPanel from './Components/ContactsPanel/Index.jsx';
import Frame from '../src/components/screens/components/Frame/Index';
import Input from '../src/components/screens/components/Input/Index';

// Icons
import { Search, PawPrint, Calendar, FileText, User, BookUser, ShieldCheck } from 'lucide-react';

// Texts
import { TEXT_PORTAL } from './Constants';

// Mock Data
const mockMascotas = [
  { id: 1, nombre: 'Max', especie: 'Perro', raza: 'Golden Retriever', edad: '3 años' },
  { id: 2, nombre: 'Luna', especie: 'Gato', raza: 'Siamés', edad: '1 año' }
];

const mockCitas = [
  { id: 1, mascota: 'Max', fecha: '2024-05-15', hora: '10:00 AM', motivo: 'Vacunación', estado: 'Completada' },
  { id: 2, mascota: 'Luna', fecha: '2024-06-20', hora: '03:30 PM', motivo: 'Chequeo General', estado: 'Pendiente' }
];

const mockRecetas = [
  { id: 1, mascota: 'Max', fecha: '2024-05-15', doctor: 'Dr. Ramírez', diagnostico: 'Saludable', prescripcion: 'Vitamina C, 1 pastilla diaria por 30 días.' }
];

export default function PortalClientes() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  
  // Security check state
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);
  const [petColor, setPetColor] = useState('');
  const [securityError, setSecurityError] = useState('');

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    setSearched(false);
    setSecurityError('');
    setPetColor('');
    
    // Simulate finding the user, but we ask for security first
    setShowSecurityCheck(true);
  };

  const handleVerifySecurity = (e) => {
    e.preventDefault();
    if (petColor.trim().length < 3) {
      setSecurityError(TEXT_PORTAL.security.errorMessage);
      return;
    }
    
    // Mock successful verification
    setSecurityError('');
    setShowSecurityCheck(false);
    setLoading(true);

    // Simulate API fetch latency after passing security
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
    }, 1500);
  };

  const columnsMascotas = [
    { header: 'Nombre', render: (row) => <strong style={{color: '#0f172a'}}>{row.nombre}</strong> },
    { header: 'Especie', key: 'especie' },
    { header: 'Raza', key: 'raza' },
    { header: 'Edad', key: 'edad' }
  ];

  const columnsCitas = [
    { header: 'Mascota', render: (row) => <strong style={{color: '#0f172a'}}>{row.mascota}</strong> },
    { header: 'Fecha', key: 'fecha' },
    { header: 'Hora', key: 'hora' },
    { header: 'Motivo', key: 'motivo' },
    { 
      header: 'Estado', 
      render: (row) => (
        <Barnner type={row.estado === 'Completada' ? 'success' : 'warning'}>
          {row.estado}
        </Barnner>
      )
    }
  ];

  const columnsRecetas = [
    { header: 'Fecha', key: 'fecha' },
    { header: 'Mascota', render: (row) => <strong style={{color: '#0f172a'}}>{row.mascota}</strong> },
    { header: 'Doctor', key: 'doctor' },
    { header: 'Prescripción', key: 'prescripcion' }
  ];

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

        <div className={styles.mockBanner}>
          Modo Maqueta: La búsqueda es simulada y los datos mostrados son de prueba.
        </div>

        <div className={styles.header}>
          <img src="/HappyPetsLogo.png" alt="Happy Pets Logo" className={styles.logo} />
          <h1 className={styles.title}>{TEXT_PORTAL.title}</h1>
          <p className={styles.subtitle}>{TEXT_PORTAL.subtitle}</p>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <SearchInput 
              value={searchValue}
              onChange={setSearchValue}
              placeholder={TEXT_PORTAL.searchPlaceholder}
              onSearch={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <Button 
            onClick={handleSearch}
            variant={Button.VARIANTS.PRIMARY}
            color={Button.COLORS.BLUE}
            icon={Search}
            className={styles.searchButton}
          >
            Buscar Información
          </Button>
        </div>

        {showSecurityCheck && !loading && !searched && (
          <Frame 
            isModal={true}
            title={TEXT_PORTAL.security.title}
            content={TEXT_PORTAL.security.content}
            icon={<ShieldCheck size={24} color="#0ea5e9" />}
            error={securityError}
          >
            <form onSubmit={handleVerifySecurity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <Input 
                type="text"
                required
                label={TEXT_PORTAL.security.inputLabel}
                placeholder={TEXT_PORTAL.security.inputPlaceholder}
                value={petColor}
                onChange={(e) => setPetColor(e.target.value)}
              />
              <Button 
                type="submit"
                variant={Button.VARIANTS.PRIMARY}
                color={Button.COLORS.BLUE}
                fullWidth
                style={{ justifyContent: 'center' }}
              >
                {TEXT_PORTAL.security.verifyButton}
              </Button>
            </form>
          </Frame>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
            <Loading size="large" phrases={[TEXT_PORTAL.searching]} />
          </div>
        )}

        {searched && !loading && (
          <div className={styles.resultsSection}>
            <div>
              <h2 className={styles.sectionTitle}>
                <PawPrint size={24} color="#0ea5e9" /> 
                {TEXT_PORTAL.tabs.pets}
              </h2>
              <TableA 
                columns={columnsMascotas}
                data={mockMascotas}
                keyExtractor={(row) => row.id}
              />
            </div>

            <div>
              <h2 className={styles.sectionTitle}>
                <Calendar size={24} color="#f59e0b" /> 
                {TEXT_PORTAL.tabs.appointments}
              </h2>
              <TableA 
                columns={columnsCitas}
                data={mockCitas}
                keyExtractor={(row) => row.id}
              />
            </div>

            <div>
              <h2 className={styles.sectionTitle}>
                <FileText size={24} color="#10b981" /> 
                {TEXT_PORTAL.tabs.recipes}
              </h2>
              <TableA 
                columns={columnsRecetas}
                data={mockRecetas}
                keyExtractor={(row) => row.id}
              />
            </div>
          </div>
        )}
      </Container>

      <ContactsPanel 
        isOpen={showContacts} 
        onClose={() => setShowContacts(false)} 
      />
    </div>
  );
}
