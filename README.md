# Sistema Electoral (Management System)

Sistema de gestión electoral con frontend en **Next.js 16** (React 19) y backend en **Node.js/Express** con **MySQL**, cifrado de datos sensibles en 5 capas y protección anti-hackers.

> El frontend y el backend son proyectos independientes dentro de este mismo repositorio: el frontend puede desplegarse por sí solo (por ejemplo en Vercel) y el backend requiere su propio hosting con acceso a una base de datos MySQL.

## Índice

- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Frontend (Next.js)](#frontend-nextjs)
- [Backend (Express + MySQL)](#backend-express--mysql)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue](#despliegue)
- [Funcionalidades](#funcionalidades)
- [Seguridad del backend](#seguridad-del-backend)
- [Documentación adicional](#documentación-adicional)

## Arquitectura

```
managment-sistem-4a/
├── src/                     # Frontend (Next.js App Router)
│   ├── app/                 # Rutas de Next.js (layout, page, globals.css)
│   ├── Components/          # Vistas y managers (Dashboard, Electoral, UI, etc.)
│   ├── components/          # Componentes comunes reutilizables (Button, Input, Table...)
│   ├── Utils/                # Login (Auth, cookies, storage), navegación entre vistas
│   ├── context/              # AuthContext (React Context)
│   ├── hooks/                 # Hooks (useElectoralData)
│   └── services/              # Clientes de API (axios) por dominio
│
├── backend/                 # API REST (Express)
│   ├── config/               # Conexión a MySQL, caché, constantes
│   ├── controllers/          # Controladores de rutas
│   ├── middleware/           # Auth, rate limiting, seguridad avanzada
│   ├── routes/                # auth.routes.js, electoral.routes.js
│   ├── services/              # Lógica de negocio + cifrado (services/base)
│   ├── server.js              # Servidor Express
│   └── cluster.js             # Modo clustering para producción
│
└── public/                  # Assets estáticos del frontend
```

El frontend consume el backend vía HTTP a través de `NEXT_PUBLIC_API_URL`. Si esta variable no está definida, el código cae por defecto a `http://localhost:3002`, así que el frontend puede compilarse y desplegarse sin que el backend esté corriendo, pero las funciones que dependen de la API (login, datos electorales, reportes) no funcionarán hasta que el backend esté disponible y la variable apunte a él.

## Requisitos

- Node.js >= 18
- npm >= 9
- MySQL >= 8 (solo para correr el backend)

## Frontend (Next.js)

```bash
npm install
npm run dev      # http://localhost:3000
```

Scripts disponibles (`package.json`):

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build de producción |
| `npm run lint` | ESLint |

Stack: Next.js 16 (App Router, Turbopack), React 19, styled-components, react-icons, axios.

La app requiere permisos de geolocalización del navegador (`src/Components/LocationGuard.jsx`) antes de mostrar cualquier contenido, y autenticación (`src/Utils/Login`) antes de acceder al panel principal. Una vez autenticado, la navegación entre vistas (Dashboard, Zonas Electorales, Familias, Reportes, Configuración, Reportes para Imprimir) se maneja en `src/Utils/RenderPages.jsx` sin routing de Next.js — es una sola ruta (`/`) con un switch de vistas en cliente.

## Backend (Express + MySQL)

```bash
cd backend
npm install
cp .env.example .env   # configurar credenciales de BD, JWT y claves de cifrado
npm run dev             # desarrollo (nodemon), http://localhost:3002
npm start                # producción
npm run cluster          # producción con clustering (Node cluster module)
```

El backend necesita una base de datos MySQL propia (no incluida en este repositorio) con las tablas de estados, delegaciones, colonias, familias y personas.

### Rutas principales

Todas las rutas de datos están bajo el prefijo `/api/electoral/*` (no `/api/*` directamente) y requieren un JWT vía `Authorization: Bearer <token>`, excepto `/health` y `/api/auth/*`.

| Prefijo | Descripción |
|---------|-------------|
| `GET /health` | Health check |
| `POST /api/auth/login` · `logout` · `refresh` · `GET /api/auth/me` | Autenticación (JWT + refresh tokens) |
| `/api/electoral/stats`, `/monthly-summary`, `/recent-activity` | Dashboard |
| `/api/electoral/states` | CRUD de estados (+ `/:id/delegations`) |
| `/api/electoral/delegations` | CRUD de delegaciones (+ `/:id/colonies`) |
| `/api/electoral/colonies` | CRUD de colonias |
| `/api/electoral/families` | CRUD de familias (+ `/:id/stats`) |
| `/api/electoral/persons` | CRUD de personas, `/stats`, búsqueda por CURP |

Detalle completo de permisos por rol en [`RUTAS_REALES_BACKEND.md`](./RUTAS_REALES_BACKEND.md).

## Variables de entorno

### Frontend (`.env.local`)

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base del backend (ej. `https://tu-backend.example.com`). Se expone al cliente — no debe usarse para secretos. |

### Backend (`backend/.env`, ver `backend/.env.example`)

Incluye credenciales de MySQL (pools de lectura/escritura), secretos JWT, 5 claves de cifrado por capa, configuración de rate limiting, CORS, caché y logging. Genera claves únicas antes de desplegar:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Despliegue

### Frontend en Vercel

El frontend es un proyecto Next.js estándar y se despliega sin depender del backend:

1. Importa este repositorio en Vercel (o usa `vercel deploy` desde la raíz).
2. Configura `NEXT_PUBLIC_API_URL` en las variables de entorno del proyecto de Vercel apuntando al backend cuando esté disponible.
3. Build command: `next build` · Output: manejado automáticamente por el framework preset de Next.js.

Mientras el backend no esté desplegado, el sitio compila y sirve la interfaz normalmente, pero las pantallas que dependen de datos (login, dashboard, gestión de familias/personas, reportes) no podrán completar las peticiones a la API.

### Backend

El backend es un servidor Node/Express con estado (pools de conexión MySQL, caché en memoria) — no es apto para funciones serverless de Vercel tal cual. Despliegues recomendados: un VPS/contenedor con PM2 o `npm run cluster`, o cualquier plataforma que soporte procesos Node de larga duración (Railway, Render, un droplet con Docker, etc.), junto con una instancia de MySQL accesible.

## Funcionalidades

- Gestión jerárquica de estados → delegaciones → colonias → familias → personas.
- Búsqueda de personas por CURP.
- Dashboard con estadísticas y actividad reciente.
- Generación de reportes y exportación (CSV, Excel, PDF, JSON) desde el backend.
- Autenticación por roles (Admin, Coordinador, Capturista) con JWT + refresh tokens.
- Guard de geolocalización en el cliente antes de permitir el acceso a la app.

## Seguridad del backend

- Cifrado de campos sensibles (nombres, CURP, teléfonos, direcciones) en 5 capas: XOR con salt rotativo, Camellia-256-CBC, ChaCha20, AES-256-CBC y AES-256-GCM.
- Rate limiting por endpoint (login, lectura, escritura, búsqueda, exportación).
- Bloqueo automático de IPs por intentos fallidos o actividad sospechosa.
- Detección de SQL injection, XSS, CSRF, path traversal y patrones de escaneo (sqlmap, nikto, etc.).
- Auditoría de accesos y contraseñas con bcrypt.

Detalle completo en [`ULTRA_SECURITY_IMPLEMENTATION.md`](./ULTRA_SECURITY_IMPLEMENTATION.md).

## Documentación adicional

Este repositorio incluye documentación extendida generada durante el desarrollo:

- [`API_ELECTORAL_DOCUMENTATION.md`](./API_ELECTORAL_DOCUMENTATION.md) — documentación detallada de la API electoral.
- [`COMPONENTS_DOCUMENTATION.md`](./COMPONENTS_DOCUMENTATION.md) — documentación de componentes del frontend.
- [`CONFIGURACION_RUTAS_API.md`](./CONFIGURACION_RUTAS_API.md) / [`RUTAS_REALES_BACKEND.md`](./RUTAS_REALES_BACKEND.md) — configuración y rutas reales del backend.
- [`SERVICIOS_API_IMPLEMENTADOS.md`](./SERVICIOS_API_IMPLEMENTADOS.md) / [`VERIFICACION_APIS_FINAL.md`](./VERIFICACION_APIS_FINAL.md) — servicios de API implementados y su verificación.
- [`ULTRA_SECURITY_IMPLEMENTATION.md`](./ULTRA_SECURITY_IMPLEMENTATION.md) / [`ULTRA_SECURE_DEPLOYMENT_SUCCESS.md`](./ULTRA_SECURE_DEPLOYMENT_SUCCESS.md) — implementación y despliegue del sistema de seguridad.
- [`DATOS_PRUEBA.md`](./DATOS_PRUEBA.md) — datos de prueba para desarrollo.
- [`backend/README.md`](./backend/README.md) — guía específica del backend.

> Nota: algunos de estos documentos fueron escritos en distintas etapas del proyecto y pueden describir una versión anterior del frontend (Vite/React Router) en lugar de la actual basada en Next.js App Router. Ante cualquier discrepancia, el código en `src/` y `backend/` es la fuente de verdad.
