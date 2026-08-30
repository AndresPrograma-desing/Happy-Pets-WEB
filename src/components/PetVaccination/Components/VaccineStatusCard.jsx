import React from 'react';
import { Calendar, Syringe } from 'lucide-react';
import CardV1 from '../../screens/components/CardV1';
import Badge from '../../screens/components/Badge';
import styles from './VaccineStatusCard.module.css';
import { formatDate, normalizeTrafficLight, TRAFFIC_LIGHT_COLORS } from '../utils';
import { PET_VACCINATION_TEXT } from '../constants';

export default function VaccineStatusCard({ item }) {
  const trafficLightKey = normalizeTrafficLight(item.traffic_light);
  const colors = TRAFFIC_LIGHT_COLORS[trafficLightKey] || TRAFFIC_LIGHT_COLORS.default;

  return (
    <CardV1
      badgeIcon={Syringe}
      badgeText={PET_VACCINATION_TEXT.trafficLightLabels[trafficLightKey] || trafficLightKey}
      badgeBgColor={colors.bg}
      badgeTextColor={colors.text}
      primaryText={item.vaccine_name}
    >
      <div className={styles.datesWrapper}>
        <Badge icon={Calendar} label="Última" value={formatDate(item.last_application_date)} iconColor={colors.text} />
        <Badge icon={Calendar} label="Próxima" value={formatDate(item.next_dose_date)} iconColor={colors.text} />
      </div>
    </CardV1>
  );
}
