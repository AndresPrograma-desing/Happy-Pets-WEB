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
| `active` | boolean | `false` | Aplica un fondo levemente oscurecido (estado activo/seleccionado) |
| `fullWidth` | boolean | `false` | Ancho completo del contenedor |
| `icon` | componente (lucide-react) | — | Ícono inicial (`startIcon`) o único contenido si `circle` |
| `onClick` | function | — | Handler de click (no se dispara si está deshabilitado/loading) |
| `disabled` | boolean | `false` | Deshabilita el botón |
| `type` | string | `'button'` | Tipo HTML del botón (`'submit'`, etc.) |
| `className` | string | `''` | Clase CSS adicional |
| `color` | string (valor CSS o de `COLORS`) | — | Color custom o uno de los colores estándar MUI/`COLORS` |
| `border` | string | — | Color de borde (fuerza variante `outlined`) |
| `borderColor` | string | — | Igual que `border` |
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
```

**Notas:** Es un `React.forwardRef`. Expone `Button.VARIANTS`, `Button.SIZES` y `Button.COLORS` como propiedades estáticas además de los named exports.

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

Variante de selector de fecha equivalente a `CalendarComponent`, pero el calendario se renderiza dentro de un `Frame` (modal reutilizable) y usa los `Button`/`Selector` del sistema de diseño en vez de controles nativos.

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
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | string | — | Label del `TextField` |
| `name` | string | — | Nombre usado en el evento sintético `onChange` |
| `value` | string (`YYYY-MM-DD`) \| Date | — | Fecha seleccionada (modo simple). Ignorado si `range` es `true`. |
| `onChange` | function | — | Recibe un evento `{ target: { name, value, type } }`. `type` es `'date'` en modo simple o `'date-range'` en modo rango. |
| `required` | boolean | `false` | Marca el campo como requerido |
| `disabled` | boolean | `false` | Deshabilita la apertura del calendario |
| `range` | boolean | `false` | Activa selección de rango. `value`/`onChange` pasan a usar `{ start, end }` (strings `YYYY-MM-DD`) en vez de una fecha suelta. |
| `inputSx` | object | — | `sx` custom pasado al `TextField` interno |
| `selectedColor` | string | — | Color del día seleccionado (y de los extremos/relleno del rango) (`--cp-selected`) |
| `accentColor` | string | — | Color de acento / botón "Hoy" (`--cp-accent`) |

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
```

**Notas:** El calendario se abre dentro de `Frame` (`isModal`), a diferencia de `CalendarComponent` que usa su propio backdrop; ambos componentes son intercambiables en su API pero difieren en la implementación visual del modal.

En modo `range`, la selección soporta dos gestos, intercambiables: (1) click en el día de inicio → click en el día de fin (el panel queda abierto entre medio, permitiendo navegar de mes con las flechas sin perder el progreso), o (2) mousedown sobre el día de inicio + arrastrar + soltar sobre el día de fin (confirma al soltar, sin necesidad de un segundo click). Si el día de fin es anterior al de inicio, se reordenan automáticamente. Mientras se arrastra/pasa el mouse se previsualiza el rango con un resaltado tenue antes de confirmar.

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
```

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
| `description` | string | — | Texto descriptivo, ubicado según `descriptionPosition` |
| `descriptionPosition` | `'top' \| 'bottom'` | `'top'` | Dónde se muestra la descripción |
| `children` | node | — | Contenido principal del panel |
| `width` | string | `'400px'` | Ancho máximo del panel |
| `showActions` | boolean | `false` | Muestra footer con botones cancelar/confirmar |
| `onConfirm` | function | — | Handler del botón confirmar |
| `confirmText` | string | `'Confirmar'` | Texto del botón confirmar |
| `cancelText` | string | `'Cancelar'` | Texto del botón cancelar |
| `formId` | string | — | Si se define, el botón confirmar es `type="submit"` con `form={formId}` |
| `loading` | boolean | `false` | Estado de carga de los botones del footer |
| `success` | boolean \| undefined | `undefined` | Pasado al `Button` de confirmar |
| `className` | string | `''` | Clase adicional en el panel |
| `showCountdown` | boolean | `false` | Muestra una `CountdownBar` bajo el header |
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
```

**Notas:** Se renderiza con `createPortal` en `document.body`. Si hay `formData` con valores (o `hasUnsavedChanges` es `true`), el primer click fuera del panel o en el botón cerrar solo muestra un aviso (`closeConfirmMessage`); un segundo click sí cierra. Compone `Button` y `CountdownBar` internos del sistema.

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

### Loading

Indicador de carga con varias variantes visuales (spinner, barras, rebote, caja) y texto opcional, incluyendo rotación automática entre varias frases.

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
| variant | `'default'` \| `'bars'` \| `'bounce'` \| `'box'` | `'default'` | Estilo visual del loader (`'default'` es el spinner circular). |
| className | string | `''` | Clase(s) CSS adicionales. |
| color | string | — | Color personalizado del loader (`--loading-color`). |

**Ejemplos:**
```jsx
<Loading phrases={['Cargando datos...', 'Procesando información...', 'Casi listo...']} />
```
```jsx
<Loading text="Un momento..." size="large" variant="bars" />
```

**Notas:** Es usado internamente por `Frame` (prop `isLoading`) con `size="giant"`.

---

### MarkdownContent

Renderiza una cadena markdown como HTML, con soporte GFM (tablas, listas de tareas, etc.) vía `react-markdown` + `remark-gfm`. Los bloques de código (` ``` `) y los encabezados (`#` a `######`) muestran, al pasar el mouse (o al enfocarlos con teclado), un botón con ícono de copiar en la esquina que copia respectivamente el código completo o el texto del título al portapapeles (con feedback visual de "copiado" por ~1.6s). El color de texto es `inherit` por default (hereda del contenedor donde se use), así que se puede soltar directamente dentro de cualquier componente (`Frame`, `DrawPanel`, `Callout`, burbujas de chat, etc.) sin quedar ilegible por un color fijo; usar `style`/`linkColor` para un color puntual.

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

---

### MarkdownEditor

Editor de texto markdown con barra de herramientas (negrita, cursiva, título, encabezados, listas, cita, código, enlace, tabla), atajos de teclado, modos Editor/Dividido/Vista previa y altura ajustable con arrastre. El botón de título inserta un encabezado `# ` y el de código un bloque ` ``` `; ambos, al previsualizarse (con `MarkdownContent`), muestran un botón de copiar rápido (ver [MarkdownContent](#markdowncontent)).

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
| labels | object | `{}` | Textos personalizables: `editorTab`, `splitTab`, `previewTab`, tooltips de cada botón (incluye `titleTooltip` para el botón de título), textos por defecto al insertar formato, encabezados de la tabla de ejemplo. |
| activeColor | string | — | Color de acento del modo/pestaña activa (`--markdown-editor-active`). |

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

**Notas:** Es un componente controlado (`value`/`onChange` obligatorios); el modo de vista es estado interno. Soporta atajos `Ctrl+B`, `Ctrl+I`, `Ctrl+K` y continuación automática de listas al presionar Enter. Usa `MarkdownContent` para la vista previa.

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
| ...props | any | — | Cualquier otra prop de `TextField` de Material-UI. |

**Ejemplos:**
```jsx
<MultilinePlaceholder label="Notas" helperText="Opcional, máximo 500 caracteres." rows={3} value={value} onChange={onChange} />
```
```jsx
<MultilinePlaceholder label="Comentarios" error="Este campo es obligatorio" rows={3} value={value} onChange={onChange} />
```

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

Campo de búsqueda basado en `Autocomplete` de Material-UI, con estado de carga y modo `freeSolo` (texto libre sin opciones).

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
| ...props | any | — | Cualquier otra prop de `Autocomplete` de Material-UI. |

**Ejemplos:**
```jsx
<Search options={[]} loading={true} label="Buscar usuario" value={value} onChange={setValue} inputValue={inputValue} onInputChange={setInputValue} />
```
```jsx
<Search freeSolo options={[]} label="Buscar" placeholder="Escribe texto libre..." value={value} onChange={setValue} />
```

**Notas:** A diferencia del `Autocomplete` nativo de MUI, `onChange` y `onInputChange` reciben directamente el valor (no `(event, value)`).

---

### Selector

`Autocomplete` de Material-UI configurado como un select de opciones fijas, con matching flexible de valores (por `value` exacto o normalizado).

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
| style | object | `{}` | Estilos adicionales (`sx`) del contenedor. |
| className | string | `''` | Clase CSS adicional. |
| fullWidth | boolean | `true` | Si ocupa el 100% del ancho (si `false`, ancho fijo de 300px). |
| placeholder | string | — | Placeholder del campo. |
| required | boolean | — | Muestra un indicador `**` junto a la etiqueta. |
| requiredColor | string | `'red'` | Color del indicador de requerido. |
| disableClearable | boolean | `false` | Si es `true`, oculta el botón de limpiar selección. |
| hideScrollbar | boolean | `true` | Oculta la barra de scroll de la lista desplegable (el scroll con rueda/teclado/touch sigue funcionando). |

**Ejemplos:**
```jsx
<Selector label="Especie" options={options} required value={value} onChange={onChange} />
```
```jsx
<Selector label="Especie" options={options} value="gato" onChange={onChange} />
```

**Notas:** El matching de `value` contra `options` ignora mayúsculas, espacios, guiones y guiones bajos si no hay coincidencia exacta por `value`.

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
```

**Notas:** Persiste el estado colapsado en `localStorage` bajo la clave `sidebar_collapsed`. Los subitems no soportan drag & drop (`onReorderItems`), menú contextual (`onItemEdit`/`onItemDelete`/`onItemPin`/`onItemCollaborators`) ni colapsado individual persistido — solo navegación simple vía `onSelect`. Cuando el sidebar está colapsado (`isCollapsed`), los grupos con `subItems` se muestran colapsados y sin chevron (igual que cualquier item simple, con tooltip); hay que expandir el sidebar para ver/navegar los subitems. `onSearch`/`filterMenuGroups` matchea por `label` del item padre o de cualquiera de sus `subItems`, pero si matchea, se muestra el item completo con **todos** sus subitems (no solo el que matcheó).

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
```

> **Importante:** `TableA` usa columnas con forma `{ header, accessor, align, width, render, filter }` y filas como objetos planos accedidos por `accessor`. Ver `TableB` abajo — su forma es distinta, no son intercambiables.

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

**Notas:** El menú de usuario se renderiza vía `createPortal` a `document.body` (mismo patrón que el menú de usuario de `Sidebar`), posicionado contra el botón del avatar. `actions` son completamente genéricas — no asume ningún set fijo de íconos (notificaciones, mensajes, ayuda, etc. quedan a elección del consumidor).

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