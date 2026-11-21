import { getMedicalHistoryPdf } from '../../../services/api/pdf';
import { REPORT_TEXT } from './constants';

export const INITIAL_PET_FORM = {
  nombre: '',
  especie: '',
  raza: '',
  color: '',
  sexo: '',
  fechaNacimiento: '',
  peso: '',
  identeficacionMascota: '',
  alergias: '',
  condicionesMedicas: '',
  esterilizado: false
};

export const handleFormChange = (e, setPetForm) => {
  const { name, value, type, checked } = e.target;
  setPetForm(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

export const preparePetPayload = (clienteId, form) => {
  return {
    clienteId: Number(clienteId),
    nombre: form.nombre.trim(),
    especie: form.especie.trim(),
    raza: form.raza.trim(),
    color: form.color.trim(),
    sexo: form.sexo.trim(),
    fechaNacimiento: form.fechaNacimiento || null,
    peso: form.peso ? Number(form.peso) : 0,
    identeficacionMascota: form.identeficacionMascota.trim(),
    alergias: form.alergias.trim() || 'Ninguna',
    condicionesMedicas: form.condicionesMedicas.trim() || 'Sano',
    esterilizado: Boolean(form.esterilizado)
  };
};
export const downloadPetReportPdf = async (mascotaId) => {
  if (!mascotaId) return;
  const res = await getMedicalHistoryPdf(mascotaId);
  const { blob, filename } = res || {};
  if (!blob) throw new Error(REPORT_TEXT.error);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || REPORT_TEXT.fileFallback(mascotaId);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
