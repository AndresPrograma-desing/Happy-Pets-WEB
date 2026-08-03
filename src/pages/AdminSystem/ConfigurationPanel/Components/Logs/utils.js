/**
 * Verifica si la clave ingresada coincide con la clave dummy esperada.
 */
export function verifyPassword(input, expected) {
  if (!input || !expected) return false;
  return input.trim() === expected.trim();
}

/**
 * Formatea una cadena de fecha ISO a un formato local legible.
 */
export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Formatea una cadena JSON para su visualización legible con sangría.
 */
export function formatJsonData(dataString) {
  if (!dataString) return "Sin datos registrados";
  
  // Si ya es un objeto, lo formateamos directamente
  if (typeof dataString === 'object') {
    return JSON.stringify(dataString, null, 2);
  }

  try {
    const parsed = JSON.parse(dataString);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return dataString; // Retorna la cadena tal cual si no es JSON válido
  }
}

/**
 * Retorna la variante de color correspondiente para el badge o ícono de la acción.
 */
export function getLogsActionColor(action) {
  if (!action) return "gray";
  const act = action.toUpperCase();
  if (act.includes("CREAR") || act.includes("CREATE") || act.includes("INSERT")) return "green";
  if (act.includes("ACTUALIZAR") || act.includes("UPDATE") || act.includes("EDIT")) return "blue";
  if (act.includes("ELIMINAR") || act.includes("DELETE") || act.includes("REMOVE")) return "red";
  if (act.includes("LOGIN") || act.includes("AUTH")) return "purple";
  return "blue";
}
