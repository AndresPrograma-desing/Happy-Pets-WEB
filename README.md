# Happy Pets Vet System WEB

Aplicación web para la gestión operativa de una clínica veterinaria, con módulos por rol (administrador, doctor y secretaria), orientada a centralizar citas, consultas médicas, clientes/mascotas, facturación y mensajería interna.

---

## 1. Descripción General del Sistema y su Propósito

Happy Pets Vet System WEB es el frontend principal del ecosistema de gestión veterinaria. Su objetivo es digitalizar y ordenar el flujo clínico-administrativo diario de la clínica:

- Gestión de usuarios y roles.
- Gestión de citas médicas.
- Registro clínico de consultas.
- Gestión de productos e inventario.
- Generación y control de facturas.
- Mensajería interna entre usuarios.
- Monitoreo de conectividad (internet + backend).

El proyecto está pensado para operar contra una API real (configurable por variables de entorno) y trae además un backend mock local para pruebas de autenticación y mensajería.

---

## 2. Funcionalidades Principales y Usuario Objetivo

### Administrador

- Panel administrativo base.
- Creación de usuarios con rol:
  - Doctor
  - Administrador
  - Secretaria
- Gestión de usuarios:
  - Listado
  - Habilitar/deshabilitar
  - Eliminación
- Dashboard de ventas/facturación:
  - Ingresos
  - Facturas pagadas
  - Clientes
  - Evolución por período
- Gestión de productos:
  - Ver inventario
  - Crear productos
  - Eliminar productos
  - Historial reciente de altas/bajas
- Acceso a configuración del sistema.

### Doctor

- Panel médico.
- Visualización de citas.
- Creación de citas.
- Registro de consultas clínicas:
  - Signos vitales
  - Diagnóstico
  - Tratamiento
  - Receta
  - Observaciones
  - Productos/medicamentos aplicados
- Actualización automática de estado de cita al completar consulta.
- Disminución de stock de productos usados en consulta.
- Visualización de facturas.
- Acceso a mensajería interna.

### Secretaria

- Panel de secretaría.
- Visualización y administración de citas.
- Creación rápida de cliente + mascota.
- Cancelación de citas.
- Generación de facturas desde citas.
- Descarga y vista previa de facturas.
- Visualización de facturas generales.
- Marcado de facturas como pagadas.
- Visualización de QR asociado al documento de factura.
- Acceso a mensajería interna.

### Cliente (indirecto)

El cliente no tiene panel frontend propio en este repositorio, pero está representado en el flujo mediante:

- Registro de datos de propietario.
- Asociación de mascota.
- Historial reflejado en citas, consultas y facturas.
- Datos usados para emisión documental y procesos administrativos.

---

## 3. Flujo de Uso por Tipo de Usuario

### Flujo Administrador

1. Inicia sesión seleccionando rol administrador.
2. Ingresa al panel de administración.
3. Crea o gestiona usuarios del sistema.
4. Supervisa métricas en dashboard (facturas/ingresos).
5. Administra inventario de productos.
6. Revisa ajustes generales.

### Flujo Doctor

1. Inicia sesión seleccionando rol doctor.
2. Entra al panel médico.
3. Consulta agenda de citas.
4. Crea una cita nueva cuando corresponde.
5. Abre consulta médica desde cita.
6. Registra diagnóstico y tratamiento.
7. Asocia productos usados.
8. Finaliza consulta y actualiza estado de cita.

### Flujo Secretaria

1. Inicia sesión seleccionando rol secretaria.
2. Entra al panel de secretaría.
3. Gestiona agenda de citas.
4. Crea cliente y mascota si es necesario.
5. Crea o cancela citas.
6. Genera factura para cita completada.
7. Descarga documento y/o muestra QR.
8. Marca factura pagada cuando aplica.

### Flujo Mensajería Interna (todos los roles operativos)

1. Usuario autenticado abre panel de mensajería.
2. El sistema obtiene perfil y lista de usuarios.
3. Carga conversaciones y mensajes por polling.
4. Enviar mensaje actualiza conversación.
5. Lecturas se marcan automáticamente como leídas.

---

## 4. Tecnologías y Lenguajes Utilizados

### Frontend

- JavaScript
- React 19
- React DOM
- React Router DOM
- React Hook Form
- React Select
- CSS Modules + estilos globales
- Vite 8

### Backend (mock local incluido)

- Node.js
- Express
- CORS

### Librerías de negocio/documentos/UI

- docx
- docxtemplater
- pizzip
- xmldom
- lucide-react
- qrcode.react

### Calidad y desarrollo

- ESLint 9
- Babel (plugin react compiler)
- Vite plugin React
- Rolldown Babel plugin
- Nodemon (dev dependency)
- open-cli (utilidad de scripts)

---

## 5. Estructura del Proyecto (Carpetas Principales)

- public
  - Documentación estática en HTML.
- scripts
  - Scripts de apoyo para probar endpoints de mensajería y perfil.
- server
  - Backend mock para pruebas locales.
- src
  - Código principal frontend.
  - assets: fuentes, íconos, imágenes, audio.
  - components: componentes reutilizables de UI y módulos funcionales.
  - config: configuración de interfaz.
  - constants: constantes globales.
  - context: utilidades de estado persistente (por ejemplo user_id).
  - features: funcionalidades agrupadas (ejemplo mensajería).
  - hooks: hooks custom de datos, polling, salud, notificaciones.
  - pages: páginas por módulo/rol.
  - services: cliente API y funciones de acceso backend.
  - styles: estilos globales y variables CSS.
  - utils: utilidades de errores API, facturación y helpers.
- test
  - HTML de pruebas/visualizaciones auxiliares.

---

## 6. Comunicación entre Frontend y Backend

La comunicación está centralizada en la capa de servicios (cliente API):

- Base URL configurable con variable de entorno.
- Normalización automática de rutas para evitar duplicación del prefijo api.
- Inyección de token Bearer para endpoints autenticados.
- Manejo de respuestas JSON y no JSON.
- Manejo uniforme de errores con status y body enriquecido.
- Logout automático ante respuesta 401.
- Persistencia de sesión en sessionStorage y localStorage.
- Polling en módulos clave:
  - Citas
  - Dashboard
  - Facturas
  - Mensajería
- Validación de disponibilidad:
  - Estado de red del navegador
  - Health check del backend cada intervalo configurable

### Endpoints funcionales usados por el frontend (resumen)

- Auth:
  - login
  - auth/me
  - auth/update-password
- Users:
  - listar, crear, habilitar, deshabilitar, eliminar
  - secretarias
- Citas:
  - listar solicitudes
  - crear
  - actualizar estado
  - eliminar
- Clientes/Mascotas:
  - crear cliente
  - crear mascota
  - crear cliente con mascota
  - búsqueda de mascotas por usuario
- Consultas:
  - crear consulta
- Productos:
  - listar
  - crear
  - actualizar
  - eliminar
  - disminuir stock
- Facturas:
  - listar
  - obtener por cita
  - actualizar estado de pago
- Mensajería:
  - enviar mensaje
  - conversaciones por par de usuarios
  - mensajes por usuario
  - marcar leído

---

## 7. Instalación y Ejecución

## Requisitos previos

- Node.js 18 o superior
- npm

## Instalación

1. Instalar dependencias del frontend:
   - npm install

2. Instalar dependencias del backend mock:
   - cd server
   - npm install
   - cd ..

## Variables de entorno recomendadas

Crear archivo .env en raíz del proyecto con:

- VITE_API_URL=https://tu-backend/api
- VITE_HEALTH_URL=https://tu-backend/Health

Si no se define, el proyecto usa URLs por defecto configuradas en código.

## Ejecución en desarrollo

1. Levantar backend mock:
   - cd server
   - npm start

2. En otra terminal, levantar frontend:
   - npm run dev

## Otros comandos útiles

- npm run build
- npm run preview
- npm run lint
- npm run documentation

---

## 8. Detalles Relevantes para Entender y Contribuir

### Arquitectura funcional

- Diseño por módulos y componentes.
- Reutilización de hooks para lógica transversal.
- Formularios complejos manejados con validación declarativa.
- Capa API unificada para minimizar duplicación.
- Polling parametrizable para mantener datos frescos.

### Gestión de sesión

- Token y datos de login se replican en sessionStorage/localStorage.
- Se guarda user_id para validaciones de estado de cuenta.
- El sistema detecta cuentas bloqueadas y fuerza retorno a login.

### Compatibilidad con backend heterogéneo

El frontend contempla diferencias de naming en payloads/respuestas:
- Español e inglés (por ejemplo rol y role, contenido y content, etc.).
- Distintas estructuras de respuesta (data, result, items, arrays directos).

Esto facilita integración con APIs no totalmente homogéneas.

### Backend mock local

El backend en carpeta server es un mock para pruebas rápidas:
- Auth por token fijo
- Perfil de usuario
- Mensajería en memoria

No reemplaza una API productiva completa para todos los módulos (citas, productos, facturas, etc.), pero es útil para validar login/chat localmente.

### Calidad y mantenimiento

- Linting con ESLint.
- Separación clara de estilos por módulo.
- Scripts utilitarios para depurar endpoints.
- Documentación HTML adicional en public/Documentation.

---

## Guía de Contribución

1. Crear rama por feature o fix.
2. Mantener cambios acotados por módulo.
3. Reutilizar la capa de servicios API existente.
4. Evitar llamadas fetch directas fuera de la capa de servicios, salvo casos justificados.
5. Validar flujo por rol afectado antes de abrir PR.
6. Ejecutar lint y build antes de proponer merge.

---

## Estado del Proyecto

Proyecto en evolución activa, con módulos operativos y áreas marcadas como en desarrollo dentro de la interfaz. La base actual es sólida para seguir expandiendo:

- permisos por ruta más estrictos,
- pruebas automatizadas,
- normalización final de contratos API,
- mejoras de observabilidad y telemetría.

---

Si quieres, en un siguiente paso te preparo una versión 2 del README con:
1. Diagrama de arquitectura.
2. Matriz de permisos por ruta.
3. Tabla de endpoints detallada con request/response esperados.
4. Checklist de release para despliegue.
