import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  Calendar, 
  User, 
  Layers, 
  Syringe, 
  FileText,
  ClipboardList,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import styles from './Index.module.css';

import GenericPanel from '../GenericPanel/GenericPanel';
import DrawPanel from '../screens/components/DrawPanel/index';
import SummaryCard from '../screens/components/SummaryCard/index';
import TableA from '../screens/components/TableA/index';
import Loading from '../screens/components/Loading/Index';
import Selector from '../screens/components/Material-UI/Components/Selector/Index';
import Button from '../screens/components/Button/index';

// API
import { getMedicalHistory, refrestMedicalHistory, getClients } from '../../services/api';

// Config & Utils
import { TEXTS } from './Constants';
import { 
  parseSuggestions, 
  formatWeight, 
  formatDateTime,
  getVacunaColumns 
} from './utils';

function HistorialMedico({ mascotaId: propMascotaId, isDrawer = false }) {
  const { state } = useLocation();
  
  // States
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  
  const [selectedPetId, setSelectedPetId] = useState(() => {
    return propMascotaId || state?.mascotaId || state?.cita?.mascota_id || '';
  });
  
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState(null);

  const [viewMode, setViewMode] = useState('info'); // 'info' or 'vacunas'
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [isIaDrawerOpen, setIsIaDrawerOpen] = useState(false);

  const switchView = (mode) => {
    setIsLoadingView(true);
    setTimeout(() => {
      setViewMode(mode);
      setIsLoadingView(false);
    }, 500);
  };

  // Sync selectedPetId with prop if it changes
  useEffect(() => {
    if (propMascotaId) {
      setSelectedPetId(propMascotaId);
    }
  }, [propMascotaId]);

  // Load clients and pets on mount
  useEffect(() => {
    async function fetchClientsData() {
      try {
        setLoadingClients(true);
        const res = await getClients(1, 1000);
        const data = Array.isArray(res) ? res : (res?.items ?? res?.Items ?? res?.data ?? res?.result ?? []);
        setClients(data);
      } catch (err) {
        console.error('Error loading clients/pets:', err);
      } finally {
        setLoadingClients(false);
      }
    }
    fetchClientsData();
  }, []);

  // Fetch medical history when selected pet changes
  useEffect(() => {
    async function fetchHistory() {
      if (!selectedPetId) {
        setHistoryData(null);
        return;
      }
      try {
        setLoadingHistory(true);
        setErrorHistory(null);
        
        // Primero llamamos al endpoint de refrescar
        await refrestMedicalHistory(selectedPetId);
        
        // Al responder OK, llamamos a getMedicalHistory
        const res = await getMedicalHistory(selectedPetId);
        setHistoryData(res);
      } catch (err) {
        console.error('Error loading medical history:', err);
        setErrorHistory(TEXTS.ERROR_TEXT);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [selectedPetId]);

  // Flatten pets list for autocomplete option mapping
  const petOptions = useMemo(() => {
    const options = [];
    clients.forEach((client) => {
      const ownerName = `${client.nombre || ''} ${client.apellido || ''}`.trim();
      if (Array.isArray(client.mascotas)) {
        client.mascotas.forEach((pet) => {
          options.push({
            value: pet.id,
            label: `${pet.nombre} (${pet.especie || ''} - Prop. ${ownerName})`
          });
        });
      }
    });
    return options;
  }, [clients]);

  // Safely extract values for JSX rendering
  const mascota = historyData?.mascota;
  const resumen = historyData?.resumen;
  const alertasRiesgo = historyData?.alertas_riesgo;
  const sugerencias = historyData?.sugerencias;
  const consultas = historyData?.consultas || [];
  const vacunas = historyData?.vacunas || [];
  const ultimoAnalisis = historyData?.ultimo_analisis;

  const suggestionsList = useMemo(() => parseSuggestions(sugerencias), [sugerencias]);

  const mainContent = (
    <div className={styles.historialContainer}>
      {/* Selector de Pacientes - Oculto si viene de un drawer con mascota precargada */}
      {(!isDrawer || !propMascotaId) && (
        <div className={styles.searchContainer}>
          <Selector
            label={TEXTS.SELECT_PET_LABEL}
            placeholder={TEXTS.SELECT_PET_PLACEHOLDER}
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            options={petOptions}
            loading={loadingClients}
          />
        </div>
      )}

      {/* Renderizado de Carga del Historial */}
      {loadingHistory ? (
        <div className={styles.loadingWrapper}>
          <Loading size='large' phrases={TEXTS.LOADING_TEXT_PHASES} />
        </div>
      ) : errorHistory ? (
        <div className={styles.errorContainer}>
          <ShieldAlert size={48} />
          <span>{errorHistory}</span>
        </div>
      ) : !selectedPetId ? (
        <div className={styles.emptyContainer}>
          <ClipboardList size={48} className={styles.emptyIcon} />
          <span>{TEXTS.NO_PET_SELECTED}</span>
        </div>
      ) : (
        <>
          {isLoadingView ? (
            <div className={styles.loadingWrapper}>
              <Loading text="Cargando sección..." />
            </div>
          ) : viewMode === 'vacunas' ? (
            <div className={styles.vacunasView}>
              <div style={{ marginBottom: '1rem' }}>
                <Button 
                  onClick={() => switchView('info')} 
                  variant="outline"
                  icon={ArrowLeft}
                >
                  Volver al Historial
                </Button>
              </div>
              <h2 className={styles.mainTitle} style={{ marginBottom: '0.5rem' }}>{TEXTS.VACUNAS_TITLE}</h2>
              <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>{TEXTS.VACUNAS_DESC}</p>
              <TableA
                columns={getVacunaColumns()}
                data={vacunas}
                keyExtractor={(row) => row.id.toString()}
                emptyMessage={TEXTS.NO_DATA}
              />
            </div>
          ) : (
            <div className={styles.infoView}>
              {/* Acciones de Navegación Superiores */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <Button 
                  onClick={() => switchView('vacunas')}
                  variant="outline" 
                  color={Button.COLORS.BLUE}
                  icon={Syringe}
                >
                  Ver {TEXTS.VACUNAS_TITLE}
                </Button>
                
                {(alertasRiesgo || suggestionsList.length > 0) && (
                  <Button 
                    onClick={() => setIsIaDrawerOpen(true)}
                    variant="outline" 
                    color={Button.COLORS.RED}
                    icon={AlertTriangle}
                  >
                    Ver Recomendaciones y Riesgos
                  </Button>
                  
                )}
                 <Button 
                    onClick={() => { console.log('click pdf'); }}
                    variant="prymary" 
                    color={Button.COLORS.GREEN}
                    icon={FileText}
                  >
                Descargar Pdf
                  </Button>
              </div>

              {/* Información General del Paciente */}
              {mascota && (
                <div className={styles.petInfoBanner}>
                  <div className={styles.petInfoHeader}>
                    <User size={32} color="#fff" />
                    <div>
                      <h2 className={styles.petInfoTitle}>{mascota.nombre}</h2>
                      <p className={styles.petInfoSubtitle}>
                        {mascota.especie || ''} • {mascota.raza || ''}
                      </p>
                    </div>
                  </div>
                  <div className={styles.petInfoGrid}>
                    <div className={styles.petInfoItem}>
                      <span className={styles.petInfoLabel}>{TEXTS.BADGE_LABELS.SEX}</span>
                      <span className={styles.petInfoValue}><Layers size={16} /> {mascota.sexo}</span>
                    </div>
                    <div className={styles.petInfoItem}>
                      <span className={styles.petInfoLabel}>{TEXTS.BADGE_LABELS.WEIGHT}</span>
                      <span className={styles.petInfoValue}><Activity size={16} /> {formatWeight(mascota.peso)}</span>
                    </div>
                    <div className={styles.petInfoItem}>
                      <span className={styles.petInfoLabel}>{TEXTS.BADGE_LABELS.BIRTHDATE}</span>
                      <span className={styles.petInfoValue}><Calendar size={16} /> {mascota.fecha_nacimiento}</span>
                    </div>
                    <div className={styles.petInfoItem}>
                      <span className={styles.petInfoLabel}>{TEXTS.BADGE_LABELS.ALLERGIES}</span>
                      <span className={styles.petInfoValue}><ShieldAlert size={16} /> {mascota.alergias}</span>
                    </div>
                    <div className={styles.petInfoItem}>
                      <span className={styles.petInfoLabel}>{TEXTS.BADGE_LABELS.CONDITIONS}</span>
                      <span className={styles.petInfoValue}><FileText size={16} /> {mascota.condiciones_medicas}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnósticos e Insights de IA */}
              <SummaryCard 
                title={TEXTS.IA_SUMMARY_TITLE} 
                text={resumen || TEXTS.NO_DATA} 
                enableCopy={true}
              />

              {ultimoAnalisis && (
                <div className={styles.analysisTime}>
                  <span>{TEXTS.LAST_ANALYSIS} {formatDateTime(ultimoAnalisis)}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Drawer de IA */}
          <DrawPanel 
            isOpen={isIaDrawerOpen} 
            onClose={() => setIsIaDrawerOpen(false)} 
            title="Recomendaciones y Riesgos"
          >
            <div style={{ padding: '1rem' }} className={styles.iaDetails}>
              {alertasRiesgo && (
                <div className={styles.riskAlertsCard}>
                  <div className={styles.alertHeader}>
                    <ShieldAlert size={18} className={styles.alertIcon} />
                    <h4>{TEXTS.IA_ALERTS_TITLE}</h4>
                  </div>
                  <p className={styles.alertText}>{alertasRiesgo}</p>
                </div>
              )}

              {suggestionsList.length > 0 && (
                <div className={styles.suggestionsCard}>
                  <h4>{TEXTS.IA_SUGGESTIONS_TITLE}</h4>
                  <ul className={styles.suggestionsList}>
                    {suggestionsList.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DrawPanel>
        </>
      )}
    </div>
  );

  if (isDrawer) {
    return mainContent;
  }

  return (
    <GenericPanel
      menuTitle={TEXTS.MENU_TITLE}
      title={TEXTS.TITLE}
      message={TEXTS.MESSAGE}
      role="doctor"
    >
      {mainContent}
    </GenericPanel>
  );
}

export default HistorialMedico;
