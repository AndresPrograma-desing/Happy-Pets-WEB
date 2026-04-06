function normalizeStatus(status) {
  const raw = String(status || '').trim().toLowerCase();
  return raw.replace(/\s+/g, '_').replace(/-/g, '_');
}

function isClosedStatus(status) {
  const normalized = normalizeStatus(status);
  return normalized === 'no_asistida' || normalized === 'completada' || normalized === 'cancelada';
}

function parseHora(hora) {
  const raw = String(hora || '').trim();
  if (!raw) return { h: 0, m: 0, s: 0 };

  const hhmm = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!hhmm) return null;

  const h = Number(hhmm[1]);
  const m = Number(hhmm[2]);
  const s = Number(hhmm[3] || 0);
  if (h > 23 || m > 59 || s > 59) return null;
  return { h, m, s };
}

function parseFecha(fecha) {
  const raw = String(fecha || '').trim();
  if (!raw) return null;

  // Formato ISO con o sin zona: tomar solo la parte de fecha para evitar desfase por timezone.
  const isoDatePrefix = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:T.*)?$/);
  if (isoDatePrefix) {
    const year = Number(isoDatePrefix[1]);
    const monthIndex = Number(isoDatePrefix[2]) - 1;
    const day = Number(isoDatePrefix[3]);
    if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
    return { year, monthIndex, day };
  }

  // Formato dd/mm/yyyy o dd-mm-yyyy
  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const monthIndex = Number(dmy[2]) - 1;
    const year = Number(dmy[3]);
    if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
    return { year, monthIndex, day };
  }

  // Formato yyyy-mm-dd
  const ymd = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymd) {
    const year = Number(ymd[1]);
    const monthIndex = Number(ymd[2]) - 1;
    const day = Number(ymd[3]);
    if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
    return { year, monthIndex, day };
  }

  // Fallback para ISO completo u otros formatos parseables por Date
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    year: parsed.getFullYear(),
    monthIndex: parsed.getMonth(),
    day: parsed.getDate(),
    fallbackDate: parsed,
  };
}

function getCitaDateTime(cita) {
  // Priorizar datetime crudo enviado por backend/DB cuando exista.
  const rawDateTime =
    cita?.fecha_hora_cita ??
    cita?.fecha_hora ??
    cita?.fechaHoraCita ??
    cita?.fechaHora ??
    cita?.cita_fecha_hora ??
    cita?.appointment_datetime ??
    cita?.appointmentDateTime ??
    null;

  if (rawDateTime) {
    const parsedDateTime = new Date(rawDateTime);
    if (!Number.isNaN(parsedDateTime.getTime())) {
      return parsedDateTime;
    }
  }

  const fechaRaw = cita?.fecha_cita || cita?.fecha || '';
  const horaRaw = cita?.hora_cita || cita?.hora || '';
  const fecha = String(fechaRaw || '').trim();
  const hora = String(horaRaw || '').trim();

  if (!fecha) return null;

  const parsedFecha = parseFecha(fecha);
  if (!parsedFecha) return null;

  // Sin hora valida no se debe expirar para evitar marcar citas recien creadas por error.
  if (!hora) return null;

  const parsedHora = parseHora(hora);
  if (hora && !parsedHora) return null;

  const h = parsedHora?.h ?? 0;
  const m = parsedHora?.m ?? 0;
  const s = parsedHora?.s ?? 0;
  return new Date(parsedFecha.year, parsedFecha.monthIndex, parsedFecha.day, h, m, s, 0);
}

function getCitaId(cita) {
  return cita?.id ?? cita?._id ?? cita?.ID;
}

export function expirePastCitas(citas, now = new Date()) {
  const nowDate = now instanceof Date ? now : new Date(now);
  const safeNow = Number.isNaN(nowDate.getTime()) ? new Date() : nowDate;

  if (!Array.isArray(citas) || !citas.length) {
    return { updatedCitas: Array.isArray(citas) ? citas : [], expiredIds: [] };
  }

  const expiredIds = [];

  const updatedCitas = citas.map((cita) => {
    const citaId = getCitaId(cita);
    const currentStatus = cita?.estado ?? cita?.status ?? '';

    if (!citaId || isClosedStatus(currentStatus)) return cita;

    const citaDate = getCitaDateTime(cita);
    if (!citaDate) return cita;

    if (citaDate.getTime() < safeNow.getTime()) {
      expiredIds.push(citaId);
      return {
        ...cita,
        estado: 'no_asistida',
        status: 'no_asistida',
      };
    }

    return cita;
  });

  return { updatedCitas, expiredIds };
}
