# Documentación de Estructura y Arquitectura del Frontend
## Happy Pets Vet System WEB

Este documento proporciona una guía detallada del frontend del sistema de gestión veterinaria **Happy Pets**. Explica el propósito de la aplicación, su arquitectura, estructura de carpetas, lenguajes y tecnologías utilizadas, así como la lógica centralizada y las reglas de contribución del proyecto.

---

## 1. ¿Qué hace este Frontend? (Propósito)

El frontend de **Happy Pets Vet System WEB** es una aplicación de tipo Panel/Dashboard orientada a digitalizar y centralizar el flujo de trabajo clínico-administrativo de una clínica veterinaria. El sistema implementa un control de acceso basado en tres roles principales:

1. **Administrador:**
   - Panel de administración.
   - Creación y gestión de usuarios (habilitar, deshabilitar, eliminar).
   - Visualización de métricas financieras (dashboard de ingresos, facturas pagadas, clientes).
   - Gestión de inventario de productos (ver stock, crear y eliminar productos).
   - Configuración global del sistema.

2. **Doctor:**
   - Visualización y agendamiento de citas médicas.
   - Registro de consultas clínicas detalladas (signos vitales, diagnóstico, tratamiento, recetas, observaciones, productos aplicados).
   - Disminución automática de stock de insumos utilizados en consulta.
   - Consulta de recetas e historial médico de pacientes.
   - Mensajería interna.

3. **Secretaria:**
   - Administración de la agenda de citas médicas.
   - Registro rápido de clientes y mascotas.
   - Generación de facturas basadas en citas completadas, descarga de recibos y marcado de pagos.
   - Generación de códigos QR asociados a facturas.
   - Mensajería interna.

4. **Portal de Clientes (Acceso Público/Autoservicio):**
   - Ubicado bajo la ruta `/portal-cliente`, permite a los dueños de mascotas consultar su información o estado sin tener un rol operativo en la clínica.

### Mecanismos de Tolerancia a Fallos y Conectividad:
- **Health Check Continuo:** El sistema evalúa periódicamente el estado de la conexión a internet y la salud de la API (`useHealthCheck`). Si detecta una interrupción, redirige temporalmente a los usuarios a una vista de espera (`/witing`). Al restablecerse la conexión, los devuelve a la vista en la que se encontraban.
- **Modo Simulado (Dummy Mode):** Para facilitar pruebas locales sin un backend activo, el cliente API puede configurarse en modo "Dummy" usando un archivo JSON de base de datos simulada (`src/dummy/db.json`).

---

## 2. Tecnologías y Lenguajes de Programación

El frontend está desarrollado bajo el ecosistema de JavaScript moderno y React:

- **Lenguajes:**
  - **JavaScript (ES6+):** Utilizado para toda la lógica de control, hooks, servicios y utilidades.
  - **JSX (React):** Lenguaje de plantilla para definir la estructura de la interfaz de usuario en combinación con JavaScript.
  - **HTML5:** Estructura del punto de entrada principal (`index.html`) y plantillas auxiliares.
  - **CSS3:** Estilos visuales optimizados mediante **CSS Modules** (evitando CSS en línea/hardcodeado).

- **Frameworks y Herramientas de Construcción:**
  - **React 19:** Utilizado para la renderización de la interfaz y control de estado reactivo.
  - **Vite 8:** Compilador y empaquetador ultrarrápido configurado para desarrollo y producción.
  - **Babel (Babel React Compiler):** Optimiza la renderización de React 19.
  - **ESLint 9:** Herramienta para asegurar la calidad y consistencia del código JavaScript.

- **Bibliotecas Clave (Dependencies):**
  - **React Router DOM:** Manejo de rutas del lado del cliente.
  - **React Hook Form:** Gestión eficiente de formularios complejos y validaciones.
  - **React Select:** Componentes avanzados de selección (por ejemplo, al elegir clientes o mascotas).
  - **Material UI (MUI) & Emotion:** Provee de soporte para algunos componentes visuales avanzados y estilos.
  - **Lucide React:** Set de íconos vectoriales modernos y consistentes.
  - **docx / docxtemplater / pizzip / xmldom:** Generación y descarga de documentos de facturas en formato Word y PDF desde el navegador.
  - **qrcode.react:** Generación dinámica de códigos QR para las facturas.
  - **@microsoft/signalr:** Cliente para la comunicación bidireccional en tiempo real mediante WebSockets (usado en notificaciones/mensajería si está habilitado).

---

## 3. Estructura de Directorios (Carpetas)

La estructura física del proyecto está organizada de la siguiente manera:

```text
├── .env                        # Configuración de variables de entorno (API Base URL, Health URL)
├── GEMINI.md                   # Reglas estrictas de desarrollo y arquitectura del proyecto
├── PortalClientes/             # Módulo independiente para el acceso web de clientes
├── README.md                   # Manual de usuario, instalación y flujos de negocio
├── Tests/                      # Playgrounds y componentes aislados para pruebas de diseño/lógica
├── public/                     # Archivos estáticos
│   └── Documentation/          # Páginas HTML y archivos PDF/DOCX de documentación técnica
├── server/                     # Backend Mock en Node.js/Express para pruebas de mensajería y login
├── src/                        # Código fuente del Frontend
│   ├── assets/                 # Recursos gráficos (imágenes, fuentes, audio, íconos)
│   ├── components/             # Componentes de UI y módulos funcionales
│   │   ├── screens/components/ # Componentes base comunes (Botones, Inputs, Cards, Tablas, etc.)
│   │   ├── auth/               # Formularios de inicio de sesión y recuperación
│   │   ├── CitasAdmin/         # Gestión de agendas de citas médicas
│   │   └── ...                 # Componentes específicos de cada funcionalidad
│   ├── config/                 # Configuraciones fijas del sistema (URLs, constantes del sistema)
│   ├── constants/              # Textos e identificadores sin harcodear (TEXT.js, constansts.js)
│   ├── context/                # Contextos y almacenamiento (Local Storage, preferencias)
│   ├── dummy/                  # Base de datos simulada en formato JSON para desarrollo offline
│   ├── features/               # Características lógicas auto-contenidas (ej. mensajería interna)
│   ├── hooks/                  # Hooks personalizados de React (Llamadas API, polling, salud, etc.)
│   ├── pages/                  # Vistas principales de enrutamiento agrupadas por rol operativo
│   │   ├── AdminSystem/        # Vistas exclusivas del rol Administrador
│   │   ├── DoctorSystem/       # Vistas exclusivas del rol Doctor
│   │   ├── SecretariSystem/    # Vistas exclusivas del rol Secretaria
│   │   └── ...                 # Páginas generales (Inicio, Espera, Citas)
│   ├── services/               # Clientes de servicios API y sockets
│   │   ├── api/                # Cliente unificado y storage de tokens (client.js, index.js, storage.js)
│   │   └── SignalR/            # Lógica para sincronización en tiempo real
│   ├── styles/                 # Estilos globales y variables de temas CSS
│   └── utils/                  # Funciones de utilidad (helpers, formateadores de moneda, errores)
├── vite.config.js              # Configuración de compilación y plugins de Vite
└── package.json                # Dependencias, metadatos y scripts del proyecto
```

---

## 4. Lógica de Funcionamiento Clave

### A. Gestión de Sesión y Rutas
- El estado de la sesión se almacena de forma persistente en `sessionStorage` y `localStorage` a través de los helpers definidos en [storage.js](file:///c:/Users/Usuario/ProjectoUniversidad/vet-system-WEB/src/services/api/storage.js).
- El enrutador en [App.jsx](file:///c:/Users/Usuario/ProjectoUniversidad/vet-system-WEB/src/App.jsx) lee el identificador del usuario (`userId`) y, dependiendo del rol asignado durante el login, presenta el flujo visual correspondiente.
- Si una petición de red retorna un código de estado `401 Unauthorized`, el cliente API ejecuta automáticamente la función `logout()`, limpia los almacenes locales y redirige al login, protegiendo al sistema ante sesiones expiradas o cuentas bloqueadas.

### B. Comunicación Centralizada (Capa API)
Toda llamada HTTP a los servicios del servidor debe seguir un flujo centralizado:
1. **El Cliente Base (`client.js`):** Exporta la función genérica `request(path, options)`. Se encarga de inyectar el token Bearer en los encabezados, normalizar las rutas para evitar prefijos duplicados (ej: `/api/api/`), registrar llamadas en desarrollo y capturar errores de red transformándolos en mensajes legibles para el usuario.
2. **Las Funciones de Servicio (`index.js`):** Traducen las interacciones del negocio en endpoints específicos. Por ejemplo, `getProducts()`, `createUser()`, `getFacturas()`, etc.
3. **Manejo Dinámico de Datos Heterogéneos:** El cliente API contempla variaciones de nombres en los modelos de base de datos debido a actualizaciones del backend (ej: mapear `role` / `rol` o `content` / `contenido`), garantizando robustez y compatibilidad.

### C. Actualización en Tiempo Real (Polling)
Dado que el flujo veterinario requiere información constante, el frontend utiliza mecanismos de consulta periódica (**Polling**) a través de hooks específicos como [usePolling.js](file:///c:/Users/Usuario/ProjectoUniversidad/vet-system-WEB/src/hooks/usePolling.js) en los paneles de citas, facturación y mensajería, asegurando que las secretarias y doctores vean las actualizaciones sin necesidad de refrescar el navegador manualmente.

---

## 5. Reglas Estrictas de Desarrollo (GEMINI.md)

Para mantener la cohesión visual, la mantenibilidad del código y evitar fallos lógicos en el sistema, todos los desarrolladores deben respetar las siguientes pautas:

* **Componentes Reutilizables:** Siempre se debe dar prioridad a los componentes de interfaz que ya existen en [screens/components](file:///c:/Users/Usuario/ProjectoUniversidad/vet-system-WEB/src/components/screens/components). En caso de necesitar uno nuevo, debe construirse allí siguiendo las convenciones de diseño del proyecto.
* **Separación de Lógica y Presentación (JSX):** Está prohibido incrustar lógica compleja de JavaScript en las vistas JSX. Cualquier procesamiento o transformación de datos debe aislarse en un archivo `utils.js` o hooks correspondientes.
* **Diseño y Estructura Visual:** No se permite el uso de estilos en línea (inline CSS) o CSS hardcodeado directamente en el JSX. Todos los estilos deben ser implementados mediante archivos `.module.css` asociados.
* **Textos No Hardcodeados:** Todos los textos, placeholders y etiquetas de la interfaz de usuario deben centralizarse en archivos de constantes (como [TEXT.js](file:///c:/Users/Usuario/ProjectoUniversidad/vet-system-WEB/src/constants/TEXT.js) o `constants.js`), facilitando su posterior traducción o cambio de redacción.
* **Rutas API Centralizadas:** Queda estrictamente prohibido usar la función `fetch` directamente en los componentes para llamar a la API. Toda ruta y método HTTP debe ser encapsulado como una función exportada en `src/services/api/index.js` y consumido a través de Hooks o servicios.
* **Dependencias:** No se deben instalar nuevas librerías en `package.json` sin previa aprobación del encargado del proyecto.
