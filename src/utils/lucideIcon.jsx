import React from 'react';
import * as LucideIcons from 'lucide-react';
import { getIcon } from '../assets/icons/ExportIcon/Index';

// El catálogo de permisos del backend manda un string por ícono, que puede ser
// una clave del set de assets custom del proyecto (ej. "adminRole", "box") o el
// nombre de un ícono de lucide-react (ej. "BellPlus", "Users"). Esta función
// resuelve cualquiera de los dos a algo que renderIcon() ya sabe pintar:
// un string (asset custom) o un elemento JSX (lucide).
export function resolveCatalogIcon(name) {
  if (!name || typeof name !== 'string') return null;
  if (getIcon(name)) return name;
  const LucideIconComponent = LucideIcons[name];
  if (LucideIconComponent) return <LucideIconComponent />;
  return null;
}
