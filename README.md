# Sistema Electoral (Management System)

Sistema de gestión electoral con frontend en **Next.js 16** (React 19) y backend en **Node.js/Express** con **MySQL**, cifrado de datos sensibles en 5 capas y protección anti-hackers.

> El frontend y el backend son proyectos independientes dentro de este mismo repositorio: el frontend puede desplegarse por sí solo (por ejemplo en Vercel) y el backend requiere su propio hosting con acceso a una base de datos MySQL.

## ¿Qué es y qué hace?

Es una plataforma para **empadronar y administrar población por zonas electorales**. Organiza la información en una jerarquía **Estado → Delegación/Alcaldía → Colonia → Familia → Persona** y permite:

- **Dashboard** con indicadores (estados, colonias, familias, personas, cobertura de votantes), gráfica mensual y actividad reciente.
- **Zonas electorales**: alta, edición y baja de estados, delegaciones y colonias.
- **Familias y personas**: captura de familias con sus miembros (CURP, edad, género, teléfono, rol), con cálculo automático de quién puede votar (18 años o más).
- **Reportes**: tablas filtrables, exportación a CSV y reporte imprimible por estado/delegación/colonia, con quiénes votan, quiénes cumplen 18 el próximo año y quiénes en dos años.
- **Búsqueda** por CURP, nombre, teléfono o dirección.
- **Seguridad**: login con JWT y refresh token, roles (ADMIN, COORDINADOR, CAPTURISTA), datos personales cifrados en la base de datos y bloqueo de comportamientos sospechosos.

El frontend funciona en dos modos intercambiables con una sola variable de entorno: **`mock`** (datos de demostración en memoria, sin backend) y **`real`** (backend Express + MySQL). Ver [Modos de datos](#modos-de-datos-mock-y-real).

## Índice

- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Modos de datos (mock y real)](#modos-de-datos-mock-y-real)
- [Frontend (Next.js)](#frontend-nextjs)
- [Backend (Express + MySQL)](#backend-express--mysql)
- [Cómo crear una API nueva que funcione con todo el sistema](#cómo-crear-una-api-nueva-que-funcione-con-todo-el-sistema)
- [Pruebas](#pruebas)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue](#despliegue)
- [Funcionalidades](#funcionalidades)
- [Seguridad del backend](#seguridad-del-backend)
- [Documentación adicional](#documentación-adicional)

## Arquitectura

```
managment-sistem-4a/
├── src/                          # Frontend (Next.js App Router)
│   ├── app/                      # layout, page (shell con menú), estilos globales
│   ├── Components/               # Pantallas: Dashboard, Zonas, Familias, Reportes, Configuración
│   │   ├── Electoral/            #   Managers CRUD (Estados, Delegaciones, Colonias, Familias, Personas)
│   │   └── UI/                   #   Kit de UI (Button, Input, Modal, Table, Card, Alert)
│   ├── hooks/                    # useApiData (carga para pantallas) y useElectoralData (CRUD de los managers)
│   ├── lib/                      # Capa HTTP: apiConfig, httpClient, createResourceApi, download
│   └── Utils/
│       ├── Login/                # Auth: AuthContext, apiClient (mock | http), cookies
│       └── ElectoralDashboard/
│           ├── ElectoralApi.jsx  # ★ Fachada única que usa toda la UI
│           ├── viewModels.js     # Convierte tablas crudas en lo que pinta cada pantalla
│           ├── mockElectoralData.js
│           └── dataSources/      # mockDataSource (memoria) | httpDataSource (backend)
│
├── backend/                      # API REST (Express)
│   ├── config/                   # MySQL (pools lectura/escritura), caché, constantes
│   ├── controllers/              # auth.controller
│   ├── middleware/               # JWT + roles, rate limiting, seguridad avanzada
│   ├── routes/                   # auth.routes.js, electoral.routes.js
│   ├── services/                 # Lógica de negocio + cifrado (services/base)
│   ├── utils/                    # csv.js, crudRouter.js (rutas CRUD en pocas líneas)
│   ├── tests/                    # Pruebas con Jest + Supertest
│   ├── server.js                 # Servidor Express
│   └── cluster.js                # Modo clustering para producción
│
└── public/                       # Assets estáticos del frontend
```

### Flujo de una petición

```
Pantalla (React)
   │  ElectoralApi.getFamiliasView()
   ▼
ElectoralApi ──► dataSource ──┬─ mock → tablas en memoria
   │                          └─ http → lib/httpClient → GET /api/electoral/families …
   ▼                                           │  (JWT + refresh automático)
viewModels.js (une tablas y calcula)            ▼
   │                                   Express: routes → services → MySQL (campos cifrados)
   ▼
{ success: true, data } ──► la pantalla pinta
```

**Contrato único de respuesta** (toda la UI y todo el backend lo respetan):

```json
{ "success": true,  "data": { } }              // éxito
{ "success": false, "error": "mensaje" }       // el frontend siempre devuelve "error"
{ "success": false, "message": "mensaje" }     // así responde el backend; httpClient lo traduce a "error"
```

Como la UI solo habla con `ElectoralApi`, cambiar de mock a backend real **no requiere tocar ningún componente**.

## Modos de datos (mock y real)

Se elige con `NEXT_PUBLIC_API_MODE` en `.env.local` (ver `.env.example`). Al ser una variable `NEXT_PUBLIC_*` se incrusta en el build: **reinicia `npm run dev` o vuelve a hacer build al cambiarla**.

| Modo | Variable | Qué hace | Credenciales |
|------|----------|----------|--------------|
| `mock` (por defecto) | `NEXT_PUBLIC_API_MODE=mock` | Datos de demostración en memoria (3 estados, 6 delegaciones, 12 colonias, 24 familias, ~70 personas). Todo se reinicia al recargar. No necesita backend. | `admin@demo.com` / `admin123` (o crea una cuenta desde "Registrarse") |
| `real` | `NEXT_PUBLIC_API_MODE=real`<br>`NEXT_PUBLIC_API_URL=http://localhost:3002` | Consume el backend Express + MySQL con JWT. | Usuarios de tu base de datos (ver `DATOS_PRUEBA.md` y `backend/seed_ultra_secure.js`) |

`NEXT_PUBLIC_API_URL` es la raíz del backend, **sin** `/api` al final (se normaliza si lo incluyes).

Diferencias en modo real:

- El rol de los registros nuevos desde "Registrarse" siempre es `CAPTURISTA`; solo un administrador asigna otros roles.
- La contraseña debe tener al menos 8 caracteres.
- "Exportar CSV" lo genera el backend y requiere rol `ADMIN` o `COORDINADOR`.
- La búsqueda se ejecuta en el servidor (los datos están cifrados en la BD).

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

Stack: Next.js 16 (App Router, Turbopack), React 19, styled-components, react-icons. Las peticiones HTTP usan `fetch` a través de `src/lib/httpClient.js` (JWT en cookie, renovación automática del token, cabeceras de ubicación).

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
| `GET /api/electoral/search?q=` | Búsqueda por CURP, nombre, teléfono o dirección (mínimo 2 caracteres) |
| `GET /api/electoral/export/:type?format=csv` | Exporta `families` o `persons` en CSV (`ADMIN`, `COORDINADOR`) |
| `POST /api/auth/register` | Alta pública de usuario (siempre rol `CAPTURISTA`, contraseña ≥ 8 caracteres) |

Detalle completo de permisos por rol en [`RUTAS_REALES_BACKEND.md`](./RUTAS_REALES_BACKEND.md).

## Cómo crear una API nueva que funcione con todo el sistema

Una API "que funcione con todo el sistema" significa: autenticada con el mismo JWT, con los mismos roles, devolviendo el contrato `{ success, data }`, cifrando datos personales y consumible desde la UI tanto en modo `mock` como en modo `real`. El ejemplo sigue un recurso nuevo, **`casillas`** (casillas electorales de una colonia), de la base de datos a la pantalla.

> El esquema SQL de la base de datos no está en este repositorio (los `*.sql` están en `.gitignore`), así que el paso 1 es crear la tabla tú mismo.

### Parte A — Backend (Express + MySQL)

**1. Crea la tabla.** Convención del proyecto: toda columna con datos sensibles se guarda como tres columnas `<campo>_encrypted`, `<campo>_iv` y `<campo>_tag`; además `activo` (borrado lógico) y marcas de tiempo.

```sql
CREATE TABLE casillas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_colonia INT NOT NULL,
  numero VARCHAR(20) NOT NULL,
  direccion_encrypted TEXT, direccion_iv VARCHAR(64), direccion_tag VARCHAR(64),
  activo TINYINT(1) NOT NULL DEFAULT 1,
  id_registro INT NULL,
  id_ultima_modificacion INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_colonia) REFERENCES colonias(id)
);
```

**2. Crea el servicio** `backend/services/casillas.service.js`. Extender `BaseService` te da CRUD, paginación, caché y cifrado/descifrado automático de los campos que declares:

```js
const BaseService = require('./base/BaseService');

class CasillasService extends BaseService {
  // 'direccion' se cifra al guardar y se descifra al leer
  constructor() {
    super('casillas', ['direccion']);
  }

  // Lógica propia: usa `this.query(sql, params)` con parámetros `?`, nunca concatenes datos del usuario
  async getByColonia(coloniaId) {
    const rows = await this.query('SELECT * FROM casillas WHERE id_colonia = ? AND activo = 1', [coloniaId]);
    return this.decryptRows(rows);
  }
}

module.exports = new CasillasService();
```

**3. Expón las rutas** en `backend/routes/electoral.routes.js`. Esa ruta ya exige JWT (`router.use(authMiddleware.verifyToken)`), así que solo agrega el recurso con `createCrudRouter` (`backend/utils/crudRouter.js`) antes de `module.exports`:

```js
const casillasService = require('../services/casillas.service');
const createCrudRouter = require('../utils/crudRouter');

router.use('/casillas', createCrudRouter(casillasService, {
  fields: ['id_colonia', 'numero', 'direccion'],   // OBLIGATORIO: lista blanca de campos aceptados
  required: ['id_colonia', 'numero'],              // campos requeridos al crear
  filters: ['id_colonia'],                         // ?id_colonia=3 filtra la lista (parametrizado)
  audit: true,                                     // guarda id_registro / id_ultima_modificacion
  roles: { create: ['ADMIN', 'COORDINADOR'] },     // opcional: por defecto create/update = ADMIN+CAPTURISTA, delete = ADMIN, read = cualquiera
}));
```

Eso publica, bajo `/api/electoral/casillas`:

| Método y ruta | Respuesta |
|---------------|-----------|
| `GET /` (`?page=&limit=&id_colonia=`) | `{ success, data: [...], pagination }` |
| `GET /:id` | `{ success, data }` o `404` |
| `POST /` | `201 { success, data }` |
| `PUT /:id` | `{ success, data }` |
| `DELETE /:id` | `{ success, data: { message } }` (borrado lógico: `activo = 0`) |

> `fields` es una lista blanca a propósito: `BaseService` arma el `INSERT`/`UPDATE` con los nombres de campo recibidos, así que sin ella un cliente podría inyectar nombres de columna. `createCrudRouter` lanza un error al arrancar si la olvidas.

**¿Necesitas un endpoint que no es CRUD?** Escríbelo a mano siguiendo el mismo patrón (rol + `try/catch` + contrato):

```js
// GET /api/electoral/colonies/:id/casillas
router.get('/colonies/:id/casillas', async (req, res) => {
  try {
    const data = await casillasService.getByColonia(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

Para restringir por rol agrega `authMiddleware.requireRole(['ADMIN'])` como segundo argumento. Dentro del handler, `req.user` trae `{ id, userId, nombre, email, rol }` ya descifrados.

**4. Pruébala** con `curl`:

```bash
TOKEN=$(curl -s -X POST localhost:3002/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"123456"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl -s localhost:3002/api/electoral/casillas -H "Authorization: Bearer $TOKEN"
curl -s -X POST localhost:3002/api/electoral/casillas -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"id_colonia":1,"numero":"C-01","direccion":"Escuela Primaria 5"}'
```

Con `curl` no hay ubicación del navegador: el backend lo registra en la auditoría (`UBICACION_RECHAZADA`) pero la petición continúa. El frontend sí la envía en las cabeceras `X-Browser-Latitude/Longitude/Accuracy`.

**5. Reglas para que encaje con el resto:**

- Siempre responde `{ success: true, data }` o `{ success: false, message }` con el código HTTP correcto.
- Los datos personales (nombres, CURP, teléfonos, direcciones) se cifran con `cryptoService` / `BaseService`; no los guardes en texto plano.
- Nunca concatenes entrada del usuario en SQL: usa `?`.
- Cada petición pasa por `verifyToken`; protege las acciones con `requireRole`.
- Si el recurso se descarga como archivo, expón la cabecera `Content-Disposition` (ya está en el CORS de `server.js`).

### Parte B — Frontend (Next.js)

**6. Usa el recurso desde la UI** con `ElectoralApi.crud(nombre)`. En modo `real` llama a `/api/electoral/<nombre>` con el JWT del usuario (renovándolo si expira); en modo `mock` trabaja sobre una tabla en memoria que registras con `registerMockTable`:

```jsx
// src/Components/CasillasPage.jsx
'use client'
import ElectoralApi from '@/Utils/ElectoralDashboard/ElectoralApi'
import { registerMockTable } from '@/Utils/ElectoralDashboard/dataSources/mockDataSource'
import useApiData from '@/hooks/useApiData'
import DataState from '@/Components/DataState'

// Solo afecta al modo mock; en modo real se ignora. Tercer argumento: campos requeridos.
registerMockTable('casillas', [{ id: 1, id_colonia: 1, numero: 'C-01', direccion: 'Escuela 5' }], ['id_colonia', 'numero'])

const casillas = ElectoralApi.crud('casillas')
const listCasillas = () => casillas.list()   // identidad estable: useApiData recarga si cambia

export default function CasillasPage() {
  const { data, loading, error, reload } = useApiData(listCasillas)

  const crear = async () => {
    const result = await casillas.create({ id_colonia: 1, numero: `C-${Date.now() % 1000}`, direccion: 'Nueva' })
    if (result.success) reload()
    else alert(result.error)
  }

  return (
    <DataState loading={loading} error={error} onRetry={reload}>
      <button onClick={crear}>Nueva casilla</button>
      <ul>{(data || []).map((c) => <li key={c.id}>{c.numero} — {c.direccion}</li>)}</ul>
    </DataState>
  )
}
```

Todos los métodos de `ElectoralApi` devuelven `{ success, data }` o `{ success: false, error }` y **nunca lanzan**: revisa `success` en lugar de usar `try/catch`.

**7. Agrégala al menú.** En `src/app/page.js` añade un `<BtnHeader page="/casillas" ... />` y en `src/Utils/RenderPages.jsx` un `case '/casillas': return <CasillasPage />`.

**Variantes:**

- **Datos unidos o calculados** (por ejemplo, "casillas con su colonia y estado"): agrega una función pura en `src/Utils/ElectoralDashboard/viewModels.js` y un método en `ElectoralApi` que la use, como `getColoniasView` o `getFamiliasView`. Así la lógica queda igual en mock y real.
- **Recurso fuera de `/api/electoral`** (p. ej. `/api/auth/users`): `createResourceApi('/api/auth/users')` (`src/lib/createResourceApi.js`) da `list/get/create/update/remove` con el mismo cliente HTTP; para peticiones sueltas usa `request(path, { method, body, query })` de `src/lib/httpClient.js`.
- **Entidad core nueva** (que deba entrar en dashboard y reportes): agrégala a `RESOURCES` en `dataSources/httpDataSource.js`, a las tablas de `mockDataSource.js` / `mockElectoralData.js`, y úsala en `viewModels.js`.

**8. Prueba el backend.** Copia el patrón de `backend/tests/crudRouter.test.js` (servicio real con pools simulados) o `backend/tests/electoral.search-export.test.js` (rutas con servicios simulados) y ejecuta `cd backend && npm test`.

### Checklist de una API nueva

- [ ] Tabla SQL con columnas cifradas y `activo`.
- [ ] Servicio (`BaseService`) y rutas montadas en `electoral.routes.js` (JWT y roles).
- [ ] Contrato `{ success, data }` y códigos HTTP correctos.
- [ ] `fields` (lista blanca), `required` y roles definidos.
- [ ] Prueba automatizada en `backend/tests/`.
- [ ] Cliente en el frontend (`ElectoralApi.crud` o método propio) y tabla mock para el modo demo.
- [ ] Pantalla con `useApiData` + `DataState` y entrada en el menú.
- [ ] Documentada aquí o en `API_ELECTORAL_DOCUMENTATION.md`.

## Pruebas

```bash
# Backend: autenticación cifrada, registro, búsqueda, exportación CSV y rutas CRUD (Jest + Supertest)
cd backend && npm install && npm test

# Frontend: compilación de producción
npm run build

# Lint: quedan errores preexistentes de las reglas nuevas de React 19 en Components/Dashboard, ElectoralDashboard,
# LocationGuard, UI/Table y hooks/useElectoralData (no afectan al build). El código de src/lib, dataSources y las
# pantallas conectadas a la API no añade ninguno.
npm run lint
```

Para probar a mano el modo real sin MySQL, apunta `NEXT_PUBLIC_API_MODE=real` a cualquier servidor que cumpla el contrato de `/api/auth/*` y `/api/electoral/*` descrito arriba.

## Variables de entorno

### Frontend (`.env.local`)

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_MODE` | `mock` (por defecto, datos en memoria) o `real` (usa el backend). |
| `NEXT_PUBLIC_API_URL` | URL base del backend **sin `/api`** (ej. `https://tu-backend.example.com`). Solo se usa en modo `real`. Se expone al cliente — no debe usarse para secretos. |

Ambas se incrustan en el build: tras cambiarlas, reinicia `npm run dev` o vuelve a compilar.

### Backend (`backend/.env`, ver `backend/.env.example`)

Incluye credenciales de MySQL (pools de lectura/escritura), secretos JWT, 5 claves de cifrado por capa, configuración de rate limiting, CORS, caché y logging. Genera claves únicas antes de desplegar:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Despliegue

### Frontend en Vercel

El frontend es un proyecto Next.js estándar y se despliega sin depender del backend:

1. Importa este repositorio en Vercel (o usa `vercel deploy` desde la raíz).
2. Sin configurar nada el sitio arranca en modo `mock` (datos de demostración, login `admin@demo.com` / `admin123`). Para conectarlo al backend define en Vercel `NEXT_PUBLIC_API_MODE=real` y `NEXT_PUBLIC_API_URL=https://tu-backend...` y vuelve a desplegar. En el backend, agrega el dominio de Vercel a `CORS_ORIGIN`.
3. Build command: `next build` · Output: manejado automáticamente por el framework preset de Next.js.

Mientras el backend no esté desplegado, deja el modo `mock`: todas las pantallas funcionan con datos de demostración.

### Backend

El backend es un servidor Node/Express con estado (pools de conexión MySQL, caché en memoria) — no es apto para funciones serverless de Vercel tal cual. Despliegues recomendados: un VPS/contenedor con PM2 o `npm run cluster`, o cualquier plataforma que soporte procesos Node de larga duración (Railway, Render, un droplet con Docker, etc.), junto con una instancia de MySQL accesible.

## Funcionalidades

- Gestión jerárquica de estados → delegaciones → colonias → familias → personas.
- Búsqueda de personas por CURP, nombre, teléfono o dirección.
- Dashboard con estadísticas y actividad reciente.
- Reportes imprimibles por zona y exportación a CSV de familias y personas.
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
