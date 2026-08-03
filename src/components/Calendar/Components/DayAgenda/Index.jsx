import React from 'react';
import { Plus, CheckCircle, ClipboardList } from 'lucide-react';
import Button from '../../../screens/components/Button/index.jsx';
import Barnner from '../../../screens/components/Barnner/index.jsx';
import { TEXTS } from '../../constants';
import styles from './Index.module.css';

export default function DayAgenda({
  selectedDateFormatted,
  selectedDoctorName,
  isDoctor,
  selectedDayAgenda,
  onBookSlot
}) {
  return (
    <div className={styles.agendaCard}>
      <div className={styles.agendaTitle}>
        {TEXTS.LABEL_DAY_DETAILS}
        <div className={styles.selectedDateText}>
          {selectedDateFormatted}
        </div>
        {!isDoctor && selectedDoctorName && (
          <div className={styles.doctorBadge}>
            {selectedDoctorName}
          </div>
        )}
      </div>

      <div className={styles.timeline}>
        {selectedDayAgenda.map((slot) => {
          const isOccupied = slot.status === 'ocupado';

          return (
            <div key={slot.hour} className={styles.timelineItem}>
              <div className={styles.timeCol}>
                {slot.displayHour}
              </div>

              <div className={`${styles.slotCard} ${isOccupied ? styles.occupiedCard : styles.availableCard}`}>
                {isOccupied ? (
                  <div className={styles.slotInfoWrapper}>
                    <div className={styles.slotInfo}>
                      <span className={`${styles.statusLabel} ${styles.statusOccupiedText}`}>
                        <ClipboardList size={14} />
                        {slot.cita ? TEXTS.STATUS_OCCUPIED : 'Indisponible'}
                      </span>
                    </div>
                    
                    <Barnner type="default" className={styles.slotStatusBadge}>
                      {slot.cita ? 'Agendado' : 'Bloqueado'}
                    </Barnner>
                  </div>
                ) : (
                  <>
                    <div className={styles.slotInfo}>
                      <span className={`${styles.statusLabel} ${styles.statusAvailableText}`}>
                        <CheckCircle size={14} color="#16a34a" />
                        <span>Disponible</span>
                      </span>
                    </div>
                    <Button
                      variant={Button.VARIANTS.PRIMARY}
                      color="green"
                      size="small"
                      onClick={() => onBookSlot(slot.hour)}
                      icon={Plus}
                      className={styles.btnBook}
                    >
                      <span className={styles.btnText}>Agendar</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}