import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle,
  ClipboardList,
  PawPrint,
  DollarSign
} from 'lucide-react';

import styles from './Index.module.css';
import { TEXTS } from './constants';
import {
  formatDateToYYYYMMDD,
  getDayAgendaFromApiSlots
} from './utils';

import usePanelHeader from '../GenericPanel/usePanelHeader';
import Loading from '../screens/components/Loading/Index.jsx';
import DrawPanel from '../screens/components/DrawPanel/index.jsx';
import Badge from '../screens/components/Badge/index.jsx';
import Barnner from '../screens/components/Barnner/index.jsx';
import DesplegablePanel from '../screens/components/DesplegablePanel/index.jsx';

import DoctorSelector from './Components/DoctorSelector/Index';
import CalendarGrid from './Components/CalendarGrid/Index';

import { getCalendar, getUsers } from '../../services/api';
import { getDoctorIdFromLoginSession } from '../../services/api/storage';
import { getUserRole } from '../GenericPanel/Routes';

export default function Calendar() {
  const navigate = useNavigate();

  // Roles y Session
  const userRole = useMemo(() => getUserRole() || 'doctor', []);
  const isDoctor = userRole === 'doctor';
  const isSecretaria = userRole === 'secretaria';

  const defaultDoctorId = useMemo(() => getDoctorIdFromLoginSession() || '', []);

  // Redireccionar si no es doctor, secretaria ni admin
  useEffect(() => {
    if (userRole && userRole !== 'doctor' && userRole !== 'secretaria' && userRole !== 'admin') {
      navigate('/inicio');
    }
  }, [userRole, navigate]);

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState(isDoctor ? defaultDoctorId : '');

  // Datos traídos de getCalendar API
  const [calendarData, setCalendarData] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(!isDoctor);
  const [errorCalendar, setErrorCalendar] = useState('');
  const [errorDoctors, setErrorDoctors] = useState('');

  // States para el DrawPanel de detalles de la cita
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCitaDetails, setSelectedCitaDetails] = useState(null);

  // States para el nuevo DrawPanel de la agenda del día
  const [isAgendaDrawOpen, setIsAgendaDrawOpen] = useState(false);
  const [expandedCitaId, setExpandedCitaId] = useState(null);

  const selectedDoctorName = useMemo(() => {
    if (isDoctor) return '';
    if (calendarData?.doctor_name || calendarData?.doctorName) {
      return calendarData.doctor_name || calendarData.doctorName;
    }
    const doc = doctors.find((d) => String(d.id) === String(selectedDoctorId));
    return doc ? doc.fullName : `Doctor ${selectedDoctorId}`;
  }, [doctors, selectedDoctorId, isDoctor, calendarData]);

  // 1. Cargar Doctores (Si es admin o secretaria)
  useEffect(() => {
    if (isDoctor) {
      setSelectedDoctorId(defaultDoctorId);
      setLoadingDoctors(false);
      return;
    }

    setLoadingDoctors(true);
    setErrorDoctors('');

    getUsers()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || res?.items || res?.rows || [];
        const mappedDoctors = list
          .map((u) => {
            const id = u?.id ?? u?._id ?? u?.ID ?? u?.user_id;
            const name = u?.nombre ?? u?.name ?? '';
            const lastName = u?.apellido ?? u?.last_name ?? '';
            const rol = String(u?.rol ?? u?.role ?? u?.tipo_rol ?? '').toLowerCase();
            return { id, fullName: `${name} ${lastName}`.trim() || String(name || ''), rol };
          })
          .filter((u) => u.rol.includes('doctor'));

        setDoctors(mappedDoctors);

        if (mappedDoctors.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(defaultDoctorId || String(mappedDoctors[0].id));
        }
      })
      .catch((err) => {
        console.error('Error al cargar doctores:', err);
        setErrorDoctors(TEXTS.ERROR_DOCTORS);
      })
      .finally(() => {
        setLoadingDoctors(false);
      });
  }, [isDoctor, defaultDoctorId]);

  // 2. Fetch al endpoint de getCalendar cuando cambia el mes, año o el doctor seleccionado
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    setLoadingCalendar(true);
    setErrorCalendar('');

    getCalendar({
      year,
      month,
      doctorId: selectedDoctorId ? Number(selectedDoctorId) : null
    })
      .then((res) => {
        const data = res?.data || res;
        setCalendarData(data);
      })
      .catch((err) => {
        console.error('Error al obtener el calendario:', err);
        setErrorCalendar(TEXTS.ERROR_CITAS || 'Error al cargar el calendario');
      })
      .finally(() => {
        setLoadingCalendar(false);
      });
  }, [currentDate, selectedDoctorId]);

  // 3. Lógica de Navegación del Calendario
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSetToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // 4. Obtener los slots del día seleccionado desde la respuesta del Backend
  const selectedDayAgenda = useMemo(() => {
    if (!calendarData?.days) return getDayAgendaFromApiSlots([]);

    const dayObj = calendarData.days.find((d) => {
      const dStr = d.date || d.Date || '';
      if (!dStr) return false;
      
      // Parse dd-MM-yyyy / dd/MM/yyyy
      const matchDMY = dStr.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/);
      if (matchDMY) {
        const dayNum = parseInt(matchDMY[1], 10);
        const month = parseInt(matchDMY[2], 10) - 1;
        const year = parseInt(matchDMY[3], 10);
        return selectedDate.getFullYear() === year &&
               selectedDate.getMonth() === month &&
               selectedDate.getDate() === dayNum;
      }
      
      // Parse yyyy-MM-dd
      const matchYMD = dStr.match(/^(\d{4})[/-](\d{2})[/-](\d{2})/);
      if (matchYMD) {
        const year = parseInt(matchYMD[1], 10);
        const month = parseInt(matchYMD[2], 10) - 1;
        const dayNum = parseInt(matchYMD[3], 10);
        return selectedDate.getFullYear() === year &&
               selectedDate.getMonth() === month &&
               selectedDate.getDate() === dayNum;
      }

      const parsed = new Date(dStr);
      return !isNaN(parsed.getTime()) && 
             selectedDate.getFullYear() === parsed.getFullYear() &&
             selectedDate.getMonth() === parsed.getMonth() &&
             selectedDate.getDate() === parsed.getDate();
    });

    const occupiedSlots = dayObj?.slots || dayObj?.Slots || [];
    return getDayAgendaFromApiSlots(occupiedSlots);
  }, [calendarData, selectedDate]);

  // Extraer todas las citas agendadas reales del día seleccionado de forma deduplicada
  const selectedDayAppointments = useMemo(() => {
    const seenIds = new Set();
    const list = [];
    selectedDayAgenda.forEach(s => {
      const cita = s.cita || s.Cita;
      if (cita) {
        const id = cita.id || cita.Id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          list.push({
            ...cita,
            hora_cita: s.hour || s.Hour,
            display_hour: s.display_hour || s.displayHour
          });
        }
      }
    });
    return list;
  }, [selectedDayAgenda]);

  // 5. Navegar a la pantalla de crear cita pre-rellenada
  const handleBookSlot = (hourStr) => {
    const roleParam = isSecretaria ? 'secretaria' : 'doctor';
    const dateStr = formatDateToYYYYMMDD(selectedDate);

    navigate('/citas/crear', {
      state: {
        role: roleParam,
        doctor_id: selectedDoctorId,
        fecha_cita: dateStr,
        hora_cita: hourStr
      }
    });
  };

  // 6. Abrir panel de detalles para una cita específica
  const handleOpenCitaDetails = (cita) => {
    setSelectedCitaDetails(cita);
    setIsDetailsOpen(true);
  };

  const doctorOptions = useMemo(() => {
    return doctors.map((doc) => ({
      value: String(doc.id),
      label: doc.fullName || `Doctor ${doc.id}`
    }));
  }, [doctors]);

  const selectedDateFormatted = useMemo(() => {
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    if (calendarData?.days) {
      const dayObj = calendarData.days.find((d) => {
        const dStr = d.date || d.Date || '';
        const parts = dStr.split(/[/-]/);
        if (parts.length === 3) {
          return parseInt(parts[0], 10) === day &&
                 parseInt(parts[1], 10) === month &&
                 parseInt(parts[2], 10) === year;
        }
        return false;
      });

      if (dayObj) {
        const mObj = calendarData.months?.find(
          (m) => (m.number ?? m.Number) === (dayObj.month_number ?? dayObj.monthNumber)
        );
        const monthName = mObj?.name || mObj?.Name || '';
        const weekday = dayObj.day_name || dayObj.dayName || '';
        const dayNum = dayObj.day_number || dayObj.dayNumber || day;
        const yr = dayObj.year_number || dayObj.yearNumber || year;

        if (weekday && monthName) {
          return `${weekday}, ${dayNum} de ${monthName} de ${yr}`;
        }
      }
    }

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthName = monthNames[selectedDate.getMonth()];
    const weekday = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][selectedDate.getDay()];
    return `${weekday}, ${day} de ${monthName} de ${year}`;
  }, [calendarData, selectedDate]);

  usePanelHeader({
    title: TEXTS.TITLE,
    message: TEXTS.SUBTITLE
  });

  return (
    <>
      <div className={styles.mainContainer}>
        {/* Selector de Doctor (Para Admin/Secretaria) */}
        {!isDoctor && !loadingDoctors && doctorOptions.length > 0 && (
          <DoctorSelector
            doctorOptions={doctorOptions}
            selectedDoctorId={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          />
        )}

        {(loadingCalendar || loadingDoctors) ? (
          <Loading
            size="large"
            variant=""
            text={loadingDoctors ? TEXTS.LOADING_DOCTORS : TEXTS.LOADING_CITAS}
          />
        ) : (
          <div className={styles.calendarLayout}>
            {/* Grilla Calendario pasando directamente calendarData */}
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              calendarDays={calendarData?.days || []}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSetToday={handleSetToday}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setIsAgendaDrawOpen(true);
              }}
              onOpenCitaDetails={handleOpenCitaDetails}
            />
          </div>
        )}
      </div>

      {/* DrawPanel de la Agenda y Detalles de Citas del Día */}
      <DrawPanel
        isOpen={isAgendaDrawOpen}
        onClose={() => setIsAgendaDrawOpen(false)}
        title={`Agenda - ${selectedDateFormatted}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
          {!isDoctor && selectedDoctorName && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', width: 'fit-content' }}>
              Doctor: {selectedDoctorName}
            </div>
          )}

          {/* Sección de Citas Agendadas */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={18} color="#0284c7" />
              Citas Agendadas ({selectedDayAppointments.length})
            </h3>

            {selectedDayAppointments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {selectedDayAppointments.map((cita) => {
                  const isOpen = expandedCitaId === cita.id;
                  const statusLabel = cita.estado || cita.Estado || '';
                  
                  return (
                    <DesplegablePanel
                      key={cita.id}
                      title={`${cita.display_hour} - ${cita.paciente_nombre || cita.pacienteNombre}`}
                      description={`Propietario: ${cita.cliente_nombre || cita.clienteNombre || '—'}`}
                      icon={PawPrint}
                      iconColorVariant={
                        {
                          completada: 'green',
                          programada: 'blue',
                          en_curso: 'purple',
                          cancelada: 'red',
                          no_asistida: 'red'
                        }[String(statusLabel).toLowerCase().trim()] || 'blue'
                      }
                      isOpen={isOpen}
                      onToggle={() => setExpandedCitaId(isOpen ? null : cita.id)}
                    >
                      {/* Detalles extendidos dentro de la cita */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <Badge
                          icon={User}
                          iconColor="#0284c7"
                          label="Cliente / Propietario"
                          value={cita.cliente_nombre || cita.clienteNombre || '—'}
                        />
                        <Badge
                          icon={Clock}
                          iconColor="#475569"
                          label="Hora de Consulta"
                          value={cita.display_hour || '—'}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>Estado:</span>
                          <Barnner
                            type={
                              {
                                completada: 'success',
                                programada: 'warning',
                                en_curso: 'default',
                                cancelada: 'danger',
                                no_asistida: 'danger'
                              }[String(statusLabel).toLowerCase().trim()] || 'default'
                            }
                            icon={CheckCircle}
                          >
                            {statusLabel}
                          </Barnner>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                          <strong style={{ display: 'block', color: '#334155', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Motivo de Consulta:</strong>
                          <p style={{ margin: 0, background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {cita.motivo || 'No especificado.'}
                          </p>
                        </div>
                      </div>
                    </DesplegablePanel>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: '500' }}>
                No hay citas agendadas para este día.
              </div>
            )}
          </div>

          {/* Sección de Horarios */}
          <div>
            <h3 className={styles.agendaSectionTitle}>Horarios Disponibles para Agendar</h3>
            <div className={styles.timeSlotsGrid}>
              {(() => {
                const groupedSlots = {};
                selectedDayAgenda.forEach(slot => {
                  const hr = slot.hour || slot.Hour || '';
                  if (!groupedSlots[hr]) {
                    groupedSlots[hr] = slot;
                  } else {
                    const currentStatus = String(groupedSlots[hr].status || '').toLowerCase().trim();
                    const newStatus = String(slot.status || '').toLowerCase().trim();
                    if (currentStatus === 'disponible' && newStatus !== 'disponible') {
                      groupedSlots[hr] = slot;
                    }
                  }
                });
                const uniqueSlots = Object.values(groupedSlots).sort((a, b) => {
                  const timeA = a.hour || '';
                  const timeB = b.hour || '';
                  return timeA.localeCompare(timeB);
                });

                return uniqueSlots.map((slot) => {
                  const isOccupied = slot.status === 'ocupado';
                  const isBlocked = slot.status === 'bloqueado';
                  const isAvailable = slot.status === 'disponible';
                  
                  let chipClass = `${styles.timeChip}`;
                  if (isAvailable) chipClass += ` ${styles.timeChipAvailable}`;
                  else if (isOccupied) chipClass += ` ${styles.timeChipOccupied}`;
                  else if (isBlocked) chipClass += ` ${styles.timeChipBlocked}`;

                  const handleChipClick = () => {
                    if (isAvailable) {
                      handleBookSlot(slot.hour);
                    }
                  };

                  return (
                    <button
                      key={slot.hour}
                      type="button"
                      className={chipClass}
                      onClick={handleChipClick}
                      disabled={!isAvailable}
                      title={
                        isAvailable 
                          ? 'Haga clic para agendar una cita' 
                          : isOccupied 
                            ? 'Horario Ocupado' 
                            : 'Horario Bloqueado'
                      }
                    >
                      <span className={styles.timeLabel}>{slot.displayHour}</span>
                      <span className={styles.statusLabelText}>
                        {isAvailable ? 'Disponible' : isOccupied ? 'Ocupado' : 'Bloqueado'}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </DrawPanel>

      {/* DrawPanel de Detalles de Cita (mantenido por compatibilidad) */}
      <DrawPanel
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Detalles Completos de la Cita"
      >
        {selectedCitaDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <Badge
              icon={PawPrint}
              iconColor="var(--button-green)"
              label="Paciente"
              value={selectedCitaDetails.paciente_nombre || selectedCitaDetails.pacienteNombre || '—'}
            />
            <Badge
              icon={User}
              iconColor="#0284c7"
              label="Cliente / Propietario"
              value={selectedCitaDetails.cliente_nombre || selectedCitaDetails.clienteNombre || '—'}
            />
            <Badge
              icon={CalendarIcon}
              iconColor="#d97706"
              label="Fecha de Consulta"
              value={formatDateToYYYYMMDD(selectedDate)}
            />
            <Badge
              icon={Clock}
              iconColor="#475569"
              label="Hora Agendada"
              value={selectedCitaDetails.hora_cita || selectedCitaDetails.hour || '—'}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: '#334155', fontWeight: '600' }}>Estado:</span>
              <Barnner
                type={
                  {
                    completada: 'success',
                    programada: 'warning',
                    en_curso: 'default',
                    cancelada: 'danger',
                    no_asistida: 'danger'
                  }[String(selectedCitaDetails.estado || '').toLowerCase().trim()] || 'default'
                }
                icon={CheckCircle}
              >
                {selectedCitaDetails.estado}
              </Barnner>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
              <strong style={{ display: 'block', color: '#334155', fontSize: '0.9rem', marginBottom: '0.35rem' }}>Motivo de Consulta:</strong>
              <p style={{ margin: 0, background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '0.88rem', lineHeight: '1.4' }}>
                {selectedCitaDetails.motivo || 'No especificado.'}
              </p>
            </div>
          </div>
        )}
      </DrawPanel>
    </>
  );
}