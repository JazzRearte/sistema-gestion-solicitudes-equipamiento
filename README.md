
# Sistema de Gestión de Solicitudes de Equipamiento

Aplicación web full stack desarrollada como trabajo práctico académico de la asignatura Desarrollo de Software de Ingeniería en Sistemas de Información, UTN Facultad Regional Córdoba.

Permite gestionar solicitudes de equipamiento, controlar su disponibilidad y administrar su aprobación, rechazo, cancelación y devolución mediante un sistema de autenticación y autorización por roles.

## Tecnologías utilizadas

### Frontend
- React
- Vite
- JavaScript
- React Router
- Axios
- Context API

### Backend
- Node.js
- Express
- API REST
- JWT (JSON Web Tokens)
- bcrypt
- Jest y Supertest

### Persistencia
- Archivos JSON
- Módulo fs de Node.js

## Funcionalidades principales

### Autenticación y usuarios
- Registro de usuarios.
- Inicio de sesión mediante JWT.
- Contraseñas protegidas mediante hashing.
- Rutas protegidas.
- Autorización basada en roles.

### Gestión de equipamiento
- Consulta del listado de equipos.
- Consulta de detalles.
- Filtros por categoría, estado y autorización.

### Gestión de solicitudes
- Creación de solicitudes.
- Consulta y edición de solicitudes.
- Cancelación de solicitudes.
- Aprobación y rechazo según permisos.
- Registro de devoluciones.
- Historial de cambios de estado.
- Validación de fechas y disponibilidad.
- Prevención de reservas con períodos superpuestos.

### Administración
- Panel de resumen.
- Filtros y paginación.
- Gestión de solicitudes según el rol del usuario.

## Roles y permisos

| Rol | Permisos |
| --- | --- |
| Usuario | Crear, consultar y cancelar sus solicitudes |
| Encargado | Gestionar solicitudes y aprobar, rechazar o registrar devoluciones |
| Administrador | Permisos de gestión y acceso al panel de resumen |

El rol administrador no puede asignarse mediante el registro público.

## Instalación y ejecución

### Requisitos

- Node.js
- npm

### 1. Backend

```bash
cd backend
npm install
```

Crear un archivo `.env` dentro de `backend`, tomando como referencia `.env.example`:

```env
PORT=3001
JWT_SECRET=replace_with_a_secure_random_secret
JWT_EXPIRES_IN=8h
```

Reemplazar `JWT_SECRET` por una clave privada y segura.

Iniciar el servidor:

```bash
node index.js
```

Backend disponible en:

http://localhost:3001

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible normalmente en:

http://localhost:5173

## Usuarios de demostración

Los datos iniciales incluyen usuarios de prueba:

| Email | Rol |
| --- | --- |
| admin@equipamiento.com | Administrador |
| encargada@equipamiento.com | Encargado |
| carlos@equipamiento.com | Usuario |
| maria@equipamiento.com | Usuario |

Contraseña de demostración: `password123`

Estas credenciales son exclusivamente para ejecutar el proyecto en un entorno local de pruebas.

## API REST

### Autenticación

| Método | Endpoint | Descripción |
| --- | --- | --- |
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |

### Equipos

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | /api/equipos | Listar equipos |
| GET | /api/equipos/:id | Consultar equipo |

### Solicitudes

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | /api/solicitudes | Listar solicitudes |
| GET | /api/solicitudes/resumen | Obtener resumen |
| GET | /api/solicitudes/:id | Consultar solicitud |
| GET | /api/solicitudes/:id/historial | Consultar historial |
| POST | /api/solicitudes | Crear solicitud |
| PUT | /api/solicitudes/:id | Editar solicitud |
| PATCH | /api/solicitudes/:id/cancelar | Cancelar |
| PATCH | /api/solicitudes/:id/aprobar | Aprobar |
| PATCH | /api/solicitudes/:id/rechazar | Rechazar |
| PATCH | /api/solicitudes/:id/devolver | Registrar devolución |

Las operaciones protegidas requieren un token JWT válido y los permisos correspondientes.

## Reglas de negocio

- Las solicitudes deben tener fechas válidas.
- No se permite aprobar solicitudes con períodos superpuestos para un mismo equipo.
- Los equipos pueden pasar de disponibles a prestados.
- La devolución actualiza el estado del equipo.
- Las operaciones están restringidas según los permisos del usuario.
- Se registran cambios de estado en el historial.

## Pruebas automatizadas

El backend incluye pruebas con Jest y Supertest.

Para ejecutarlas:

```bash
cd backend
npm test
```

Las pruebas contemplan autenticación, permisos, consultas, filtros, validaciones, disponibilidad y transiciones de estado.

## Arquitectura del proyecto

```text
sistema-gestion-solicitudes-equipamiento/
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   ├── routes/
│   ├── data/
│   ├── tests/
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── context/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
├── .gitignore
└── README.md
```

## Consideraciones

Este proyecto fue desarrollado con fines académicos.

La persistencia utiliza archivos JSON, por lo que no está diseñada para entornos de producción con múltiples escrituras concurrentes.

El almacenamiento del JWT en localStorage corresponde a la implementación académica del proyecto.

## Autora

**Jazmín Rearte**

Estudiante de Ingeniería en Sistemas de Información  
Universidad Tecnológica Nacional — Facultad Regional Córdoba

[Mi perfil de GitHub](https://github.com/JazzRearte)
