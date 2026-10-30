# Documentación de componentes — anteriority-ui

Referencia detallada de uso de cada componente de la librería (props, ejemplos, notas). Para instalación y setup del proyecto, ver [README.md](README.md). Para convenciones internas (patrón de colores, estructura de carpetas), ver [CLAUDE.md](CLAUDE.md).

---

### AlertModal

Modal de alerta/confirmación genérico que se renderiza vía portal sobre `document.body`. Traduce y formatea automáticamente mensajes de error (string, array u objeto con `errors`/`details`) al español, y puede incluir un input de texto o select embebido.

**Import:**
```jsx
import AlertModal from '../AlertModal/AlertModal'; // export default
```

**Uso básico:**
```jsx
<AlertModal
  open={true}
  title="Alerta"
  message="¿Estás seguro de que deseas continuar con esta acción?"
  confirmText="Ok"
  cancelText="Cancelar"
  onClose={() => setOpen(false)}
  onConfirm={handleConfirm}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `open` | boolean | — | Controla si el modal se renderiza (si es falsy, retorna `null`) |
| `title` | string | `'Alerta'` | Título del modal |
| `message` | string \| array \| object | `''` | Mensaje o error a mostrar; se parsea automáticamente (soporta objetos de error tipo API con `errors`/`details`) |
| `onClose` | function | — | Handler del botón cancelar / click en overlay; si no es función, no se renderiza el botón cancelar |
| `onConfirm` | function | — | Handler del botón confirmar; si no se pasa, el botón confirmar actúa como `onClose` |
| `confirmText` | string | `'Ok'` | Texto del botón de confirmación |
| `cancelText` | string | `'Cancelar'` | Texto del botón de cancelar |
| `hideActions` | boolean | `false` | Oculta la fila de botones de acción |
| `children` | node | — | Contenido adicional (ej. un formulario) renderizado dentro del cuerpo |
| `showInput` | boolean | `false` | Muestra un input (`TextField` o `Selector`) dentro del modal |
| `inputType` | string | `'text'` | Tipo de input; `'select'` renderiza un `Selector`, cualquier otro valor un `TextField` |
| `inputLabel` | string | `''` | Label del input |
| `inputPlaceholder` | string | `''` | Placeholder del input |
| `inputValue` | string | `''` | Valor controlado del input |
| `onInputChange` | function | — | Handler de cambio del input |
| `inputOptions` | array | `[]` | Opciones para el `Selector` (`{ value, label }`) |
| `inputError` | string | `''` | Mensaje de error mostrado bajo el `TextField` |
| `imageUrl` | string | `''` | Si se define, muestra una imagen de vista previa |
| `showWarningIcon` | boolean | `true` | Muestra el ícono de alerta triangular junto al título |
| `bgColor` | string | — | Sobrescribe el color de fondo del modal (`--alertmodal-bg`) |
| `titleBorderColor` | string | — | Sobrescribe el borde bajo el título (`--alertmodal-title-border`) |
| `errorTextColor` | string | — | Color del texto de errores (`--alertmodal-error-text`) |
| `errorBgColor` | string | — | Color de fondo/borde de la lista de errores (`--alertmodal-error-bg`/`--alertmodal-error-border`) |

**Ejemplos:**
```jsx
// Con input de texto controlado
<AlertModal
  open
  title="Renombrar elemento"
  showInput
  inputType="text"
  inputLabel="Nombre"
  inputValue={value}
  onInputChange={(e) => setValue(e.target.value)}
  onConfirm={handleSave}
  onClose={handleClose}
/>

// Con imagen y sin botón cancelar
<AlertModal
  open
  title="Foto de Perfil"
  imageUrl="https://i.pravatar.cc/300?img=12"
  confirmText="Cerrar"
  showWarningIcon={false}
  onClose={handleClose}
/>
```

**Notas:** Se renderiza con `createPortal` en `document.body`, por lo que puede colocarse en cualquier parte del árbol. Depende de `Button`, `TextField` y `Selector` (Material-UI) internos del sistema de diseño.

---

### AppShell

Plantilla de layout principal de una aplicación: compone `Sidebar` (columna fija a la izquierda, alto completo) + `TopBar` (barra superior) + un área de contenido central con scroll propio, para no tener que armar esa estructura a mano en cada proyecto. No redeclara las props de `Sidebar`/`TopBar` una por una — se les pasa un objeto (`sidebarProps`/`topBarProps`) que se spreadea tal cual sobre cada uno, así que cualquier prop que esos componentes acepten hoy o agreguen en el futuro ya es compatible sin tocar `AppShell`.

**Import:**
```jsx
import AppShell from '../AppShell/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<AppShell
  sidebarProps={{
    groups: [{ title: 'General', items: [{ id: 'home', label: 'Inicio', icon: Home }] }],
    activeId: 'home',
    onSelect: (item) => navigate(item.id),
    headerContent: <Logo />, // evita el espacio vacío arriba del sidebar
  }}
  topBarProps={{ title: 'Panel de control', logo: <Logo /> }}
  useContainer
>
  <h2>Contenido de la página</h2>
</AppShell>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `sidebarProps` | object | `{}` | Spreadeado tal cual sobre el `Sidebar` interno (`groups`, `activeId`, `onSelect`, `user`, colores, etc. — ver [Sidebar](#sidebar)) |
| `topBarProps` | object | `{}` | Spreadeado tal cual sobre el `TopBar` interno (`title`, `actions`, `user`, `searchProps`, colores, etc. — ver [TopBar](#topbar)) |
| `children` | node | — | Contenido principal, renderizado dentro del área central con scroll propio |
| `useContainer` | boolean | `false` | Envuelve `children` en un [Container](#container) (con `wattermark={false}`) para darle marco (card con borde/sombra) al contenido sin que el consumidor tenga que importarlo aparte |
| `containerProps` | object | `{}` | Spreadeado tal cual sobre el `Container` interno cuando `useContainer` está activo (`borderColor`, `bgImage`, `showPagination`, etc. — ver [Container](#container)); ignorado si `useContainer` es `false` |
| `contentBgColor` | string | `'#f8fafc'` | Color de fondo del área de contenido (no afecta a `Sidebar`/`TopBar`, que mantienen su propio fondo vía `sidebarProps`/`topBarProps`) |
| `className` | string | `''` | Clase adicional en el contenedor raíz del layout |
| `style` | object | — | Estilos inline adicionales para el contenedor raíz |

**Ejemplos:**
```jsx
// Estado mobile del Sidebar manejado automáticamente: AppShell conecta por
// defecto el botón hamburguesa de TopBar (onMenuClick) con isMobileOpen/
// onCloseMobile de Sidebar. Pasar esas props dentro de sidebarProps/topBarProps
// las sobreescribe si se necesita un control propio.
<AppShell
  sidebarProps={{
    groups,
    activeId,
    onSelect: setActiveId,
    user: { email: 'jane.doe@example.com' },
    userMenuItems,
  }}
  topBarProps={{
    title: 'Reportes',
    actions: [{ key: 'notifications', icon: Bell, tooltip: 'Notificaciones', onClick: () => {} }],
    user: { email: 'jane.doe@example.com' },
  }}
  contentBgColor="#eef2ff"
  useContainer
  containerProps={{ borderColor: '#6366f1' }}
>
  <ReportsPage />
</AppShell>
```

**Notas:** Compone `Sidebar`, `TopBar`, `ScrollBar` y (con `useContainer`) `Container` internos del sistema — ver sus respectivas secciones para la lista completa de props disponibles vía `sidebarProps`/`topBarProps`/`containerProps`. El layout es `height: 100vh` (pensado para ocupar toda la ventana); el `Sidebar` ya trae su propio `height: 100vh` y el `TopBar` es `width: 100%` sin alto fijo, por lo que encajan sin ajustes adicionales. El área de `children` scrollea con el `ScrollBar` de la librería (track/thumb estilizados, auto-hide) en vez de la barra de scroll nativa del navegador — el scroll horizontal queda deshabilitado (`horizontal={false}`), ya que el área de contenido está pensada para crecer solo en alto. Si se pasa `onMenuClick`/`isMobileOpen`/`onCloseMobile` manualmente dentro de `topBarProps`/`sidebarProps`, reemplaza el manejo automático del estado mobile que `AppShell` provee por defecto. Ninguno de los dos trae un logo por defecto: sin `sidebarProps.headerContent` el bloque superior del sidebar queda vacío (o directamente no se renderiza, salvo que `collapsible` esté activo), y sin `topBarProps.logo` el `TopBar` arranca directo en el título — pasar el mismo logo a ambas props (`headerContent` y `logo`) es el uso esperado.

---

### Avatar

Componente de avatar nativo (sin dependencias de MUI) para fotos de perfil, iniciales de nombre o íconos, con generación automática de colores armoniosos basados en el texto/nombre e iniciales automáticas.

**Import:**
```jsx
import Avatar from '../Avatar'; // o import { Avatar } from 'anteriority-ui'
```

**Uso básico:**
```jsx
<Avatar src="/foto.jpg" alt="Natacha" />
<Avatar name="Martin Perez" />
<Avatar>M</Avatar>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `src` | string | — | URL de la imagen del avatar |
| `alt` | string | `''` | Texto alternativo de la imagen |
| `name` | string | `''` | Nombre usado para calcular la inicial y el color de fondo si no hay imagen |
| `children` | node | — | Contenido libre o letra inicial directa (ej. `<Avatar>M</Avatar>`) |
| `size` | number \| `'small'` \| `'medium'` \| `'large'` | `32` | Diámetro del avatar en píxeles |
| `shape` | `'circle'` \| `'rounded'` \| `'square'` | `'circle'` | Forma geométrica del avatar |
| `bgColor` | string | — | Color de fondo personalizado |
| `textColor` | string | `'#ffffff'` | Color del texto |
| `icon` | component | — | Icono opcional (ej. de `lucide-react`) si no hay foto ni inicial |

---

### AvatarChip

Componente de chip/píldora con avatar, texto y acciones opcionales (sin MUI). Incluye la prop especial `expandOnHover` para mostrar inicialmente solo el avatar circular y desplegar suavemente el nombre/label hacia un lado al colocar el puntero encima. Incluye `AvatarChipGroup` para agrupar chips fácilmente reemplazando `Stack`.

**Import:**
```jsx
import AvatarChip, { Chip, Avatar, AvatarChipGroup } from '../AvatarChip'; 
// o import { AvatarChip, Chip, AvatarChipGroup } from 'anteriority-ui'
```

**Uso básico:**
```jsx
// 1. Estilo MUI Chip con Avatar y Stack
<AvatarChipGroup direction="row" spacing={8}>
  <Chip avatar={<Avatar>M</Avatar>} label="Avatar" />
  <Chip
    avatar={<Avatar alt="Natacha" src="/foto.jpg" />}
    label="Avatar"
    variant="outlined"
  />
</AvatarChipGroup>

// 2. Con animación expandOnHover (solo avatar, se despliega al hover)
<AvatarChip
  expandOnHover
  src="/foto.jpg"
  label="Natacha Romanov"
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `avatar` | node | — | Elemento Avatar personalizado (ej. `<Avatar>M</Avatar>`) |
| `src` | string | — | Atajo directo para la foto del avatar |
| `name` | string | — | Atajo para el nombre (calcula iniciales y color automáticamente) |
| `initial` | string | — | Atajo para la inicial directa del avatar (ej. `"M"`) |
| `icon` | component | — | Atajo para icono en lugar de avatar de imagen |
| `label` | node | — | Texto o contenido principal del chip |
| `variant` | `'filled'` \| `'outlined'` | `'filled'` | Estilo visual del chip |
| `size` | `'small'` \| `'medium'` \| `'large'` | `'medium'` | Tamaño del chip (`small` = 24px, `medium` = 32px, `large` = 40px) |
| `expandOnHover` | boolean | `false` | Si es `true`, muestra solo el avatar circular y lo expande suavemente a un lado mostrando el label al colocar el puntero (hover) |
| `collapsed` | boolean | — | Control manual del estado colapsado (opcional) |
| `onClick` | function | — | Si se define, el chip se vuelve clickeable con hover y accesibilidad de botón |
| `onDelete` | function | — | Si se define, renderiza un botón de eliminar (icono X) al extremo derecho |
| `deleteIcon` | node | — | Icono personalizado para el botón de eliminar |
| `disabled` | boolean | `false` | Deshabilita la interacción del chip |
| `bgColor` | string | — | Color de fondo personalizado |
| `textColor` | string | — | Color de texto personalizado |
| `borderColor` | string | — | Color de borde personalizado |

---

### Badge

Etiqueta pequeña e inline para mostrar un par label/valor, opcionalmente con ícono, usada para indicadores de estado o métricas cortas.

**Import:**
```jsx
import Badge from '../Badge'; // export default (index.jsx)
```

**Uso básico:**
```jsx
<Badge label="Estado" value="Activo" />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `icon` | componente (lucide-react) | — | Ícono a mostrar antes del texto (prop interna `Icon`) |
| `label` | string | — | Etiqueta opcional antes del valor (se renderiza como `label:`) |
| `value` | node | — | Valor principal mostrado |
| `iconColor` | string | `'#000000ff'` | Color del ícono |
| `bgColor` | string | — | Color de fondo (`--badge-bg`) |
| `borderColor` | string | — | Color de borde (`--badge-border`) |
| `labelColor` | string | — | Color del texto de la etiqueta (`--badge-label`) |
| `valueColor` | string | — | Color del texto del valor (`--badge-value`) |
| `style` | object | `{}` | Estilos inline adicionales fusionados con las variables CSS |

**Ejemplos:**
```jsx
<Badge icon={Star} label="Puntaje" value="4.8" iconColor="#f59e0b" />

<Badge icon={Clock} value="12:30" />
```

---

### Barnner

Chip/etiqueta de estado con variantes de color predefinidas (default, success, warning, danger) y un ícono opcional.

**Import:**
```jsx
import Barnner from '../Barnner'; // export default (index.jsx)
```

**Uso básico:**
```jsx
<Barnner type="default">Default</Barnner>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | node | — | Contenido del banner |
| `icon` | componente (lucide-react) | — | Ícono opcional mostrado antes del texto |
| `type` | string: `'default' \| 'success' \| 'warning' \| 'danger'` (o cualquier variante definida en el CSS) | `'default'` | Determina la clase de color (`badge{Type}`); si no existe, cae a `badgeDefault` |
| `className` | string | `''` | Clase CSS adicional |
| `bgColor` | string | — | Sobrescribe el color de fondo inline |
| `textColor` | string | — | Sobrescribe el color de texto inline |
| `borderColor` | string | — | Sobrescribe el borde inline (agrega `1px solid`) |

**Ejemplos:**
```jsx
<Barnner type="success" icon={CheckCircle}>Completado</Barnner>

<Barnner type="danger" icon={XCircle}>Cancelado</Barnner>
```

> `screens/components/Barnner/utils.js` existe pero está vacío; no exporta nada actualmente usado por el componente.

---

### BlueLink

Enlace de texto con estilo de "link azul" que abre URLs externas en una nueva pestaña o navega internamente vía una función `navigate`, envuelto en un tooltip.

**Import:**
```jsx
import BlueLink from '../BlueLink/index'; // export default
```

**Uso básico:**
```jsx
<BlueLink label="Visitar sitio web" url="https://example.com" />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | string | — | Texto visible del enlace |
| `url` | string | — | URL destino; si empieza con `http://` o `https://` se abre en nueva pestaña, si no, se usa `navigate(url)` |
| `navigate` | function | — | Función de navegación interna (ej. router) usada para URLs no absolutas |
| `color` | string | — | Sobrescribe el color del enlace (`--bluelink-color`) |

**Ejemplos:**
```jsx
<BlueLink
  label="Ir al perfil"
  url="/profile/123"
  navigate={(path) => router.push(path)}
/>
```

**Notas:** Envuelve el link en `ModalTooltip` (muestra "Ir a {label}"); si `url` no está definido, `url.startsWith` lanzará un error, así que `url` es efectivamente requerido.

---

### Breadcrumbs

Rastro de navegación (breadcrumb trail) animado; el último elemento de `items` siempre se muestra como página actual (texto en negrita, no clicable, sin chip/fondo), y los anteriores con `onClick` se renderizan como botones.

**Import:**
```jsx
import { Breadcrumbs } from '../Breadcrumbs/index'; // named export (también default export)
```

**Uso básico:**
```jsx
<Breadcrumbs
  items={[
    { label: 'Inicio', onClick: goHome },
    { label: 'Pacientes', onClick: goPatients },
    { label: 'Juan Pérez' },
  ]}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `items` | array de `{ id?, label, icon?, onClick? }` | `[]` | Ruta completa de migas de pan en orden; si está vacío no renderiza nada. `icon` es opcional, un componente (ej. ícono de `lucide-react`) que se muestra antes del label de ese ítem puntual |
| `className` | string | `''` | Clase CSS adicional en el `<nav>` |
| `separator` | string | `'/'` | Carácter divisor entre crumbs (ej. `'/'`, `'-'`, `'>'`) |
| `iconColor` | string | — | Color de los íconos de los crumbs (`--crumb-icon-color`) |
| `linkColor` | string | — | Color de los crumbs clicables (`--crumb-link-color`) |
| `currentColor` | string | — | Color del último crumb (página actual, texto en negrita) (`--crumb-current-color`). Útil para usar `Breadcrumbs` sobre fondos claros — el default (`#e6e8ec`) está pensado para fondo oscuro. |
| `maxItems` | number | — | Si `items.length` supera este valor, colapsa los crumbs del medio detrás de un botón "…" con un menú |
| `itemsBeforeCollapse` | number | `1` | Cantidad de crumbs visibles antes del colapso (solo aplica si `maxItems` está seteado) |
| `itemsAfterCollapse` | number | `1` | Cantidad de crumbs visibles después del colapso, incluyendo el actual (solo aplica si `maxItems` está seteado) |
| `menuBgColor` | string | `'#1b1f27'` | Fondo del menú desplegable de crumbs colapsados |
| `menuTextColor` | string | `'#e6e8ec'` | Color de texto del menú desplegable de crumbs colapsados |
| `separatorColor` | string | — | Color del separador entre crumbs (`--crumb-separator-color`) |
| `tooltipBgColor` | string | — | Fondo del tooltip que se muestra al pasar el mouse sobre un crumb truncado (pasa a `ModalTooltip.bgColor`) |
| `tooltipTextColor` | string | — | Color de texto del tooltip de crumb truncado (pasa a `ModalTooltip.textColor`) |

**Ejemplos:**
```jsx
<Breadcrumbs
  items={[
    { label: 'Inicio', onClick: goHome },
    { label: 'Sesiones', onClick: goSessions },
    { label: '2024-05-10', onClick: goDate },
    { label: 'Detalle' },
  ]}
/>
```

Con íconos por crumb y separador custom:
```jsx
import { Home, Flame, Gem } from 'lucide-react';

<Breadcrumbs
  separator=">"
  items={[
    { label: 'MUI', icon: Home, onClick: goHome },
    { label: 'Core', icon: Flame, onClick: goCore },
    { label: 'Breadcrumb', icon: Gem },
  ]}
/>
```

Con colapso de crumbs intermedios detrás de un menú:
```jsx
<Breadcrumbs
  maxItems={3}
  items={[
    { label: 'Breadcrumb 1', onClick: go1 },
    { label: 'Breadcrumb 2', onClick: go2 },
    { label: 'Breadcrumb 3', onClick: go3 },
    { label: 'Breadcrumb 4', onClick: go4 },
    { label: 'Breadcrumb 5', onClick: go5 },
    { label: 'Breadcrumb 6' },
  ]}
/>
```

**Notas:** Si un ítem no trae `icon`, el primer crumb cae por defecto en el ícono de casa (comportamiento sin cambios); los demás no muestran ícono salvo que se pase uno. Las animaciones de entrada usan `--crumb-index` y respetan `prefers-reduced-motion`. El botón "…" de crumbs colapsados reutiliza [MenuPopover](#menupopover) (`isCollapsed` + `triggerProps={{ circle: true }}` para el ícono redondo, `children` como render-prop para la lista de items ocultos con sus propios `MenuItem`) en vez de armar un `@mui/material/Menu` propio — así ambos componentes comparten el mismo mecanismo de dropdown y escalan juntos si ese diseño cambia. Se puede importar tanto como named export (`{ Breadcrumbs }`) o default.

Cada crumb (clicable o actual) mide su propio ancho en runtime (`scrollWidth` vs. `clientWidth`) y, solo si el `text-overflow: ellipsis` realmente lo está cortando, se envuelve en [ModalTooltip](#modaltooltip) para revelar el label completo al pasar el mouse — en vez de dejarlo cortado sin forma de leerlo. Esto no agrega un tooltip en crumbs que ya entran completos. El link clicable trunca a `max-width: 200px` (antes no truncaba individualmente, solo el contenedor general con `overflow: hidden`); el crumb actual sigue truncando a `max-width: 360px` como antes.

---

### Button

Botón estándar del sistema, construido sobre `MuiButton` de Material-UI, con variantes, tamaños, colores, estado de carga, forma circular y tooltip integrado.

**Import:**
```jsx
import Button, { VARIANTS, SIZES, COLORS } from '../Button'; // export default + named exports
```

**Uso básico:**
```jsx
<Button variant={VARIANTS.PRIMARY} size={SIZES.MEDIUM} onClick={handleSave}>
  Guardar
</Button>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | node | — | Contenido del botón |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'outline' \| 'tab' \| 'list-item'` (`VARIANTS`) | `'primary'` | Estilo visual; mapea a `variant`/`color` de MUI |
| `size` | `'small' \| 'medium' \| 'large'` (`SIZES`) | `'medium'` | Tamaño del botón e ícono |
| `active` | boolean | `false` | Aplica el fondo de `activeColor` (estado activo/seleccionado) |
| `fullWidth` | boolean | `false` | Ancho completo del contenedor |
| `icon` | componente (lucide-react) | — | Ícono inicial (`startIcon`) o único contenido si `circle` |
| `onClick` | function | — | Handler de click (no se dispara si está deshabilitado/loading) |
| `disabled` | boolean | `false` | Deshabilita el botón |
| `type` | string | `'button'` | Tipo HTML del botón (`'submit'`, etc.) |
| `className` | string | `''` | Clase CSS adicional |
| `color` | string (valor CSS o de `COLORS`) | — | Color custom o uno de los colores estándar MUI/`COLORS` |
| `border` | string | — | Color de borde (fuerza variante `outlined`) |
| `borderColor` | string | — | Igual que `border` |
| `hoverColor` | string | `color-mix(in srgb, currentColor 10%, transparent)` | Fondo del hover. Por default se deriva de `currentColor`, así se adapta automáticamente al color de texto resultante (útil en botones `color="transparent"`/`ghost` cuyo fondo real lo define el contenedor, ej. filas de `Sidebar` o items de un popover oscuro — evita el hover blanco fijo de MUI sobre fondos de color) |
| `activeColor` | string | `color-mix(in srgb, currentColor 16%, transparent)` | Fondo aplicado cuando `active={true}`. Mismo criterio de default que `hoverColor` |
| `style` | object | `{}` | Estilos `sx` adicionales, se aplican al final (mayor prioridad) |
| `loading` | boolean | `false` | Muestra un `CircularProgress` en lugar del contenido y deshabilita el botón |
| `success` | boolean \| undefined | `undefined` | Si es `false`, deshabilita el botón |
| `circle` | boolean | `false` | Botón circular que muestra solo el ícono como children |
| `ToolTip` | boolean \| string | `false` | Si es truthy, envuelve el botón en `ModalTooltip` (usa el string como texto, o `title` si es `true`) |
| `title` | string | — | Texto de tooltip cuando `ToolTip={true}` |
| `...props` | — | — | Cualquier otra prop se pasa directo a `MuiButton` |

**Ejemplos:**
```jsx
<Button variant={VARIANTS.PRIMARY} loading>Guardando...</Button>

<Button
  variant={VARIANTS.GHOST}
  circle
  icon={Star}
  color={COLORS.GREEN}
  ToolTip
  title="Marcar como favorito"
  onClick={handleFavorite}
/>

{/* Botón "transparent" sobre un contenedor de color propio (ej. sidebar azul oscuro):
    sin hoverColor/activeColor, el hover/active ya se adapta solo vía currentColor */}
<Button color="transparent" active={isActive} onClick={handleSelect}>
  Inicio
</Button>

{/* Override explícito del hover/active, ej. para un contraste puntual distinto al default */}
<Button
  color="transparent"
  active={isActive}
  hoverColor="rgba(13, 82, 248, 0.12)"
  activeColor="rgba(13, 82, 248, 0.2)"
  onClick={handleSelect}
>
  Inicio
</Button>
```

**Notas:** Es un `React.forwardRef`. Expone `Button.VARIANTS`, `Button.SIZES` y `Button.COLORS` como propiedades estáticas además de los named exports. Para asignarle un atajo de teclado global, envolverlo con `KeyboardShortcut` (ver sección correspondiente) en vez de una prop propia — así el mismo wrapper sirve para `Button`, `Input` o cualquier otro elemento. El hover/active de los botones `color="transparent"` (y en general cualquiera con `muiColor` `inherit`) ya no usa el blanco/negro translúcido fijo de MUI — se deriva de `currentColor`, por lo que se adapta solo al color de texto resultante sobre cualquier fondo heredado del contenedor (ej. filas de `Sidebar`, items de un popover con fondo de color). Usar `hoverColor`/`activeColor` solo cuando se necesite un color puntual distinto a ese default.

---

### CalendarComponent

Selector de fecha con `TextField` (Material-UI) como disparador y un calendario propio en un modal/backdrop, con selectores rápidos de mes/año.

**Import:**
```jsx
import CustomDatePicker from '../CalendarComponent/CustomDatePicker'; // export default
```

**Uso básico:**
```jsx
<CustomDatePicker
  label="Fecha de nacimiento"
  name="birthDate"
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | string | — | Label del `TextField` |
| `name` | string | — | Nombre usado en el evento sintético `onChange` |
| `value` | string (`YYYY-MM-DD`) \| Date | — | Fecha seleccionada |
| `onChange` | function | — | Recibe un evento `{ target: { name, value, type: 'date' } }` |
| `required` | boolean | `false` | Marca el campo como requerido |
| `disabled` | boolean | `false` | Deshabilita la apertura del calendario |
| `selectedColor` | string | — | Color del día seleccionado (`--cdp-selected`) |
| `accentColor` | string | — | Color de acento del calendario (`--cdp-accent`) |

**Ejemplos:**
```jsx
<CustomDatePicker
  label="Fecha de la cita"
  name="appointmentDate"
  value="2024-06-15"
  onChange={handleChange}
/>

<CustomDatePicker label="Fecha bloqueada" name="disabledDate" value="2024-01-01" disabled onChange={handleChange} />
```

**Notas:** El valor se emite siempre como string `YYYY-MM-DD`. Incluye botones internos "Borrar" y "Hoy". Depende de `date-fns` (locale `es`) y del `TextField` de Material-UI del sistema.

---

### CalendarPicker

Selector de fecha con dos variantes (`variant`):

- `'popover'` (default): un `TextField` que al clickearse abre un calendario chico (círculos) flotando debajo, anclado al input, con selectores rápidos de mes/año.
- `'inline'`: sin `TextField` — se renderiza directo un calendario grande tipo "hoja de agenda" (celdas rectangulares, pensado para ocupar el ancho de un container, ej. una vista de citas/turnos).

Internamente delega el grid de cada variante a un subcomponente propio (`components/CalendarGrid` para popover, `components/AgendaGrid` para inline) controlado por `CalendarPicker`, que mantiene todo el estado (mes visible, selección, rango, drag).

**Import:**
```jsx
import CalendarPicker from '../CalendarPicker/index'; // export default
```

**Uso básico:**
```jsx
<CalendarPicker
  label="Fecha de nacimiento"
  name="birthDate"
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
/>

// Modo agenda (sin TextField, calendario grande inline)
<CalendarPicker
  name="agendaDate"
  variant="inline"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'popover'` \| `'inline'` | `'popover'` | `'popover'`: `TextField` + calendario flotante chico. `'inline'`: calendario grande tipo agenda, sin `TextField`, ocupa el ancho del container (`max-width: 880px`). |
| `label` | string | — | Label del `TextField` (solo aplica en `variant="popover"`) |
| `name` | string | — | Nombre usado en el evento sintético `onChange` |
| `value` | string (`YYYY-MM-DD`) \| Date | — | Fecha seleccionada (modo simple). Ignorado si `range` es `true`. |
| `onChange` | function | — | Recibe un evento `{ target: { name, value, type } }`. `type` es `'date'` en modo simple o `'date-range'` en modo rango. |
| `required` | boolean | `false` | Marca el campo como requerido (solo `variant="popover"`) |
| `disabled` | boolean | `false` | Deshabilita la apertura del calendario (solo `variant="popover"`) |
| `showFooter` | boolean | `false` | Solo `variant="popover"`. Muestra el footer con los botones "Borrar" (limpia el valor) y "Hoy" (selecciona la fecha actual) debajo del grid de días. Es opt-in: si no se pasa, el popover solo muestra el calendario, sin esos controles. |
| `range` | boolean | `false` | Activa selección de rango. `value`/`onChange` pasan a usar `{ start, end }` (strings `YYYY-MM-DD`) en vez de una fecha suelta. Funciona igual en ambas variantes. |
| `inputSx` | object | — | `sx` custom pasado al `TextField` interno (solo `variant="popover"`) |
| `renderDay` | `function(date: Date) => ReactNode` | — | Solo `variant="inline"`. Contenido custom por celda (ej. eventos/citas de ese día + acciones). Si no se pasa, la celda entera es un único `Button` de la librería (click selecciona el día); si se pasa, la celda es un contenedor y solo el número de día es un `Button` circular aparte (un `<button>` no puede contener otro `<button>`, así que el contenido de `renderDay` puede incluir sus propios `Button`s — ver ejemplo). |
| `country` | string | — | Código de país ISO 3166-1 (ej. `"AR"`, `"US"`) para calcular feriados/efemérides oficiales vía `date-holidays`. Funciona en ambas variantes. |
| `showHolidays` | boolean | `Boolean(country)` | Marca los días con feriado/efeméride. Por default se activa solo si se pasó `country`. Funciona en ambas variantes (ver nota sobre cómo se ve en cada una). |
| `extraHolidays` | `{ [yyyy-MM-dd]: string \| {label, type} \| Array<...> }` | — | Feriados/efemérides custom que `date-holidays` no cubre (ej. una efeméride internacional puntual), combinados con los oficiales de `country`. Funciona en ambas variantes. |
| `showMoonPhases` | boolean | `false` | Marca los días con un ícono de fase lunar (react-icons/wi), calculada por ciclo sinódico (±1 día de margen). Funciona en ambas variantes. |
| `selectedColor` | string | — | Color del día seleccionado (y de los extremos/relleno del rango) (`--cp-selected`) |
| `accentColor` | string | — | Color de acento / botón "Hoy" (`--cp-accent`) |
| `holidayBorderColor` | string | `#ef4444` (rojo) | Color del anillo/borde que marca la celda de un día con feriado/efeméride, en ambas variantes (`--cp-agenda-holiday-border` en inline, `--cp-holiday-border` en popover). Tiene un default visible (no solo el fallback del token CSS) porque el borde debe marcarse incluso sin personalizar nada. |
| `moonPhaseColor` | string | — | Color del ícono/punto de fase lunar, en ambas variantes (`--cp-agenda-moon` en inline, `--cp-moon-dot` en popover). |
| `tooltipBgColor` | string | — | Fondo del tooltip (`ModalTooltip`) que muestra el detalle de un feriado/fase lunar al hacer hover, en ambas variantes. |
| `tooltipTextColor` | string | — | Color de texto de ese tooltip, en ambas variantes. |
| `bgColor` | string | — | Solo `variant="inline"`. Fondo del calendario (`--cp-agenda-bg`). |
| `textColor` | string | — | Solo `variant="inline"`. Color del texto principal (mes, números de día) (`--cp-agenda-text`). |
| `mutedColor` | string | — | Solo `variant="inline"`. Color de texto secundario (año, nombres de día, días de otro mes) (`--cp-agenda-muted`/`--cp-agenda-year`). |
| `mutedBgColor` | string | — | Solo `variant="inline"`. Fondo de las celdas de días fuera del mes actual (`--cp-agenda-muted-bg`). |
| `borderColor` | string | — | Solo `variant="inline"`. Color de las líneas divisorias del grid (`--cp-agenda-border`). |
| `hoverColor` | string | — | Solo `variant="inline"`. Fondo al pasar el mouse sobre una celda (`--cp-agenda-hover`). |
| `holidayColor` | string | — | Solo `variant="inline"`. Color del nombre del feriado/efeméride en la celda (`--cp-agenda-holiday`) — el popover no tiene este, el nombre nunca se muestra como texto ahí (ver nota). |
| `selectorsPopperZIndex` | number | `100000` (default interno de `Selector`) | Solo `variant="popover"`. `z-index` del `Popper` de los `Selector` (Material-UI) de "Mes"/"Año" que se abren al clickear el título del calendario — ese `Popper` se renderiza vía portal al final de `<body>`, fuera del popover del calendario (`z-index: 20`). Ajustar si un modal/drawer propio del proyecto consumidor tiene un `z-index` mayor y "tapa" los clics del listado de años (ver nota). |

**Ejemplos:**
```jsx
<CalendarPicker label="Fecha requerida" name="requiredDate" value="" required onChange={handleChange} />

<CalendarPicker label="Fecha bloqueada" name="disabledDate" value="2024-01-01" disabled onChange={handleChange} />

// Rango de fechas
<CalendarPicker
  label="Rango de estadía"
  name="stayRange"
  range
  value={{ start: '2024-06-10', end: '2024-06-18' }}
  onChange={(e) => setStayRange(e.target.value)} // e.target.value = { start, end }
/>

// Agenda con feriados de Argentina + fases lunares
<CalendarPicker
  name="agendaDate"
  variant="inline"
  country="AR"
  showMoonPhases
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
/>

// Agenda con eventos propios por día (usa el Button de la librería para cada acción)
<CalendarPicker
  name="agendaWithEvents"
  variant="inline"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  renderDay={(day) => {
    const events = getEventsForDay(day); // lógica del consumidor
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {events.map((ev) => (
          <Button key={ev.id} variant="primary" size="small" onClick={(e) => { e.stopPropagation(); openEvent(ev); }}>
            {ev.label}
          </Button>
        ))}
      </div>
    );
  }}
/>
```

**Ejemplo (popover con feriados y fases lunares):**
```jsx
<CalendarPicker
  label="Fecha de la cita"
  name="popoverHolidays"
  country="AR"
  showMoonPhases
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
/>
```

**Notas:**
- En modo `range`, la selección soporta dos gestos, intercambiables: (1) click en el día de inicio → click en el día de fin (el panel queda abierto entre medio, permitiendo navegar de mes con las flechas sin perder el progreso), o (2) mousedown sobre el día de inicio + arrastrar + soltar sobre el día de fin (confirma al soltar, sin necesidad de un segundo click). Si el día de fin es anterior al de inicio, se reordenan automáticamente. Mientras se arrastra/pasa el mouse se previsualiza el rango con un resaltado tenue antes de confirmar.
- `country`/`showHolidays`/`extraHolidays`/`showMoonPhases` funcionan en **ambas** variantes, pero se muestran distinto por el espacio disponible en cada una:
  - `variant="inline"` (celda rectangular grande): el nombre del feriado se ve como texto (truncado si no entra) y la fase lunar como un ícono de `react-icons/wi`, ambos dentro de la celda.
  - `variant="popover"` (círculo chico de 36px, tamaño fijo — nunca se agranda ni deforma): el feriado se marca con un anillo/borde de color alrededor del círculo (`holidayBorderColor`) y la fase lunar con un punto diminuto (`moonPhaseColor`); ninguno de los dos se muestra como texto/ícono visible ahí, porque no entra sin romper el tamaño fijo de la celda.
  - En ambas variantes, pasar el mouse sobre el día revela el detalle completo (nombre del feriado, fase lunar + fecha) en un tooltip (`ModalTooltip`, vía portal a `document.body` — un tooltip `position: absolute` local no alcanza porque cada celda del grid es su propio stacking context y las celdas de filas siguientes, pintadas después en el DOM, lo taparían).
- `holidayColor` (color del *texto* del nombre del feriado) solo existe en `variant="inline"`, porque el popover nunca muestra ese texto. `holidayBorderColor`/`moonPhaseColor`/`tooltipBgColor`/`tooltipTextColor` sí aplican a ambas variantes.
- `bgColor`/`textColor`/`mutedColor`/`mutedBgColor`/`borderColor`/`hoverColor` (paleta general del calendario grande) solo existen en `variant="inline"` — el popover usa su propia paleta fija (ver `selectedColor`/`accentColor`).
- El cálculo de feriados usa `date-holidays` (datos reales por país, no hardcodeados en la librería); el de fase lunar es un cálculo astronómico aproximado por ciclo sinódico (sin dependencia de red), con ±1 día de margen de error — no reemplaza una efeméride astronómica oficial.
- El popover (`variant="popover"`) se reposiciona automáticamente para no desbordar el viewport: si el input está cerca del borde derecho (o dentro de un contenedor angosto), se desplaza hacia la izquierda lo necesario para quedar completo en pantalla, clampeando también por la izquierda si el contenedor es más angosto que el popover (320px). Se recalcula al abrir y en cada `resize` de la ventana — no requiere ninguna prop.
- Si al abrir el selector de "Año"/"Mes" dentro de un modal/drawer propio (ej. un panel lateral) la lista se ve pero los clics no registran, es un conflicto de capas: el `Popper` de MUI vive en un portal a `<body>`, fuera de ese modal, y si el modal tiene su propio overlay con `z-index` mayor al default del `Popper` (`100000`), ese overlay intercepta los clics aunque visualmente el listado quede encima. Subir `selectorsPopperZIndex` por encima del `z-index` de ese overlay soluciona el bloqueo.

---

### Callout

Caja de aviso/notificación (advertencia, error, éxito, info, nota neutral) con ícono y paleta de color por `variant`, título opcional, timestamp opcional y cuerpo en Markdown completo (listas, negrita, links, bloques de código, tablas, etc. — reutiliza `MarkdownContent` por dentro). Pensado para usarse suelto en una vista, dentro de `DrawPanel`/`Frame`, o como notificación (es el building block que usa `NotificationsPanel` para cada item de la lista). Opcionalmente clickeable/navegable vía `onClick`/`href`.

**Import:**
```jsx
import Callout from '../Callout/index'; // export default
```

**Uso básico:**
```jsx
<Callout variant="warning" title="Advertencia">
  {'Esta acción afecta a **todos los usuarios** del workspace.'}
</Callout>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'info'` \| `'warning'` \| `'danger'` \| `'success'` \| `'neutral'` | `'info'` | Determina paleta (fondo/borde/texto/ícono) e ícono por default. |
| `title` | string | — | Título en negrita sobre el cuerpo. |
| `children` | string | — | Cuerpo en Markdown (mismo formato que `MarkdownContent`). |
| `timestamp` | string | — | Texto pequeño (ej. `"Hace 5 minutos"`) mostrado debajo del cuerpo. |
| `icon` | component | — | Reemplaza el ícono default del `variant`. |
| `actions` | node | — | Contenido (ej. botones) renderizado debajo del cuerpo. Los clicks dentro de `actions` no disparan `onClick`/`href` del Callout (`stopPropagation`). |
| `onClose` | `function()` | — | Si se define, muestra un botón de cerrar (×) arriba a la derecha. Su click tampoco dispara `onClick`/`href`. |
| `closeLabel` | string | `'Cerrar aviso'` | `aria-label` del botón de cerrar. |
| `onClick` | `function(event)` | — | Si se define (y no hay `href`), el Callout entero se vuelve clickeable: se renderiza como `<div role="button" tabIndex={0}>` con soporte de teclado (Enter/Espacio) y cursor pointer. |
| `href` | string | — | Si se define, el Callout se renderiza como `<a href={href}>` (navegación nativa: Ctrl+click, abrir en pestaña nueva, etc.). Tiene prioridad sobre `onClick` como tag, pero `onClick` igual se dispara si también se pasa. |
| `bgColor` | string | — | Sobrescribe el color de fondo de la paleta del `variant`. |
| `textColor` | string | — | Sobrescribe el color del título y del cuerpo (markdown incluido). |
| `iconColor` | string | — | Sobrescribe el color del ícono. |
| `borderColor` | string | — | Sobrescribe el color del borde. |
| `linkColor` | string | — | Color de los links dentro del markdown (pasa a `MarkdownContent`). |
| `markdownComponents` | object | — | Renderers custom de `react-markdown` (pasa a `MarkdownContent`). |
| `className` | string | `''` | Clase adicional en el contenedor raíz. |
| `style` | object | — | Estilos inline adicionales en el contenedor raíz. |

**Ejemplos:**
```jsx
// Con Markdown completo
<Callout variant="warning" title="Antes de continuar">
  {`- La migración **no es reversible**\n- Backup desde \`Configuración → Backups\`\n- [Documentación](https://example.com/docs)`}
</Callout>

// Con acciones y botón de cerrar
<Callout
  variant="danger"
  title="Eliminar cuenta"
  onClose={() => setShow(false)}
  actions={<>
    <Button size="small" variant={Button.VARIANTS.DANGER}>Eliminar</Button>
    <Button size="small" variant={Button.VARIANTS.GHOST}>Cancelar</Button>
  </>}
>
  Esta acción es permanente y no se puede deshacer.
</Callout>
```

**Notas:** Si no se pasa `title` ni `children`, el componente retorna `null`. `role` se calcula automáticamente (`'alert'` para `warning`/`danger`, `'status'` para el resto).

---

### CardV1

Tarjeta de métrica/KPI con badge superior, botón de acción (ej. refrescar), estados de carga/error/vacío, un valor principal grande y un footer opcional con ícono de tendencia.

**Import:**
```jsx
import CardV1 from '../CardV1'; // export default (index.jsx)
```

**Uso básico:**
```jsx
<CardV1
  badgeIcon={DollarSign}
  badgeText="Ingresos"
  primaryText="Total del mes"
  secondaryText="$12,450"
  footerIcon={TrendingUp}
  footerContent="+12% vs mes anterior"
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `badgeIcon` | componente (lucide-react) | — | Ícono del badge principal |
| `badgeText` | string | — | Texto del badge principal |
| `badgeBgColor` | string | `'#f1f5f9'` | Fondo del badge principal |
| `badgeTextColor` | string | `'#475569'` | Color de texto del badge principal |
| `extraBadges` | array de `{ text, bgColor, textColor }` | `[]` | Badges adicionales junto al principal |
| `actionIcon` | componente (lucide-react) | — | Ícono del botón de acción (esquina superior derecha) |
| `onActionClick` | function | — | Handler del botón de acción |
| `actionDisabled` | boolean | `false` | Deshabilita el botón de acción |
| `actionTooltip` | string | — | Si se define, envuelve el botón de acción en `ModalTooltip` |
| `isSpinning` | boolean | `false` | Pasa `loading` al botón de acción (para íconos de refresco) |
| `actionCustomClass` | string | — | Clase custom para el botón de acción (declarada pero no aplicada en el JSX actual) |
| `isLoading` | boolean | `false` | Muestra un skeleton en el contenido principal |
| `isError` | boolean | `false` | Muestra `errorText` en vez del contenido |
| `isEmpty` | boolean | `false` | Muestra `emptyText` en vez del contenido |
| `errorText` | string | `'Error'` | Texto mostrado en estado de error |
| `emptyText` | string | `'Vacío'` | Texto mostrado en estado vacío |
| `primaryText` | node | — | Subtítulo/label sobre el valor principal |
| `secondaryText` | node | — | Valor principal grande |
| `secondaryTextStyle` | object | `{}` | Estilos inline para el valor principal |
| `footerIcon` | componente (lucide-react) | — | Ícono del footer |
| `footerIconColor` | string | — | Color del ícono del footer |
| `footerContent` | node | — | Contenido del footer (si no se define, el footer no se renderiza) |
| `className` | string | `''` | Clase CSS adicional en la tarjeta |
| `variant` | `'default' \| 'glass-pink-green'` | `'default'` | Variante visual de la tarjeta |
| `children` | node | — | Contenido adicional insertado después de `secondaryText` |

**Ejemplos:**
```jsx
<CardV1
  badgeText="Ingresos"
  extraBadges={[{ text: 'Nuevo', bgColor: '#fef3c7', textColor: '#92400e' }]}
  primaryText="Total del mes"
  secondaryText="$8,920"
  footerIcon={TrendingDown}
  footerIconColor="#ef4444"
  footerContent="-5% vs mes anterior"
/>

<CardV1 badgeText="Ingresos" isLoading primaryText="Total del mes" />
```

**Notas:** El archivo `utils.js` del componente exporta helpers (`getPriorityData`, `getAppointmentColorByTime`) que no son usados directamente dentro de `CardV1`; están pensados para que el consumidor calcule colores/badges antes de pasarlos como props.

---

### Chart

Gráficos con un componente único que delega a un motor distinto según `type`: `"line"` y `"bar"` usan [Recharts](https://recharts.org/), `"pie"` usa [@nivo/pie](https://nivo.rocks/pie/) y `"nivo-calendar"` (calendario de actividad estilo GitHub contributions) usa [@nivo/calendar](https://nivo.rocks/calendar/). La card exterior soporta `title`/`description` en Markdown (vía `MarkdownContent`) y un slot `actions` libre (cualquier `ReactNode`: `Search`, `Selector`, `Swich`, botones, etc.) en el header, al lado del título.

**Import:**
```jsx
import Chart from '../Chart/index'; // export default
```

**Uso básico:**
```jsx
<Chart
  type="line"
  data={[{ month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 5800 }]}
  xKey="month"
  lines={[{ dataKey: 'revenue' }]}
/>
```

**Props comunes (`Chart`, el wrapper — aplican sin importar el `type`):**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `type` | `'line'` \| `'pie'` \| `'bar'` \| `'nivo-calendar'` | `'line'` | Motor de gráfico a renderizar. También expuesto como `Chart.TYPE`. |
| `title` | string (Markdown) | — | Título renderizado arriba del gráfico con `MarkdownContent` (soporta headings, negrita, links, etc.). |
| `description` | string (Markdown) | — | Texto renderizado debajo del gráfico con `MarkdownContent`. |
| `actions` | node | — | Contenido libre en el header, a la derecha del `title` (ej. `Search`, `Selector`, `Swich`, botones de ícono, filtros de fecha). El header solo se renderiza si hay `title` y/o `actions`. |
| `bgColor` | string | `#ffffff` | Fondo de la card contenedora. |
| `borderColor` | string | `#e5e7eb` | Color del borde (2px) de la card. El radio es fijo en 6px. |
| `titleColor` | string | — | Color de texto del `title`. |
| `descriptionColor` | string | — | Color de texto del `description`. |
| `className` | string | `''` | Clase adicional en la card. |
| `style` | object | — | Estilos inline adicionales en la card. |

El resto de las props (`data`, colores específicos del motor, etc.) depende del `type` y se pasa directo al mini-componente correspondiente — ver cada uno abajo.

---

#### Chart (`type="line"`)

Basado en Recharts `LineChart`. Soporta eje X categórico o numérico, múltiples líneas, referencias (línea/punto) y tick icons custom en el eje X.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `data` | array | — | `[{ [xKey]: valor, [lines[i].dataKey]: number }]`. |
| `lines` | array | — | `[{ dataKey, name?, color?, strokeWidth?, strokeDasharray? }]`. Color por default según `DEFAULT_LINE_COLORS` (ciclo de 5 colores) si no se pasa `color`. |
| `xKey` | string | `'name'` | Key de `data` usada en el eje X. |
| `xType` | `'category'` \| `'number'` | `'category'` | Tipo de eje X (default real de Recharts). |
| `xTicks` | array de number | — | Valores fijos de los ticks del eje X. |
| `xScale` | string | `'auto'` | Escala del eje X (`'auto'`, `'linear'`, `'symlog'`, etc. — cualquier escala válida de Recharts). |
| `xTickIcon` | `function(value) => pathString` | — | Si se pasa, reemplaza el tick de texto del eje X por un ícono SVG (path `d`, viewBox 1024×1024). |
| `xTickIconColor` | string | hereda `axisColor` | Color del ícono del tick. |
| `xTickIconSize` | number | `24` | Tamaño (px) del ícono del tick. |
| `xAxisHeight` | number | — | Alto del eje X (útil para dar espacio a `xTickIcon`). |
| `yTicks` | array de number | — | Valores fijos de los ticks del eje Y. |
| `yScale` | string | `'auto'` | Escala del eje Y. |
| `showGrid` | bool | `true` | Muestra el `CartesianGrid`. |
| `showTooltip` | bool | `true` | Muestra el tooltip al hover. |
| `showLegend` | bool | `true` | Muestra la leyenda. |
| `referenceLines` | array | `[]` | `[{ y, label?, labelPosition?, color?, strokeDasharray? }]` — línea horizontal en un valor de dato. |
| `referenceDots` | array | `[]` | `[{ x, y, label?, labelPosition?, color?, radius? }]` — punto destacado en coordenadas de dato. |
| `gridColor` | string | `#c7d2fe` | Color del grid. |
| `axisColor` | string | `#4338ca` | Color de los ejes. |
| `textColor` | string | `#1e1b4b` | Color del texto de ticks y del label del tooltip. |
| `tooltipBgColor` | string | `#eef2ff` | Fondo del tooltip. |
| `tooltipBorderColor` | string | `#4338ca` | Borde del tooltip. |
| `tooltipTextColor` | string | — | Color de cada fila del tooltip (por default toma el color de su línea). |
| `legendTextColor` | string | — | Color del texto de la leyenda (por default toma el color de su línea). |
| `height` | number | `300` | Alto en px del gráfico. |

---

#### Chart (`type="bar"`)

Basado en Recharts `BarChart`. Soporta múltiples series, color por serie o por item individual, labels encima de cada barra y ejes formateados.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `data` | array | — | `[{ [xKey]: valor, [bars[i].dataKey]: number, color? }]`. `color` por item pisa el color de la serie en esa barra puntual (ej. un color distinto por categoría dentro de una única serie). |
| `bars` | array | — | `[{ dataKey, name?, color?, unit?, showValueLabel?, labelFormatter? }]`. |
| `xKey` | string | `'name'` | Key de `data` usada en el eje X. |
| `xTickFormatter` | `function(value)` | — | Formatea el texto de cada tick del eje X. |
| `yTickFormatter` | `function(value)` | — | Formatea el texto de cada tick del eje Y. |
| `xAxisLabel` | string | — | Título del eje X (posición `insideBottomRight`). |
| `yLabel` | string | — | Título del eje Y, rotado (posición `insideLeft`). |
| `yDomain` | `[min, max]` | — | Dominio fijo del eje Y (activa `allowDataOverflow`). |
| `yAxisWidth` | number | — | Ancho del eje Y (útil cuando `yLabel`/los ticks son largos). |
| `showGrid` | bool | `true` | Muestra el `CartesianGrid`. |
| `showTooltip` | bool | `true` | Muestra el tooltip al hover. |
| `showLegend` | bool | `true` | Muestra la leyenda. |
| `gridColor` | string | `#c7d2fe` | Color del grid. |
| `axisColor` | string | `#4338ca` | Color de los ejes. |
| `textColor` | string | `#1e1b4b` | Color del texto de ticks y del label del tooltip. |
| `tooltipBgColor` | string | `#eef2ff` | Fondo del tooltip. |
| `tooltipBorderColor` | string | `#4338ca` | Borde del tooltip. |
| `tooltipTextColor` | string | — | Color de cada fila del tooltip. |
| `legendTextColor` | string | — | Color del texto de la leyenda. |
| `labelColor` | string | hereda `textColor` | Color del texto de `showValueLabel` encima de cada barra. |
| `height` | number | `300` | Alto en px del gráfico. |

---

#### Chart (`type="pie"`)

Basado en [@nivo/pie](https://nivo.rocks/pie/) — dona o torta llena con labels externos conectados por línea, color-matched al segmento, ícono configurable en el centro (si hay hueco) y porciones clickeables.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `data` | array | — | `[{ name, value, color? }]`. `color` por item pisa el color de paleta para esa porción. |
| `colors` | array de string | paleta de 12 colores | Paleta cíclica usada cuando el item no trae `color` propio. |
| `innerRadius` | number (0–1) | `0.5` | Proporción del hueco central (`0` = torta llena, `~1` = anillo muy fino). |
| `padAngle` | number | `0.6` | Separación angular entre porciones. |
| `cornerRadius` | number | `2` | Redondeo de las esquinas de cada porción. |
| `onSliceClick` | `function({ name, value, color }, index, event)` | — | Si se define, cada porción se vuelve clickeable (cursor pointer). |
| `centerIcon` | node | `<FiPieChart />` (solo si `innerRadius > 0`) | Ícono/elemento en el centro de la dona. `null`/`false` lo oculta explícitamente; en torta llena (`innerRadius={0}`) no se muestra por default porque se superpondría con las porciones. |
| `centerIconColor` | string | `#1e1b4b` | Color del ícono central default. |
| `showTooltip` | bool | `true` | Muestra el tooltip al hover. |
| `showLegend` | bool | `true` | Muestra la leyenda (abajo, símbolo circular). |
| `sliceStrokeColor` | string | `#fff` | Color del borde entre porciones. |
| `textColor` | string | `#1e1b4b` | Color del label del tooltip y de los links de las etiquetas externas (`arcLinkLabelsTextColor`). |
| `arcLabelColor` | string/objeto | arco oscurecido (`darker`, 2) | Color del número dentro de cada porción. |
| `tooltipBgColor` | string | `#eef2ff` | Fondo del tooltip. |
| `tooltipBorderColor` | string | `#4338ca` | Borde del tooltip. |
| `tooltipTextColor` | string | hereda `textColor` | Color del valor dentro del tooltip. |
| `legendTextColor` | string | `#1e1b4b` | Color del texto de la leyenda. |
| `height` | number | `400` | Alto en px del gráfico. |

---

#### Chart (`type="nivo-calendar"`)

Basado en [@nivo/calendar](https://nivo.rocks/calendar/) — calendario de actividad por día (estilo GitHub contributions), con celdas clickeables.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `data` | array | — | `[{ day: 'YYYY-MM-DD', value: number }]`. |
| `from` | string/Date | — | Fecha de inicio del rango mostrado. |
| `to` | string/Date | — | Fecha de fin del rango mostrado. |
| `colors` | array de string | `['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']` | Escala de color según `value` (días sin dato usan `emptyColor`). |
| `emptyColor` | string | `#eeeeee` | Color de los días sin dato en `data`. |
| `monthBorderColor` | string | `#ffffff` | Color del borde entre meses. |
| `dayBorderColor` | string | `#ffffff` | Color del borde entre días. |
| `dayBorderWidth` | number | `2` | Grosor del borde entre días. |
| `yearSpacing` | number | `40` | Espacio (px) entre filas de años, si el rango cruza más de un año. |
| `margin` | object | `{ top: 40, right: 40, bottom: 40, left: 40 }` | Márgenes del gráfico. |
| `showLegend` | bool | `true` | Muestra la leyenda de intensidad (abajo a la derecha). |
| `onDayClick` | `function(day, event)` | — | Si se define, cada celda se vuelve clickeable (cursor pointer); `day` trae `day`/`value`/`date`/`color` del día (o solo `day`/`date` si no tiene dato). |
| `height` | number | `300` | Alto en px del gráfico. |

**Ejemplos:**
```jsx
// Barra con color por item individual y eje Y con dominio fijo
<Chart
  type="bar"
  data={[
    { name: 'Sun', massKg: 1.989e30, color: '#ffa700' },
    { name: 'Mercury', massKg: 3.3e23, color: '#1a1a1a' },
  ]}
  xKey="name"
  bars={[{ dataKey: 'massKg', unit: 'kg' }]}
  yDomain={[1e23, 2e27]}
  yLabel="Mass [kg]"
/>

// Torta clickeable con título/descripción en Markdown
<Chart
  type="pie"
  title="## Distribución por categoría"
  description="Hacé click en una porción para ver el detalle."
  data={[{ name: 'A', value: 30 }, { name: 'B', value: 70 }]}
  onSliceClick={(entry) => console.log(entry.name, entry.value)}
/>

// Calendario de actividad con acciones en el header (Search + botón)
<Chart
  type="nivo-calendar"
  data={[{ day: '2024-03-01', value: 12 }]}
  from="2024-03-01"
  to="2024-07-12"
  title="## Actividad del usuario"
  actions={<button onClick={refresh}>Refrescar</button>}
  onDayClick={(day) => openDrawPanel(day)}
/>
```

**Notas:** `recharts`, `@nivo/core`, `@nivo/pie` y `@nivo/calendar` vienen empaquetados como `dependencies` de la librería — no hace falta instalarlos en el proyecto consumidor. `type="pie"` usa Nivo (reemplazó una implementación previa en Recharts); `type="line"`/`"bar"` siguen en Recharts. Choropleth (`@nivo/geo`) se evaluó pero no se implementó: requiere un GeoJSON de `features` que la librería no embebe (queda a criterio del consumidor agregarlo si lo necesita).

---

### ChatWindow

Ventana de chat completa (header de contacto, lista de mensajes con auto-scroll, indicador de "escribiendo" y composer) con un mini-lenguaje de formato propio que se traduce a Markdown.

**Import:**
```jsx
import ChatWindow from '../ChatWindow/index'; // export default
```

**Uso básico:**
```jsx
<ChatWindow
  messages={messages}
  currentUser={{ id: 'user-1' }}
  selectedContact={selectedContact}
  onSend={(text) => sendMessage(text)}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `messages` | array de `{ id, from, content, createdAt }` | `[]` | Lista de mensajes; `content` puede ser string (parseado con el mini-formato) o un nodo React |
| `currentUser` | object `{ id }` | `{}` | Usuario actual, usado para alinear mensajes propios |
| `selectedContact` | object `{ id, name, avatarUrl, raw }` | `{}` | Contacto activo mostrado en el header |
| `isTyping` | boolean | `false` | Muestra el indicador de "escribiendo" |
| `onSend` | function(text) | — | Handler al enviar un mensaje (Enter o botón enviar) |
| `showHeader` | boolean | `true` | Muestra/oculta el header del hilo |
| `isMobile` | boolean | `false` | Muestra botón "Volver" en el header (para layout móvil) |
| `showContactsList` | boolean | `false` | Declarado pero no usado en el render actual |
| `handleBackToList` | function | — | Handler del botón "Volver" en modo móvil |
| `isLoading` | boolean | `false` | Muestra el componente `Loading` en el área de mensajes |
| `placeholder` | string | `'Escribe tu mensaje aquí...'` | Placeholder del textarea de composición |
| `accentColor` | string | — | Color de acento (`--chat-accent`) |
| `accentColorDark` | string | — | Color de acento oscuro (`--chat-accent-dark`) |

**Ejemplos:**
```jsx
<ChatWindow messages={messages} currentUser={currentUser} selectedContact={selectedContact} isTyping onSend={handleSend} />

<ChatWindow
  messages={messages}
  currentUser={currentUser}
  selectedContact={selectedContact}
  isMobile
  handleBackToList={() => setSelected(null)}
  onSend={handleSend}
/>
```

**Notas:** El texto de cada mensaje soporta un mini-formato propio: `**texto**` para resaltado (vía `GreenHighlight`), `$Label|url$` para enlaces (`BlueLink`) y `(texto)` para bloques copiables (`CopyText`); todo se convierte a Markdown y se renderiza con `MarkdownContent`. Depende de `UserAvatar`, `Loading`, `CopyText`, `GreenHighlight`, `BlueLink` y `MarkdownContent`, además de `Popover` de Material-UI para el menú de ayuda de formato.

---

### Checks

Ítem de checkbox de permisos: fila completa clicable con un `Checkbox` de Material-UI y una etiqueta, pensado para listas de permisos/opciones.

**Import:**
```jsx
import PermissionCheckboxItem from '../Checks/index'; // export default
```

**Uso básico:**
```jsx
<PermissionCheckboxItem
  label="Ver historial clínico"
  checked={checked}
  onChange={() => setChecked(!checked)}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | string | — | Texto de la opción (también usado como texto del tooltip sobre el checkbox) |
| `checked` | boolean | — | Estado marcado/desmarcado |
| `onChange` | function | — | Handler al hacer click en toda la fila (no solo en el checkbox) |
| `disabled` | boolean | — | Deshabilita la fila y el checkbox |
| `checkedBgColor` | string | — | Color de fondo cuando está marcado (`--checks-checked-bg`) |

**Ejemplos:**
```jsx
<PermissionCheckboxItem label="Editar información de pacientes" checked onChange={toggle} />

<PermissionCheckboxItem label="Eliminar registros (bloqueado)" checked={false} disabled onChange={toggle} />
```

**Notas:** Todo el `ButtonBase` es clicable (no solo el checkbox visual), y el checkbox interno tiene `tabIndex={-1}` para que el foco recaiga en el contenedor.

---

### ColorPicker

Selector de color: botón con muestra + hex que despliega un popover con área de saturación/brillo, barra de matiz y edición numérica en HEX, RGB o HSL. Lógica portada del `ColorPickerPanel` de Workspace-Backoffice-Web (sin `energy-ui` ni `i18next`).

**Import:**
```jsx
import ColorPicker from '../ColorPicker/index'; // export default (memo), archivo index.jsx
```

**Uso básico:**
```jsx
const [color, setColor] = useState('#1717FF');
<ColorPicker label="Color" value={color} onChange={setColor} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| value | string | `'#000000'` | Color en hex de 6 dígitos (con o sin `#`). Controlado: si cambia desde afuera, el panel se resincroniza. |
| onChange | function | — | Recibe el hex en mayúsculas (`'#RRGGBB'`). Durante el arrastre se emite con throttle de 80 ms y se hace flush al soltar. |
| label | string | — | Etiqueta sobre el botón. |
| ariaLabel | string | `label` | `aria-label` del botón. |
| disabled | boolean | `false` | Deshabilita el selector. |
| placement | string | `'bottom-start'` | Posición del popover (se voltea/ajusta solo si no hay espacio). |
| labels | object | textos en español | Textos traducibles: `saturation`, `hue`, `invalidHex`, `invalidRgb`, `invalidHsl`, `channels` (`r g b h s l`). |
| className | string | `''` | Clase CSS del contenedor. |
| bgColor / textColor / borderColor / accentColor | string | blanco / `#1e293b` / `#e2e8f0` / `#1717ff` | Colores del botón y del popover. |

**Notas:** Accesible por teclado (flechas sobre el área de saturación y la barra de matiz, Escape cierra). Soporta mouse y touch (pointer events). Un valor inválido en HEX/RGB/HSL muestra error y se restaura al salir del campo.

---

### Container

Envoltorio de tarjeta genérico para secciones de contenido, con soporte opcional de paginación integrada (`Paginador` de Material-UI).

**Import:**
```jsx
import Container from '../Container'; // export default (index.jsx)
```

**Uso básico:**
```jsx
<Container>
  <p>Contenido de ejemplo dentro del contenedor.</p>
</Container>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | node | — | Contenido del contenedor |
| `className` | string | `''` | Clase CSS adicional |
| `showPagination` | boolean | `false` | Muestra el bloque de paginación al pie |
| `paginationCount` | number | `10` | Total de elementos/páginas para el `Paginador` |
| `paginationPage` | number | `1` | Página actual |
| `onPaginationChange` | function | — | Handler de cambio de página |
| `paginationProps` | object | `{}` | Props adicionales pasadas directo al `Paginador` |
| `pageSize` | number | `10` | Tamaño de página actual |
| `pageSizeOptions` | array | `[5, 10, 20, 50]` | Opciones de tamaño de página |
| `onPageSizeChange` | function | — | Handler de cambio de tamaño de página |
| `borderColor` | string | `'rgba(0, 0, 0, 0.08)'` | Color del borde del contenedor (`--container-border`). Por defecto un negro claro sutil. |
| `bgImage` | string | — | URL de una imagen de fondo, renderizada detrás del contenido (capa independiente del `backdrop-filter` existente) |
| `blurBackground` | boolean | `false` | Difumina la imagen de `bgImage` (no afecta el `backdrop-filter` del contenido, que sigue activo siempre por compatibilidad) |
| `...props` | — | — | Cualquier otra prop (ej. `onClick`, `id`, `style`) se pasa al `div` raíz |

**Ejemplos:**
```jsx
<Container
  showPagination
  paginationCount={50}
  paginationPage={1}
  pageSize={10}
  onPaginationChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
>
  <p>Lista de resultados paginados.</p>
</Container>

<Container bgImage="/fondo.jpg" blurBackground style={{ minHeight: '100vh' }}>
  <p>Contenedor usado como fondo de pantalla completa, con imagen difuminada detrás.</p>
</Container>
```

**Notas:**
- Para usar `Container` como fondo de pantalla completa, combinar con `style={{ minHeight: '100vh', maxWidth: 'none' }}` (el `max-width: 1300px` por defecto está pensado para secciones de contenido, no para fondos).

---

### CopyText

Texto/código con click-to-copy: al hacer click copia el valor al portapapeles vía `navigator.clipboard` y muestra feedback visual (ícono de check) durante 2 segundos.

**Import:**
```jsx
import CopyableText from '../CopyText/index'; // export default
```

**Uso básico:**
```jsx
<CopyableText text="ABC-12345-XYZ" />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `text` | string | — | Texto a mostrar y copiar al portapapeles |
| `bgColor` | string | — | Color de fondo (`--copytext-bg`) |
| `borderColor` | string | — | Color de borde (`--copytext-border`) |
| `textColor` | string | — | Color de texto (`--copytext-text`) |

**Ejemplos:**
```jsx
<CopyableText text="f47ac10b-58cc-4372-a567-0e02b2c3d479" />
```

**Notas:** Muestra un `ModalTooltip` con "Haga clic para copiar" / "¡Copiado!" según el estado; requiere un contexto de navegador con `navigator.clipboard` disponible (HTTPS o localhost).

---

### CountdownBar

Barra de progreso/cuenta regresiva animada, con color interpolado dinámicamente según el progreso; soporta modo temporizador automático (por duración o fecha de expiración) o modo de valor controlado externamente, y una variante "overlay" a pantalla completa.

**Import:**
```jsx
import CountdownBar from '../CountdownBar'; // export default (index.jsx)
```

**Uso básico:**
```jsx
<CountdownBar active duration={10000} onComplete={() => console.log('listo')} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `active` | boolean | — | Si es `false`, el componente no renderiza nada |
| `duration` | number (ms) | `10000` | Duración del temporizador cuando no se usa `value`/`expiresAt` |
| `onComplete` | function | — | Callback al llegar a 0 |
| `height` | string | `'6px'` | Alto de la barra |
| `width` | string | `'100%'` | Ancho del wrapper |
| `colors` | array de strings hex | `['#ef4444', '#f59e0b', '#10b981', '#3b82f6']` | Gradiente de colores interpolado según el progreso (rojo→azul de fin a inicio) |
| `expiresAt` | string/Date | — | Fecha/hora de expiración absoluta, alternativa a `duration` |
| `totalDuration` | number (ms) | `900000` | Duración total usada para calcular el % cuando se usa `expiresAt` |
| `value` | number (0-100) | — | Si se define, el progreso es controlado externamente (ignora el temporizador interno) |
| `increment` | boolean | `false` | Cuando se usa `value`, invierte la barra para que se vea "creciente" en vez de "decreciente" |
| `isOverlay` | boolean | `false` | Renderiza la barra centrada como overlay de pantalla, con `overlayMessage` |
| `overlayMessage` | string | — | Mensaje mostrado sobre la barra en modo overlay |

**Ejemplos:**
```jsx
<CountdownBar active duration={15000} height="10px" colors={['#ef4444', '#f97316', '#22c55e']} onComplete={handleDone} />

<CountdownBar active value={65} increment height="8px" />

<CountdownBar active duration={8000} isOverlay overlayMessage="Guardando cambios, no cierres esta ventana..." onComplete={handleDone} />
```

**Notas:** Envuelve la barra en `ModalTooltip` mostrando el porcentaje o segundos restantes. El hook interno `useCountdown` (en `utils.js`) captura `expiresAt`/`totalDuration` solo la primera vez que se activa.

---

### DateTag

Etiqueta/chip que muestra una fecha (y hora) formateada en español con un ícono de calendario.

**Import:**
```jsx
import DateTag from '../DateTag'; // export default (index.jsx)
```

**Uso básico:**
```jsx
<DateTag date="2026-09-12T10:30:00" />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `date` | string \| Date | — | Fecha a mostrar; si es falsy, el componente no renderiza nada |
| `bgColor` | string | `'var(--tag-bg, #f1f5f9)'` | Color de fondo |
| `textColor` | string | `'var(--tag-text, #475569)'` | Color de texto |
| `iconColor` | string | usa `textColor` como fallback | Color del ícono de calendario |
| `style` | object | `{}` | Estilos inline adicionales (tienen prioridad sobre `bgColor`/`textColor`) |

**Ejemplos:**
```jsx
<DateTag date="2026-01-05T08:00:00" bgColor="#fee2e2" textColor="#b91c1c" />

<DateTag date="2026-12-25T00:00:00" bgColor="#dcfce7" textColor="#166534" iconColor="#16a34a" />
```

**Notas:** El formato de fecha es fijo: `dd/MM/yyyy HH:mm` en locale `es-ES` (vía `toLocaleString`), no configurable por props.

---

### DesplegablePanel

Panel/fila expandible tipo "settings" (acordeón de un solo ítem): muestra un ícono, título y descripción, y al hacer click alterna la visibilidad de su contenido (controlado externamente vía `isOpen`/`onToggle`).

**Import:**
```jsx
import DesplegablePanel from '../DesplegablePanel'; // export default (index.jsx)
```

**Uso básico:**
```jsx
<DesplegablePanel
  title="Notificaciones"
  description="Administra cómo recibes las alertas del sistema"
  icon={Bell}
  isOpen={open}
  onToggle={() => setOpen(!open)}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | — | Título de la fila |
| `description` | string | — | Descripción secundaria (opcional) |
| `icon` | componente (lucide-react) | — | Ícono a la izquierda |
| `iconColorVariant` | `'blue' \| 'green' \| 'purple' \| 'red' \| 'green2'` | — | Variante de color predefinida del contenedor del ícono |
| `iconColor` | string | — | Sobrescribe el color del ícono (`--dp-icon-color`) |
| `iconBgColor` | string | — | Sobrescribe el fondo del ícono (`--dp-icon-bg`) |
| `isOpen` | boolean | `false` | Controla si el contenido (`children`) está expandido |
| `onToggle` | function | — | Handler al hacer click en la fila |
| `action` | node | — | Si se define, reemplaza la flecha (chevron) por este contenido a la derecha |
| `children` | node | — | Contenido expandible, solo se renderiza si `isOpen` es `true` |

**Ejemplos:**
```jsx
<DesplegablePanel
  title="Seguridad"
  description="Configura las opciones de seguridad de tu cuenta"
  icon={Shield}
  iconColorVariant="green"
  isOpen
  onToggle={toggle}
>
  <p>Aquí puedes activar la autenticación en dos pasos.</p>
</DesplegablePanel>

<DesplegablePanel
  title="Perfil"
  icon={User}
  action={<span style={{ fontSize: '0.8rem', color: '#64748b' }}>Editar</span>}
  onToggle={toggle}
/>
```

**Notas:** El componente es totalmente controlado: no maneja estado interno de apertura, depende de que el consumidor guarde `isOpen` y actualice en `onToggle`.

---

### DrawPanel

Panel lateral (drawer) deslizante renderizado vía portal, con header, footer de acciones opcional, barra de progreso (`CountdownBar`) opcional y protección contra cierre accidental cuando hay cambios sin guardar.

**Import:**
```jsx
import DrawPanel from '../DrawPanel'; // export default (index.jsx)
```

**Uso básico:**
```jsx
<DrawPanel
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Detalle del registro"
  description="Revisa la información antes de continuar"
  width="420px"
>
  <p>Contenido del panel lateral.</p>
</DrawPanel>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` | boolean | — | Controla apertura/cierre (anima entrada/salida antes de desmontar) |
| `onClose` | function | — | Handler de cierre (click en overlay, botón X o cancelar) |
| `title` | string | — | Título del panel |
| `closeIcon` | component | `XCircle` (lucide-react) | Ícono del botón de cerrar; recibe `size` y `color` como props (mismo contrato que cualquier ícono de lucide-react) |
| `description` | string | — | Texto descriptivo, ubicado según `descriptionPosition` |
| `descriptionPosition` | `'top' \| 'bottom'` | `'top'` | Dónde se muestra la descripción |
| `children` | node | — | Contenido principal del panel |
| `width` | string | `'400px'` | Ancho máximo del panel |
| `showActions` | boolean | `true` | Muestra footer con botones cancelar/confirmar |
| `onConfirm` | function | — | Handler del botón confirmar |
| `confirmText` | string | `'Confirmar'` | Texto del botón confirmar (ignorado si `confirmButtonProps.children` viene definido) |
| `cancelText` | string | `'Cancelar'` | Texto del botón cancelar (ignorado si `cancelButtonProps.children` viene definido) |
| `confirmButtonProps` | object | — | Props adicionales spreadeadas sobre el `Button` de confirmar (override total: variant, color, icon, children, etc.) |
| `cancelButtonProps` | object | — | Props adicionales spreadeadas sobre el `Button` de cancelar (override total: variant, color, icon, children, etc.) |
| `formId` | string | — | Si se define, el botón confirmar es `type="submit"` con `form={formId}` |
| `loading` | boolean | `false` | Estado de carga de los botones del footer |
| `contentLoading` | boolean | `false` | Reemplaza `children` (y la descripción bottom) por un `Loading` centrado dentro del área de contenido |
| `contentLoadingText` | string | — | Texto mostrado bajo el spinner cuando `contentLoading` está activo (pasado a `Loading` como `text`; ignorado si `typeLoading` es `'skeleton'`) |
| `typeLoading` | string | `'default'` | Variante de `Loading` usada cuando `contentLoading` está activo. `'skeleton'`/`'Skeleton'` (sin distinguir mayúsculas) fuerza el placeholder de líneas; cualquier otro valor se pasa tal cual como `variant` a `Loading` (`'bars'`, `'bounce'`, `'box'`, o cualquier otro string, que cae al spinner `'default'` de `Loading` si no matchea ninguna variante) |
| `success` | boolean \| undefined | `undefined` | Pasado al `Button` de confirmar |
| `className` | string | `''` | Clase adicional en el panel |
| `showCountdown` | boolean | `false` | Muestra una `CountdownBar` dentro del header (debajo del título), pegada a la línea divisoria |
| `countdownActive` | boolean | `true` | Activa el temporizador de la `CountdownBar` |
| `countdownDuration` | number | — | Duración pasada a `CountdownBar` |
| `countdownOnComplete` | function | — | Callback al completar el countdown |
| `countdownExpiresAt` | string/Date | — | Fecha de expiración para `CountdownBar` |
| `countdownTotalDuration` | number | — | Duración total para `CountdownBar` |
| `countdownValue` | number | — | Valor manual de progreso (ver `calculatedProgress`) |
| `countdownHeight` | string | — | Alto de la `CountdownBar` |
| `countdownColors` | array | — | Colores de la `CountdownBar` |
| `countdownIncrement` | boolean | `true` | Modo incremental de la `CountdownBar` |
| `progressMode` | `'count' \| 'selection' \| 'form'` | `'count'` | Cómo se calcula el progreso automáticamente |
| `totalFields` | number | `0` | Total de campos (modo `'count'`) |
| `filledFields` | number | `0` | Campos completados (modo `'count'`) |
| `totalItems` | array | `[]` | Ítems totales (modo `'selection'`) |
| `selectedItems` | array | `[]` | Ítems seleccionados (modo `'selection'`) |
| `formData` | object | — | Datos del formulario (modo `'form'`, y para detectar cambios sin guardar) |
| `requiredFields` | array | `[]` | Campos requeridos a validar (modo `'form'`) |
| `panelColor` | string | `'#ffffff'` | Color de fondo del panel/header/footer |
| `textColor` | string | `'#0f172a'` | Color del texto del título |
| `mutedTextColor` | string | `'#64748b'` | Color de textos secundarios/íconos |
| `borderColor` | string | `'#e2e8f0'` | Color de bordes del header/footer |
| `hasUnsavedChanges` | boolean | — | Fuerza el estado "sucio"; si no se define, se infiere de `formData` |
| `closeConfirmMessage` | string | `'Vuelve a hacer clic fuera para cerrar sin guardar'` | Mensaje mostrado al intentar cerrar con cambios sin guardar |
| `anchor` | `'right' \| 'top'` | `'right'` | Lado desde el que se desliza el panel |

**Ejemplos:**
```jsx
<DrawPanel
  isOpen
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Confirmar acción"
  description="Esta acción no se puede deshacer"
  descriptionPosition="bottom"
  showActions
  confirmText="Guardar"
>
  <p>Formulario o resumen de la acción a confirmar.</p>
</DrawPanel>

<DrawPanel
  isOpen
  onClose={handleClose}
  title="Selecciona elementos"
  showCountdown
  progressMode="selection"
  totalItems={['a', 'b', 'c', 'd']}
  selectedItems={['a', 'b']}
>
  <p>2 de 4 elementos seleccionados.</p>
</DrawPanel>

<DrawPanel
  isOpen
  onClose={handleClose}
  title="Detalle del registro"
  closeIcon={MedalIcon} // ícono propio (lucide-react) en vez del XCircle default
>
  <p>Contenido del panel lateral.</p>
</DrawPanel>

<DrawPanel
  isOpen
  onClose={handleClose}
  title="Detalle del registro"
  contentLoading={isFetching}
  contentLoadingText="Cargando información..."
>
  <p>Este contenido no se muestra mientras contentLoading es true.</p>
</DrawPanel>

<DrawPanel
  isOpen
  onClose={handleClose}
  title="Detalle del registro"
  contentLoading={isFetching}
  typeLoading="skeleton"
>
  <p>Este contenido no se muestra mientras contentLoading es true.</p>
</DrawPanel>
```

**Notas:** Se renderiza con `createPortal` en `document.body`. Si hay `formData` con valores (o `hasUnsavedChanges` es `true`), el primer click fuera del panel o en el botón cerrar solo muestra un aviso (`closeConfirmMessage`); un segundo click sí cierra. Compone `Button`, `CountdownBar` y `Loading` internos del sistema. El header (título + `CountdownBar` si `showCountdown`) queda fijo (`flex-shrink: 0`) mientras solo el contenido (`children`) hace scroll; al scrollear el contenido aparece una sombra interna sutil bajo el header (color derivado de `borderColor`) como indicador de que hay más contenido arriba. En `anchor="top"` el panel queda acotado a la altura del viewport (`max-height: 100%`) para que el scroll ocurra siempre dentro del contenido, nunca en la página. `contentLoading` es independiente del `loading` de los botones del footer: se puede mostrar el panel con los botones habilitados mientras el contenido todavía carga, o viceversa.

---

### FileListItem

Fila de lista de archivos: checkbox de selección opcional, ícono cuadrado de color según el tipo de archivo (mismo mapeo que [MediaViewer](#mediaviewer), ver [common/icons/fileType.js](#común-iconsfiletypejs)), nombre, metadata (tamaño · fecha) y acciones a la derecha. Las acciones por default son compartir/descargar/eliminar (solo se renderiza el botón cuyo callback se pasa); se pueden reemplazar completamente por botones propios (ej. "Editar") vía la prop `actions`. Pensado para listar varias instancias apiladas (ver story `ListaCompleta`). Responsive: en viewports angostos (`max-width: 480px`) reduce paddings, tamaño del ícono y de los botones de acción; el nombre siempre trunca con ellipsis en vez de desbordar.

**Import:**
```jsx
import FileListItem from 'anteriority-ui/screens/components/FileListItem'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<FileListItem name="Product Backlog - Happy Pets v2.pdf" size="114.7 KB" date="16/10/2026" />

<FileListItem
  name="Historias Usuario.docx"
  size="30.8 KB"
  date="15/10/2026"
  selectable
  selected={selected}
  onSelectChange={setSelected}
  onShare={() => share(file)}
  onDownload={() => download(file)}
  onDelete={() => remove(file)}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| name | string | — | Nombre de archivo a mostrar (también se usa para inferir el ícono/color por extensión). |
| url | string | — | URL del archivo; si no se pasa `name`, se usa para inferir el tipo igual (no se renderiza como link por sí sola — ver `onClick`/`actions` para eso). |
| size | string | — | Texto de tamaño ya formateado (ej. `'114.7 KB'`). El componente no formatea bytes — para eso usar `formatFileSize` auxiliar de ser necesario antes de pasarlo. |
| date | string | — | Texto de fecha ya formateado (ej. `'16/10/2026'`). |
| selectable | bool | `false` | Muestra el checkbox de selección (MUI `Checkbox`) a la izquierda. |
| selected | bool | `false` | Estado controlado del checkbox. |
| onSelectChange | function | — | Callback `(checked: bool)` al tildar/destildar. |
| selectLabel | string | `'Seleccionar archivo'` | `aria-label` del checkbox. |
| onShare | function | — | Si se pasa, renderiza el botón de compartir (ícono `Share2`) en las acciones default. |
| onDownload | function | — | Si se pasa, renderiza el botón de descarga (ícono `Download`) en las acciones default. |
| onDelete | function | — | Si se pasa, renderiza el botón de eliminar (ícono `Trash2`, se pinta rojo en hover) en las acciones default. |
| shareLabel | string | `'Compartir'` | `aria-label`/`title` del botón de compartir. |
| downloadLabel | string | `'Descargar'` | `aria-label`/`title` del botón de descargar. |
| deleteLabel | string | `'Eliminar'` | `aria-label`/`title` del botón de eliminar. |
| actions | node | — | Si se pasa (incluso `null`), reemplaza por completo el bloque de acciones default — útil para botones propios como "Editar". El click dentro de este bloque no dispara el `onClick` de la fila (`stopPropagation`). |
| onClick | function | — | Si se pasa, toda la fila es clickeable (cursor pointer, hover, `role="button"`, accesible por teclado). |
| bgColor | string | `'transparent'` | Color de fondo de la fila. |
| borderColor | string | `'#e2e8f0'` | Color de borde de la fila. |
| textColor | string | `'#1e293b'` | Color del nombre de archivo. |
| metaColor | string | `'#64748b'` | Color del texto de metadata (tamaño/fecha) y de los íconos de acción. |
| className | string | `''` | Clase adicional para la fila. |
| style | object | — | Estilos inline adicionales para la fila. |

**Ejemplos:**
```jsx
// Lista completa con selección individual y eliminar que saca el item del estado
{files.map((file) => (
  <FileListItem
    key={file.id}
    name={file.name}
    size={file.size}
    date={file.date}
    selectable
    selected={file.selected}
    onSelectChange={(checked) => toggleSelected(file.id, checked)}
    onShare={() => share(file)}
    onDownload={() => download(file)}
    onDelete={() => removeFile(file.id)}
  />
))}

// Acciones completamente custom (ej. un botón "Editar" en vez de compartir/descargar/eliminar)
<FileListItem
  name="reporte-ventas.xlsx"
  size="45 KB"
  date="01/10/2026"
  actions={<Button size="small" onClick={() => editFile(file)}>Editar</Button>}
/>
```

**Notas:** El ícono cuadrado de color no tiene prop propia — viene del tipo de archivo detectado (mismo mapeo que `MediaViewer`), igual que su glifo blanco. No persiste selección ni hace llamadas de red — es puramente presentacional/controlado.

---

### Filter

Barra de acciones para filtros de una tabla/listado: botón "Filtrar" que abre un panel lateral (drawer) con los campos de filtro, badge con el conteo de filtros activos, botón "Limpiar" e indicador del término de búsqueda actual.

**Import:**
```jsx
import Filter from '../Filter/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<Filter title="Filtros" onApply={handleApply} onClear={handleClear}>
  <TextField label="Nombre" placeholder="Buscar por nombre" />
</Filter>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| children | node | — | Campos de filtro que se renderizan dentro del panel lateral. |
| onClear | function | — | Se ejecuta al pulsar "Limpiar". Si no se pasa, ese botón no se muestra. |
| onApply | function | — | Se ejecuta al pulsar "Aplicar"; además cierra el panel. |
| searchTerm | string | `''` | Si tiene valor, muestra un indicador "Buscar: {searchTerm}" en la barra. |
| width | string | `'350px'` | Ancho del panel lateral (DrawPanel). |
| title | string | `'Filtros'` | Título del panel lateral. |
| activeFiltersCount | number | `0` | Si es mayor a 0, muestra un badge numérico sobre el botón "Filtrar". |
| badgeColor | string | — | Color de fondo del badge (`--filter-badge-bg`). |

**Ejemplos:**
```jsx
<Filter
  title="Filtros avanzados"
  activeFiltersCount={3}
  searchTerm="reporte mensual"
  onApply={handleApply}
  onClear={handleClear}
>
  <TextField label="Nombre" placeholder="Buscar por nombre" />
  <TextField label="Estado" placeholder="Activo, inactivo..." />
</Filter>
```
```jsx
<Filter title="Filtros" width="480px" onApply={handleApply} onClear={handleClear}>
  <TextField label="Fecha desde" type="date" />
</Filter>
```

**Notas:** Compone internamente `DrawPanel`, `Button` y `ModalTooltip` (el badge muestra un tooltip "Filtros aplicados"). El botón "Limpiar" solo aparece si se pasa `onClear`.

---

### FormControls

Conjunto de tres componentes para armar formularios en tarjeta: `FormCard` (contenedor con encabezado e ícono), `FormInput` (campo de texto) y `FormTextArea` (área de texto multilínea).

**Import:**
```jsx
import { FormCard, FormInput, FormTextArea } from '../FormControls/index'; // named exports, archivo index.jsx
```

**Uso básico:**
```jsx
<FormCard icon={Settings} title="Preferencias">
  <FormInput label="Nombre completo" placeholder="Juan Pérez" />
  <FormTextArea label="Descripción" placeholder="Cuéntanos más detalles" rows={5} />
</FormCard>
```

**Props:**

#### FormCard

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| icon | componente (ícono) | — | Ícono (ej. de lucide-react) mostrado junto al título. |
| title | string | — | Título de la tarjeta. |
| children | node | — | Contenido del cuerpo de la tarjeta. |
| headerActions | node | — | Elemento(s) alineados a la derecha del header (ej. un botón "Editar"). |
| iconColor | string | — | Color del ícono (`--form-card-icon`). |

#### FormInput

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| label | string | — | Etiqueta del campo, pasada a `TextField`. |
| icon | componente | — | Se recibe pero actualmente no se renderiza (no tiene efecto visual). |
| ...props | any | — | Cualquier otra prop válida de `TextField` (placeholder, value, onChange, error, helperText, etc.). |

#### FormTextArea

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| label | string | — | Etiqueta del campo, pasada a `MultilinePlaceholder`. |
| icon | componente | — | Se recibe pero actualmente no se renderiza (no tiene efecto visual). |
| ...props | any | — | Cualquier otra prop válida de `MultilinePlaceholder` (rows, placeholder, value, onChange, error, etc.). |

**Ejemplos:**
```jsx
<FormCard icon={FileText} title="Datos del contacto" headerActions={<button type="button">Editar</button>}>
  <FormInput label="Nombre completo" placeholder="Juan Pérez" />
</FormCard>
```

**Notas:** `FormInput` y `FormTextArea` son wrappers delgados de `TextField` y `MultilinePlaceholder` respectivamente: heredan todas sus props.

---

### Frame

Contenedor tipo "card" con título, ícono, descripción y estado de error/carga opcionales. Puede renderizarse inline o como modal (overlay + portal). Opcionalmente scrollea su contenido internamente (vía `ScrollBar`, sin barra de scroll nativa) cuando el contenido supera un alto máximo.

**Import:**
```jsx
import Frame from '../Frame/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<Frame title="Información general" content="Este es un panel de contenido simple con título y descripción." />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| title | string | — | Título en el header del frame. |
| icon | node | — | Ícono mostrado junto al título. |
| content | string | — | Texto descriptivo debajo del header. |
| error | string | — | Mensaje de error mostrado en rojo. |
| children | node | — | Contenido principal del frame. |
| className | string | `''` | Clase(s) CSS adicionales. |
| isModal | boolean | `false` | Si es `true`, renderiza el frame como overlay modal vía `createPortal` a `document.body`. |
| onClose | function | — | Se ejecuta al hacer click en el overlay (solo aplica con `isModal`). |
| isLoading | boolean | `false` | Muestra un overlay sobre el contenido (oculto con `visibility: hidden`, no desmontado) mientras carga. El tipo de overlay lo decide `loadingType`. |
| loadingType | `'spinner'` \| `'skeleton'` | `'spinner'` | Con `isLoading`: `'spinner'` muestra `Loading` (`size="giant"`); `'skeleton'` muestra `skeletonCount` barras `Skeleton` genéricas apiladas. |
| loadingVariant | string | `'default'` | Con `loadingType="spinner"`, se pasa tal cual como prop `variant` a `Loading` (`'default'` \| `'bars'` \| `'bounce'` \| `'box'`). |
| skeletonCount | number | `3` | Con `loadingType="skeleton"`, cantidad de barras `Skeleton` a mostrar. |
| scrollable | boolean | `false` | Si es `true`, envuelve `children` con `ScrollBar` (scroll interno sin barra nativa, thumb delgado visible solo on hover/scroll). |
| maxHeight | number \| string | — | Con `scrollable`, alto máximo del área scrolleable (pasa a `ScrollBar` como `maxHeight`). Sin `maxHeight`, el contenido crece libremente (el `ScrollBar` no limita el alto por sí solo). |
| bgColor | string | — | Color de fondo del frame (`--frame-bg`). |
| iconColor | string | — | Color del contenedor del ícono (`--frame-icon`). |
| descriptionBgColor | string | — | Color de fondo del texto de descripción (`--frame-description-bg`). |

**Ejemplos:**
```jsx
<Frame title="Error al cargar" error="No se pudo obtener la información solicitada." />
```
```jsx
<Frame title="Cargando datos" isLoading={true}>
  <p>Este contenido queda oculto mientras carga.</p>
</Frame>
```
```jsx
// Overlay tipo skeleton en vez del spinner default
<Frame title="Cargando datos" isLoading loadingType="skeleton" skeletonCount={4}>
  <p>Este contenido queda oculto mientras carga.</p>
</Frame>
```
```jsx
// Lista larga con scroll interno (sin barra de scroll nativa)
<Frame title="Lista larga" scrollable maxHeight={220}>
  {items.map((item) => <p key={item.id}>{item.label}</p>)}
</Frame>
```

**Notas:** `isModal` renderiza vía `createPortal` sobre `document.body` con un overlay que cierra al hacer click fuera (así lo usa internamente `HoursPicker`). El estado `isLoading` depende de `Loading` (modo `'spinner'`, default) o de `Skeleton` (modo `'skeleton'`) — el skeleton es genérico (barras simples) porque `Frame` no conoce la forma real del contenido de cada consumidor; componentes como `NotificationsPanel` exponen las mismas props (`isLoading`/`loadingType`/`loadingVariant`/`skeletonCount`/`scrollable` vía `maxHeight`) y simplemente las reenvían a su `Frame` interno en vez de reimplementar loading o scroll por su cuenta.

---

### GreenHighlight

Envoltorio `<strong>` para resaltar texto (por ejemplo montos o palabras clave) con color de texto/fondo personalizables.

**Import:**
```jsx
import GreenHighlight from '../GreenHighlight/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<GreenHighlight>texto destacado</GreenHighlight>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| children | node | — | Contenido a resaltar. |
| textColor | string | — | Color del texto (`--green-highlight-text`). |
| bgColor | string | — | Color de fondo (`--green-highlight-bg`). |
| style | object | — | Estilos inline adicionales; se combinan con las variables de color. |

**Ejemplos:**
```jsx
<p>
  El pedido fue <GreenHighlight>aprobado exitosamente</GreenHighlight> y está listo para su envío.
</p>
```
```jsx
<GreenHighlight>$1,250.00</GreenHighlight>
```

**Notas:** Existe un helper `formatHighlightedText` (`GreenHighlight/utils.jsx`) que convierte automáticamente segmentos `**texto**` dentro de un string en `<GreenHighlight>`; lo usan internamente `TextField` y `MultilinePlaceholder` para sus props `label`/`helperText`.

---

### HoursPicker

Selector de hora (formato 12h AM/PM por default en la UI, valor siempre en formato 24h `"HH:MM"`) implementado como un `TextField` de solo lectura que abre un modal con ruedas de hora/minuto y accesos rápidos. Soporta modo rango (hora de inicio/fin) y formato 24h en la UI.

**Import:**
```jsx
import HoursPicker from '../HoursPicker/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<HoursPicker
  label="Hora de inicio"
  name="startTime"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| label | string | — | Etiqueta del `TextField` que dispara el selector. |
| name | string | — | Nombre devuelto en `event.target.name`. |
| value | string | — | Hora en formato 24h `"HH:MM"` (ej. `"14:30"`). En modo `range`, se ignora y se usa `{ start, end }` en su lugar. |
| onChange | function | — | Se llama con un evento simulado `{ target: { name, value, type } }` al confirmar, limpiar o al usar "Hora Actual". `type` es `'time'` (simple) o `'time-range'` (con `range`). |
| required | boolean | `false` | Marca el campo como obligatorio (asterisco en el `TextField`). |
| disabled | boolean | `false` | Deshabilita la apertura del selector. |
| range | boolean | `false` | Activa selección de rango (hora de inicio/fin). `value`/`onChange` pasan a usar `{ start, end }` (strings `"HH:MM"` 24h) en vez de una hora suelta. El modal muestra tabs "Inicio"/"Fin" para elegir cuál se está editando. |
| format24h | boolean | `false` | Si es `true`, la UI (rueda de horas, preview, presets, texto del `TextField`) usa formato 24h (`00`-`23`, sin AM/PM) en vez de 12h. El valor guardado siempre es `"HH:MM"` 24h, independientemente de esta prop — solo cambia cómo se edita. |
| selectedColor | string | `'#10b981'` | Color de la columna hora/minuto activa y de los presets seleccionados. |
| accentColor | string | `'#0f172a'` | Color de acento del botón "Confirmar" y de selecciones por defecto. |

**Ejemplos:**
```jsx
<HoursPicker label="Hora límite" name="deadlineTime" value="09:00" required onChange={handleChange} />
```
```jsx
<HoursPicker label="Hora de cierre" name="closeTime" value="18:00" disabled onChange={handleChange} />
```
```jsx
// Rango de horario
<HoursPicker
  label="Horario de atención"
  name="attentionRange"
  range
  value={{ start: '09:00', end: '17:30' }}
  onChange={(e) => setRange(e.target.value)} // e.target.value = { start, end }
/>
```
```jsx
// Formato 24h (también combinable con range)
<HoursPicker label="Hora (24h)" name="militaryTime" format24h value="14:30" onChange={handleChange} />
```

**Notas:** Al abrirse renderiza un `Frame` en modo modal (`isModal`) con selector por columnas (hora/minuto, y AM/PM si no es `format24h`), presets rápidos (`QUICK_TIMES` en `Constants.js`) y botones "Hora Actual" / "Confirmar" / "Borrar". Depende de `TextField`, `Frame` y `Button`.

---

### Icons (lucide-react)

No es un componente con props propias, sino un re-export: `anteriority-ui/lucide` expone [lucide-react](https://lucide.dev/) completo, para que un proyecto consumidor importe cualquier ícono de lucide **sin instalar `lucide-react` por su cuenta** — queda disponible transitivamente al instalar `anteriority-ui` (ya es una `dependency` de la librería, usada internamente por la mayoría de los componentes).

**Import:**
```jsx
import { Home, Bell, Search } from 'anteriority-ui/lucide';
```

**Uso básico:**
```jsx
<Home size={24} color="#0ea5e9" />
```

**Notas:** Los nombres son exactamente los que exporta `lucide-react` — ver el [buscador oficial](https://lucide.dev/icons/). Es un re-export de 1 línea (`export * from 'lucide-react'`) en [lucide.js](lucide.js), en la raíz del paquete.

---

### Icons (react-icons)

No es un componente con props propias, sino un mecanismo de subpaths: `anteriority-ui` empaqueta [react-icons](https://react-icons.github.io/react-icons/) completo como dependency propia (igual que `lucide-react`), para que un proyecto consumidor use cualquier ícono de cualquier pack de react-icons (Simple Icons, Font Awesome, Material Design, Bootstrap Icons, Ionicons, etc.) **sin instalar `react-icons` por su cuenta** — queda disponible transitivamente al instalar `anteriority-ui`.

**Import:**
```jsx
import { SiJavascript, SiYaml, SiDocker } from 'anteriority-ui/screens/components/Icons/si';
import { FaFileAudio } from 'anteriority-ui/screens/components/Icons/fa';
import { VscJson } from 'anteriority-ui/screens/components/Icons/vsc';
```

**Uso básico:**
```jsx
<SiJavascript size={24} color="#f7df1e" />
```

**Packs disponibles:** cada pack de react-icons se expone en `screens/components/Icons/<pack>`, con el mismo nombre de carpeta que usa react-icons: `ai`, `bi`, `bs`, `cg`, `ci`, `di`, `fa`, `fa6`, `fc`, `fi`, `gi`, `go`, `gr`, `hi`, `hi2`, `im`, `io`, `io5`, `lia`, `lu`, `md`, `pi`, `ri`, `rx`, `si`, `sl`, `tb`, `tfi`, `ti`, `vsc`, `wi`.

**Notas:** Los nombres de cada ícono son exactamente los que exporta react-icons — usar el [buscador oficial](https://react-icons.github.io/react-icons/), el componente [IconCatalog](#iconcatalog) o la función [findIcons](#findicons) para encontrar el nombre exacto dentro de su pack. `si` (Simple Icons) es el pack más relevante para logos de marcas/lenguajes/herramientas (JavaScript, YAML, Docker, etc.), pero **no tiene cobertura total** — por ejemplo no existe un ícono de C# en `si`; ese logo vive en los packs `tb` (`TbBrandCSharp`) y `pi` (`PiFileCSharp`). Si un ícono no aparece en `si`, buscarlo en otros packs antes de asumir que no está disponible — o usar `findIcons`, que ya busca en los 31 a la vez. Packs como `fa` o `md` cubren además íconos genéricos de tipo de archivo (audio, pdf, imagen) que no tienen un logo de marca propio. Los archivos `screens/components/Icons/<pack>/index.js` son re-exports de 1 línea generados por `node scripts/generate-icon-packs.mjs` (correr de nuevo solo si react-icons agrega o quita un pack); quedan versionados en el repo como cualquier otro archivo fuente, no se regeneran en cada build. `screens/components/Icons/registry.js` centraliza el import de los 31 packs (`ICON_PACKS`, `ICON_PACK_NAMES`) — tanto `IconCatalog` como `findIcons` lo reusan en vez de repetir la lista de imports.

---

### findIcons

Busca un término (substring, case-insensitive) en el nombre de ícono de **todos** los packs de react-icons a la vez, sin necesidad de saber de antemano en qué pack vive cada uno. Pensada para resolver casos como "necesito el logo de C#" sin tener que adivinar o probar pack por pack — `findIcons('csharp')` ya devuelve los matches de `tb`, `pi`, etc. en un solo llamado.

**Import:**
```jsx
import { findIcons } from 'anteriority-ui/common/icons';
```

**Uso básico:**
```jsx
const results = findIcons('csharp');
// [{ pack: 'tb', name: 'TbBrandCSharp', Icon: [Function] }, { pack: 'pi', name: 'PiFileCSharp', Icon: [Function] }, ...]

const { Icon } = results[0];
<Icon size={24} />
```

**Firma:** `findIcons(query: string) => { pack: string, name: string, Icon: ComponentType }[]`

**Notas:** Es una utilidad de **búsqueda en runtime**, no un import estático — devuelve el componente ya resuelto (`Icon`), listo para renderizar, pero no reemplaza el subpath import para un ícono que ya se conoce (ver [Icons (react-icons)](#icons-react-icons)), que sigue siendo más explícito y con mejor tree-shaking cuando el nombre exacto ya está decidido. Con query vacío devuelve `[]`. Puede devolver cientos de resultados con términos muy cortos/genéricos (ej. `'a'`) — conviene truncar/paginar en la UI que consuma el resultado, como hace [IconCatalog](#iconcatalog) internamente. También se puede usar directo desde `anteriority-ui/screens/components/Icons/findIcons` (el subpath real); `anteriority-ui/common/icons` es solo un alias más corto.

---

### IconCatalog

Página/panel navegable para buscar y copiar el nombre exacto de cualquier ícono de cualquier pack de react-icons empaquetado en [Icons (react-icons)](#icons-react-icons). Pensado para que un proyecto consumidor lo monte en una ruta propia (ej. `/dev/icons`) y así explorar qué íconos tiene disponibles la librería sin depender del Storybook de `anteriority-ui`.

**Import:**
```jsx
import { IconCatalog } from 'anteriority-ui';
```

**Uso básico:**
```jsx
<Route path="/dev/icons" element={<IconCatalog />} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `defaultPack` | string | `'si'` | Pack de react-icons seleccionado al montar (ver lista de packs en [Icons (react-icons)](#icons-react-icons)) |

**Ejemplos:**
```jsx
<IconCatalog />

<IconCatalog defaultPack="tb" />
```

**Notas:** El selector de pack reutiliza [Selector](#selector) y el buscador de texto reutiliza [Search](#search) (en modo `freeSolo`, sin `options`, como `TextField` libre) en vez de elementos nativos — consistente con el resto de la librería. Muestra hasta 200 resultados por búsqueda (`MAX_RESULTS` en `constants.js`) para no renderizar packs completos de miles de íconos de una sola vez. Cada resultado incluye el ícono renderizado junto a su nombre exacto envuelto en [CopyText](#copytext), para copiarlo con un clic y pegarlo directo en un import. No expone `size`/`color` como props porque es una herramienta de exploración, no un ícono para usar en UI final — una vez encontrado el nombre, se importa directo desde el subpath del pack correspondiente (ver [Icons (react-icons)](#icons-react-icons)).

---

### ImagePastePreview

Fila de chips (miniatura + badge con label + botón de quitar) para mostrar las imágenes extraídas por el hook `usePasteImage` (`common/hooks/usePasteImage.js`). Es la pieza visual compartida por [MultilinePlaceholder](#multilineplaceholder) y [PasteImageField](#pasteimagefield) para no duplicar ese bloque entre ambos — también puede usarse standalone si se arma una integración de paste propia con el hook.

**Import:**
```jsx
import ImagePastePreview from 'anteriority-ui/screens/components/ImagePastePreview'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
const { onPaste, previews, clearPreview } = usePasteImage({ onImagePaste });

<textarea onPaste={onPaste} />
<ImagePastePreview previews={previews} onRemove={clearPreview} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| previews | array | — | Array de previews tal como los devuelve `usePasteImage` (`{ id, url, file }` por cada imagen). Si está vacío o es `undefined`, el componente no renderiza nada. |
| onRemove | function | — | Callback `(id)` invocado al hacer click en el botón de quitar de un chip. |
| label | string | `'Imagen pegada'` | Texto del badge (`Barnner`) de cada chip (y `alt` de la miniatura). |
| removeLabel | string | `'Quitar imagen'` | `aria-label` del botón de quitar. |
| borderColor | string | `'#e2e8f0'` | Color de borde del chip contenedor (miniatura + badge + botón). |
| thumbBorderColor | string | `'#cbd5e1'` | Color de borde propio de la miniatura (el `<img>`). |
| labelBgColor | string | `'#dbeafe'` | Color de fondo del badge del label (prop `bgColor` de `Barnner`). |
| labelTextColor | string | `'#1e40af'` | Color de texto del badge del label (prop `textColor` de `Barnner`). |
| className | string | `''` | Clase adicional para el contenedor de la lista. |
| style | object | — | Estilos inline adicionales para el contenedor de la lista. |

**Ejemplos:**
```jsx
<ImagePastePreview
  previews={previews}
  onRemove={clearPreview}
  label="Adjunto"
  labelBgColor="#fce7f3"
  labelTextColor="#9d174d"
/>
```

**Notas:** No sube ni persiste nada — es puramente presentacional; la extracción/estado vive en `usePasteImage`. El badge del label usa [Barnner](#barnner) (el mismo chip que usan las celdas de `TableB`) en vez de un chip reimplementado a mano.

---

### InfoTooltip

Botón de ayuda (ícono) que al hacer click abre un popover con un título y contenido explicativo; se cierra al hacer click fuera.

**Import:**
```jsx
import InfoTooltip from '../InfoTooltip/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<InfoTooltip
  title="¿Qué es esto?"
  content="Este campo se utiliza para identificar de forma única cada registro en el sistema."
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| content | string \| string[] | — | Contenido del popover; si es un arreglo de strings, se renderiza un párrafo por elemento. |
| title | string | — | Título del popover (también se usa como `aria-label` del botón disparador). |
| icon | componente | `HelpCircle` (lucide-react) | Ícono del botón disparador. |
| iconSize | number | `18` | Tamaño del ícono. |
| iconColor | string | `'#94a3b8'` | Color del ícono. |
| width | string | `'280px'` | Ancho del popover. |

**Ejemplos:**
```jsx
<InfoTooltip
  title="Detalles del cálculo"
  content={[
    'El total se calcula sumando todos los conceptos activos.',
    'Los descuentos se aplican antes de los impuestos.',
  ]}
/>
```
```jsx
<InfoTooltip title="Información adicional" content="..." icon={Info} iconSize={22} iconColor="#3b82f6" width="320px" />
```

---

### Input

Wrapper de `TextField` que agrega manejo simplificado de `required` (asterisco `**`) y de `error`/`helperText`.

**Import:**
```jsx
import Input from '../Input/index'; // export default, forwardRef, archivo index.jsx
```

**Uso básico:**
```jsx
<Input label="Nombre" placeholder="Escribe tu nombre" />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| label | string | — | Etiqueta del campo; si `required` es `true` se le agrega `**` en el color de `requiredColor`. |
| id | string | — | id del input. |
| className | string | `''` | Clase CSS adicional. |
| error | string | — | Mensaje de error; si existe, reemplaza a `helperText` y activa el estado de error. |
| helperText | string | — | Texto de ayuda bajo el campo (se ignora si hay `error`). |
| required | boolean | — | Muestra el indicador `**` junto a la etiqueta. |
| requiredColor | string | `'red'` | Color del indicador de requerido. |
| numeric | boolean | `false` | Solo acepta números. Al enfocar muestra un popover con flechas ▲▼; la rueda del mouse y las flechas del teclado también suben/bajan el valor. |
| min / max | number | — | Límites (solo con `numeric`); se aplican al usar el stepper y al salir del campo. |
| step | number | `1` | Incremento por click/rueda (solo con `numeric`). |
| allowDecimal | boolean | `false` | Permite punto decimal (solo con `numeric`). |
| allowNegative | boolean | `min < 0` o sin `min` | Permite signo `-` (solo con `numeric`). |
| showStepper | boolean | `true` | Muestra el popover de flechas (solo con `numeric`). |
| popoverPlacement | `'top'` \| `'bottom'` | `'top'` | Lado del popover respecto al campo (se voltea solo si no hay espacio; solo con `numeric`). |
| popoverBgColor / popoverIconColor | string | `'#ffffff'` / `'#0f172a'` | Colores del popover (solo con `numeric`). |
| ...props | any | — | Cualquier otra prop de `TextField` (`type`, `placeholder`, `value`, `onChange`, `disabled`, etc.). |

**Ejemplos:**
```jsx
<Input label="Teléfono" placeholder="555-555-5555" error="El número de teléfono no es válido" />
```
```jsx
<Input label="Contraseña" type="password" helperText="Debe tener al menos 8 caracteres" />
```

**Notas:** Es un wrapper de `TextField` con `forwardRef`, por lo que la `ref` se reenvía al input nativo.

---
[]()
### KeyboardShortcut

Envoltorio genérico que asigna un atajo de teclado global a **cualquier** `children` (`Button`, `Input`, un `<div>` propio, etc.) sin agregar markup propio al DOM — renderiza exactamente el `children` recibido, así que no altera layouts `flex`/`grid` del padre. Internamente usa el hook compartido `useKeyboardShortcut` (`common/hooks/useKeyboardShortcut.js`), el mismo que usan los atajos Ctrl/Cmd+K de `TopBar` y Ctrl/Cmd+B de `Sidebar`.

**Import:**
```jsx
import KeyboardShortcut from 'anteriority-ui/screens/components/KeyboardShortcut'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<KeyboardShortcut shortcut="ctrl+e" onTrigger={handleEdit}>
  <Button onClick={handleEdit}>Editar</Button>
</KeyboardShortcut>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| children | node | — | El elemento a envolver; se renderiza tal cual, sin wrapper adicional. |
| shortcut | string | — | Combinación de teclas (ej. `'ctrl+e'`, `'ctrl+shift+a'`, `'cmd+k'`). `ctrl` y `cmd`/`meta` son equivalentes, para que el mismo atajo funcione en Windows/Linux y Mac sin distinguir el sistema operativo. |
| enabled | boolean | `true` | Si es `false`, el atajo no se registra (útil para deshabilitarlo condicionalmente, ej. cuando el elemento envuelto está disabled). |
| onTrigger | function | — | Callback invocado cuando se presiona la combinación. |
| preventDefault | boolean | `true` | Si llama `event.preventDefault()` al disparar el atajo (evita comportamiento default del navegador en esa combinación). |

**Ejemplos:**
```jsx
<KeyboardShortcut shortcut="ctrl+shift+f" onTrigger={() => inputRef.current?.focus()}>
  <TextField inputRef={inputRef} label="Buscar" value={value} onChange={onChange} />
</KeyboardShortcut>
```

**Notas:** Es intencionalmente un wrapper y no una prop de `Button` u otro componente puntual — así el mismo mecanismo sirve para cualquier elemento, incluso componentes ajenos a esta librería en un proyecto consumidor. No sube ni persiste nada; es puramente el registro/cleanup del listener de teclado vía `useKeyboardShortcut`.

---

### Loading

Indicador de carga con varias variantes visuales (spinner, barras, rebote, caja, skeleton, y un set de loaders más elaborados: barra rebotando, barra continua, escáner neón, pulso líquido, órbita 3D, waveform, hélice ADN, cohete despegando) y texto opcional, incluyendo rotación automática entre varias frases.

**Import:**
```jsx
import Loading from '../Loading/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<Loading text="Cargando..." />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| text | string | `''` | Texto fijo mostrado junto al loader (se ignora si se pasa `phrases`). |
| phrases | string[] | `[]` | Frases que rotan automáticamente cada 3.5s con transición de fundido. |
| size | `'small'` \| `'medium'` \| `'large'` \| `'giant'` | `'medium'` | Tamaño del loader. |
| variant | `'default'` \| `'bars'` \| `'bounce'` \| `'box'` \| `'skeleton'` \| `'bounce-bar'` \| `'continuous-bar'` \| `'neon-scanner'` \| `'liquid-pulse'` \| `'orbit-3d'` \| `'waveform'` \| `'dna-helix'` \| `'rocket'` \| `'cube-3d'` \| `'prism-3d'` \| `'text-3d'` \| `'text-3d-static'` | `'default'` | Estilo visual del loader (`'default'` es el spinner circular; `'skeleton'` muestra 5 líneas de placeholder con shimmer, ver nota). Un valor no reconocido cae al spinner `'default'`. |
| className | string | `''` | Clase(s) CSS adicionales. |
| color | string | — | Color personalizado del loader (`--loading-color`). |
| active | boolean | `true` | Controla la animación de salida (ver nota). Pasar `active={false}` cuando la carga termina en vez de desmontar `Loading` directamente — sigue renderizado un instante animando la salida y recién después retorna `null` por su cuenta. |
| onExited | function | — | Callback disparado cuando termina la animación de salida (`active={false}`) y `Loading` ya se ocultó internamente — útil para desmontar el componente padre recién ahí. |

**Ejemplos:**
```jsx
<Loading phrases={['Cargando datos...', 'Procesando información...', 'Casi listo...']} />
```
```jsx
<Loading text="Un momento..." size="large" variant="bars" />
```
```jsx
<Loading variant="skeleton" color="#94a3b8" />
```
```jsx
<Loading text="Desplegando..." size="giant" variant="rocket" />
```
```jsx
<Loading text="Cargando" variant="neon-scanner" />
```
```jsx
<Loading text="Renderizando..." size="giant" variant="cube-3d" />
```
```jsx
<Loading text="A" size="giant" variant="text-3d" />
```
```jsx
<Loading text="AnteriorityUI" size="giant" variant="text-3d-static" />
```
```jsx
// Al terminar la carga real, pasar active={false} en vez de dejar de renderizar
// Loading de golpe: así alcanza a animar la salida antes de ocultarse.
<Loading text="AnteriorityUI" size="giant" variant="text-3d" active={!loadingFinished} />
```

**Notas:** Es usado internamente por `Frame` (prop `isLoading`) con `size="giant"` y por `DrawPanel` (prop `contentLoading`, ver [DrawPanel](#drawpanel)). La variante `'skeleton'` ignora `text`/`phrases`/`size` (no tiene spinner ni texto) y usa `className` sobre su propio contenedor (`height: 100%`) en vez del de `loadingContainer` — para que ocupe el espacio disponible necesita que su contenedor padre tenga una altura definida (como el `.contentLoading` de `DrawPanel`, que estira el `Loading` con `height: 100%`).

Las 12 variantes elaboradas (`'bounce-bar'`, `'continuous-bar'`, `'neon-scanner'`, `'liquid-pulse'`, `'orbit-3d'`, `'waveform'`, `'dna-helix'`, `'rocket'`, `'cube-3d'`, `'prism-3d'`, `'text-3d'`, `'text-3d-static'`) viven como sub-componentes propios en `screens/components/Loading/components/<Nombre>/` (mismo patrón de descomposición que [MediaViewer](#mediaviewer)): cada una es `index.jsx` + `index.module.css`, no son componentes públicos de la librería (no están en el barrel raíz). Todas aceptan `color` (mapeado a `--loading-color`, igual que el resto de variantes) para su tono principal, con el mismo azul (`#0d52f8`) como default en todas — consistente entre sí, no cada una con un color distinto; donde el diseño original tenía varios tonos fijos (ej. el segundo anillo de `'orbit-3d'`, las caras de `'cube-3d'`/`'prism-3d'`, antes cada una de un color del espectro), los tonos secundarios se derivan del `color` recibido con `color-mix()`/opacidad en vez de quedar completamente hardcodeados — excepción consciente: el fuego/humo de `'rocket'` mantiene su paleta de fuego (naranja/rojo) mezclada parcialmente con `color`, porque es un efecto físico, no el color del cohete en sí (que sí es 100% `color`, un solo tono para el casco completo). `'rocket'` agrupa el SVG del cohete y su fuego en un único elemento animado (`.ship`) para que viajen pegados durante el despegue, en vez de que el fuego quede fijo mientras el cuerpo se mueve. `'cube-3d'` (cubo isométrico con 6 caras `preserve-3d`) y `'prism-3d'` (octaedro flotante con 8 caras tipo `border-triangle`) son los dos loaders 3D más pesados en CSS del set — usan `perspective`/`transform-style: preserve-3d`, igual de livianos en JS que el resto (solo CSS, sin JS de animación). `'text-3d'` extruye el `text` recibido (sin límite de longitud) apilando 10 capas en `translateZ` que rotan 360° en Y a `3s` por vuelta; a propósito **no** usa `backface-visibility: hidden`, así que al cruzar 90°/180°/270° el texto se ve momentáneamente espejado — es el efecto elegido para esta variante, no un bug a corregir. `'text-3d-static'` usa la misma extrusión en capas pero sin rotación (ángulo fijo `rotateY(-22deg) rotateX(10deg)`, siempre legible); en su lugar, la capa frontal tiene un reflejo/shine que la recorre (`background-clip: text` con gradiente animado en `background-position`, mismo mecanismo que el shimmer de `'skeleton'` pero aplicado al glifo del texto en vez de a un bloque). Todas menos `'neon-scanner'`/`'text-3d'`/`'text-3d-static'` reutilizan el wrapper estándar de `Loading` (`text`/`phrases` animados debajo del loader, igual que `'bars'`/`'bounce'`/`'box'`); `'neon-scanner'` integra el texto dentro de su propio diseño (mayúsculas, estilo neón) en vez de usar el texto genérico de abajo, así que no muestra doble texto.

**Animación de salida (`active`):** `'text-3d'` y `'text-3d-static'` tienen una animación de salida con estilo cuando `active` pasa a `false` — en vez de desaparecer de golpe (porque el padre dejó de renderizar `Loading`), el loader hace fade + scale-down + un giro de 90° en Y (`loadingExit`, 0.5s) antes de ocultarse. El patrón es el mismo que `DrawPanel.isOpen`: `Loading` sigue montado internamente durante la animación (estado `render` propio) y recién retorna `null` cuando termina (`onAnimationEnd` → `onExited`, si se pasó). El resto de variantes (`'default'`, `'bars'`, `'rocket'`, `'cube-3d'`, etc.) todavía no tienen esta animación de salida — `active={false}` en ellas no hace nada visible, simplemente no se les aplica la clase `.exiting`.

---

### MarkdownContent

Renderiza una cadena markdown como HTML, con soporte GFM (tablas, listas de tareas, etc.) vía `react-markdown` + `remark-gfm`. Los bloques de código (` ``` `) y los encabezados (`#` a `######`) muestran, al pasar el mouse (o al enfocarlos con teclado), un botón con ícono de copiar en la esquina que copia respectivamente el código completo o el texto del título al portapapeles (con feedback visual de "copiado" por ~1.6s). El color de texto es `inherit` por default (hereda del contenedor donde se use), así que se puede soltar directamente dentro de cualquier componente (`Frame`, `DrawPanel`, `Callout`, burbujas de chat, etc.) sin quedar ilegible por un color fijo; usar `style`/`linkColor` para un color puntual.

Las imágenes usan la sintaxis estándar de markdown (`![alt](url)`) — `react-markdown` las soporta nativamente, sin ninguna prop extra; el CSS ya las limita a `max-width: 100%` con `border-radius: 6px`. Además, **una URL http(s) pegada sola en su propia línea** (sin texto alrededor ni la sintaxis `![alt](url)`) se detecta automáticamente y se muestra como imagen — útil para URLs de Google Images u otros servicios que no terminan en una extensión reconocible (`.png`/`.jpg`/etc.), donde exigir extensión dejaría afuera el caso más común. Si la URL autodetectada en realidad no es una imagen y falla la carga, cae a un link clickeable normal (`<a target="_blank">`) en vez de mostrar un ícono de imagen rota.

Para colorear texto puntual (markdown no tiene sintaxis nativa para esto) se soporta una convención propia del repo: `{color:X}texto{/color}`, donde `X` es cualquier color CSS válido (hex, `rgb()`, nombre). Internamente se reescribe a un link markdown con protocolo custom (`[texto](color:X)`) antes de pasarlo a `react-markdown`; como `react-markdown` sanea por default los `href` con protocolos no estándar (para prevenir XSS, ej. `javascript:`), se pasa un `urlTransform` propio que deja pasar `color:` intacto y delega el resto al saneo default. El renderer de `a` intercepta ese protocolo devolviendo un `<span style="color: X">` en vez de un `<a>` — por eso el contenido de bloques/inline code (` ``` ` o `` ` ``) queda exento tanto de este reemplazo como del de imágenes (un snippet que contenga ese texto literal no se toca). `MarkdownEditor` ya trae un botón de toolbar con selector de color que inserta esta sintaxis (ver [MarkdownEditor](#markdowneditor)).

Para marcar texto como copiable (con un botón de copiar al lado) se soporta `{copy}contenido{/copy}`, con dos formas según el contenido:
- **Inline** (una línea, sin salto de línea ni ` ``` `): se resuelve con el mismo truco de link markdown que `{color:X}` (protocolo `copy:`), renderizando un `<span>` con el texto seguido de un botón de copiar.
- **Bloque** (contiene saltos de línea y/o ` ``` `fences` ``` `, ej. una sección completa con headings + código + texto): se resuelve con un plugin remark propio (`remarkCopyBlocks`, en `copyBlocks.js`) que agrupa los nodos del AST entre marcadores en un `<div>` contenedor con un botón de copiar flotante — el markdown interno se sigue renderizando normal (headings, code fences, listas, etc.), y el botón copia el **markdown fuente** tal cual se escribió (no el HTML renderizado).

**Import:**
```jsx
import { MarkdownContent } from '../MarkdownContent/index'; // named export (también default export)
```

**Uso básico:**
```jsx
<MarkdownContent>{'# Heading\n\nThis is a **bold** paragraph.'}</MarkdownContent>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| children | string | — | Contenido markdown a renderizar. |
| className | string | `''` | Clase(s) CSS adicionales. |
| style | object | — | Estilos inline adicionales. |
| components | object | — | Mapa de renderers personalizados de `react-markdown`. Un renderer propio para `code`/`pre`/`h1`-`h6` reemplaza por completo el renderer con botón de copiar de ese tag. |
| linkColor | string | — | Color de los enlaces (`--markdown-link`). |
| copyCodeLabel | string | `'Copiar código'` | Tooltip/aria-label del botón de copiar sobre bloques de código. |
| copiedCodeLabel | string | `'Código copiado'` | Tooltip/aria-label del botón tras copiar un bloque de código. |
| copyTitleLabel | string | `'Copiar título'` | Tooltip/aria-label del botón de copiar sobre encabezados (`h1`-`h6`). |
| copiedTitleLabel | string | `'Título copiado'` | Tooltip/aria-label del botón tras copiar un encabezado. |
| copyTextLabel | string | `'Copiar'` | Tooltip/aria-label del botón de copiar sobre texto marcado con `{copy}...{/copy}` (inline o bloque). |
| copiedTextLabel | string | `'Copiado'` | Tooltip/aria-label del botón tras copiar ese texto. |
| images | object | — | Mapa `id -> url/base64` para resolver tokens `[imagen:id]` (los inserta `MarkdownEditor` al pegar una captura del portapapeles). |

**Ejemplos:**
```jsx
<MarkdownContent>{'| Col 1 | Col 2 |\n| --- | --- |\n| A | B |'}</MarkdownContent>
```
```jsx
<MarkdownContent>{'```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```'}</MarkdownContent>
```
```jsx
<MarkdownContent copyCodeLabel="Copy code" copiedCodeLabel="Copied!" copyTitleLabel="Copy title" copiedTitleLabel="Copied!">
  {'# My Title\n\n```js\nconsole.log("hi");\n```'}
</MarkdownContent>
```
```jsx
<MarkdownContent>{'![Logo](https://ejemplo.com/logo.png)'}</MarkdownContent>
```
```jsx
{/* URL sola, pegada directamente sin escribir ![alt](url) — se autodetecta como imagen */}
<MarkdownContent>{'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFvLKiCCYeL-dqH4i8rEAHVcLw9aMIxp3qFmMk-CMDjg&s=10'}</MarkdownContent>
```
```jsx
<MarkdownContent>
  {'Este texto tiene {color:#ef4444}una palabra en rojo{/color} en el medio.'}
</MarkdownContent>
```
```jsx
{/* {copy} inline: un valor puntual (email, ID, IP) */}
<MarkdownContent>
  {'El correo de soporte es {copy}soporte@ejemplo.com{/copy}.'}
</MarkdownContent>
```
```jsx
{/* {copy} como bloque: envuelve headings + código + texto, un solo botón copia todo el markdown fuente */}
<MarkdownContent>
  {'{copy}# Guía\n\n## Paso 1\n\n```js\nconst x = 1;\n```\n{/copy}\n\nEsto queda afuera del bloque.'}
</MarkdownContent>
```

**Notas sobre imágenes pegadas (URL sola en su línea):** el criterio es deliberadamente amplio (cualquier línea que sea únicamente una URL `http(s)://`, sin exigir extensión de archivo) porque las URLs de imagen de Google Images y otros servicios casi nunca terminan en `.png`/`.jpg`. Esto significa que una URL que el usuario pegó pensando en un link normal (no una imagen) también se intentará mostrar como `<img>`; si la carga falla, el fallback a `<a target="_blank">` cubre ese caso sin dejar un ícono de imagen rota. El bloque de código (` ``` ` o `` ` ``) también queda exento de esta detección.

**Notas sobre `{color:X}`:** el patrón solo soporta texto plano simple adentro (no anida otro `{color:}` dentro del mismo bloque); `X` acepta cualquier valor CSS de color (`#ef4444`, `rgb(239, 68, 68)`, `red`). Como se implementa reescribiendo a un link `[texto](color:X)`, un markdown que por casualidad contenga un link real cuya URL empiece literalmente con `color:` (muy improbable) se renderizaría como texto coloreado en vez de como link.

---

### MarkdownEditor

Editor de texto markdown con barra de herramientas (negrita, cursiva, título, encabezados, listas, cita, código, enlace, imagen, tabla, texto copiable, color de texto), atajos de teclado, modos Editor/Dividido/Vista previa y altura ajustable con arrastre. El botón de título inserta un encabezado `# ` y el de código un bloque ` ``` `; ambos, al previsualizarse (con `MarkdownContent`), muestran un botón de copiar rápido (ver [MarkdownContent](#markdowncontent)).

El botón de texto copiable (ícono `Copy`) envuelve la selección actual en `{copy}...{/copy}` — en la vista previa aparece con su propio botón de copiar al lado, sin afectar los copiables de título/código (ver la sintaxis en [MarkdownContent](#markdowncontent)).

El botón de imagen (ícono de imagen) inserta `![descripción](url-de-la-imagen)` alrededor de la selección (o del texto placeholder si no hay selección) — mismo mecanismo que el botón de enlace. El botón de color (ícono de paleta) abre un popover con el panel de [ColorPicker](#colorpicker) (saturación/matiz + HEX/RGB/HSL); mientras se arrastra el selector solo cambia el color de preview del ícono de la paleta, y recién al tocar el botón "Aplicar" del popover se envuelve el texto seleccionado (o el texto placeholder) en `{color:HEX}...{/color}` y se cierra el popover — así evita insertar texto en cada frame del arrastre. Ver la sintaxis `{color:X}...{/color}` en [MarkdownContent](#markdowncontent).

**Import:**
```jsx
import { MarkdownEditor } from '../MarkdownEditor/index'; // named export (también default export)
```

**Uso básico:**
```jsx
const [value, setValue] = useState('# Hello world');

<MarkdownEditor
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Write your markdown here..."
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| value | string | `''` | Contenido markdown controlado. |
| onChange | function | — | Se llama con un evento simulado `{ target: { value } }`. |
| placeholder | string | `''` | Placeholder del textarea. |
| defaultHeight | number | `320` | Alto inicial (px) del área de contenido; ajustable arrastrando el handle inferior (entre 180 y 1200px). |
| labels | object | `{}` | Textos personalizables: `editorTab`, `splitTab`, `previewTab`, tooltips de cada botón (incluye `titleTooltip`, `imageTooltip`, `colorTooltip`, `copyableTooltip`), textos por defecto al insertar formato (incluye `imageAltDefaultText`, `imageUrlPlaceholder`, `colorDefaultText`, `copyableDefaultText`), `applyColorLabel` (texto del botón "Aplicar" del popover de color), encabezados de la tabla de ejemplo. |
| activeColor | string | — | Color de acento del modo/pestaña activa (`--markdown-editor-active`). |
| scrollbarColor | string | — | Color del thumb del scrollbar del textarea (mismo estilo delgado que usa `Selector`). |

**Ejemplos:**
```jsx
<MarkdownEditor
  value={value}
  onChange={(e) => setValue(e.target.value)}
  defaultHeight={260}
  placeholder="Type something..."
/>
```
```jsx
<MarkdownEditor
  value={value}
  onChange={(e) => setValue(e.target.value)}
  labels={{ editorTab: 'Editar', splitTab: 'Dividido', previewTab: 'Vista previa' }}
/>
```

**Notas:** Es un componente controlado (`value`/`onChange` obligatorios); el modo de vista es estado interno. Soporta atajos `Ctrl+B`, `Ctrl+I`, `Ctrl+K` y continuación automática de listas al presionar Enter. Usa `MarkdownContent` para la vista previa. El popover de color reutiliza directamente `ColorPickerPanel` (la pieza interna de [ColorPicker](#colorpicker), sin su botón trigger propio) dentro de un `Popper`/`ClickAwayListener` propio anclado al botón de paleta de la toolbar.

---

### MediaViewer

Renderiza un archivo (imagen, video, audio, PDF o cualquier otro tipo) a partir de una `url`. El tipo de media se infiere automáticamente del `mimeType`/`type` o, si no se pasa, de la extensión del `name`/`url`; también se puede forzar explícitamente. Si no hay `type`/`mimeType` ni extensión reconocible (ej. una url de API del tipo `/api/files/42/raw`, o un CDN como `picsum.photos` que no incluye extensión), el componente prueba la `url` en cascada contra un `<img>`/`<video>`/`<audio>` real fuera del DOM visible (ver `autoDetectType` para desactivar esto) — a diferencia de `fetch()`, cargar estas etiquetas para mostrarse no está sujeto a CORS, así que funciona incluso contra CDNs que no mandan `Access-Control-Allow-Origin`. Si ni así se puede determinar el tipo, cae en una tarjeta genérica con ícono cuadrado de color según el tipo de archivo (PDF, Word, Excel, Zip, Markdown, código, etc.) + nombre + tamaño + botón de descarga — ese mapeo extensión → ícono/color vive en [common/icons/fileType.js](#común-iconsfiletypejs) y es compartido con [FileListItem](#filelistitem). Totalmente responsive: imagen/video/iframe de PDF se ajustan al ancho del contenedor padre, con tamaños reducidos en viewports angostos (`max-width: 480px`). Para imagen/video/audio se puede agregar opcionalmente un botón de acción genérico de ancho completo debajo del marco (ver `actionLabel`/`actionIcon`/`onAction`) — no viene activado por default, y no está atado a "descargar": el consumidor decide el texto, el ícono y qué hace al clickearlo (ej. abrir un panel de detalle externo, como el header con flecha de un visor de archivos).

Cuando el tipo resuelve a video y `controls` es `true` (default), el `<video>` no usa los controles nativos del browser: renderiza un reproductor custom (`components/VideoPlayer`) con la paleta de la librería — play/pause central y en la barra inferior, seek bar con preview de tiempo al hover y buscador de tiempo por texto (`mm:ss` o segundos), control de volumen, velocidad de reproducción (0.5x–2x), fullscreen y Picture-in-Picture (si el browser lo soporta), overlay de buffering (usando el componente `Loading`) y overlay de error con reintento. La barra espaciadora pausa/reanuda mientras el mouse está sobre el player o en fullscreen (vía el componente `KeyboardShortcut`, sin capturar la tecla globalmente en el resto de la página). Pasar `controls={false}` devuelve el `<video>` nativo del browser sin ningún control (útil para videos de fondo/autoplay silencioso).

**Import:**
```jsx
import MediaViewer from 'anteriority-ui/screens/components/MediaViewer'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<MediaViewer url="https://ejemplo.com/foto.png" />
<MediaViewer url="https://ejemplo.com/video.mp4" />
<MediaViewer url="https://ejemplo.com/audio.mp3" name="nota-de-voz.mp3" />
<MediaViewer url="https://ejemplo.com/contrato.docx" name="contrato.docx" size={512000} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| url / src | string | — | URL del archivo a mostrar. Si no se pasa ninguna de las dos, el componente no renderiza nada. `src` es alias de `url`. |
| type / mimeType | string | — | Fuerza el tipo de media en vez de inferirlo. Acepta un mimeType real (`'image/png'`, `'application/pdf'`, etc.) o directamente uno de los valores de `MediaViewer.KIND` (`'image'`, `'video'`, `'audio'`, `'pdf'`, `'file'`). |
| name | string | — | Nombre de archivo a mostrar (y a usar para inferir el tipo por extensión si no hay `mimeType`). Si no se pasa, se intenta extraer del final de la `url`. |
| size | number | — | Tamaño en bytes, mostrado formateado (`KB`/`MB`/`GB`) en la tarjeta genérica de archivo. |
| alt | string | nombre del archivo | Texto alternativo para imagen/video. |
| poster | string | — | Poster del `<video>` (atributo nativo, también usado por el reproductor custom). |
| controls | bool | `true` | Si es video, `true` usa el reproductor custom (`VideoPlayer`); `false` devuelve el `<video>` nativo del browser sin controles. Para audio sigue siendo el atributo `controls` nativo. |
| autoPlay | bool | `false` | Autoplay nativo de `<video>`/`<audio>`. |
| loop | bool | `false` | Loop nativo de `<video>`/`<audio>`. |
| muted | bool | `false` | Mute nativo de `<video>`/`<audio>`. |
| zoomable | bool | `true` | Si es imagen, permite hacer click para ampliarla a su tamaño natural manteniendo el contenedor en su alto normal (con scroll interno) — el componente no crece hacia afuera. Volver a hacer click la achica de nuevo. Cambia el cursor a `zoom-in`/`zoom-out`. |
| actionLabel | string | — | Texto de un botón genérico de ancho completo debajo del marco (imagen/video/audio). No tiene acción propia — es puramente de presentación; qué hace se define con `onAction`. Solo se renderiza si `onAction` está definido. |
| actionIcon | component | `Download` (lucide-react) | Ícono (componente, no elemento) que se muestra junto a `actionLabel` en el botón. Pasar `null` para que el botón se vea sin ícono. |
| onAction | function | — | Callback del botón genérico. Si no se pasa, el botón no se renderiza (no es exclusivo de "descargar" — se usa para cualquier acción, ej. abrir un visor externo, compartir, etc., según lo que pase el consumidor). |
| autoDetectType | bool | `true` | Si no se pudo inferir el tipo por `type`/`mimeType`/extensión, prueba la `url` contra un `<img>`/`<video>`/`<audio>` real (sin tocar el DOM visible) para determinar el tipo. Poner en `false` para evitar ese intento (ej. si ya se sabe que la URL no es un media reconocible, o para no generar carga innecesaria en listas largas). No se dispara si se pasó `type`/`mimeType` explícito. |
| downloadable | bool | `true` | Muestra el botón de descarga en la tarjeta genérica de archivo (no aplica a imagen/video/audio/PDF). |
| downloadLabel | string | `'Descargar'` | `aria-label`/`title` del botón de descarga. |
| openLabel | string | `'Abrir'` | Texto del link "abrir en pestaña nueva" que acompaña al visor de PDF. |
| bgColor | string | `'#f8fafc'` | Color de fondo del contenedor. |
| borderColor | string | `'#e2e8f0'` | Color de borde del contenedor. |
| textColor | string | `'#334155'` | Color de texto (nombre de archivo, metadata, nombre de audio). |
| accentColor | string | `'#2563eb'` | Color del botón de descarga y del link "Abrir" del PDF. |
| videoBgColor | string | `'#0d0f14'` | Color de fondo del reproductor de video custom (detrás del `<video>`, visible en los bordes si el aspect ratio no llena el contenedor). |
| videoAccentColor | string | `'#7c9cff'` | Color de acento del reproductor de video custom: seek bar, slider de volumen y opción de velocidad activa. |
| videoControlsColor | string | `'#f1f3f6'` | Color de los íconos/texto de los controles del reproductor de video custom (play, volumen, fullscreen, PiP, velocidad, buscador de tiempo) y del overlay de buffering. |
| videoPip | bool | `true` | Muestra el botón de Picture-in-Picture en el reproductor de video custom (solo si el browser lo soporta). |
| videoErrorLabel | string | `'No se pudo cargar el video'` | Texto del overlay de error del reproductor de video custom. |
| videoRetryLabel | string | `'Reintentar'` | Texto del botón de reintento en el overlay de error del reproductor de video custom. |
| videoLoadingVariant | string | `'bars'` | `variant` pasado al componente `Loading` del overlay de buffering del reproductor de video custom (`'default'`, `'bars'`, `'bounce'`, `'box'`). |
| videoLoadingSize | string | `'medium'` | `size` pasado al componente `Loading` del overlay de buffering del reproductor de video custom. |
| onError | function | — | Callback del evento `onError` nativo de `<img>`/`<video>`/`<audio>` (ej. para mostrar un fallback si la URL no carga). |
| className | string | `''` | Clase adicional para el contenedor. |
| style | object | — | Estilos inline adicionales para el contenedor. |

**Ejemplos:**
```jsx
// Tipo forzado explícitamente (útil si la url no tiene extensión, ej. un endpoint de descarga)
<MediaViewer url="/api/files/42/raw" type="image" name="foto-perfil" />

// Imagen sin zoom al hacer click
<MediaViewer url="/api/files/10/raw" name="banner.png" zoomable={false} />

// Imagen con botón de acción debajo del marco (acción genérica, definida por el consumidor)
import { Download } from 'lucide-react';

<MediaViewer
  url="/api/files/55/raw"
  name="F1-Logo-black.jpeg"
  actionLabel="Descargar"
  actionIcon={Download}
  onAction={() => downloadFile(fileId)}
/>

// Video con el reproductor custom repaletizado al branding del consumidor
<MediaViewer
  url="/api/files/77/raw"
  name="presentacion.mp4"
  poster="/api/files/77/poster"
  videoBgColor="#1a0f2e"
  videoAccentColor="#a855f7"
  videoControlsColor="#f3e8ff"
/>

// Video sin PiP y con controles nativos del browser en vez del reproductor custom
<MediaViewer url="/api/files/78/raw" name="clip.mp4" videoPip={false} />
<MediaViewer url="/api/files/79/raw" name="fondo.mp4" controls={false} autoPlay loop muted />

// Tarjeta de archivo genérico con colores personalizados
<MediaViewer
  url="/api/files/99/raw"
  name="contrato.docx"
  size={512000}
  bgColor="#f5f3ff"
  borderColor="#ddd6fe"
  accentColor="#7c3aed"
/>
```

**Notas:** No sube ni persiste nada — es puramente presentacional, recibe una URL ya resuelta. El PDF se muestra embebido en un `<iframe>` (sujeto a las políticas de same-origin/CSP del sitio que lo sirve) con un link "Abrir" como fallback — la story `PdfLocal` usa un PDF de prueba real servido desde `fixtures/MediaViewer/documento-de-prueba.pdf` (ver `.storybook/main.js`, `staticDirs: ["../fixtures"]`). `MediaViewer.KIND` expone las constantes de tipo (`MediaViewer.KIND.IMAGE`, etc.) para quien quiera forzar `type` sin hardcodear el string. El ícono cuadrado de la tarjeta genérica de archivo no tiene prop de color propia (su color viene del tipo de archivo detectado); usar `bgColor`/`borderColor`/`textColor`/`accentColor` para el resto del contenedor. El request de detección por `HEAD`/`GET` (ver `detectTypeByHead`) necesita que la `url` sea alcanzable por `fetch` desde el navegador con CORS permitido — si el servidor bloquea el origen, el intento falla silenciosamente y el componente se queda con el fallback por extensión/tarjeta genérica, sin romper el render.

---

### common/icons/fileType.js

No es un componente — es el módulo compartido que mapea una extensión de archivo (`pdf`, `docx`, `xlsx`, `zip`, `md`, `mp3`, `png`, etc.) a `{ icon, bgColor, label }`, usado por [MediaViewer](#mediaviewer) y [FileListItem](#filelistitem) para no duplicar esa lógica. Los íconos son de `react-icons/bs` (set "file earmark"). Si se agrega soporte para una extensión nueva, se agrega en `FILE_TYPE_MAP` de este archivo y ambos componentes lo heredan automáticamente.

**Import:**
```jsx
import { getFileTypeInfo, getExtension } from 'anteriority-ui/common/icons/fileType';
```

**API:**

| Export | Tipo | Descripción |
|---|---|---|
| getFileTypeInfo(nameOrUrl) | function | Devuelve `{ icon: ComponentType, bgColor: string, label: string }` para la extensión detectada en `nameOrUrl`. Si no matchea ninguna extensión conocida, devuelve `DEFAULT_FILE_TYPE` (ícono genérico, gris, label `'Archivo'`). |
| getExtension(value) | function | Extrae la extensión en minúsculas de un nombre de archivo o URL (ignora querystring/hash). Devuelve `''` si no hay extensión. |
| FILE_TYPE_MAP | object | El mapa completo `extensión → { icon, bgColor, label }`, por si un consumidor necesita iterarlo o extenderlo localmente. |
| DEFAULT_FILE_TYPE | object | El fallback usado cuando la extensión no matchea. |

---

### InputWithIcon

Campo de texto de Material-UI con un ícono (lucide-react) como adorno, con tres presentaciones distintas: `outlined`/`filled` (adorno dentro del campo), `standard` y `row` (ícono al costado, fuera del campo).

**Import:**
```jsx
import InputWithIcon from '../Material-UI/Components/InputWithIcon/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<InputWithIcon label="Correo electrónico" icon={Mail} value={value} onChange={(e) => setValue(e.target.value)} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| label | string | — | Etiqueta del campo. |
| value | string | — | Valor controlado. |
| onChange | function | — | Handler estándar de evento de input. |
| icon | componente (ícono) | — | Ícono mostrado como adorno. |
| placeholder | string | — | Placeholder del campo. |
| type | string | `'text'` | Tipo de input HTML. |
| variant | `'standard'` \| `'outlined'` \| `'row'` \| `'filled'` | `'outlined'` | Presentación visual; `'row'` coloca el ícono fuera del campo. |
| fullWidth | boolean | `true` | Si ocupa el 100% del ancho disponible. |
| iconColor | string | `'black'` | Color del ícono (solo aplica en `standard` y `row`; en `outlined`/`filled` usa `currentColor`). |
| ...props | any | — | Cualquier otra prop de `TextField`/`Input` de Material-UI. |

**Ejemplos:**
```jsx
<InputWithIcon label="Usuario" icon={User} variant="standard" value={value} onChange={onChange} />
```
```jsx
<InputWithIcon label="Buscar" icon={SearchIcon} variant="row" value={value} onChange={onChange} />
```

---

### MenuPopover

Botón de navegación que al hacer click abre un menú desplegable de Material-UI (`Menu`/`MenuItem`), pensado para ítems de un sidebar con sub-opciones.

**Import:**
```jsx
import MenuPopover from '../Material-UI/Components/MenuPopover/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<MenuPopover
  item={{ label: 'Opciones', icon: Settings, subItems: [{ label: 'Editar' }, { label: 'Eliminar', isDanger: true }] }}
  renderIcon={(Icon) => (Icon ? <Icon size={18} /> : null)}
  onNavigate={(subItem) => console.log('navigate to', subItem)}
  isCollapsed={false}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| item | object | — | `{ label, icon, subItems: [{ label, isDanger? }] }`. Requerido. |
| styles | object | `{}` | Objeto de clases CSS externas (ej. `{ navItem, icon }`) aplicadas al botón disparador. |
| renderIcon | function | — | `(icon, className) => node`; renderiza el ícono de `item.icon`. |
| onNavigate | function | — | Se llama con el `subItem` clickeado. |
| isCollapsed | boolean | — | Si es `true`, oculta el texto del label y la flecha. |
| children | node \| function | — | Contenido personalizado del menú; si es función, recibe `{ handleClose }` (render prop). |
| triggerProps | object | `{}` | Props adicionales que se mezclan en el botón disparador. |
| bgColor | string | `'#ffffffff'` | Color de fondo del panel del menú. |
| textColor | string | `'#000000ff'` | Color de texto de las opciones. |
| dangerColor | string | `'#ef4444'` | Color de las opciones marcadas como peligrosas. |

**Ejemplos:**
```jsx
<MenuPopover item={item} renderIcon={renderIcon} onNavigate={onNavigate} isCollapsed={true} />
```

**Notas:** Un `subItem` se resalta con `dangerColor` si tiene `isDanger: true`, o si su `label` contiene "eliminar" o "cancelar".

---

### MultilinePlaceholder

`TextField` multilínea (textarea), hermano de `TextField` de este mismo kit, con el mismo soporte de resaltado `**texto**` en `label`/`helperText`.

**Import:**
```jsx
import MultilinePlaceholder from '../Material-UI/Components/MultilinePlaceholder/index'; // export default, forwardRef, archivo index.jsx
```

**Uso básico:**
```jsx
<MultilinePlaceholder label="Descripción" placeholder="Escribe una descripción..." rows={4} value={value} onChange={onChange} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| label | string \| node | — | Etiqueta del campo; admite `**texto**` para resaltar con `GreenHighlight`. |
| value | string | — | Valor controlado. |
| onChange | function | — | Handler de evento de input. |
| error | string | — | Mensaje de error; si existe, activa el estado de error y reemplaza a `helperText`. |
| helperText | string \| node | — | Texto de ayuda (admite `**texto**` como el `label`). |
| rows | number | `4` | Número de filas visibles. |
| maxRows | number | — | Límite de filas al auto-crecer. |
| variant | string | `'outlined'` | Variant de `TextField`. |
| size | string | `'small'` | Tamaño de `TextField`. |
| fullWidth | boolean | `true` | Si ocupa el 100% del ancho disponible. |
| placeholder | string | — | Placeholder del campo. |
| bgColor | string | `'#fff'` | Color de fondo del input. |
| onImagePaste | function | — | Callback `(files, event)` invocado cuando se pegan (Ctrl+V) una o más imágenes desde el clipboard; `files` es un array de `File` nativos listos para subir o guardar en cualquier storage (si se pega una sola imagen, el array tiene un elemento). Una imagen ya pegada antes (mismo archivo, detectado por nombre+tamaño+fecha+tipo) se ignora para no duplicarla. Si no se pasa, el paste de imágenes no se intercepta (se comporta como un textarea normal). |
| showImagePreview | boolean | `true` | Si se muestran miniaturas de las imágenes pegadas debajo del textarea, cada una con su propio botón para quitarla. Solo aplica si se pasó `onImagePaste`. |
| imagePreviewLabel | string | `'Imagen pegada'` | Texto del badge (`Barnner`) de cada imagen pegada (y `alt` de la miniatura). |
| imageRemoveLabel | string | `'Quitar imagen'` | `aria-label` del botón de quitar. |
| imagePreviewBorderColor | string | `'#e2e8f0'` | Color de borde del chip contenedor del preview (miniatura + badge + botón de quitar). |
| imageThumbBorderColor | string | `'#cbd5e1'` | Color de borde propio de la miniatura de la imagen (el `<img>`). |
| imageLabelBgColor | string | `'#dbeafe'` | Color de fondo del badge del label (prop `bgColor` de `Barnner`). |
| imageLabelTextColor | string | `'#1e40af'` | Color de texto del badge del label (prop `textColor` de `Barnner`). |
| ...props | any | — | Cualquier otra prop de `TextField` de Material-UI. |

**Ejemplos:**
```jsx
<MultilinePlaceholder label="Notas" helperText="Opcional, máximo 500 caracteres." rows={3} value={value} onChange={onChange} />
```
```jsx
<MultilinePlaceholder label="Comentarios" error="Este campo es obligatorio" rows={3} value={value} onChange={onChange} />
```
```jsx
<MultilinePlaceholder
  label="Descripción"
  value={value}
  onChange={onChange}
  onImagePaste={(files) => files.forEach(saveToStorage)}
/>
```

**Notas sobre `onImagePaste`:** la extracción de los `File` se apoya en el hook compartido `usePasteImage` (`common/hooks/usePasteImage.js`), el mismo que usa el wrapper genérico `PasteImageField`. Si el clipboard trae varias imágenes a la vez, se extraen todas (ninguna se descarta en silencio); si una imagen ya fue pegada antes (mismo archivo), se ignora para no duplicarla. El preview debajo del textarea se renderiza con [ImagePastePreview](#imagepastepreview) — el mismo componente que usa `PasteImageField` — en vez de reimplementar el chip acá; todas las props `image*` de esta tabla se reenvían a ese componente. El componente sigue aceptando `onPaste` propio (se encadena, no se pisa).

---

### Paginador

Barra de paginación de Material-UI con selector opcional de "filas por página".

**Import:**
```jsx
import Paginador from '../Material-UI/Components/Paginador/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<Paginador count={10} page={page} onChange={(e, value) => setPage(value)} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| count | number | `10` | Número total de páginas. |
| page | number | `1` | Página actual. |
| onChange | function | — | Handler estándar de `Pagination` de MUI: `(event, page) => void`. |
| color | string | `'primary'` | Color de `Pagination`. |
| size | string | `'medium'` | Tamaño de `Pagination`. |
| disabled | boolean | `false` | Deshabilita la paginación (y el selector de filas, si está presente). |
| variant | string | `'outlined'` | Variant de `Pagination`. |
| shape | string | `'rounded'` | Forma de los botones de `Pagination`. |
| pageSize | number | — | Valor actual del selector de "Filas". Si se pasa junto con `onPageSizeChange`, se muestra el `Select` a la izquierda. |
| pageSizeOptions | number[] | `[5, 10, 20, 50]` | Opciones del selector de filas por página. |
| onPageSizeChange | function | — | `(newPageSize: number) => void`. |
| ...props | any | — | Cualquier otra prop de `Pagination` de Material-UI. |

**Ejemplos:**
```jsx
<Paginador
  count={15}
  page={page}
  onChange={(e, value) => setPage(value)}
  pageSize={pageSize}
  pageSizeOptions={[5, 10, 20, 50]}
  onPageSizeChange={setPageSize}
/>
```
```jsx
<Paginador count={10} page={3} disabled onChange={onChange} />
```

**Notas:** El selector de "Filas" solo se renderiza si se pasan **ambos** `pageSize` y `onPageSizeChange`.

---

### Search

Campo de búsqueda basado en `Autocomplete` de Material-UI, con estado de carga, modo `freeSolo` (texto libre sin opciones) y un botón de limpiar (ícono `X` de lucide-react) activo por default en ambos modos — aparece automáticamente cuando hay texto/valor cargado, sin necesitar ninguna prop.

**Import:**
```jsx
import Search from '../Material-UI/Components/Search/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<Search
  options={options}
  value={value}
  onChange={setValue}
  inputValue={inputValue}
  onInputChange={setInputValue}
  label="Buscar usuario"
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| open | boolean | — | Controla si el desplegable está abierto. |
| onOpen | function | — | Callback al abrirse el desplegable. |
| onClose | function | — | Callback al cerrarse el desplegable. |
| options | array | `[]` | Lista de opciones (objetos, ej. `{ label, value }`). |
| loading | boolean | `false` | Muestra un `CircularProgress` como adorno final. |
| value | any | — | Opción seleccionada (controlado). |
| onChange | function | — | `(newValue) => void` — recibe el valor directamente, no el evento de MUI. |
| inputValue | string | — | Texto actual del input (controlado). |
| onInputChange | function | — | `(newInputValue) => void`. |
| getOptionLabel | function | `option => option?.label \|\| ''` | Cómo obtener el texto de cada opción. |
| isOptionEqualToValue | function | `(option, val) => option?.value === val?.value` | Comparador de igualdad de opciones. |
| label | string | `'Buscar'` | Etiqueta del `TextField` interno. |
| placeholder | string | `'Buscar...'` | Placeholder del `TextField` interno. |
| freeSolo | boolean | `false` | Si es `true` y `options` está vacío, renderiza un `TextField` simple (texto libre) en vez de `Autocomplete`. |
| size | `'small'` \| `'medium'` | `'small'` | Tamaño del input. |
| error | boolean | `false` | Estado de error del `TextField`. |
| helperText | string | — | Texto de ayuda/error debajo del input. |
| bgColor | string | — | Fondo del input. |
| textColor | string | — | Color del texto del input. |
| borderColor | string | — | Color del borde (variant outlined). |
| iconColor | string | `rgba(0, 0, 0, 0.54)` | Color del ícono de limpiar (mismo gris que usa MUI por default para íconos de acción). |
| ...props | any | — | Cualquier otra prop de `Autocomplete` de Material-UI. |

**Ejemplos:**
```jsx
<Search options={[]} loading={true} label="Buscar usuario" value={value} onChange={setValue} inputValue={inputValue} onInputChange={setInputValue} />
```
```jsx
<Search freeSolo options={[]} label="Buscar" placeholder="Escribe texto libre..." value={value} onChange={setValue} />
```
```jsx
// Colores custom + error
<Search
  freeSolo
  options={[]}
  label="Buscar"
  error
  helperText="Ingresa al menos 3 caracteres"
  bgColor="#0f172a"
  textColor="#e2e8f0"
  borderColor="#38bdf8"
  iconColor="#38bdf8"
  value={value}
  onChange={setValue}
/>
```

**Notas:** A diferencia del `Autocomplete` nativo de MUI, `onChange` y `onInputChange` reciben directamente el valor (no `(event, value)`). El botón de limpiar no requiere ninguna prop para activarse: en modo `freeSolo` aparece apenas hay texto escrito; en modo `Autocomplete` ya viene habilitado salvo que se pase `disableClearable`.

---

### Selector

`Autocomplete` de Material-UI configurado como un select de opciones fijas, con matching flexible de valores (por `value` exacto o normalizado). Soporta selección múltiple con checkbox (`multiSelect`), usando el componente `Checks` de la librería para el indicador visual de cada opción.

**Import:**
```jsx
import Selector from '../Material-UI/Components/Selector/index'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<Selector
  label="Especie"
  options={[{ value: 'perro', label: 'Perro' }, { value: 'gato', label: 'Gato' }]}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```
`
**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| label | string | — | Etiqueta del campo. |
| value | string | — | Valor seleccionado (se busca en `options` por `value` o, si no matchea, de forma normalizada). |
| onChange | function | — | Se llama con un evento simulado `{ target: { value } }`, no con `(event, newValue)` de MUI. |
| options | array | `[]` | Lista de opciones `{ value, label, icon? }` (`icon` es una URL de imagen mostrada en el listado). |
| id | string | `'custom-autocomplete'` | id del `Autocomplete`. |
| style | object | `{}` | Estilo inline del `Autocomplete` (prop `style` nativa, no `sx`) — útil para pisar el ancho default sin pelear con `fullWidth` (ej. `style={{ width: 200 }}`). |
| className | string | `''` | Clase CSS adicional. |
| fullWidth | boolean | `true` | Si ocupa el 100% del ancho (si `false`, ancho fijo de 300px). Para un ancho distinto que no sea 300px fijo, usar `style={{ width }}` junto con `fullWidth={false}`. |
| placeholder | string | — | Placeholder del campo. |
| required | boolean | — | Muestra un indicador `**` junto a la etiqueta. |
| requiredColor | string | `'red'` | Color del indicador de requerido. |
| disableClearable | boolean | `false` | Si es `true`, oculta el botón de limpiar selección. |
| hideScrollbar | boolean | `true` | Oculta la barra de scroll de la lista desplegable (el scroll con rueda/teclado/touch sigue funcionando). Con `false`, la barra se muestra con una estética delgada propia (mismo grosor/color que `ScrollBar`) en vez del scrollbar crudo del navegador. |
| multiSelect | boolean | `false` | Activa selección múltiple (`Autocomplete multiple`). En este modo `value` es un array de `value`s y `onChange` recibe `{ target: { value: nuevoArray } }`. Cada opción muestra un checkbox (`Checks`, modo `iconOnly`) como indicador de selección. |
| checkedBgColor | string | — | Color de fondo del checkbox marcado (propaga a `Checks`, solo aplica con `multiSelect`). |
| checkedLabelColor | string | — | Color del label del checkbox marcado (propaga a `Checks`). |
| scrollbarColor | string | — | Color del thumb del scrollbar cuando `hideScrollbar={false}`. |
| chipBgColor | string | — | Fondo de los chips de selección (modo `multiSelect`). |
| chipTextColor | string | — | Color de texto de los chips. |
| chipIconColor | string | — | Color del ícono "X" de cada chip. |
| popperZIndex | number | `100000` | `z-index` del `Popper` del listado desplegable (se renderiza en un portal al final de `<body>`, fuera del árbol del componente). Ajustar si un overlay/modal propio del proyecto consumidor tiene un `z-index` mayor y tapa los clics del listado. |

**Ejemplos:**
```jsx
<Selector label="Especie" options={options} required value={value} onChange={onChange} />
```
```jsx
<Selector label="Especie" options={options} value="gato" onChange={onChange} />
```
```jsx
<Selector label="Especie" options={options} value={value} onChange={onChange} fullWidth={false} style={{ width: 180 }} />
```
```jsx
// Selección múltiple con chips y checkbox personalizados
<Selector
  label="Especies"
  options={options}
  multiSelect
  value={values}
  onChange={(e) => setValues(e.target.value)}
  checkedBgColor="#0369a1"
  chipBgColor="#0369a1"
  chipTextColor="#ffffff"
/>
```

**Notas:** El matching de `value` contra `options` ignora mayúsculas, espacios, guiones y guiones bajos si no hay coincidencia exacta por `value`. `fullWidth` default es `true` — si solo se pasa `className` para controlar el ancho sin `fullWidth={false}`, el `sx.width: '100%'` default sigue ganando; para un ancho custom, combinar `fullWidth={false}` con `style={{ width }}`. En `multiSelect`, `disableCloseOnSelect` se activa automáticamente (el dropdown no se cierra después de cada click). `popperZIndex`: el `Popper` de MUI se monta vía portal al final de `<body>`, fuera de cualquier contenedor con overflow/scroll o `z-index` local del componente padre (ej. el popover de `CalendarPicker`, con `z-index: 20`) — si el proyecto consumidor tiene un modal/drawer propio con `z-index` superior al default (`100000`), esa capa puede interceptar los clics sobre el listado aunque se vea visualmente encima; subir `popperZIndex` por encima de esa capa resuelve el bloqueo de clics.

---

### TextField

Wrapper del `TextField` de Material-UI usado como base de varios otros componentes del kit (`Input`, `Filter`, `FormInput`, `HoursPicker`), con manejo de `required` y resaltado `**texto**` en `label`/`helperText`.

**Import:**
```jsx
import TextField from '../Material-UI/Components/TextField/index'; // export default, forwardRef, archivo index.jsx
```

**Uso básico:**
```jsx
<TextField label="Nombre" placeholder="Escribe tu nombre..." value={value} onChange={onChange} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| label | string \| node | — | Etiqueta del campo; admite `**texto**` para resaltar con `GreenHighlight`. |
| value | string | — | Valor controlado. |
| onChange | function | — | Handler de evento de input. |
| error | boolean \| string | — | Estado/mensaje de error; si es un string, reemplaza a `helperText`. |
| helperText | string \| node | — | Texto de ayuda (admite `**texto**` como el `label`). |
| type | string | `'text'` | Tipo de input HTML. |
| variant | string | `'outlined'` | Variant de `TextField`. |
| size | string | `'small'` | Tamaño de `TextField`. |
| fullWidth | boolean | `true` | Si ocupa el 100% del ancho disponible. |
| placeholder | string | — | Placeholder del campo. |
| required | boolean | — | Muestra un indicador `**` junto a la etiqueta. |
| requiredColor | string | `'red'` | Color del indicador de requerido. |
| bgColor | string | `'#fff'` | Color de fondo del input (incluye fix de autofill de Chrome). |
| textColor | string | `'#0f172a'` | Color de texto usado en el fix de autofill. |
| ...props | any | — | Cualquier otra prop de `TextField` de Material-UI. |

**Ejemplos:**
```jsx
<TextField label="Contraseña" type="password" error helperText="La contraseña debe tener al menos 6 caracteres" />
```
```jsx
<TextField label="Correo electrónico (Autocompletado)" value="usuario@correo.com" disabled />
```

**Notas:** El `ref` se reenvía al input interno de Material-UI (`inputRef`). Es el componente base que usan internamente `Input`, `Filter`, `FormInput` y `HoursPicker`.

---

### ModalTooltip

Tooltip flotante que se muestra al pasar el mouse sobre su contenido, renderizado en un portal para evitar problemas de overflow/z-index, con reposicionamiento automático para no salirse del viewport.

**Import:**
```jsx
import ModalTooltip from 'screens/components/ModalTooltip/ModalTooltip';
```

**Uso básico:**
```jsx
<ModalTooltip text="Más información" position="top">
  <button type="button">Hover me</button>
</ModalTooltip>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `text` | `string` | — | Texto mostrado dentro del tooltip. |
| `children` | `node` | — | Elemento(s) que disparan el tooltip al hacer hover. |
| `position` | `"top"` \| `"bottom"` | `"top"` | Posición preferida del tooltip; se invierte automáticamente si colisiona con el borde del viewport. |
| `delay` | `number` | `150` | Milisegundos de espera antes de mostrar el tooltip tras el `mouseenter`. |
| `style` | `object` | — | Estilos inline adicionales para el contenedor `span` que envuelve a `children`. |
| `bgColor` | `string` | — | Color de fondo del tooltip (`--modaltooltip-bg`). |
| `textColor` | `string` | — | Color del texto del tooltip (`--modaltooltip-text`). |
| `...props` | — | — | Cualquier otro prop se pasa al `span` contenedor. |

**Ejemplos:**
```jsx
<ModalTooltip text="Shows after a longer delay" position="top" delay={600}>
  <button type="button">Slow tooltip</button>
</ModalTooltip>
```

---

### ErrorMessage

Banner de notificación en línea para mostrar mensajes de error o de éxito, con icono y título.

**Import:**
```jsx
import ErrorMessage from 'screens/components/Notification/Error/ErrorMessage';
```

**Uso básico:**
```jsx
<ErrorMessage title="Atención" message="No se pudo completar la operación." variant="danger" />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `message` | `string` | — | Texto del mensaje. Si es falsy, el componente no renderiza nada (`return null`). |
| `title` | `string` | `"Atención"` | Título en negrita mostrado sobre el mensaje. |
| `variant` | `"danger"` \| `"success"` | `"danger"` | Controla el icono (`AlertCircle` o `CheckCircle`) y el estilo del banner. |
| `bgColor` | `string` | — | Color de fondo (`--errormessage-bg`). |
| `borderColor` | `string` | — | Color del borde (`--errormessage-border`). |
| `style` | `object` | — | Estilos inline adicionales. |

**Ejemplos:**
```jsx
<ErrorMessage title="Operación Exitosa" message="¡Contraseña actualizada correctamente!" variant="success" />
```

---

### NotificationsPanel

Panel de notificaciones construido sobre `Frame` (header con ícono de campana + título). Cada notificación se renderiza con `Callout` (título, mensaje en Markdown, timestamp, ícono, paleta por `variant`, botones de acción vía `Button`, botón de descarte (×) y soporte de click/navegación). La lista scrollea internamente (vía la prop `scrollable` de `Frame`, que a su vez usa `ScrollBar`) sin mostrar una barra de scroll nativa — el thumb queda oculto hasta hover/scroll. Soporta modo inline o modal (overlay + portal) y loading en dos variantes (spinner o skeleton), todo heredado de `Frame`.

**Import:**
```jsx
import NotificationsPanel from '../NotificationsPanel/index'; // export default
```

**Uso básico:**
```jsx
<NotificationsPanel
  notifications={[
    {
      id: 1,
      title: 'Nueva cita agendada - Firulais',
      message: 'Se agendó una cita para Firulais el 08/10/2026 a las 15:00 con el Dr. Doctor Doctor.',
      timestamp: 'Hace 5 minutos',
      actions: [
        { label: 'Confirmar asistencia', variant: 'primary', onClick: () => {} },
        { label: 'No podré asistir', variant: 'outline', color: 'red', onClick: () => {} },
      ],
    },
  ]}
  onDismiss={(id) => console.log('quitar', id)}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | `'Notificaciones'` | Título del header (prop `title` de `Frame`). |
| `icon` | node | `<Bell size={20} />` | Ícono del header (prop `icon` de `Frame`). |
| `notifications` | array | `[]` | Lista de notificaciones. Cada item acepta: `{ id, title?, message?, timestamp?, icon?, variant?, actions?, onClick?, href?, bgColor?, borderColor?, iconColor?, textColor? }`. `message` se pasa como `children` de `Callout` (acepta Markdown). `actions` es un array de `{ key?, label, variant?, color?, fullWidth?, onClick? }`, renderizados con `Button`. `variant` es la misma paleta de `Callout` (`'info'` \| `'warning'` \| `'danger'` \| `'success'` \| `'neutral'`, default `'neutral'`). `onClick`/`href` hacen la tarjeta entera clickeable/navegable (ver `Callout`). Los `bgColor`/`borderColor`/`iconColor`/`textColor` del item individual tienen prioridad sobre los equivalentes globales del panel (`itemBgColor`, etc.). |
| `onDismiss` | `function(id)` | — | Si se define, cada tarjeta muestra un botón (×) que lo invoca con el `id` de la notificación. El panel no quita el item solo — el consumidor controla el array `notifications` (ver ejemplo `Dismissible` en Storybook). |
| `emptyMessage` | string | `'No tenés notificaciones nuevas.'` | Texto mostrado cuando `notifications` está vacío. |
| `maxHeight` | number | `380` | Alto máximo (px) del área scrolleable (pasa a `Frame` como `maxHeight`, junto con `scrollable` activado automáticamente cuando hay notificaciones). |
| `dismissLabel` | string | `'Quitar notificación'` | `aria-label` del botón de descarte (pasa a `Callout` como `closeLabel`). |
| `isModal` | boolean | `false` | Renderiza como overlay modal (pasa a `Frame`). |
| `onClose` | function | — | Click en el overlay cuando `isModal` (pasa a `Frame`). |
| `isLoading` | boolean | `false` | Muestra el overlay de carga de `Frame` (spinner o skeleton genérico) en vez de la lista. |
| `loadingType` | `'spinner'` \| `'skeleton'` | `'spinner'` (default de `Frame`) | Tipo de loading cuando `isLoading` (pasa a `Frame`). |
| `loadingVariant` | string | `'default'` (default de `Frame`) | Con `loadingType="spinner"`, variant de `Loading` (pasa a `Frame`). |
| `skeletonCount` | number | `3` (default de `Frame`) | Con `loadingType="skeleton"`, cantidad de barras `Skeleton` (pasa a `Frame`). |
| `className` | string | `''` | Clase adicional en el `Frame` raíz. |
| `bgColor` | string | — | Color de fondo del panel (pasa a `Frame` como `bgColor`). |
| `iconColor` | string | — | Color del ícono del header — la campana (pasa a `Frame` como `iconColor`). |
| `itemBgColor` | string | — | Color de fondo por default de cada tarjeta (pasa a `Callout` como `bgColor`; cada item puede pisarlo con su propio `bgColor`). |
| `itemBorderColor` | string | — | Color de borde por default de cada tarjeta (pasa a `Callout` como `borderColor`; pisable por item). |
| `itemIconColor` | string | — | Color del ícono por default de cada tarjeta (pasa a `Callout` como `iconColor`; pisable por item). |
| `textColor` | string | — | Color de texto (título + mensaje + timestamp) por default de cada tarjeta (pasa a `Callout`; pisable por item). |

**Ejemplos:**
```jsx
// Vacío
<NotificationsPanel notifications={[]} />

// Con descarte controlado por el consumidor
function Example() {
  const [items, setItems] = useState(notifications);
  return (
    <NotificationsPanel
      notifications={items}
      onDismiss={(id) => setItems((prev) => prev.filter((n) => n.id !== id))}
    />
  );
}

// Como modal
<NotificationsPanel notifications={notifications} isModal onClose={() => setOpen(false)} />

// Loading tipo skeleton
<NotificationsPanel notifications={[]} isLoading loadingType="skeleton" skeletonCount={4} />

// Notificación clickeable (navega al hacer click) y con paleta/colores propios
<NotificationsPanel
  notifications={[
    {
      id: 1,
      variant: 'danger',
      title: 'Pago rechazado',
      message: 'No se pudo procesar el pago.',
      onClick: () => navigate('/facturas/00234'),
    },
    {
      id: 2,
      title: 'Con colores propios',
      message: 'Esta tarjeta define su propio bgColor/borderColor/textColor.',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0',
      textColor: '#065f46',
    },
  ]}
/>
```

**Notas:** No persiste ni elimina notificaciones por su cuenta — es UI pura (ver regla de separación en `CLAUDE.md`). `onDismiss` solo informa el `id`; el array `notifications` sigue siendo responsabilidad de quien lo use. El contenedor interno aplica `overflow` vía `ScrollBar`, que oculta el track nativo del navegador y muestra un thumb delgado solo mientras se hace hover/scroll. Cada tarjeta es un `Callout` — para personalizar algo no cubierto por las props de `NotificationsPanel` (ej. `linkColor`, `markdownComponents`), usar `Callout` directamente en vez de este componente.

---

### PasswordResetPanel

Panel deslizante (basado en `DrawPanel`) para que un administrador solicite y complete el restablecimiento de contraseña de un usuario, incluyendo lista de solicitudes pendientes, polling de estado y asignación de nueva clave.

**Import:**
```jsx
import PasswordResetPanel from 'screens/components/PasswordResetPanel';
```

**Uso básico:**
```jsx
<PasswordResetPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controla si el panel está abierto. |
| `onClose` | `function` | — | Callback al cerrar el panel. |
| `cancelColor` | `string` | `'var(--button-red, #ef4444)'` | Color del botón "Cancelar Espera". |
| `pendingColor` | `{ label, bg, text }` | `{ label: '#b45309', bg: '#fffbeb', text: '#92400e' }` | Colores para el estado "Pending" en la lista de solicitudes. |
| `acceptedColor` | `{ label, bg, text }` | `{ label: '#16a34a', bg: '#f0fdf4', text: '#166534' }` | Colores para el estado "Accepted". |
| `expiredColor` | `{ label, bg, text }` | `{ label: '#ef4444', bg: '#fef2f2', text: '#991b1b' }` | Colores para solicitudes expiradas. |

**Ejemplos:**
```jsx
<PasswordResetPanel isOpen={false} onClose={() => console.log('close panel')} />
```

**Notas:** Internamente usa el hook `useAdminPasswordReset` (`hooks/useAdminPasswordReset.js`), que llama a `features/password-reset/api.js`. Para que las llamadas de red reales funcionen en una app consumidora hace falta tener configurado `configureApiClient` (`common/api/client.js`); sin esa configuración el panel igual renderiza su UI inicial/carga/error sin fallar.

---

### PasteImageField

Wrapper genérico que agrega la capacidad de pegar (Ctrl+V) una o más imágenes desde el clipboard a **cualquier** campo de texto que se le pase como `children` (`MultilinePlaceholder`, `TextField`, un `<textarea>` plano, etc.), sin acoplar esa lógica a un componente de texto en particular. Si el clipboard pegado contiene al menos una imagen, se previene el paste normal (texto/base64) y se extraen todos los `File` nativos encontrados; si no, el campo recibe el paste normal sin cambios. Una imagen ya pegada antes (mismo archivo) se ignora para no duplicarla. La extracción/preview vive en el hook `usePasteImage` (`common/hooks/usePasteImage.js`), reutilizable también sin este wrapper.

**Import:**
```jsx
import PasteImageField from 'anteriority-ui/screens/components/PasteImageField'; // export default, archivo index.jsx
```

**Uso básico:**
```jsx
<PasteImageField onImagePaste={(files) => files.forEach(saveToStorage)}>
  <MultilinePlaceholder label="Descripción" value={value} onChange={onChange} />
</PasteImageField>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| children | node | — | El campo de texto a envolver (debe aceptar/reenviar `onPaste`, como `MultilinePlaceholder`, `TextField` o un `<textarea>`/`<input>` nativo). |
| onImagePaste | function | — | Callback `(files, event)` invocado cuando se pegan una o más imágenes; `files` es un array de `File` nativos listos para subir o guardar en cualquier storage (un elemento si se pegó una sola imagen). Una imagen ya pegada antes (mismo archivo, detectado por nombre+tamaño+fecha+tipo) se excluye del array. |
| disabled | boolean | `false` | Si es `true`, ignora el paste de imágenes (el campo sigue aceptando paste de texto normal). |
| showPreview | boolean | `true` | Si muestra una miniatura propia por cada imagen pegada, con botón para quitarla individualmente. |
| previewLabel | string | `'Imagen pegada'` | Texto junto a cada miniatura (y `alt` de la imagen). |
| removeLabel | string | `'Quitar imagen'` | `aria-label` del botón de quitar preview. |
| borderColor | string | `'#e2e8f0'` | Color de borde del chip contenedor del preview (miniatura + label + botón de quitar). |
| thumbBorderColor | string | `'#cbd5e1'` | Color de borde propio de la miniatura de la imagen (el `<img>`). |
| labelBgColor | string | `'#dbeafe'` | Color de fondo del chip del label ("Imagen pegada"). |
| labelTextColor | string | `'#1e40af'` | Color de texto del chip del label. |
| ...props | any | — | Cualquier otra prop se pasa al `div` contenedor (`className`, `style`, etc.). |

**Ejemplos:**
```jsx
<PasteImageField onImagePaste={(files) => setLastFiles(files)}>
  <TextField label="Comentario" value={value} onChange={onChange} />
</PasteImageField>
```
```jsx
<PasteImageField showPreview={false} onImagePaste={(files) => files.forEach(uploadFile)}>
  <MultilinePlaceholder label="Notas" rows={3} value={value} onChange={onChange} />
</PasteImageField>
```

**Notas:** No sube ni persiste las imágenes por sí mismo — solo las extrae del clipboard y las entrega vía `onImagePaste` para que el consumidor decida qué hacer (subir a un backend, guardar en `localStorage`/IndexedDB, etc.). Si se pegan varias imágenes a la vez, se extraen todas (ninguna se descarta en silencio). El preview se renderiza con [ImagePastePreview](#imagepastepreview) — el mismo componente que usa `MultilinePlaceholder` — en vez de un chip reimplementado acá; todas las props de color/label de esta tabla se reenvían a ese componente. El hook subyacente `usePasteImage({ onImagePaste, disabled })` (`common/hooks/usePasteImage.js`) puede usarse directamente si se prefiere conectar `onPaste` a mano en vez de usar este wrapper.

---

### PlaceholderButton

Campo de configuración compuesto por un input (numérico, texto o multilínea) más un botón de guardado, con manejo de estado de carga, mensajes de éxito/error y validación.

**Import:**
```jsx
import PlaceholderButton from 'screens/components/PlaceholderButton';
```

**Uso básico:**
```jsx
<PlaceholderButton
  icon={Calendar}
  placeholder="Días"
  unitText="días"
  buttonText="Guardar"
  initialValue="7"
  onSavePromise={(value) => api.save(value)}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `icon` | `component` | — | Icono mostrado dentro del input (modo no-multilínea). |
| `tooltipText` | `string` | — | (recibido pero no usado en el render actual). |
| `placeholder` | `string` | — | Placeholder del input. |
| `unitText` | `string` | — | Texto de unidad mostrado junto al input (p. ej. "días"). |
| `buttonText` | `string` | — | Texto del botón de guardar. |
| `hintText` | `string` | — | Texto de ayuda mostrado debajo del input. |
| `disabledHintText` | `string` | — | Texto mostrado cuando `disabled` es `true`. |
| `initialValue` | `string` | `''` | Valor inicial del input (se sincroniza si cambia). |
| `inputType` | `"number"` \| `"text"` \| otros | `'number'` | Tipo de input; determina si el valor se parsea con `parseInt`. |
| `min` | `string` | `"1"` | Atributo `min` del input numérico. |
| `disabled` | `boolean` | `false` | Deshabilita el input y el botón. |
| `multiline` | `boolean` | `false` | Si es `true`, usa un textarea (`InputWithIcon` multilínea) en vez de input simple. |
| `onSavePromise` | `function` | — | Función que retorna una promesa; se invoca con el valor al guardar. |
| `clearCache` | `function` | — | Callback opcional invocado tras guardar (limpieza de caché). |
| `successMessage` | `string` | — | Mensaje mostrado tras guardar con éxito. |
| `errorMessage` | `string` | — | Mensaje mostrado si `onSavePromise` falla. |
| `validationErrorMsg` | `string` | — | Mensaje mostrado si la validación del valor falla. |
| `clearOnSuccess` | `boolean` | `false` | Si es `true`, limpia el input tras guardar con éxito. |
| `focusColor` | `string` | — | Color de foco (`--placeholderbutton-focus`). |
| `unitBgColor` | `string` | — | Color de fondo del texto de unidad (`--placeholderbutton-unit-bg`). |

**Ejemplos:**
```jsx
<PlaceholderButton
  placeholder="Escribe una nota..."
  buttonText="Guardar nota"
  multiline
  clearOnSuccess
  onSavePromise={fakeSavePromise}
/>

<PlaceholderButton
  {...defaultArgs}
  disabled
  disabledHintText="Esta opción está deshabilitada por ahora."
/>
```

---

### Profile

Encabezado de perfil de usuario para barras superiores/sidebars: avatar, nombre de usuario y botón de edición.

**Import:**
```jsx
import Profile from 'screens/components/Profile/index';
```

**Uso básico:**
```jsx
<Profile username="Ana Gomez" avatarUrl="" onEditClick={() => {}} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `username` | `string` | — | Nombre mostrado junto al avatar. |
| `avatarUrl` | `string` | — | URL de la imagen de avatar (si está vacío, se muestra el fallback con inicial). |
| `onEditClick` | `function` | — | Callback al hacer click en el icono de lápiz. |
| `textColor` | `string` | `'#ffffff'` | Color del texto del nombre y del icono de edición. |

**Ejemplos:**
```jsx
<Profile username="Maria Fernanda Rodriguez Castillo" avatarUrl="" onEditClick={() => {}} />
```

**Notas:** Internamente renderiza `Profile/Avatar` (`UserAvatar`) con `size={35}` fijo, no configurable desde este componente.

---

### Avatar (Profile/Avatar)

Avatar de usuario (basado en MUI `Avatar`) con fallback de inicial y color generado a partir del nombre, estado de carga, indicador de actividad (online/offline) y vista ampliada opcional.

**Import:**
```jsx
import Avatar from 'screens/components/Profile/Avatar/index';
```

**Uso básico:**
```jsx
<Avatar name="Ana Gomez" src="https://i.pravatar.cc/100?img=12" size={48} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `src` | `string` | — | URL de la imagen; si no hay, se muestra la inicial sobre un color generado del `name`. |
| `name` | `string` | `'Usuario'` | Nombre usado para la inicial y el color de fallback. |
| `size` | `number` | `35` | Tamaño (px) del avatar. |
| `editable` | `boolean` | `false` | Si es `true`, envuelve el avatar en un `ModalTooltip` ("Cambiar Foto de Perfil") y muestra un overlay con icono de cámara al hover; el click dispara `onEditClick`. |
| `onEditClick` | `function` | `() => {}` | Callback al hacer click cuando `editable` es `true`. |
| `loading` | `boolean` | `false` | Muestra un spinner (`Loading`) en vez del avatar. |
| `viewable` | `boolean` | `false` | Si es `true` y hay `src`, permite abrir la imagen en un `AlertModal` a pantalla completa al hacer click. |
| `isActive` | `boolean` \| `null` | `null` | Si no es `null`/`undefined`, muestra un punto de estado (activo/inactivo). |
| `fallbackBgColor` | `string` | — | Color de fondo del fallback (`--avatar-fallback-bg`). |
| `activeStatusColor` | `string` | `'#10b981'` | Color del punto de estado cuando `isActive` es `true`. |
| `inactiveStatusColor` | `string` | `'#ef4444'` | Color del punto de estado cuando `isActive` es `false`. |

**Ejemplos:**
```jsx
<Avatar name="Marta Ruiz" size={64} editable onEditClick={() => console.log('edit avatar clicked')} />

<Avatar name="Ana Gomez" size={48} loading />
```

---

### ScrollBar

Contenedor con scrollbars personalizados (vertical y/u horizontal) que se ocultan automáticamente cuando no hay interacción.

**Import:**
```jsx
import ScrollBar from 'screens/components/ScrollBar';
```

**Uso básico:**
```jsx
<ScrollBar vertical maxHeight={200}>
  <div>Contenido largo...</div>
</ScrollBar>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | `node` | — | Contenido a scrollear. |
| `vertical` | `boolean` | `true` | Habilita scroll/thumb vertical. |
| `horizontal` | `boolean` | `true` | Habilita scroll/thumb horizontal. |
| `autoHide` | `boolean` | `true` | Si es `false`, los thumbs permanecen siempre visibles. |
| `maxHeight` | `string` \| `number` | — | Altura máxima del área scrolleable. |
| `hideHorizontalTrack` | `boolean` | `false` | Oculta el thumb/track horizontal propio (el scroll sigue funcionando). Lo usa `TableA` cuando muestra su pie de desplazamiento. |
| `hideVerticalTrack` | `boolean` | `false` | Oculta el thumb/track vertical propio (el scroll sigue funcionando). Lo usa `TableA`/`TableB` con `stickyHeader`. |
| `reserveTrackSpace` | `boolean` | `false` | Reserva `padding-right` en el área de scroll para que el thumb vertical no quede superpuesto sobre el contenido (texto/botones). Pensado para listas verticales de tarjetas (lo usa `Frame` cuando `scrollable`); no afecta el ancho de tablas con scroll horizontal porque es opt-in. |
| `scrollAreaRef` | `ref` \| `function` | — | Recibe el elemento del área de scroll interna, para poder leer o mover `scrollLeft`/`scrollTop` desde afuera. |
| `className` | `string` | `''` | Clase adicional para el contenedor raíz. |
| `contentClassName` | `string` | `''` | Clase adicional para el área de scroll interna. |
| `style` | `object` | — | Estilos inline para el contenedor raíz. |

**Ejemplos:**
```jsx
<ScrollBar vertical={false} horizontal autoHide>
  <div style={{ width: '1600px' }}>Contenido muy ancho...</div>
</ScrollBar>
```

**Notas:** Es usado internamente por `TableA` y `TableB` para el scroll horizontal de sus tablas.

---

### SchemaForm

Renderiza un formulario completo a partir de un JSON Schema (+ `uiSchema` opcional), usando los widgets ya existentes de la librería (`Input`, `Checks`, `Swich`, `Selector`, `CalendarPicker`, `FormTextArea`) para cada tipo de campo, en vez de los inputs default de rjsf. Pensado para usarse como `children` de cualquier contenedor (ej. `DrawPanel`): el contenedor no sabe que adentro hay un `SchemaForm`, solo le llega el schema correspondiente a cada caso (login, alta de usuario, etc.).

Es un wrapper de [`@rjsf/core`](https://rjsf-team.github.io/react-jsonschema-form/docs/) — requiere `@rjsf/core` como peer dependency (opcional: solo hace falta instalarlo si se usa este componente). El validador (`@rjsf/validator-ajv8`) ya viene empaquetado como dependency de `anteriority-ui` y se usa por default, así que no hace falta instalarlo ni pasarlo por prop; la prop `validator` queda disponible solo para quien quiera forzar otra versión/implementación.

**Import:**
```jsx
import SchemaForm from '../SchemaForm'; // export default (index.jsx)
```

**Uso básico:**
```jsx
const schema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', title: 'Email', format: 'email' },
    password: { type: 'string', title: 'Contraseña' },
  },
};

<SchemaForm
  schema={schema}
  formData={formData}
  onChange={setFormData}
  onSubmit={(data) => login(data)}
  submitText="Ingresar"
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `schema` | object | — | JSON Schema que describe los campos del formulario |
| `uiSchema` | object | — | `uiSchema` de rjsf: qué widget usar por campo (`'ui:widget'`), opciones de cada uno (`'ui:options'`), orden, etc. |
| `formData` | object | — | Valores actuales del formulario (controlado) |
| `validator` | object | validador ajv8 incluido | Validador de rjsf; solo hace falta pasarlo para reemplazar el default empaquetado |
| `widgets` | object | — | Widgets adicionales/override, mergeados sobre los widgets default de `SchemaForm` |
| `fields` | object | — | `fields` custom de rjsf (para `ObjectField`/`ArrayField` a medida) |
| `formId` | string | — | `id` del `<form>`; útil para disparar el submit desde un botón externo (ej. el footer de `DrawPanel`) |
| `onChange` | function | — | `(formData, rjsfEvent) => void`, en cada cambio de cualquier campo |
| `onSubmit` | function | — | `(formData, rjsfEvent) => void`, al enviar el formulario válido |
| `onError` | function | — | Callback de errores de validación de rjsf |
| `showSubmitButton` | boolean | `true` | Si no hay `children`, muestra un botón de submit (`Button` primario) |
| `submitText` | string | `'Enviar'` | Texto del botón de submit default |
| `disabled` | boolean | `false` | Deshabilita todos los campos |
| `readonly` | boolean | `false` | Vuelve todos los campos de solo lectura |
| `className` | string | `''` | Clase adicional en el `<form>` |
| `style` | object | — | Estilos inline en el `<form>` |
| `children` | node | — | Si se define, reemplaza el botón de submit default (ej. para poner acciones propias, o nada si los botones ya los provee un contenedor externo como `DrawPanel`) |

**Widgets incluidos** (seleccionables desde `uiSchema` con `'ui:widget': '<Nombre>'`):

| Widget | Usa | Tipo de campo típico |
|---|---|---|
| `TextWidget` | `Input` | `string` (default) |
| `NumberWidget` | `Input` (`numeric`) | `number` / `integer` (default) |
| `TextareaWidget` | `FormTextArea` | `string` largo (ej. `'ui:widget': 'TextareaWidget'`) |
| `CheckboxWidget` | `Swich` | `boolean` (default — ver nota debajo) |
| `SwitchWidget` | `Swich` | `boolean` como toggle, alias explícito de `CheckboxWidget` |
| `ChecksWidget` | `Checks` | `boolean` con el look de checkbox tachable (ej. `'ui:widget': 'ChecksWidget'`) |
| `CheckboxesWidget` | `Checks` (uno por opción) | `array` de `string` con `enum` + `uniqueItems` (selección múltiple; ej. `'ui:widget': 'CheckboxesWidget'` con `'ui:options': { enumOptions }`) |
| `SelectWidget` | `Selector` | `string` con `enum` (default cuando hay `enum`; **no soporta selección múltiple**, usar `CheckboxesWidget` para eso) |
| `RadioWidget` | `RadioGroup` + `Radio` (uno por opción) | `string` con `enum` + `'ui:widget': 'radio'` (alternativa a `SelectWidget` cuando conviene mostrar todas las opciones visibles en vez de un dropdown) |
| `DateWidget` | `CalendarPicker` | `string` con `format: 'date'` (ej. `'ui:widget': 'DateWidget'`) |
| `ColorWidget` | `ColorPicker` | `string` con `format: 'color'` (convención estándar de rjsf) |
| `RangeWidget` | `Slider` | `number` / `integer` con `'ui:widget': 'range'`; usa `minimum`/`maximum`/`multipleOf` del schema como `min`/`max`/`step` |
| `FileWidget` | botón de subida + `ImagePastePreview` | `string` con `format: 'data-url'` (archivo/imagen única), o `array` de esos con `format: 'data-url'` (múltiples, detectado automáticamente por rjsf) — ver nota de archivos debajo |
| `EmailWidget` / `URLWidget` | `Input` (`type="email"`/`"url"`) | `string` con `format: 'email'` / `format: 'uri'` (rjsf los resuelve por `format` con prioridad sobre `TextWidget`, por eso necesitan su propio mapeo) |
| `PasswordWidget` | `Input` (`type="password"`) | `string` con `'ui:widget': 'password'` (shorthand de rjsf) |

**Nota sobre `boolean`:** `Checks` tacha el label al marcarlo (pensado para listas de permisos/to-do), lo cual se ve mal en un campo booleano suelto de formulario. Por eso el widget registrado como `CheckboxWidget` (el que rjsf usa por default para todo `boolean`) es en realidad un `Swich`; para el look de checkbox clásico hay que pedirlo explícito con `'ui:widget': 'ChecksWidget'`.

**Nota sobre archivos (`FileWidget`):** el valor que entrega `onChange` es un data-URL en base64 (string), o un array de data-URLs si el campo es `array`/`'ui:options': { multiple: true }` — no un `File` nativo del browser. Restringir el tipo de archivo con `'ui:options': { accept: 'image/*' }` (mismo formato que el atributo HTML `accept`). El preview reusa `ImagePastePreview` (el mismo chip que usan `PasteImageField`/`MultilinePlaceholder`).

**Nota sobre theming de `ColorWidget`/`RadioWidget`/`RangeWidget`:** estos tres widgets no tienen ninguna prop de color directa en `SchemaForm` — `widgets.jsx` no inyecta un theme global a los widgets internos. Para tematizarlos hay que pasar las props de color del componente subyacente vía `'ui:options'` en el campo correspondiente del `uiSchema`, igual que `accept`/`multiple` en `FileWidget`:
- `ColorWidget` → `'ui:options': { bgColor, textColor, borderColor, accentColor }` (mismas props que acepta `ColorPicker`, incluido el popover).
- `RadioWidget` → `'ui:options': { color }` (prop `color` de `RadioGroup`/`Radio` de MUI: `'primary'` / `'secondary'` / etc., no un hex libre).
- `RangeWidget` → `'ui:options': { accentColor }` (prop `accentColor` de `Slider`, sí acepta hex).

Sin `ui:options`, los tres quedan con la paleta default de su componente (no heredan ningún color del resto del formulario).

**Schema de referencia completo:** este `schema` + `uiSchema` ejercitan todos los tipos/formatos que `SchemaForm` sabe interpretar — útil como plantilla para armar uno propio o para ver de un vistazo qué forma de JSON Schema produce cada widget.

```js
const schema = {
  type: 'object',
  required: ['nombre', 'email'],
  properties: {
    nombre: {
      type: 'string',
      title: 'Nombre',
      minLength: 2,
      maxLength: 50,
      description: 'Texto corto → TextWidget (Input)',
    },
    bio: {
      type: 'string',
      title: 'Biografía',
      description: 'Texto largo → TextareaWidget si se pide en uiSchema (FormTextArea)',
    },
    edad: {
      type: 'integer',
      title: 'Edad',
      minimum: 18,
      maximum: 99,
      description: 'number/integer → NumberWidget (Input numeric)',
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email',
      description: "format: 'email' → EmailWidget (Input type=email)",
    },
    password: {
      type: 'string',
      title: 'Contraseña',
      description: "ui:widget: 'password' → PasswordWidget (Input type=password)",
    },
    sitioWeb: {
      type: 'string',
      format: 'uri',
      title: 'Sitio web',
      description: "format: 'uri' → URLWidget (Input type=url)",
    },
    activo: {
      type: 'boolean',
      title: 'Cuenta activa',
      default: true,
      description: 'boolean (default) → CheckboxWidget, que en SchemaForm es un Swich',
    },
    recibirNotificaciones: {
      type: 'boolean',
      title: 'Recibir notificaciones',
      description: "boolean + ui:widget: 'ChecksWidget' → look de checkbox clásico (Checks)",
    },
    pais: {
      type: 'string',
      title: 'País',
      enum: ['ar', 'uy', 'br'],
      description: 'string + enum → SelectWidget (Selector, single-select)',
    },
    plan: {
      type: 'string',
      title: 'Plan',
      enum: ['free', 'pro', 'enterprise'],
      description: "string + enum + ui:widget: 'radio' → RadioWidget (RadioGroup + Radio)",
    },
    roles: {
      type: 'array',
      title: 'Roles',
      items: { type: 'string', enum: ['admin', 'editor', 'viewer'] },
      minItems: 1,
      uniqueItems: true,
      description: "array de enum + ui:widget: 'CheckboxesWidget' → selección múltiple (Checks)",
    },
    nacimiento: {
      type: 'string',
      format: 'date',
      title: 'Fecha de nacimiento',
      description: "format: 'date' + ui:widget: 'DateWidget' → CalendarPicker",
    },
    avatar: {
      type: 'string',
      format: 'data-url',
      title: 'Foto de perfil',
      description: "format: 'data-url' → FileWidget, un solo archivo (data-URL en base64)",
    },
    adjuntos: {
      type: 'array',
      title: 'Archivos adjuntos',
      items: { type: 'string', format: 'data-url' },
      description: "array de format: 'data-url' → FileWidget con multiple=true (detectado solo por rjsf)",
    },
    colorFavorito: {
      type: 'string',
      format: 'color',
      title: 'Color favorito',
      default: '#2563eb',
      description: "format: 'color' → ColorWidget (ColorPicker)",
    },
    satisfaccion: {
      type: 'integer',
      title: 'Satisfacción',
      minimum: 0,
      maximum: 10,
      default: 5,
      description: "number/integer + ui:widget: 'range' → RangeWidget (Slider), min/max desde minimum/maximum",
    },
    direccion: {
      type: 'object',
      title: 'Dirección',
      properties: {
        calle: { type: 'string', title: 'Calle' },
        ciudad: { type: 'string', title: 'Ciudad' },
        codigoPostal: {
          type: 'string',
          title: 'Código postal',
          pattern: '^[0-9]{4,6}$',
        },
      },
      required: ['calle', 'ciudad'],
      description: 'object anidado → ObjectFieldTemplate, recursivo (cada property usa su propio widget)',
    },
  },
};

const uiSchema = {
  bio: { 'ui:widget': 'TextareaWidget' },
  password: { 'ui:widget': 'password' },
  recibirNotificaciones: { 'ui:widget': 'ChecksWidget' },
  roles: {
    'ui:widget': 'CheckboxesWidget',
    'ui:options': {
      enumOptions: [
        { value: 'admin', label: 'Admin' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Viewer' },
      ],
    },
  },
  plan: { 'ui:widget': 'radio', 'ui:options': { color: 'secondary' } },
  nacimiento: { 'ui:widget': 'DateWidget' },
  avatar: { 'ui:options': { accept: 'image/*' } },
  adjuntos: { 'ui:options': { multiple: true } },
  colorFavorito: { 'ui:options': { bgColor: '#1e293b', textColor: '#f1f5f9', borderColor: '#334155' } },
  satisfaccion: { 'ui:widget': 'range', 'ui:options': { accentColor: '#f97316' } },
};

<SchemaForm schema={schema} uiSchema={uiSchema} formData={formData} onChange={setFormData} onSubmit={handleSave} />
```

**Ejemplos:**
```jsx
// Formulario de perfil con textarea, select y fecha, dentro de un DrawPanel
const schema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: { type: 'string', title: 'Nombre' },
    bio: { type: 'string', title: 'Biografía' },
    pais: { type: 'string', title: 'País', enum: ['ar', 'uy', 'br'] },
    nacimiento: { type: 'string', title: 'Fecha de nacimiento', format: 'date' },
  },
};

const uiSchema = {
  bio: { 'ui:widget': 'TextareaWidget' },
  pais: {
    'ui:options': {
      enumOptions: [
        { value: 'ar', label: 'Argentina' },
        { value: 'uy', label: 'Uruguay' },
        { value: 'br', label: 'Brasil' },
      ],
    },
  },
};

<DrawPanel isOpen={open} onClose={handleClose} title="Editar perfil" showActions formId="profile-form" onConfirm={() => {}}>
  <SchemaForm
    formId="profile-form"
    schema={schema}
    uiSchema={uiSchema}
    formData={formData}
    onChange={setFormData}
    onSubmit={handleSave}
    showSubmitButton={false}
  />
</DrawPanel>
```

**Notas:** El validador (`@rjsf/validator-ajv8`) viene empaquetado como dependency de `anteriority-ui` y se usa por default — no hace falta instalarlo ni pasarlo por prop; `validator` solo sirve para forzar otra implementación. Los widgets propios pueden extenderse o pisarse por campo vía la prop `widgets` (se mergean sobre los default) sin perder el resto. Al igual que el resto de componentes con `children` libre, no se acopla a `DrawPanel` ni a ningún contenedor — cualquier componente puede envolverlo. `templates.ButtonTemplates.SubmitButton` está pisado con un componente que no renderiza nada: `@rjsf/core` agrega su propio botón de submit nativo (sin estilo) además de cualquier `children`/botón que se le pase al `<Form>`, así que sin ese override quedarían dos submits — el de `SchemaForm` y el default de rjsf.

---

### RenderJsonSchema

Vista de **solo lectura** de datos ya guardados a partir de un JSON Schema: a diferencia de `SchemaForm`, no renderiza un formulario editable ni depende de rjsf — recorre `schema.properties` y muestra cada valor de `formData` como texto (o imagen, para `format: 'data-url'`), resolviendo el `title`, `enum`/`enumNames` (o `anyOf` con `const`/`title`), `boolean` y `format: 'date'`/`'date-time'` del propio schema. Pensado para mostrar el detalle de una respuesta ya enviada (ej. lo que guardó un `<SchemaForm />`) sin tener que escribir a mano el mapeo de cada campo.

Tolera datos guardados por un widget roto o una versión vieja (un valor que no matchea el `type` esperado, como un objeto en vez de un string): en lugar de romper o mostrar `"[object Object]"`, ese campo se muestra vacío (`"Sin datos"` por default).

**Import:**
```jsx
import RenderJsonSchema from '../RenderJsonSchema'; // export default (index.jsx)
```

**Uso básico:**
```jsx
const schema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', title: 'Nombre' },
    pais: { type: 'string', title: 'País', enum: ['ar', 'uy'], enumNames: ['Argentina', 'Uruguay'] },
    nacimiento: { type: 'string', title: 'Fecha de nacimiento', format: 'date' },
  },
};

<RenderJsonSchema schema={schema} formData={{ nombre: 'Ignacio', pais: 'ar', nacimiento: '1996-05-10' }} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `schema` | object | — | Mismo JSON Schema (`properties`, `title`, `enum`/`enumNames`, `anyOf`, `format`) que se le pasaría a `SchemaForm` |
| `formData` | object | — | Datos ya guardados a mostrar; si falta una key o el schema no tiene `properties`, se muestra `emptyText` |
| `emptyText` | string | `'Sin datos'` | Texto para un campo sin valor, o un valor que no matchea el tipo esperado por el schema |
| `bordered` | boolean | `true` | Si `true`, envuelve las filas en un panel con fondo/borde propio (look de card). Un `object` anidado se renderiza internamente con `bordered={false}` para no anidar panel dentro de panel |
| `bgColor` | string | — | Color de fondo del panel (solo visible si `bordered`) |
| `textColor` | string | — | Color del texto de los valores |
| `labelColor` | string | — | Color de los labels (nombre de cada campo) |
| `borderColor` | string | — | Color del borde del panel y de la línea divisoria entre filas |
| `className` | string | `''` | Clase adicional en el contenedor raíz |
| `style` | object | — | Estilos inline en el contenedor raíz |

**Ejemplos:**
```jsx
// object anidado → recursión (mismo componente, con indentación); array de enum → labels unidos por coma
const schema = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      title: 'Roles',
      items: { type: 'string', enum: ['admin', 'editor'], enumNames: ['Admin', 'Editor'] },
    },
    direccion: {
      type: 'object',
      title: 'Dirección',
      properties: {
        calle: { type: 'string', title: 'Calle' },
        ciudad: { type: 'string', title: 'Ciudad' },
      },
    },
  },
};

<RenderJsonSchema
  schema={schema}
  formData={{ roles: ['admin', 'editor'], direccion: { calle: 'Av. Siempre Viva 742', ciudad: 'Springfield' } }}
/>
```

**Notas:** No usa ningún widget de `SchemaForm` ni acepta `uiSchema` — el mapeo de presentación (enum→label, boolean→Sí/No, fecha formateada `dd/MM/yyyy` con `date-fns`) está fijo y se resuelve solo con lo que ya describe el `schema`. Layout en una sola columna: cada campo es una fila (label en mayúsculas chico arriba, valor grande abajo) separada de la siguiente por una línea divisoria, todo dentro de un único panel — así es naturalmente responsive, sin media queries. Un `object` anidado recorre el mismo componente dentro de la fila del campo padre (sin repetir panel/borde), heredando los mismos props de color. Para `format: 'data-url'` (archivo/imagen, single o array) cada valor se renderiza con `MediaViewer` (detecta imagen/video/audio/PDF/archivo genérico solo), no con un `<img>` a mano; `bgColor`/`textColor`/`borderColor` se propagan también a ese `MediaViewer` interno (usa sus propios tokens CSS, no los hereda solo). Los colores son light por default (como el resto de la librería); para un panel oscuro (ej. para integrarlo en un contenedor con tema oscuro) usar `bgColor`/`textColor`/`labelColor`/`borderColor` en vez de CSS global, siguiendo la convención de props de color del resto de componentes — ver [Convención: props de color](#convención-props-de-color) en CLAUDE.md.

---

### Sidebar

Barra lateral de navegación colapsable con grupos de items, subitems anidados y colapsables (ej. "Vacunas" → Ver/Crear/Pendientes/Lotes), badges por método HTTP, menú de usuario, menú contextual por item (editar/eliminar/fijar/colaboradores) y reordenamiento por drag & drop.

**Import:**
```jsx
import Sidebar from 'screens/components/Sidebar/index';
// también disponible como export nombrado: import { ProSidebar } from 'screens/components/Sidebar/index';
```

**Uso básico:**
```jsx
<Sidebar
  groups={groups}
  activeId={activeId}
  onSelect={(item) => setActiveId(item.id)}
  user={{ email: 'jane.doe@example.com' }}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `groups` | `Array<{ title?, items: Array<{ id, label, icon?, badge?, badgeType?, pinned?, isOwner?, isShared?, subItems? }> }>` | — | Estructura de grupos e items del menú. `subItems` es un array opcional de `{ id, label, icon?, badge?, badgeType? }`: si un item lo tiene, se renderiza como header colapsable (con chevron) en vez de item navegable — el click solo expande/colapsa, no dispara `onSelect` ni se marca "activo" (ver Notas). |
| `activeId` | `string`\|`number` | — | Id del item (o subitem) actualmente activo. Si matchea el id de un subitem, ese subitem se resalta y su grupo padre se auto-expande al montar el componente. |
| `onSelect` | `function(item)` | — | Callback al seleccionar un item. |
| `collapsible` | `boolean` | `true` | Muestra el botón de colapsar y habilita el atajo de teclado para colapsar/expandir. |
| `loading` | `boolean` | `false` | Muestra `skeletonItems` filas de `Skeleton` en vez de los grupos reales. |
| `skeletonItems` | `number` | `15` | Cantidad de filas skeleton al cargar. |
| `className` | `string` | `''` | Clase adicional para el `<aside>` raíz. |
| `headerContent` | `node` | — | Contenido custom del header (oculto si está colapsado). |
| `footerContent` | `node` | — | Contenido custom del footer (oculto si está colapsado). |
| `user` | `{ email }` | — | Si tiene `email`, muestra el footer de usuario con menú desplegable. |
| `userMenuItems` | `Array<{ id?, label, icon?, onClick?, variant? }>` | `[]` | Items del menú de usuario (variant `'danger'` los resalta en rojo). |
| `userMenuLinks` | `Array<{ id?, label, link, target?, onClick? }>` | `[]` | Links secundarios (ej. "Política de Privacidad") agrupados debajo de `userMenuItems` dentro del mismo menú desplegable, con divisor y estilo chico/centrado. `target` por default es `'_blank'`. |
| `userFooterAction` | `{ icon, tooltip, onClick, tooltipPosition? }` | — | Botón circular de acción al lado del perfil (ej. ajustes), con `ModalTooltip`. No abre el menú de usuario al hacer click. Se oculta si el sidebar está colapsado. |
| `onItemEdit` | `function(item)` | — | Habilita "Editar" en el menú contextual del item. |
| `onItemDelete` | `function(item)` | — | Habilita "Eliminar"/"Salir" en el menú contextual. |
| `onItemPin` | `function(item)` | — | Habilita "Fijar"/"Desfijar" en el menú contextual. |
| `onItemCollaborators` | `function(item)` | — | Habilita "Colaboradores" (solo si `item.isOwner !== false && item.isShared`). |
| `onReorderItems` | `function(orderedIds)` | — | Si se define, habilita drag & drop para reordenar items dentro de un grupo. |
| `avatarBgColor` | `string` | — | Color del avatar de usuario. |
| `pinnedIconColor` | `string` | — | Color del icono de "fijado". |
| `methodBadgeColors` | `{ post?, get?, put?, delete?, info?: { bg, color } }` | — | Sobrescribe los colores de badge por método HTTP. |
| `subItemActiveBgColor` | `string` | — | Color de fondo de un subitem activo (dentro de un item con `subItems`). |
| `subItemActiveTextColor` | `string` | — | Color de texto de un subitem activo. |
| `isMobileOpen` | `boolean` | `false` | Controla la apertura del drawer en modo mobile (ver "Responsive" abajo). |
| `onCloseMobile` | `function()` | — | Callback al cerrar el drawer mobile (backdrop, Escape, X, o al seleccionar un item). |
| `style` | `object` | — | Estilos inline adicionales para el `<aside>` raíz; se mergea con las CSS custom properties que generan las props de color. |
| `enableFilter` | `boolean` | `false` | Muestra el botón de filtro (ícono embudo) en el header, que despliega un popover con las opciones de `currentFilter`. |
| `currentFilter` | `string`\|`null` | — | Key del filtro activo (`'date'`, `'name'`, `'recent'`); resalta esa opción en el popover con un check. |
| `onFilterChange` | `function(filterKey \| null)` | — | Callback al elegir una opción del popover. Si se vuelve a elegir la opción ya activa, se llama con `null` (deselecciona). |
| `filterIcon` | componente (lucide-react) \| `node` | `ArrowUpDown` | Ícono del botón de filtro. |
| `filterBtnActiveBg` | `string` | `#eff6ff` | Fondo del botón de filtro cuando el popover está abierto o hay un filtro activo. |
| `filterBtnActiveColor` | `string` | `#0d52f8` | Color de texto/ícono del botón de filtro en ese mismo estado. |
| `filterPopoverBg` | `string` | `#ffffff` | Fondo del popover del filtro (vía portal, fuera del árbol del sidebar). |
| `filterPopoverTextColor` | `string` | `--sidebar-text` (`#0f172a`) | Color de texto base de las opciones del popover. |
| `filterPopoverTitleColor` | `string` | `--sidebar-text-muted` (`#64748b`) | Color del título "FILTRAR POR". |
| `filterPopoverBorderColor` | `string` | `--sidebar-border` (`#e2e8f0`) | Color de borde del popover y del separador bajo el título. |
| `filterPopoverHoverBg` | `string` | derivado de `filterPopoverTextColor` (ver Notas) | Fondo al pasar el mouse sobre una opción del popover. |
| `filterPopoverActiveBg` | `string` | derivado de `filterPopoverTextColor` (ver Notas) | Fondo de la opción actualmente seleccionada (`currentFilter`). |
| `filterPopoverActiveTextColor` | `string` | `--sidebar-text-active` (`#0d52f8`) | Color de texto de la opción seleccionada. |
| `filterPopoverCheckColor` | `string` | = `filterPopoverActiveTextColor` | Color del ícono de check en la opción seleccionada. |

**Ejemplos:**
```jsx
// Item con subItems colapsables (ej. "Vacunas")
<Sidebar
  groups={[
    {
      title: 'General',
      items: [
        { id: 'home', label: 'Inicio', icon: Home },
        {
          id: 'vaccines',
          label: 'Vacunas',
          icon: Activity,
          subItems: [
            { id: 'vaccines-view', label: 'Ver vacunas' },
            { id: 'vaccines-create', label: 'Crear vacuna' },
            { id: 'vaccines-pending', label: 'Vacunas pendientes' },
            { id: 'vaccines-batches', label: 'Lotes de vacunas' },
          ],
        },
      ],
    },
  ]}
  activeId="vaccines-view"
  onSelect={(item) => setActiveId(item.id)}
  user={{ email: 'jane.doe@example.com' }}
/>

<Sidebar groups={[]} loading skeletonItems={8} user={{ email: 'jane.doe@example.com' }} />

<Sidebar
  groups={groups}
  user={{ email: 'jane.doe@example.com' }}
  onItemEdit={(item) => console.log('edit', item)}
  onItemDelete={(item) => console.log('delete', item)}
  onReorderItems={(orderedIds) => console.log('reordered', orderedIds)}
/>

// Menú de usuario con links legales + botón de acción (ajustes) al lado del perfil
<Sidebar
  groups={groups}
  user={{ email: 'jane.doe@example.com' }}
  userMenuItems={[{ id: 'logout', label: 'Cerrar sesión', icon: LogOut, variant: 'danger', onClick: handleLogout }]}
  userMenuLinks={[
    { id: 'privacy', label: 'Política de Privacidad', link: '/privacidad' },
    { id: 'terms', label: 'Términos del Servicio', link: '/terminos' },
  ]}
  userFooterAction={{ icon: Settings, tooltip: 'Configuración', onClick: () => navigate('/settings') }}
/>

// Botón de filtro con popover personalizado por completo, incluyendo un fondo oscuro
<Sidebar
  groups={groups}
  user={{ email: 'jane.doe@example.com' }}
  enableFilter
  currentFilter={currentFilter}
  onFilterChange={setCurrentFilter}
  filterPopoverBg="#140e46"
  filterPopoverTextColor="#e6e8ec"
  filterBtnActiveColor="#2207c4"
  // filterPopoverHoverBg / filterPopoverActiveBg no se pasan a propósito:
  // al quedar sin especificar, se derivan solos de filterPopoverTextColor
  // (ver Notas) y ya se ven bien sobre el fondo oscuro de filterPopoverBg.
/>
```

**Notas:** Persiste el estado colapsado en `localStorage` bajo la clave `sidebar_collapsed`. Los subitems no soportan drag & drop (`onReorderItems`), menú contextual (`onItemEdit`/`onItemDelete`/`onItemPin`/`onItemCollaborators`) ni colapsado individual persistido — solo navegación simple vía `onSelect`. Cuando el sidebar está colapsado (`isCollapsed`), los grupos con `subItems` se muestran colapsados y sin chevron (igual que cualquier item simple, con tooltip); hay que expandir el sidebar para ver/navegar los subitems. `onSearch`/`filterMenuGroups` matchea por `label` del item padre o de cualquiera de sus `subItems`, pero si matchea, se muestra el item completo con **todos** sus subitems (no solo el que matcheó).

**Popover de filtro — hover/active derivados por default:** si no se pasan `filterPopoverHoverBg`/`filterPopoverActiveBg` explícitamente, ya no caen en el tema claro fijo del propio Sidebar (`#f1f5f9`/`#eff6ff`) — eso producía un hover/active blanco o celeste pálido que se veía mal cuando `filterPopoverBg` se personalizaba a un color oscuro (el fondo quedaba oscuro pero el hover/active de las opciones seguía claro, sin relación con ese fondo). Ahora el fallback se deriva mezclando `filterPopoverTextColor` (el color de texto del propio popover, que normalmente ya contrasta con `filterPopoverBg`) con transparencia (`color-mix`), así se adapta solo a cualquier fondo de popover, claro u oscuro. `filterPopoverHoverBg`/`filterPopoverActiveBg` siguen existiendo para fijar un color puntual distinto a ese default.

**Responsive (mobile):** por debajo de 767px de viewport, el sidebar se comporta como un drawer: queda oculto fuera de pantalla y aparece un botón flotante con ícono de hamburguesa (esquina superior izquierda) para abrirlo. Al abrirse, se desliza como overlay a ancho completo (280px, hasta 85vw) sobre un backdrop oscuro; se cierra al tocar el backdrop, al presionar Escape, al tocar la X del propio drawer, o automáticamente al seleccionar un item (`onSelect`). El botón de colapsar (`collapsible`) se oculta en este modo, ya que no aplica a un drawer full-width. No requiere ninguna prop nueva — la detección de mobile es automática vía `matchMedia`.

---

### Skeleton

Placeholder de carga (shimmer) simple, en forma de bloque, línea o círculo.

**Import:**
```jsx
import Skeleton from 'screens/components/Skeleton/index';
// también disponible como export nombrado: import { Skeleton } from 'screens/components/Skeleton/index';
```

**Uso básico:**
```jsx
<Skeleton width="200px" height="1em" />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `width` | `string`\|`number` | `'100%'` | Ancho del skeleton. |
| `height` | `string`\|`number` | `'1em'` | Alto del skeleton. |
| `radius` | `string` | `'6px'` | Radio de borde (ignorado si `circle` es `true`). |
| `circle` | `boolean` | `false` | Si es `true`, fuerza `border-radius: 50%`. |
| `className` | `string` | `''` | Clase adicional. |
| `style` | `object` | `{}` | Estilos inline adicionales. |

**Ejemplos:**
```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
  <Skeleton circle width={28} height={28} />
  <Skeleton width="60%" height="12px" />
</div>
```

---

### Slider

Slider horizontal controlado, basado en el `Slider` de MUI, con color de acento configurable y tooltip opcional con el porcentaje. Es el que usa el pie de desplazamiento de `TableA`/`TableB`.

**Import:**
```jsx
import Slider from 'screens/components/Slider/index';
// también disponible como export nombrado: import { Slider } from 'screens/components/Slider/index';
```

**Uso básico:**
```jsx
const [value, setValue] = useState(30);

<Slider value={value} onChange={setValue} showPercentage aria-label="Volumen" />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `number` | `0` | Valor actual (controlado). |
| `min` | `number` | `0` | Valor mínimo. |
| `max` | `number` | `100` | Valor máximo. |
| `step` | `number` | `1` | Incremento. |
| `onChange` | `function(value: number)` | — | Se llama con el nuevo valor ya convertido a número. |
| `disabled` | `boolean` | `false` | Deshabilita el slider. |
| `showPercentage` | `boolean` | `false` | Muestra en el tooltip del thumb el porcentaje del recorrido (`(value - min) / (max - min)`), al arrastrar o pasar el mouse. |
| `accentColor` | `string` | `'#7c9cff'` | Color de acento (barra rellena y thumb). |
| `thickness` | `number` | `8` | Grosor de la línea en px (el thumb crece en proporción). |
| `className` | `string` | `''` | Clase adicional. |
| `style` | `object` | — | Estilos inline. |
| `aria-label` | `string` | — | Texto accesible del slider. |

---

### SubSidebarLayout

Layout de dos columnas: un sub-menú lateral con botones tipo pestaña y un área de contenido a la derecha.

**Import:**
```jsx
import SubSidebarLayout from 'screens/components/SubSidebarLayout';
```

**Uso básico:**
```jsx
<SubSidebarLayout
  menuItems={[{ id: 'general', label: 'General', icon: <Settings size={16} /> }]}
  activeItemId="general"
  onItemClick={(id) => setActiveItemId(id)}
>
  <div>Contenido de la sección</div>
</SubSidebarLayout>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `menuItems` | `Array<{ id, label, icon? }>` | `[]` | Items del sub-menú lateral (`icon` es un nodo React opcional). |
| `activeItemId` | `string`\|`number` | — | Id del item activo. |
| `onItemClick` | `function(id, item)` | — | Callback al hacer click en un item del menú. |
| `children` | `node` | — | Contenido del área principal. |
| `bgColor` | `string` | — | Color de fondo del sub-sidebar (`--subsidebarlayout-bg`). |

**Ejemplos:**
```jsx
<SubSidebarLayout menuItems={menuItems} activeItemId={activeItemId} onItemClick={setActiveItemId}>
  {null}
</SubSidebarLayout>
```

---

### SummaryCard

Tarjeta destacada (con gradiente) para mostrar un resumen generado, con botón opcional de copiar al portapapeles.

**Import:**
```jsx
import SummaryCard from 'screens/components/SummaryCard';
```

**Uso básico:**
```jsx
<SummaryCard title="Resumen generado" text="Este es un resumen de ejemplo..." />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | — | Título de la tarjeta. |
| `text` | `string` | — | Cuerpo del resumen. |
| `enableCopy` | `boolean` | `false` | Muestra un botón para copiar `text` al portapapeles. |
| `gradientStart` | `string` | — | Color inicial del gradiente de fondo (`--summarycard-gradient-start`). |
| `gradientEnd` | `string` | — | Color final del gradiente (`--summarycard-gradient-end`). |
| `headerColor` | `string` | — | Color del header/icono (`--summarycard-header-color`). |

**Ejemplos:**
```jsx
<SummaryCard title="Resumen con copia" text="..." enableCopy />
```

---

### Swich

Interruptor (toggle) tipo switch con animación de ripple al hacer click y tooltip que indica el estado actual.

**Import:**
```jsx
import Swich from 'screens/components/Swich/index';
```

**Uso básico:**
```jsx
const [value, setValue] = useState(false);
<Swich value={value} onChange={setValue} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `boolean` | `false` | Estado controlado del switch (encendido/apagado). |
| `onChange` | `function(newActive)` | — | Callback invocado con el nuevo valor al hacer click. |
| `disabled` | `boolean` | `false` | Deshabilita la interacción. |
| `activeColor` | `string` | `'#088d4f'` | Color de fondo cuando está activo. |
| `inactiveColor` | `string` | `'#919191'` | Color de fondo cuando está inactivo. |
| `thumbColor` | `string` | `'#ffffff'` | Color del "thumb" (círculo deslizante). |
| `className` | `string` | `''` | Clase adicional para el botón. |
| `style` | `object` | `{}` | Estilos inline adicionales. |

**Ejemplos:**
```jsx
<Swich value={true} activeColor="#2563eb" inactiveColor="#cbd5e1" thumbColor="#ffffff" />
```

**Notas:** Es controlado, así que se debe pasar `value` junto con `onChange` para reflejar el estado externo. Envuelve el botón en un `ModalTooltip` que muestra "activado"/"desactivado".

---

### TableA

Tabla simple orientada a columnas con `accessor`/`render`, con estados de carga (skeleton), error y vacío incorporados.

**Import:**
```jsx
import TableA from 'screens/components/TableA';
```

**Uso básico:**
```jsx
<TableA
  columns={[
    { header: 'Nombre', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
  ]}
  data={[{ id: 1, name: 'Ana Gomez', email: 'ana@correo.com' }]}
  keyExtractor={(row) => row.id}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `columns` | `Array<{ header, accessor, align?, width?, render?(row), filter? }>` | `[]` | Definición de columnas. `header` es el texto de cabecera, `accessor` es la clave leída de cada fila (`row[col.accessor]`), `render(row)` sobreescribe el contenido de la celda, `align` es `'left'`\|`'center'`\|`'right'`. `filter` agrega un ícono de embudo junto al header (ver abajo). |
| `data` | `Array<object>` | `[]` | Filas a renderizar; cada fila es un objeto plano cuyas claves coinciden con `accessor`. |
| `keyExtractor` | `function(row) => key` | — | **Requerido** para renderizar filas reales (se usa como `key`). |
| `rowClassName` | `function(row) => string` | — | Clase CSS adicional por fila. |
| `loading` | `boolean` | `false` | Muestra `skeletonRows` filas de `Skeleton` en lugar de los datos. |
| `skeletonRows` | `number` | `6` | Cantidad de filas skeleton. |
| `error` | `string`\|`node` | `null` | Si está presente, muestra un mensaje de error con icono en vez de la tabla de datos. |
| `onRetry` | `function` | — | Si se define junto con `error`, muestra un botón "Reintentar". |
| `emptyIcon` | `component` | `Inbox` | Icono mostrado cuando `data` está vacío. |
| `emptyMessage` | `string` | `"No hay datos disponibles"` | Mensaje mostrado cuando `data` está vacío. |
| `onRowClick` | `function(row)` | — | Si se define, hace las filas clicables (cursor pointer). |
| `surfaceColor`, `headerColor`, `textColor`, `headingColor`, `mutedTextColor`, `borderColor`, `hoverColor`, `rowBorderColor` | `string` | — | Overrides de tema vía variables CSS `--tableA-*`. |
| `filterIconColor` | `string` | — | Color del ícono de embudo cuando la columna no tiene filtro activo. |
| `filterActiveColor` | `string` | `'#10b981'` | Color del ícono de embudo cuando `col.filter.value` tiene un valor (filtro activo). |
| `stickyFirstColumn` | `boolean` | `false` | Deja la primera columna fija a la izquierda mientras la tabla se desplaza en horizontal. Su celda necesita fondo opaco: por defecto usa `surfaceColor`; si pintás las filas con un tinte (`rowClassName`), el fondo de `td:first-child` debe seguir siendo opaco (ej. el tinte como `linear-gradient` sobre el color de superficie). |
| `stickyHeader` | `boolean` | `false` | Encabezado siempre visible: la tabla pasa a scrollear en vertical por dentro (hasta `maxHeight`, sin barra vertical visible) y el `<th>` queda pegado arriba con `position: sticky`. Combina bien con `scrollFooter`, que queda siempre a la vista bajo la tabla. |
| `maxHeight` | `string` \| `number` | `'70vh'` | Alto máximo del área de la tabla cuando `stickyHeader` está activo. |
| `width` | `string` \| `number` | — | Ancho total de la tabla (`<table>`), ej. `'480px'` o `600`. Sin esta prop la tabla sigue ocupando el 100% del contenedor, igual que antes — es para el caso contrario, cuando se quiere que la tabla NO se estire a todo el ancho disponible. No afecta el ancho del contenedor/wrapper, que sigue siendo 100%. |
| `scrollFooter` | `boolean` | `false` | Muestra un pie pegado al borde inferior de la pantalla (`position: sticky`) con un botón ◀, un slider y un botón ▶ para desplazar la tabla en horizontal sin bajar hasta su final. Solo aparece si la tabla es más ancha que su contenedor y reemplaza la barra de scroll horizontal propia de la tabla. Ningún ancestro de la tabla debe tener `overflow: hidden/auto` entre ella y el scroll de la página (usar `overflow: clip` si hace falta recortar). |
| `scrollFooterBgColor` | `string` | `surfaceColor` | Fondo del pie de desplazamiento. |
| `scrollFooterBorderColor` | `string` | `borderColor` | Borde del pie de desplazamiento. |
| `scrollControlsColor` | `string` | `'#7c9cff'` (slider) / color por defecto de `Button` | Color de los botones ◀ ▶ y del slider del pie. |
| `scrollLeftLabel`, `scrollRightLabel`, `scrollSliderLabel` | `string` | `'Desplazar tabla a la izquierda'`, `'Desplazar tabla a la derecha'`, `'Posición horizontal de la tabla'` | Textos (tooltips / `aria-label`) del pie de desplazamiento. |

**Filtro por columna (`col.filter`):**

Cualquier columna puede declarar `filter: { options, value, onChange, tooltip? }` para mostrar un ícono de embudo junto al header que, al hacer click, **cicla** al siguiente valor de `options` (vuelve al principio al llegar al final):

| Campo de `filter` | Tipo | Descripción |
|---|---|---|
| `options` | `Array<{ value, label }>` | **Requerido.** Lista de valores por los que cicla el ícono. La primera opción suele representar "sin filtro" (ej. `{ value: '', label: 'Todos' }`). |
| `value` | `any` | Valor actualmente seleccionado (controlado por el consumidor). |
| `onChange` | `function(nextValue)` | La tabla lo llama con el siguiente valor del ciclo; el consumidor solo necesita guardarlo en estado. |
| `tooltip` | `string` | Texto del tooltip del ícono; por default muestra el `label` de la opción actual. |

La tabla **no filtra `data` por sí misma** — solo maneja el ciclo de valores y el ícono. El consumidor decide cómo aplicar `value` sobre `data` (ej. con un `.filter()` antes de pasarlo a la tabla), igual que decide qué hacer con `onRowClick` o `render`.

**Ejemplos:**
```jsx
<TableA columns={columns} data={[]} keyExtractor={(row) => row.id} loading skeletonRows={4} />

<TableA
  columns={columns}
  data={[]}
  keyExtractor={(row) => row.id}
  error="No se pudieron cargar los datos."
  onRetry={() => console.log('retry clicked')}
/>

// Tabla ancha: primera columna fija + pie de desplazamiento horizontal
<TableA
  columns={wideColumns}
  data={rows}
  keyExtractor={(row) => row.id}
  stickyFirstColumn
  scrollFooter
/>

// Con filtro por columna
function UsersTable() {
  const [statusFilter, setStatusFilter] = useState('');

  const columns = [
    { header: 'Nombre', accessor: 'name' },
    {
      header: 'Estado',
      accessor: 'active',
      filter: {
        options: [
          { value: '', label: 'Todos' },
          { value: 'active', label: 'Activo' },
          { value: 'inactive', label: 'Inactivo' },
        ],
        value: statusFilter,
        onChange: setStatusFilter,
      },
    },
  ];

  const filteredData = users.filter((u) => {
    if (statusFilter === 'active') return u.active;
    if (statusFilter === 'inactive') return !u.active;
    return true;
  });

  return <TableA columns={columns} data={filteredData} keyExtractor={(row) => row.id} />;
}

// Ancho total fijo en vez de ocupar todo el contenedor
<TableA columns={columns} data={data} keyExtractor={(row) => row.id} width="480px" />
```

> **Importante:** `TableA` usa columnas con forma `{ header, accessor, align, width, render, filter }` y filas como objetos planos accedidos por `accessor`. Ver `TableB` abajo — su forma es distinta, no son intercambiables. No confundir `width` a nivel tabla (prop de arriba) con `width` a nivel columna (`col.width`, dentro de `columns`) — son dos cosas distintas.

---

### TableB

Tabla "moderna" orientada a columnas con `key`/`label`, con soporte para columnas de tipo badge y acciones, filas expandibles y estados de carga/error/vacío.

**Import:**
```jsx
import TableB from 'screens/components/TableB';
```

**Uso básico:**
```jsx
<TableB
  columns={[
    { key: 'name', label: 'Nombre' },
    { key: 'species', label: 'Especie' },
  ]}
  data={[{ id: 1, name: 'Firulais', species: 'Perro' }]}
  rowKey="id"
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `columns` | `Array<{ key, label, align?, width?, type?, render?(row, rowIndex), badgeType?(row), badgeClass?(row), actions?: Array<{ label, onClick(row), disabled?(row), icon?, invertIcon? }>, filter? }>` | `[]` | Definición de columnas. `label` es el texto de cabecera; `key` identifica la columna y por defecto se lee `row[col.key]`. `type: 'badge'` renderiza el valor dentro de un `Barnner` (color según `badgeType(row)`: `'success'`\|`'warning'`\|`'danger'`); `type: 'actions'` renderiza botones definidos en `actions`. `filter` agrega un ícono de embudo junto al header (misma forma que en `TableA`, ver abajo). |
| `data` | `Array<object>` | `[]` | Filas a renderizar; objetos planos leídos por `col.key` (o por `col.render`). |
| `loading` | `boolean` | `false` | Muestra `skeletonRows` filas de `Skeleton`. |
| `skeletonRows` | `number` | `6` | Cantidad de filas skeleton. |
| `error` | `string`\|`node` | `null` | Si está presente, muestra un `Loading` con frases de error en vez de la tabla. |
| `onRetry` | `function` | — | Recibido pero actualmente sin efecto (el botón de reintentar está comentado en el código). |
| `emptyIcon` | `component` | `Inbox` | Icono mostrado cuando `data` está vacío. |
| `emptyMessage` | `string` | `"No hay datos disponibles."` | Mensaje mostrado cuando `data` está vacío. |
| `expandable` | `{ rowExpandable?(row) => boolean, expandedRowRender(row, rowIndex) => node }` | — | Si se define, agrega una columna de expandir. |
| `rowKey` | `string` | `'id'` | Nombre de la propiedad de `data` usada como clave/identificador de fila. |
| `rowClassName` | `function(row, rowIndex) => string` | — | Clase CSS adicional por fila. |
| `surfaceColor`, `headerColor`, `textColor`, `headingColor`, `mutedTextColor`, `borderColor`, `hoverColor`, `rowBorderColor` | `string` | — | Overrides de tema vía variables CSS `--tableB-*`. |
| `badgeColors` | `{ success?, warning?, danger?: { bg, color } }` | — | Overrides de color para columnas tipo badge. |
| `filterIconColor` | `string` | — | Color del ícono de embudo sin filtro activo. |
| `filterActiveColor` | `string` | `'#10b981'` | Color del ícono de embudo con filtro activo. |
| `stickyFirstColumn` | `boolean` | `false` | Deja la primera columna fija a la izquierda al desplazar en horizontal. Su celda usa `surfaceColor` como fondo opaco (si pintás las filas con un tinte, el fondo de `td:first-child` debe seguir siendo opaco). Las celdas con colSpan (vacío, error, fila expandida) no se fijan. |
| `stickyHeader` | `boolean` | `false` | Encabezado siempre visible: la tabla pasa a scrollear en vertical por dentro (hasta `maxHeight`, sin barra vertical visible) y el `<th>` queda pegado arriba con `position: sticky`. Combina bien con `scrollFooter`, que queda siempre a la vista bajo la tabla. |
| `maxHeight` | `string` \| `number` | `'70vh'` | Alto máximo del área de la tabla cuando `stickyHeader` está activo. |
| `width` | `string` \| `number` | — | Ancho total de la tabla (`<table>`), ej. `'480px'` o `600`. Sin esta prop la tabla sigue ocupando el 100% del contenedor, igual que antes — es para el caso contrario, cuando se quiere que la tabla NO se estire a todo el ancho disponible. No afecta el ancho del contenedor/wrapper, que sigue siendo 100%. No confundir con `col.width` (ancho de una columna puntual, dentro de `columns`). |
| `scrollFooter` | `boolean` | `false` | Pie `position: sticky` al borde inferior de la pantalla con ◀, slider y ▶ para desplazar la tabla sin bajar hasta su final. Solo aparece si la tabla es más ancha que su contenedor y reemplaza la barra horizontal propia. Ningún ancestro entre la tabla y el scroll de la página debe tener `overflow: hidden/auto` (usar `overflow: clip`). |
| `scrollFooterBgColor`, `scrollFooterBorderColor` | `string` | `surfaceColor`, `borderColor` | Fondo y borde del pie. |
| `scrollControlsColor` | `string` | `'#7c9cff'` (slider) / color por defecto de `Button` | Color de los botones ◀ ▶ y del slider. |
| `scrollLeftLabel`, `scrollRightLabel`, `scrollSliderLabel` | `string` | `'Desplazar tabla a la izquierda'`, `'Desplazar tabla a la derecha'`, `'Posición horizontal de la tabla'` | Textos (tooltips / `aria-label`) del pie. |

**Filtro por columna (`col.filter`):** misma API que en `TableA` — ver esa sección para el detalle de `options`/`value`/`onChange`/`tooltip`. La tabla solo cicla el valor y muestra el ícono; el filtrado real de `data` lo hace el consumidor.

**Ejemplos:**
```jsx
<TableB
  columns={columns}
  data={data}
  rowKey="id"
  expandable={{
    rowExpandable: () => true,
    expandedRowRender: (row) => <div>Detalles adicionales para {row.name}</div>,
  }}
/>

<TableB columns={columns} data={[]} error="Error al cargar la información" />

// Con filtro por columna
function PetsTable() {
  const [statusFilter, setStatusFilter] = useState('');

  const columns = [
    { key: 'name', label: 'Nombre' },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      badgeType: (row) => (row.status === 'Activo' ? 'success' : 'warning'),
      filter: {
        options: [
          { value: '', label: 'Todos' },
          { value: 'Activo', label: 'Activo' },
          { value: 'Inactivo', label: 'Inactivo' },
        ],
        value: statusFilter,
        onChange: setStatusFilter,
      },
    },
  ];

  const filteredData = statusFilter ? pets.filter((p) => p.status === statusFilter) : pets;

  return <TableB columns={columns} data={filteredData} rowKey="id" />;
}
```

> **Confirmado:** `TableB` usa una forma de columna DISTINTA a `TableA`: `{ key, label, type, badgeType(row), actions }` en vez de `{ header, accessor, render }`.

### Swich

Componente interruptor (toggle switch) interactivo con animación de onda (ripple), tooltip de estado y opciones visuales para mostrar íconos en el thumb (redondito blanco) o etiquetas de texto en el espacio libre del track.

**Import:**
```jsx
import Switch from 'screens/components/Swich'; // o import { Swich } from 'anteriority-ui'
```

**Uso básico:**
```jsx
const [enabled, setEnabled] = useState(false);

<Switch value={enabled} onChange={setEnabled} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `boolean` | `false` | Estado actual del interruptor (`true` = activo / habilitado, `false` = inactivo). |
| `onChange` | `function(boolean)` | — | Callback invocado al alternar el estado con el nuevo valor booleano. |
| `disabled` | `boolean` | `false` | Deshabilita la interacción del switch. |
| `activeColor` | `string` | `'#088d4f'` | Color de fondo del switch cuando está activo. |
| `inactiveColor` | `string` | `'#919191'` | Color de fondo del switch cuando está inactivo. |
| `thumbColor` | `string` | `'#ffffff'` | Color del círculo deslizante (thumb / redondito blanco). |
| `variant` | `'default'` \| `'icons'` \| `'labels'` \| `'both'` | `'default'` | Variante visual: `'icons'` muestra check/X en el thumb; `'labels'` muestra SI/NO en la parte libre del track; `'both'` activa ambos. |
| `showIcons` / `icons` | `boolean` | `false` | Muestra un ícono de check cuando está en `true` y una X cuando está en `false` dentro del círculo blanco (thumb). |
| `showLabels` / `labels` | `boolean` | `false` | Muestra texto descriptivo en la parte que queda libre del track (por defecto "SI" cuando está activo y "NO" cuando está inactivo). |
| `yesText` | `string` | `'SI'` | Texto para el estado activo cuando `showLabels` está habilitado. |
| `noText` | `string` | `'NO'` | Texto para el estado inactivo cuando `showLabels` está habilitado. |
| `iconActiveColor` | `string` | `activeColor` | Color del ícono de check dentro del thumb. |
| `iconInactiveColor` | `string` | `inactiveColor` | Color del ícono de X dentro del thumb. |
| `labelActiveColor` | `string` | `'#ffffff'` | Color del texto "SI" en el track. |
| `labelInactiveColor` | `string` | `'#ffffff'` | Color del texto "NO" en el track. |
| `showTooltip` | `boolean` | `true` | Habilita o deshabilita el tooltip flotante de estado. Pasar `false` para no mostrar tooltip. |
| `tooltip` | `boolean` \| `string` \| `{ enabled?, disabled? }` | — | Configura el tooltip. Si es `false`, oculta el tooltip; si es un `string`, muestra ese texto fijo; si es un objeto, permite personalizar los textos según el estado. |
| `className` | `string` | `''` | Clase CSS adicional en el elemento `<button>`. |
| `style` | `object` | `{}` | Estilos inline adicionales. |

**Ejemplos:**
```jsx
// Switch con Check / X en el redondito blanco (thumb)
<Switch value={value} onChange={setValue} showIcons />

// Switch con texto SI / NO en la parte que queda libre (track)
<Switch value={value} onChange={setValue} showLabels />

// Switch con ambos
<Switch value={value} onChange={setValue} variant="both" />

// Switch sin tooltip
<Switch value={value} onChange={setValue} showTooltip={false} />

// Switch con tooltip personalizado
<Switch value={value} onChange={setValue} tooltip="Activar notificaciones" />
```

---

### Text

Bloque de texto genérico (título o párrafo) para usar dentro de layouts como `Container` o `Frame` cuando se necesita meter texto suelto sin armar un componente nuevo. La `variant` define tanto el tag HTML semántico (`h1`/`h2`/`h3`/`p`/`span`) como su tamaño de fuente por defecto. Incluye además un set de animaciones de entrada/salida opcionales (`animate`) para títulos o textos destacados.

**Import:**
```jsx
import Text from '../Text'; // export default (index.jsx)
```

**Uso básico:**
```jsx
<Text variant="h2">Título de la sección</Text>
<Text>Texto de párrafo normal.</Text>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | node | — | Contenido del texto. Solo se usa como texto plano (string) en las animaciones `typing` y `letter-fade-in`/`letter-fade-out`; con cualquier otro `animate` (o sin animación) puede ser cualquier `node`. |
| `variant` | `'h1' \| 'h2' \| 'h3' \| 'body' \| 'caption'` | `'body'` | Define el tag HTML (`h1`/`h2`/`h3`/`p`/`span`) y el tamaño/peso de fuente |
| `color` | string | — | Color del texto (`--text-color`; default `#0f172a`, `#64748b` en `caption`) |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alineación del texto (`text-align`) |
| `className` | string | `''` | Clase CSS adicional |
| `style` | object | — | Estilos inline adicionales, mergeados con los internos |
| `animate` | `'fade-in' \| 'fade-out' \| 'typing' \| 'letter-fade-in' \| 'letter-fade-out' \| 'rise-and-fade'` | — | Animación aplicada al montar. Sin esta prop, el texto se muestra estático. |
| `duration` | number (ms) | `800` | Duración total de la animación para `fade-in`, `fade-out`, `letter-fade-in` y `letter-fade-out`. En las letter-fade, se reparte entre todas las letras (cada una anima con un delay escalonado). |
| `typingSpeed` | number (ms) | `50` | Milisegundos entre cada letra en `animate="typing"`. |
| `riseDuration` | number (ms) | `1000` | Duración de la animación en `animate="rise-and-fade"`. |
| `riseDelay` | number (ms) | `400` | Espera antes de que arranque `rise-and-fade` (útil para encadenar varios `Text` en secuencia). |

**Ejemplos:**
```jsx
<Text variant="h1">Título principal</Text>
<Text variant="h3" color="#2563eb" align="center">Subtítulo centrado</Text>
<Text variant="caption">Nota aclaratoria</Text>

{/* Aparece letra por letra como si se tipeara */}
<Text animate="typing" typingSpeed={30}>Escribiendo texto...</Text>

{/* Fade-in del bloque completo */}
<Text variant="h1" animate="fade-in" duration={1000} color="#0d52f8">
  Apareciendo suavemente
</Text>

{/* Cada letra aparece/desaparece con su propio delay escalonado */}
<Text animate="letter-fade-in" duration={1500}>Texto letra por letra...</Text>
<Text animate="letter-fade-out" duration={1500}>Desaparece de atrás hacia adelante...</Text>

{/* Sube y se desvanece tras un delay — útil para intros/splash */}
<Text
  variant="h1"
  animate="rise-and-fade"
  riseDelay={500}
  riseDuration={1200}
  color="#8b5cf6"
  align="center"
>
  Palabra que sube y desaparece
</Text>
```

**Notas:** `fade-in`/`fade-out`/`rise-and-fade` animan el bloque completo (el `Tag` resultante); `letter-fade-in`/`letter-fade-out` envuelven cada carácter en su propio `span` con `animationDelay` escalonado (de izquierda a derecha para `-in`, de derecha a izquierda para `-out`) — por eso solo soportan `children` como string, cualquier otro nodo se ignora en el cálculo de letras. `typing` reconstruye el string letra por letra con `setInterval` y muestra un cursor parpadeante (`border-right`) mientras dura la animación. Ninguna animación hace loop ni se revierte sola: son de una sola pasada al montar (controlar su repetición vía `key` desde el padre, como hace `KeyboardShortcut`/`ModalTooltip` en otros componentes del repo para resetear animaciones).

---

### ToggleCard

Tarjeta informativa/aviso con icono, título y descripción (con soporte de texto resaltado tipo `**negrita**`), acción custom y botón de cierre opcional.

**Import:**
```jsx
import ToggleCard from 'screens/components/ToggleCard';
```

**Uso básico:**
```jsx
<ToggleCard title="Nueva funcionalidad disponible" description="Ahora puedes **destacar** texto." icon={Info} />
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string`\|`node` | — | Título de la tarjeta (si es `string`, se procesa con `formatHighlightedText` para resaltar `**texto**`). |
| `description` | `string`\|`node` | — | Descripción de la tarjeta (mismo procesamiento de resaltado si es `string`). |
| `icon` | `component` | — | Icono mostrado junto al título. |
| `action` | `node` | — | Elemento de acción custom (p. ej. un botón) mostrado en la sección de acciones. |
| `children` | `node` | — | Contenido adicional renderizado debajo del bloque principal. |
| `onClose` | `function` | — | Si se define, muestra un botón de cierre. |
| `closeText` | `string` | `"Cerrar"` | Texto del botón de cierre. |
| `variant` | `"default"` \| `"floating"` | `"default"` | `"floating"` aplica un estilo flotante/elevado. |
| `onClick` | `function` | — | Si se define, hace clicable toda la tarjeta. |
| `backgroundColor` | `string` | — | Color de fondo custom. |
| `borderColor` | `string` | — | Color de borde custom. |
| `titleColor` | `string` | — | Color del título. |
| `descriptionColor` | `string` | — | Color de la descripción. |
| `iconColor` | `string` | — | Color del icono. |

**Ejemplos:**
```jsx
<ToggleCard
  title="Acción requerida"
  description="Revisa los cambios pendientes antes de continuar."
  icon={Info}
  action={<button type="button">Revisar</button>}
  backgroundColor="#fef3c7"
  borderColor="#f59e0b"
  onClick={() => console.log('card clicked')}
/>
```

**Notas:** Es usado internamente por `PasswordResetPanel` (variant `"floating"`) para mostrar avisos flotantes de estado.

---

### TopBar

Barra superior de navegación de 3 secciones (izquierda / centro / derecha), estilo "top nav" de apps tipo GitHub: logo + breadcrumb a la izquierda, buscador centrado con atajo de teclado, y botones de acción (casi cuadrados, con borde fino y fondo gris claro) + separador vertical + usuario con menú desplegable a la derecha. Reutiliza `Breadcrumbs` para la navegación jerárquica y `Profile/Avatar` para el avatar de usuario.

**Import:**
```jsx
import TopBar from '../TopBar/index'; // export default
```

**Uso básico:**
```jsx
<TopBar
  logo={<Logo />}
  breadcrumbItems={[{ label: 'Mi Empresa', onClick: goHome }, { label: 'Proyecto' }]}
  searchProps={{ value, onChange: (e) => setValue(e.target.value) }}
  actions={[{ icon: Bell, tooltip: 'Notificaciones', badge: 3, onClick: openNotifications }]}
  user={{ name: 'Jane Doe', email: 'jane.doe@example.com' }}
  userMenuItems={[{ label: 'Cerrar sesión', icon: LogOut, variant: 'danger', onClick: logout }]}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `logo` | node | — | Contenido del logo (ej. un `<svg>` o `<img>`), renderizado en un botón si se pasa `onLogoClick`. |
| `onLogoClick` | `function()` | — | Si se define, el logo se vuelve clickeable. |
| `breadcrumbItems` | array de `{ label, icon?, onClick? }` | — | Si se define y no está vacío, renderiza `Breadcrumbs` con estos items (mismo formato que el componente `Breadcrumbs`). Tiene prioridad sobre `title`. |
| `title` | string | — | Título simple mostrado cuando no hay `breadcrumbItems`. |
| `searchProps` | `{ value, onChange, placeholder?, shortcut?, onFocus?, onBlur? }` | — | Si se define, renderiza un input de búsqueda estilizado con ícono y badge de atajo de teclado a la derecha (ej. `/`). `shortcut: false` oculta el badge. Tiene prioridad sobre `centerContent`. |
| `centerContent` | node | — | Contenido libre para la sección central (alternativa a `searchProps` para casos custom). |
| `actions` | array de `{ key?, icon, tooltip?, badge?, onClick?, disabled? }` | `[]` | Botones de acción a la derecha (casi cuadrados — `border-radius: 6px`, no círculos). `icon` es un componente (ej. de `lucide-react`); `tooltip` envuelve el botón en `ModalTooltip`. `badge` es flexible: `true` muestra un punto de notificación; cualquier otro valor truthy (número o string, ej. `3`, `'Nuevo'`) se muestra como texto dentro de un pill superpuesto en la esquina; `undefined`/`false`/`null` no muestra nada. Pensado para números cortos (1-2 dígitos) o texto corto — un string largo se desborda del pill. |
| `user` | `{ name?, email?, avatarUrl? }` | — | Si se define, muestra el avatar de usuario (`Profile/Avatar`) con menú desplegable al hacer click. |
| `userMenuItems` | array de `{ id?, label, icon?, onClick?, variant? }` | `[]` | Items del menú de usuario (variant `'danger'` los resalta en rojo). |
| `className` | string | `''` | Clase adicional en el `<header>` raíz. |
| `showDivider` | boolean | `true` | Si es `true` y hay tanto `actions` (no vacío) como `user`, muestra una línea divisora vertical entre el grupo de acciones y el avatar. |
| `bgColor` | string | — | Color de fondo de la barra (`--topbar-bg`). |
| `textColor` | string | — | Color del texto/título y del crumb activo (`--topbar-text`, también se usa como `currentColor` de `Breadcrumbs` si no se pasa `breadcrumbCurrentColor`). |
| `borderColor` | string | — | Color del borde inferior (`--topbar-border`). |
| `iconColor` | string | — | Color de los íconos de acción y del buscador (`--topbar-icon`). |
| `accentColor` | string | — | Color de foco del buscador; también default del fondo del badge si no se pasa `badgeBgColor` (`--topbar-accent`). |
| `searchBgColor` | string | — | Color de fondo del input de búsqueda (`--topbar-search-bg`). Ajustar junto con `bgColor` en temas oscuros — sin esta prop, el buscador mantiene su fondo claro default. |
| `actionBgColor` | string | — | Color de fondo de los botones de acción (`--topbar-action-bg`). |
| `actionBorderColor` | string | — | Color de borde de los botones de acción (`--topbar-action-border`). Pasar `"transparent"` para quitar visualmente el borde (sigue ocupando 1px de layout). |
| `dividerColor` | string | — | Color de la línea divisora entre acciones y usuario (`--topbar-divider`). |
| `badgeBgColor` | string | — | Color de fondo del badge (punto o pill numérico) (`--topbar-badge-bg`). Si no se pasa, cae a `accentColor` y luego al rojo default. |
| `badgeTextColor` | string | — | Color del texto dentro del badge numérico/texto (`--topbar-badge-text`). |
| `breadcrumbLinkColor` | string | `'#64748b'` | Color de los crumbs clicables (pasa a `Breadcrumbs.linkColor`). El default de `Breadcrumbs` está pensado para fondo oscuro, por eso `TopBar` pisa este valor con uno legible en su tema claro default. |
| `breadcrumbCurrentColor` | string | `'#0f172a'` | Color del crumb activo cuando no se pasa `textColor` (pasa a `Breadcrumbs.currentColor`). |
| `loading` | boolean | `false` | Activa el estado de carga utilizando el componente `Skeleton` para logo, breadcrumbs/título, buscador y acciones, conservando la estructura y layout sin saltos visuales. |
| `isLoading` | boolean | `false` | Alias de conveniencia para `loading`. |
| `skeletonActionsCount` | number | `3` (o `actions.length`) | Cantidad de botones de acción a mostrar como skeleton durante el estado de carga. |
| `actionHover` | boolean | `true` | Controla si los botones de acción tienen efecto hover. Pasar `false` para quitar/desactivar el hover por completo. |
| `actionHoverBgColor` | string | `'#e2e8f0'` | Color de fondo en hover para los botones de acción (`--topbar-action-hover-bg`). |
| `actionHoverTextColor` | string | `'#0f172a'` | Color de texto/icono en hover para los botones de acción (`--topbar-action-hover-text`). |
| `actionHoverBorderColor` | string | `'#e2e8f0'` | Color del borde en hover para los botones de acción (`--topbar-action-hover-border`). |
| `actionRippleColor` | string | `'rgba(15, 23, 42, 0.28)'` | Color de la animación de onda (ripple/olas) al hacer click en los botones de acción (`--topbar-action-ripple`). |



**Ejemplos:**
```jsx
// Con título simple en vez de breadcrumb
<TopBar logo={<Logo />} title="Panel de administración" actions={actions} user={user} />

// Tema oscuro estilo GitHub, logrado solo con props de color
<TopBar
  logo={<Logo />}
  breadcrumbItems={breadcrumbItems}
  searchProps={searchProps}
  actions={actions}
  user={user}
  bgColor="#0d1117"
  textColor="#e6edf3"
  borderColor="#30363d"
  iconColor="#9198a1"
  accentColor="#2f81f7"
  searchBgColor="#161b22"
  breadcrumbLinkColor="#9198a1"
/>
```

**Notas:** El menú de usuario se renderiza vía `createPortal` a `document.body` (mismo patrón que el menú de usuario de `Sidebar`), posicionado contra el botón del avatar. `actions` son completamente genéricas — no asume ningún set fijo de íconos (notificaciones, mensajes, ayuda, etc. quedan a elección del consumidor). El atajo de teclado Ctrl/Cmd+K para abrir el `CommandPalette` (`useCommandPaletteShortcut` en `utils.js`) usa el hook genérico `useKeyboardShortcut` (`common/hooks/useKeyboardShortcut.js`), reutilizable para registrar cualquier otro atajo global (`{ key, ctrlOrMeta, shift, alt, enabled, onTrigger }`) sin reimplementar el listener de teclado a mano en cada componente nuevo.

**Responsive:** `leftSection` (logo + breadcrumb/título) se encoge primero y trunca con ellipsis; `rightSection` (acciones + divisor + avatar + `ctaButton`) nunca se encoge, para que los botones nunca queden apretados ni se superpongan entre sí. Por debajo de 1023px el buscador central se angosta, por debajo de 767px se oculta por completo (el consumidor puede ofrecer una lupa en `actions` para ese breakpoint) y el header pasa a `flex-wrap` como red de seguridad si aun así no entra todo en una fila; por debajo de 479px se reducen aún más los paddings de los botones de acción y el ancho máximo de breadcrumb/título.

---

### UserEditPopover

Popover (basado en MUI `Popover`) para editar el nombre de usuario, con guardado contra la API real.

**Import:**
```jsx
import UserEditPopover from 'screens/components/UserEditPopover';
```

**Uso básico:**
```jsx
<UserEditPopover
  open={open}
  anchorEl={anchorEl}
  onClose={() => setOpen(false)}
  currentName="Ana Gomez"
  onSuccess={(name) => setUsername(name)}
/>
```

**Props:**

| Prop          | Tipo                | Default | Descripción                                                                                                                          |
| ---------------| ---------------------| ---------| --------------------------------------------------------------------------------------------------------------------------------------|
| `open`        | `boolean`           | —       | Controla la visibilidad del popover.                                                                                                 |
| `anchorEl`    | `HTMLElement`       | —       | Nodo DOM al que se ancla el popover (requerido por MUI `Popover`).                                                                   |
| `onClose`     | `function`          | —       | Callback al cerrar el popover (también se llama tras guardar).                                                                       |
| `currentName` | `string`            | —       | Nombre actual, usado para precargar el input al abrir.                                                                               |
| `onSuccess`   | `function(newName)` | —       | Callback invocado con el nuevo nombre tras un guardado exitoso (o incluso si la llamada a la API falla, como fallback para pruebas). |
| `bgColor`     | `string`            | —       | Color de fondo del popover (`--usereditpopover-bg`).                                                                                 |
| `saveColor`   | `string`            | —       | Color del botón guardar (`--usereditpopover-save`).                                                                                  |
| `cancelColor` | `string`            | —       | Color del botón cancelar (`--usereditpopover-cancel`).                                                                               |

**Ejemplos:**
```jsx
<UserEditPopover open={true} anchorEl={anchorEl} currentName="" onClose={() => {}} onSuccess={(name) => console.log('saved name', name)} />
```

**Notas:** Al guardar, llama a `updateUserName` de `features/user-profile/api.js` y a `getUserId` de `common/storage/LocalStorage.js`. Para que la petición real funcione en una app consumidora es necesario tener configurado `configureApiClient` (`common/api/client.js`); si la llamada falla, el componente igual invoca `onSuccess` con el nombre local como fallback para pruebas.

---

### NotificationsPanel

Panel de notificaciones y mensajes con soporte para scroll interno, descartado de ítems, acciones por ítem, estados de carga (Skeleton y Spinner) y un estado vacío (*empty state*) espacioso y personalizable. Si el título o el mensaje hacen referencia a mensajes/correo, detecta el contexto automáticamente y muestra los íconos de sobre correspondientes.

**Import:**
```jsx
import NotificationsPanel from 'screens/components/NotificationsPanel';
// o desde el barrel:
import { NotificationsPanel } from 'anteriority-ui';
```

**Uso básico (con notificaciones):**
```jsx
<NotificationsPanel
  title="Notificaciones"
  notifications={[
    {
      id: 1,
      title: 'Nueva cita agendada',
      message: 'Se agendó una cita para mañana a las 15:00.',
      timestamp: 'Hace 5 minutos',
    },
  ]}
  onDismiss={(id) => handleDismiss(id)}
/>
```

**Uso estado vacío (Mensajes / Screenshot):**
```jsx
<NotificationsPanel
  title="Mensajes"
  emptyMessage="No tienes mensajes."
  notifications={[]}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | `'Notificaciones'` | Título del panel. Si contiene palabras como "mensaje", "mail" o "chat", adapta los íconos por defecto a correo. |
| `icon` | `ReactNode` | `<Bell size={20} />` \| `<Mail size={20} />` | Ícono del encabezado. Si no se pasa, se deduce según el contexto del título. |
| `notifications` | `Array<NotificationItem>` | `[]` | Lista de notificaciones a mostrar. Si está vacía, muestra el contenedor de estado vacío. |
| `onDismiss` | `function(id)` | — | Callback invocado cuando el usuario descarta una notificación. |
| `emptyTitle` | `string` | — | Título opcional para el estado vacío (ej. `"Bandeja limpia"`). |
| `emptyMessage` | `string` | `'No tenés notificaciones nuevas.'` | Mensaje descriptivo del estado vacío. |
| `emptyIcon` | `ReactNode \| ReactComponent \| boolean` | Auto (`MailX` o `BellOff`) | Ícono central del estado vacío. Pasar `false` para ocultarlo. |
| `emptyIconSize` | `number` | `46` | Tamaño en píxeles del ícono del estado vacío. |
| `emptyIconColor` | `string` | `'#94a3b8'` | Color del ícono del estado vacío. |
| `emptyTextColor` | `string` | `'#64748b'` | Color del texto del estado vacío. |
| `emptyMinHeight` | `number \| string` | `200` | Altura mínima del contenedor de estado vacío en píxeles. |
| `maxHeight` | `number \| string` | `380` | Altura máxima del contenido con scroll interno. |
| `dismissLabel` | `string` | `'Quitar notificación'` | Tooltip/aria-label para el botón de descartar. |
| `isModal` | `boolean` | `false` | Renderiza el panel dentro de un modal. |
| `onClose` | `function` | — | Callback al cerrar el panel cuando se usa en modo modal. |
| `isLoading` | `boolean` | `false` | Muestra estado de carga. |
| `loadingType` | `'skeleton' \| 'spinner'` | `'skeleton'` | Tipo de indicador de carga. |
| `loadingVariant` | `string` | — | Variante del spinner (`'bars'`, `'dots'`, etc.). |
| `skeletonCount` | `number` | `3` | Cantidad de skeletons a renderizar. |
| `bgColor` | `string` | — | Color de fondo del panel (`--frame-bg`). |
| `iconColor` | `string` | — | Color del ícono del encabezado (`--frame-icon-color`). |
| `itemBgColor` | `string` | — | Fondo por defecto de las tarjetas de notificación. |
| `itemBorderColor` | `string` | — | Borde por defecto de las tarjetas de notificación. |
| `itemIconColor` | `string` | — | Color del ícono por defecto de las tarjetas. |
| `textColor` | `string` | — | Color de texto principal. |
