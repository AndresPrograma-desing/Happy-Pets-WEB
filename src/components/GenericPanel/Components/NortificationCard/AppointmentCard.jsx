import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, CalendarArrowDown, User } from 'lucide-react';
import { citaToday } from '../../../../services/api'; 
import { getText } from '../../../../constants';
import CardV1 from '../../../screens/components/CardV1';
import { getAppointmentColorByTime } from '../../../screens/components/CardV1/utils';

const AppointmentCard = () => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [badgeColor, setBadgeColor] = useState('#94a3b8');
  
  const hasFetched = useRef(false);

  const getAppointments = useCallback(async (isManualRefresh = false) => { 
    if (!isManualRefresh && hasFetched.current) return;
    
    setLoading(true);
    hasFetched.current = true;  

    try { 
      const response = await citaToday();
     
      if (Array.isArray(response) && response.length > 0) {
        const sortedAppointments = [...response].sort((a, b) => {
          return a.hora_cita.localeCompare(b.hora_cita);
        });

        const nextAppointment = sortedAppointments[0];
        setAppointment(nextAppointment);
        setBadgeColor(getAppointmentColorByTime(nextAppointment.hora_cita));
      } else {
        setAppointment(null); 
        setBadgeColor('#94a3b8');
      }
    } catch (err) {
      console.error(getText("appointmentCard.appointmentCardError.awaitCitaError"), err);
      setAppointment(null); 
      setBadgeColor('#94a3b8');
      hasFetched.current = false; 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAppointments();
  }, [getAppointments]);

  return (
    <CardV1
      badgeIcon={Calendar}
      badgeText="CITAS"
      badgeBgColor={badgeColor}
      badgeTextColor="#fff"
      isLoading={loading && !appointment}
      isEmpty={!loading && !appointment}
      emptyText="Libre"
      primaryText={appointment?.hora_cita?.substring(0, 5)}
      secondaryText={appointment?.mascota_nombre?.toLowerCase()}
      secondaryTextStyle={{ fontSize: '1.4rem', textTransform: 'capitalize' }}
      footerIcon={CalendarArrowDown}
      footerContent={
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {appointment ? (
            <>
              <User size={12} style={{ color: '#64748b' }} />
              {appointment.cliente_nombre}
            </>
          ) : (
            getText("appointmentCard.notCompromised")
          )}
        </span>
      }
    />
  );
};

export default AppointmentCard;