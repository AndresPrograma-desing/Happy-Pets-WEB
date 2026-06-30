import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import styles from './s.module.css';

const CalendarioCompleto = ({ citas = [] }) => {
  const [fechaActual, setFechaActual] = useState(new Date());

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Lógica de fechas
  const año = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();
  const primerDiaMes = new Date(año, mes, 1).getDay();
  const diasEnMes = new Date(año, mes + 1, 0).getDate();

  const cambiarMes = (offset) => {
    setFechaActual(new Date(año, mes + offset, 1));
  };

  const esCitaVencida = (fechaCita) => {
    return new Date(fechaCita) < new Date();
  };

  const renderizarDias = () => {
    const celdas = [];
    // Espacios mes anterior
    for (let i = 0; i < primerDiaMes; i++) {
      celdas.push(<div key={`empty-${i}`} className={styles.celdaVacia}></div>);
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaHoy = new Date(año, mes, dia);
      
      // Filtrar citas para este día específico
      const citasDelDia = citas.filter(c => {
        const dCita = new Date(c.fecha);
        return dCita.getDate() === dia && dCita.getMonth() === mes && dCita.getFullYear() === año;
      });

      celdas.push(
        <div key={dia} className={styles.celdaDia}>
          <span className={styles.numeroDia}>{dia}</span>
          <div className={styles.contenedorCitas}>
            {citasDelDia.map((cita, index) => (
              <div 
                key={index} 
                className={`${styles.etiquetaCita} ${esCitaVencida(cita.fecha) ? styles.vencida : styles.pendiente}`}
              >
                <span className={styles.horaCita}>{new Date(cita.fecha).getHours()}:00</span>
                <span className={styles.nombreMascota}>{cita.mascota}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return celdas;
  };

  return (
    <div className={styles.pantallaCompleta}>
      <header className={styles.header}>
        <div className={styles.infoMes}>
          <h1>{meses[mes]} <span>{año}</span></h1>
        </div>
        <div className={styles.controles}>
          <button onClick={() => cambiarMes(-1)}><ChevronLeft /></button>
          <button onClick={() => setFechaActual(new Date())} className={styles.btnHoy}>Hoy</button>
          <button onClick={() => cambiarMes(1)}><ChevronRight /></button>
        </div>
      </header>

      <div className={styles.gridCalendario}>
        {diasSemana.map(d => <div key={d} className={styles.cabeceraSemana}>{d}</div>)}
        {renderizarDias()}
      </div>
    </div>
  );
};

export default CalendarioCompleto;