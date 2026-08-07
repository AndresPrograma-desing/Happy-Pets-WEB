import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './index.module.css';
import { sendEmails } from '../../../services/api/emails';
import Page1 from '../../Page1/Page1';
import SwitchComponent from '../../screens/components/Swich/Index';
import LoginInfo from '../../LoginInfo/LoginInfo';
import ModalTooltip from '../../ModalTooltip/ModalTooltip';
import AlertModal from '../../AlertModal/AlertModal';
import TableA from '../../screens/components/TableA';
import usePanelHeader from '../../GenericPanel/usePanelHeader';

import {
  FileText,
  RotateCw,
  HelpCircle,
  Search,
  X,
  Send,
  Ban,
  Activity,
  Edit,
  Save
} from 'lucide-react';

import DrawPanel from '../../screens/components/DrawPanel';
import MultilinePlaceholder from '../../screens/components/Material-UI/Components/MultilinePlaceholder/index';
import api from '../../../services/api';
import Button from '../../screens/components/Button';
import Badge from '../../screens/components/Badge';
import InfoTooltip from '../../screens/components/InfoTooltip';

import {
  formatDate,
  useRecetas,
  useRecetasCalculadas,
  EMAIL_TYPE_RECETA
} from '../utils';

import { TEXT_RECETAS_GESTION } from '../constants';

import SearchInput from '../../UI/Search/Search';

const RecetasHeader = React.memo(function RecetasHeader({ onRefresh, pdfOnly, onPdfToggle }) {
  return (
    <div className={styles.headerActionsWrapper}>
      <Button 
        variant="outline"
        onClick={onRefresh}
        icon={RotateCw}
        color="#475569"
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
      >
        Refrescar
      </Button>

      <div className={styles.switchWrapper}>
        <SwitchComponent value={pdfOnly} onChange={onPdfToggle} />
        <span className={styles.switchLabel}>{TEXT_RECETAS_GESTION.pdfOnlyLabel}</span>
        <InfoTooltip 
          title="Filtrar por PDF"
          content={TEXT_RECETAS_GESTION.filterPdfInfo}
        />
      </div>
    </div>
  );
});

export default function Recetas() {
  const { recetas, loading, error, load } = useRecetas();
  const [pdfOnly, setPdfOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { visibleRecetas } = useRecetasCalculadas(recetas, pdfOnly, searchTerm);

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, pdfOnly]);

  const pageCount = Math.ceil(visibleRecetas.length / itemsPerPage);
  const paginatedRecetas = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return visibleRecetas.slice(start, start + itemsPerPage);
  }, [visibleRecetas, page]);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
  const [sendingId, setSendingId] = useState(null);

  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [editRecetaText, setEditRecetaText] = useState('');
  const [savingReceta, setSavingReceta] = useState(false);

  const showAlert = useCallback(({ title, message }) => {
    setAlertConfig({ title, message });
    setAlertOpen(true);
  }, []);

  const closeAlert = () => {
    setAlertOpen(false);
    setAlertConfig({ title: '', message: '' });
  };

  const handleSendEmail = async (receta) => {
    const isUrlValid = receta.url_docx?.startsWith('http');
    if (!isUrlValid || sendingId) return;
    
    setSendingId(receta.id);
    try {
      const res = await sendEmails(receta.cita_id || receta.id, EMAIL_TYPE_RECETA);
      showAlert({
        title: 'Envío Exitoso',
        message: res?.message || TEXT_RECETAS_GESTION.sendSuccess
      });
    } catch (err) {
      console.error(err);
      showAlert({
        title: 'Fallo de Envío',
        message: err?.message || TEXT_RECETAS_GESTION.sendError
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleEditClick = (receta) => {
    setSelectedReceta(receta);
    setEditRecetaText(receta.receta || '');
    setEditPanelOpen(true);
  };

  const handleSaveReceta = async () => {
    if (!selectedReceta) return;
    setSavingReceta(true);
    try {
      await api.updateConsultaReceta(selectedReceta.id, { receta: editRecetaText });
      
      showAlert({ title: 'Éxito', message: 'Receta actualizada correctamente' });
      setEditPanelOpen(false);
      load({ force: true });
    } catch (err) {
      console.error('Error al actualizar receta:', err);
      showAlert({ title: 'Error', message: 'No se pudo actualizar la receta.' });
    } finally {
      setSavingReceta(false);
    }
  };

  const columns = [
    {
      header: 'Paciente',
      accessor: 'mascota',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#334155' }}>
            {row.mascota?.nombre || row.mascota_nombre || 'Desconocido'}
          </div>
        </div>
      )
    },
    {
      header: 'Correo',
      accessor: 'correo',
      render: (row) => (
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {row.mascota?.cliente?.correo || row.mascota?.propietario?.correo || row.correo_cliente || 'No registrado'}
        </div>
      )
    },
    {
      header: 'Fecha',
      accessor: 'fecha_consulta',
      render: (row) => (
        <div style={{ whiteSpace: 'nowrap', minWidth: '120px' }}>
          {formatDate(row.fecha_consulta || row.createdAt)}
        </div>
      )
    },
    {
      header: 'Receta / Indicaciones',
      accessor: 'receta',
      render: (row) => {
        const text = row.receta || '—';
        const maxLen = 45;
        const truncated = text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
        return (
          <div 
            style={{ color: '#64748b', fontSize: '0.9rem', cursor: 'help' }} 
            title={text}
          >
            {truncated}
          </div>
        );
      }
    },
    {
      header: 'Acciones',
      accessor: 'acciones',
      align: 'center',
      render: (row) => {
        const isUrlValid = row.url_docx?.startsWith('http');
        const isSending = sendingId === row.id;
        
        return (
          <div className={styles.actionsColumn}>
            <ModalTooltip text={isUrlValid ? 'Descargar PDF' : 'PDF no disponible'}>
              <a 
                href={isUrlValid ? row.url_docx : '#'} 
                target="_blank" 
                rel="noreferrer" 
                className={styles.linkIcon}
                style={{ 
                  background: isUrlValid ? '#e0f2fe' : '#f1f5f9', 
                  color: isUrlValid ? '#0284c7' : '#94a3b8',
                  pointerEvents: isUrlValid ? 'auto' : 'none'
                }}
              >
                <FileText size={16} />
              </a>
            </ModalTooltip>

            <ModalTooltip text="Editar receta">
              <Button
                type="button"
                onClick={() => handleEditClick(row)}
                variant="ghost"
                color="#d97706"
                circle
                icon={Edit}
                style={{ backgroundColor: '#fef3c7' }}
              />
            </ModalTooltip>

            <ModalTooltip text={!isUrlValid ? 'PDF no disponible' : isSending ? 'Enviando...' : 'Enviar por correo'}>
              <Button
                type="button"
                onClick={() => handleSendEmail(row)}
                disabled={isSending || !isUrlValid}
                variant="ghost"
                color={(!isUrlValid || isSending) ? '#94a3b8' : '#16a34a'}
                circle
                icon={Send}
                style={{ backgroundColor: (!isUrlValid || isSending) ? '#f1f5f9' : '#dcfce7' }}
              />
            </ModalTooltip>
          </div>
        );
      }
    }
  ];

  let userRole = 'doctor';
  try {
    const raw = sessionStorage.getItem('auth_login_data') || localStorage.getItem('auth_login_data');
    if (raw) {
      const data = JSON.parse(raw);
      userRole = data?.rol?.toLowerCase() || data?.user?.rol?.toLowerCase() || data?.usuario?.rol?.toLowerCase() || 'doctor';
    }
  } catch (e) {}

  usePanelHeader({
    title: TEXT_RECETAS_GESTION.title,
    message: TEXT_RECETAS_GESTION.subtitle,
    menuTitle: userRole === 'secretaria' ? 'Panel de la Secretaria' : 'Panel Médico',
    showPagination: true,
    paginationCount: pageCount,
    paginationPage: page,
    onPaginationChange: (e, v) => setPage(v)
  });

  return (
    <>
      <div className={styles.mainContainer}>
        
        <div className={styles.headerControlsContainer}>
          <div className={styles.leftControls}>
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
            <RecetasHeader onRefresh={() => load({ force: true })} pdfOnly={pdfOnly} onPdfToggle={(v) => setPdfOnly(!!v)} />
          </div>
          
          <div className={styles.rightControls}>
            <Badge 
              icon={Activity} 
              label={TEXT_RECETAS_GESTION.total} 
              value={visibleRecetas.length} 
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <TableA 
            columns={columns} 
            data={visibleRecetas} 
            keyExtractor={(row) => row.id} 
            loading={loading} 
            error={error}
            emptyIcon={Ban}
            emptyMessage={error ? 'Hubo un error al cargar las recetas.' : TEXT_RECETAS_GESTION.empty}
          />
        </div>

        {alertOpen && (
          <AlertModal open={alertOpen} title={alertConfig.title} onClose={closeAlert} onConfirm={closeAlert} confirmText="Aceptar">
            <div style={{ textAlign: 'center', padding: '1rem 0', color: '#334155', fontSize: '0.95rem' }}>
              {alertConfig.message}
            </div>
          </AlertModal>
        )}

        <DrawPanel 
          isOpen={editPanelOpen} 
          onClose={() => setEditPanelOpen(false)} 
          title="Editar Receta"
        >
          <div className={styles.editPanelContent}>
            {selectedReceta && (
              <div className={styles.editPanelHeaderInfo}>
                <p><strong>Paciente:</strong> {selectedReceta.mascota?.nombre || selectedReceta.mascota_nombre || 'Desconocido'}</p>
                <p><strong>Doctor:</strong> {selectedReceta.doctor?.nombre || selectedReceta.doctor_nombre || 'Desconocido'}</p>
              </div>
            )}
            <div className={styles.editFormGroup}>
              <MultilinePlaceholder
                label="Receta / Indicaciones"
                value={editRecetaText}
                onChange={(e) => setEditRecetaText(e.target.value)}
                rows={10}
                placeholder="Escribe la receta o indicaciones médicas"
              />
            </div>
            
            <Button
              fullWidth
              onClick={handleSaveReceta}
              disabled={savingReceta}
              icon={Save}
              color="#3b82f6"
              style={{ marginTop: '1rem' }}
            >
              Guardar Cambios
            </Button>
          </div>
        </DrawPanel>
      </div>
    </>
  );
}
