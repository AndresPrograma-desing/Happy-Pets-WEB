import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TableB from '../screens/components/TableB';
import tableStyles from '../screens/components/TableB/index.module.css';
import styles from './PanelCitas.module.css';
import { Phone, PawPrint, Calendar, Clock, Stethoscope, FileText, Trash2, XCircle, PlayCircle } from 'lucide-react';

import Button from '../screens/components/Button/index';
import Container from '../screens/components/Container/index';

function PanelCitasTable({
  listaCitas = [],
  loading = false,
  deletingId,
  renderField,
  formatDate,
  formatTime,
  getCitaId,
  onDelete,
  onCancel, // Nuevo prop para cancelar
  primaryActionLabel,
  onPrimaryAction,
  onViewHistory,
}) {
  const navigate = useNavigate();
  const columns = [
    { 
      label: 'Paciente', 
      key: 'paciente', 
      render: (row) => {
        const nombre = renderField(row, ['paciente_nombre', 'paciente']);
        const telefono = renderField(row, ['paciente_telefono', 'telefono']);
        const initial = typeof nombre === 'string' && nombre.length > 0 ? nombre.charAt(0).toUpperCase() : 'P';
        return (
          <div className={styles.clientCell}>
            <div className={styles.avatar}>{initial}</div>
            <div className={styles.clientInfo}>
              <span className={styles.clientName}>{nombre || 'Desconocido'}</span>
              <span className={styles.clientMeta}><Phone size={12} /> {telefono || 'Sin teléfono'}</span>
            </div>
          </div>
        );
      }
    },
    { 
      label: 'Mascota', 
      key: 'mascota', 
      render: (row) => {
        const mascota = renderField(row, ['mascota_nombre', 'nombre_mascota', 'mascota']);
        return (
          <div className={styles.petCell}>
            <span className={styles.petName}><PawPrint size={14} /> {mascota || 'Sin mascota'}</span>
          </div>
        );
      }
    },
    { 
      label: 'Agendamiento', 
      key: 'fecha', 
      render: (row) => {
        const fecha = formatDate(row.fecha_cita || row.fecha);
        const hora = formatTime(row.hora_cita || row.hora);
        const doctor = renderField(row, ['doctor_nombre', 'doctor']);
        return (
          <div className={styles.appointmentCell}>
            <div className={styles.dateTime}>
              <span className={styles.dateBadge}><Calendar size={12} /> {fecha}</span>
              <span className={styles.timeBadge}><Clock size={12} /> {hora}</span>
            </div>
            <span className={styles.doctorName}><Stethoscope size={12} /> {doctor || 'Sin doctor'}</span>
          </div>
        );
      }
    },
    { 
      label: 'Estado', 
      key: 'estado', 
      type: 'badge',
      badgeType: (row) => {
        const statusLabel = renderField(row, ['estado', 'status']);
        const statusNormalized = (statusLabel || '').toString().toLowerCase();
        if (statusNormalized.includes('complet')) return 'success';
        if (statusNormalized.includes('program')) return 'warning';
        if (statusNormalized.includes('asist')) return 'danger';
        return 'default';
      },
      render: (row) => renderField(row, ['estado', 'status'])
    }
  ];

  const expandedRowRender = (row) => {
    const motivo = renderField(row, ['motivo']) || 'Sin motivo especificado';
    const notas = row.notas || row.nota || '';
    const isDeleting = deletingId === getCitaId(row);

    return (
      <div className={styles.expandedContent}>
        <div className={styles.extendedDetails}>
          <div className={styles.fullDetailItem}>
            <FileText size={14} />
            <div>
              <strong>Motivo de Consulta:</strong> {motivo}
            </div>
          </div>
          {notas && (
            <div className={styles.fullDetailItem}>
              <FileText size={14} />
              <div>
                <strong>Notas adicionales:</strong> {notas}
              </div>
            </div>
          )}
        </div>

        <div className={styles.petsHeaderRow}>
          <h4 className={styles.sectionTitle}>Acciones Disponibles</h4>
          <div className={styles.actionButtonsRow}>
            <Button 
              onClick={(e) => { e.stopPropagation(); if (typeof onPrimaryAction === 'function') onPrimaryAction(row); }}
              disabled={isDeleting}
              icon={PlayCircle}
              variant="primary"
              color={Button.COLORS.PURPLE}
            >
              {primaryActionLabel || 'Empezar Consulta'}
            </Button>
            {(() => {
              const mascotaId = row.mascota_id || row.Mascotum?.id || row.mascota?.id;
              if (!mascotaId) return null;
              return (
                <Button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (typeof onViewHistory === 'function') {
                      onViewHistory(row);
                    } else {
                      navigate('/doctor/pacientes', { state: { mascotaId } }); 
                    }
                  }}
                  disabled={isDeleting}
                  icon={FileText}
                  variant="outline"
                  color={Button.COLORS.BLUE}
                >
                  Ver Historial
                </Button>
              );
            })()}
            {onCancel && (
              <Button
                onClick={(e) => { e.stopPropagation(); onCancel(row); }}
                disabled={isDeleting}
                icon={XCircle}
                variant="danger"
              >
                Cancelar Cita
              </Button>
            )}
            <Button
              onClick={(e) => { e.stopPropagation(); onDelete(row); }}
              disabled={isDeleting}
              icon={Trash2}
              variant="danger"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const pageCount = Math.ceil((listaCitas || []).length / itemsPerPage) || 1;

  return (
    <Container 
      showPagination={true}
      paginationCount={pageCount}
      paginationPage={page}
      onPaginationChange={(e, v) => setPage(v)}
      style={{ padding: 0, boxShadow: 'none', background: 'transparent' }}
    >
      <TableB
        columns={columns}
        data={listaCitas}
        loading={loading}
        rowKey={(row) => getCitaId(row)}
        emptyMessage="No hay citas registradas."
        expandable={{
          expandedRowRender,
          rowExpandable: () => true
        }}
      />
    </Container>
  );
}

export default PanelCitasTable;
