import * as LucideIcons from 'lucide-react';
import { getIcon } from '../assets/icons/ExportIcon/Index';

// El catálogo de permisos del backend manda un string por ícono, que puede ser
// una clave del set de assets custom del proyecto (ej. "adminRole", "box") o el
// nombre de un ícono de lucide-react (ej. "BellPlus", "Users"). El Sidebar de
// anteriority-ui trata `item.icon` siempre como un COMPONENTE y lo renderiza él
// mismo como <Icon size={20} /> — nunca como un string ni un elemento JSX ya
// instanciado — así que esta función siempre devuelve un componente: el de
// lucide-react directo, o uno local que envuelve el <img> del asset custom.
export function resolveCatalogIcon(name) {
  if (!name || typeof name !== 'string') return null;
  const assetSrc = getIcon(name);
  if (assetSrc) {
    const CustomAssetIcon = (props) => <img src={assetSrc} alt="" {...props} />;
    return CustomAssetIcon;
  }
  return LucideIcons[name] || null;
}
