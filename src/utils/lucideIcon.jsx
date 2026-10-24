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
    // El Sidebar renderiza <Icon size={N} />: para un componente lucide, `size` se
    // traduce a width/height en px. Un <img> no entiende la prop `size` (no es un
    // atributo HTML válido ahí), así que sin este mapeo la imagen cae a su tamaño
    // intrínseco del SVG en vez de a N px — de ahí los íconos custom más grandes
    // que los de lucide-react en el mismo menú.
    const CustomAssetIcon = ({ size, ...props }) => (
      <img src={assetSrc} alt="" width={size} height={size} {...props} />
    );
    return CustomAssetIcon;
  }
  return LucideIcons[name] || null;
}
