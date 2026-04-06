import React from 'react';
import styles from './PanelCitas.module.css';

function PanelCitasTable({
  listaCitas = [],
  deletingId,
  renderField,
  formatDate,
  formatTime,
  getCitaId,
  onDelete,
  primaryActionLabel,
  onPrimaryAction,
}) {
  if (!Array.isArray(listaCitas) || !listaCitas.length) {
    return <div className={styles.empty}>No hay citas registradas.</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.excelTable}>
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Teléfono</th>
            <th>Mascota</th>
            <th>Doctor</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {listaCitas.map((cita, index) => {
            const citaId = getCitaId(cita);
            const isDeleting = deletingId === citaId;

            const statusLabel = renderField(cita, ['estado', 'status']);
            const statusNormalized = (statusLabel || '').toString().toLowerCase();

            let statusClass = styles.defaultStatus;
            if (statusNormalized.includes('complet')) statusClass = styles.completed;
            else if (statusNormalized.includes('program')) statusClass = styles.scheduled;
            else if (statusNormalized.includes('asist')) statusClass = styles.noAsistida;

            const primaryHandler = () => {
              if (typeof onPrimaryAction === 'function') return onPrimaryAction(cita);
            };

            const primaryLabel = primaryActionLabel || 'Empezar consulta';

            return (
              <tr key={citaId ?? index}>
                <td>{renderField(cita, ['paciente_nombre', 'paciente'])}</td>
                <td>{renderField(cita, ['paciente_telefono', 'telefono'])}</td>
                <td>{renderField(cita, ['mascota_nombre', 'nombre_mascota', 'mascota'])}</td>
                <td>{renderField(cita, ['doctor_nombre', 'doctor'])}</td>
                <td>{formatDate(cita.fecha_cita || cita.fecha)}</td>
                <td>{formatTime(cita.hora_cita || cita.hora)}</td>
                <td>{renderField(cita, ['motivo'])}</td>
                <td>
                  <span className={`${styles.statusBadge} ${statusClass}`}>{statusLabel}</span>
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.buttonWrapper}>
                    <button className={styles.startButton} onClick={primaryHandler} disabled={isDeleting}>
                      {isDeleting ? '...' : primaryLabel}
                    </button>
                    <button className={styles.deleteButton} onClick={() => onDelete(cita)} disabled={isDeleting}>
                      {isDeleting ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PanelCitasTable;
