import { getClientMeHistorialPdf } from '../src/services/api';

export async function downloadClientMedicalHistoryPdf(mascotaId) {
  if (!mascotaId) return;
  const res = await getClientMeHistorialPdf(mascotaId);
  const { blob, filename } = res || {};
  if (!blob) throw new Error('No se pudo obtener el historial médico.');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `historial-medico-${mascotaId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function calculateAge(birthDateString) {
  if (!birthDateString) return '—';
  try {
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return birthDateString;
    
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} año${years > 1 ? 's' : ''}${months > 0 ? ` y ${months} mes${months > 1 ? 'es' : ''}` : ''}`;
    }
    if (months > 0) {
      return `${months} mes${months > 1 ? 'es' : ''}`;
    }
    
    const diffTime = Math.abs(today - birthDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
  } catch (e) {
    return '—';
  }
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

export function formatHour(hourString) {
  if (!hourString) return '—';
  try {
    if (hourString.includes(':')) {
      const parts = hourString.split(':');
      const hour = parseInt(parts[0], 10);
      const minute = parts[1];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minute} ${ampm}`;
    }
    return hourString;
  } catch (e) {
    return hourString;
  }
}

export function verifyPetColor(petColorInput, petsList) {
  if (!petColorInput || !Array.isArray(petsList)) return false;
  const inputClean = petColorInput.trim().toLowerCase();
  
  return petsList.some(pet => {
    const petColorClean = String(pet.color || '').trim().toLowerCase();
    if (!petColorClean) return false;
    
    // Check if the input is a substring or if it contains the input
    return petColorClean.includes(inputClean) || inputClean.includes(petColorClean);
  });
}
