import React from 'react';
import ModalTooltip from '../ModalTooltip/ModalTooltip';
import Button from '../screens/components/Button';
import Barnner from '../screens/components/Barnner';
import { Download, FileText, FilePlus } from 'lucide-react';
import { TEXT_FACTURAS } from './constants';
import styles from './FacturaDowloader.module.css';

export function getFacturaColumns({
  generatingId,
  invoiceUrls,
  handleFileDownload,
  handleGenerate,
  setPreviewIframeUrl,
  setPreviewInvoice,
  setPreviewCitaId,
  setPreviewOpen
}) {
  return [
    {
      header: 'FECHA Y HORA',
      key: 'date',
      width: '15%',
      render: (cita) => (
        <div className={styles.dateCell}>
          {cita.fecha_cita}
          <small>{cita.hora_cita}</small>
        </div>
      )
    },
    {
      header: 'CLIENTE',
      key: 'client',
      width: '20%',
      render: (cita) => (
        <div className={styles.clientCell}>
          <strong>{cita.Mascotum?.Cliente?.nombre} {cita.Mascotum?.Cliente?.apellido}</strong>
          <div className={styles.clientPhone}>{cita.Mascotum?.Cliente?.telefono}</div>
        </div>
      )
    },
    {
      header: 'MASCOTA',
      key: 'pet',
      width: '15%',
      render: (cita) => (
        <div className={styles.petCell}>
          <strong>{cita.Mascotum?.nombre}</strong>
          <small>{cita.Mascotum?.raza}</small>
        </div>
      )
    },
    {
      header: 'DOCTOR',
      key: 'doctor',
      width: '15%',
      render: (cita) => <span className={styles.doctorCell}>Dr. {cita.doctor?.nombre}</span>
    },
    {
      header: 'ESTADO',
      key: 'estado',
      width: '10%',
      render: (cita) => {
        const s = String(cita.estado || '').toLowerCase();
        let type = 'default';
        if (s === 'pendiente') type = 'warning';
        else if (s === 'completada' || s === 'completado' || s === 'completa') type = 'success';
        else if (s === 'cancelada' || s === 'no_asistida' || s === 'no asistida') type = 'danger';
        else if (s === 'programada') type = 'default';

        return (
          <Barnner type={type}>
            {cita.estado || 'Desconocido'}
          </Barnner>
        );
      }
    },
    {
      header: 'ACCIONES',
      key: 'actions',
      width: '15%',
      align: 'right',
      render: (cita) => {
        const hasUrl = invoiceUrls[cita.id];
        const isGenerating = generatingId === cita.id;
        const disabledState = ['programada', 'no_asistida', 'cancelada'].includes((cita.estado || '').toLowerCase());
        
        return (
          <div className={styles.actionContainer}>
            <ModalTooltip text={TEXT_FACTURAS.tooltips.generate}>
              <div style={{ display: 'inline-block' }}>
                <Button
                  variant="ghost"
                  color="#2563eb"
                  size="medium"
                  circle
                  onClick={() => handleGenerate(cita.id)}
                  disabled={isGenerating || disabledState || hasUrl}
                  icon={FilePlus}
                  loading={isGenerating}
                />
              </div>
            </ModalTooltip>

            <ModalTooltip text={TEXT_FACTURAS.tooltips.download}>
              <div style={{ display: 'inline-block' }}>
                <Button
                  variant="ghost"
                  color="#16a34a"
                  size="medium"
                  circle
                  onClick={() => handleFileDownload(cita.id)}
                  disabled={!hasUrl || isGenerating}
                  icon={Download}
                />
              </div>
            </ModalTooltip>

            {hasUrl && (
              <ModalTooltip text={TEXT_FACTURAS.tooltips.view}>
                <div style={{ display: 'inline-block' }}>
                  <Button
                    variant="ghost"
                    color="#475569"
                    size="medium"
                    circle
                    onClick={(e) => {
                      e.preventDefault();
                      setPreviewIframeUrl(null);
                      setPreviewInvoice(null);
                      setPreviewCitaId(cita.id);
                      setPreviewOpen(true);
                    }}
                    icon={FileText}
                  />
                </div>
              </ModalTooltip>
            )}
          </div>
        );
      }
    }
  ];
}
