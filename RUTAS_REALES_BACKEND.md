# 🔗 RUTAS REALES DEL BACKEND

## ⚠️ IMPORTANTE: CORRECCIÓN DE RUTAS

Las rutas del backend están bajo `/api/electoral/`, NO bajo `/api/` directamente.

---

## 📍 RUTAS DISPONIBLES

### Autenticación: `/api/auth`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/auth/refresh` | Refresh token |

---

### Dashboard: `/api/electoral`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/electoral/stats` | Estadísticas generales |
| GET | `/api/electoral/monthly-summary` | Resumen mensual |
| GET | `/api/electoral/recent-activity` | Actividad reciente |

---

### Estados: `/api/electoral/states`

| Método | Ruta | Descripción | Permisos |
|--------|------|-------------|----------|
| GET | `/api/electoral/states` | Listar estados | Todos |
| GET | `/api/electoral/states/:id` | Obtener estado | Todos |
| POST | `/api/electoral/states` | Crear estado | ADMIN |
| PUT | `/api/electoral/states/:id` | Actualizar | ADMIN |
| DELETE | `/api/electoral/states/:id` | Eliminar | ADMIN |
| GET | `/api/electoral/states/:id/delegations` | Delegaciones del estado | Todos |

---

### Delegaciones: `/api/electoral/delegations`

| Método | Ruta | Descripción | Permisos |
|--------|------|-------------|----------|
| GET | `/api/electoral/delegations` | Listar delegaciones | Todos |
| GET | `/api/electoral/delegations/:id` | Obtener delegación | Todos |
| POST | `/api/electoral/delegations` | Crear delegación | ADMIN, CAPTURISTA |
| PUT | `/api/electoral/delegations/:id` | Actualizar | ADMIN, CAPTURISTA |
| DELETE | `/api/electoral/delegations/:id` | Eliminar | ADMIN |
| GET | `/api/electoral/delegations/:id/colonies` | Colonias de la delegación | Todos |

---

### Colonias: `/api/electoral/colonies`

| Método | Ruta | Descripción | Permisos |
|--------|------|-------------|----------|
| GET | `/api/electoral/colonies` | Listar colonias | Todos |
| GET | `/api/electoral/colonies/:id` | Obtener colonia | Todos |
| POST | `/api/electoral/colonies` | Crear colonia | ADMIN, CAPTURISTA |
| PUT | `/api/electoral/colonies/:id` | Actualizar | ADMIN, CAPTURISTA |
| DELETE | `/api/electoral/colonies/:id` | Eliminar | ADMIN |

---

### Familias: `/api/electoral/families`

| Método | Ruta | Descripción | Permisos |
|--------|------|-------------|----------|
| GET | `/api/electoral/families` | Listar familias | Todos |
| GET | `/api/electoral/families/:id` | Obtener familia | Todos |
| GET | `/api/electoral/families/:id/stats` | Estadísticas | Todos |
| POST | `/api/electoral/families` | Crear familia | ADMIN, CAPTURISTA |
| PUT | `/api/electoral/families/:id` | Actualizar | ADMIN, CAPTURISTA |
| DELETE | `/api/electoral/families/:id` | Eliminar | ADMIN |

---

### Personas: `/api/electoral/persons`

| Método | Ruta | Descripción | Permisos |
|--------|------|-------------|----------|
| GET | `/api/electoral/persons` | Listar personas | Todos |
| GET | `/api/electoral/persons/stats` | Estadísticas | Todos |
| GET | `/api/electoral/persons/:id` | Obtener persona | Todos |
| GET | `/api/electoral/search/curp/:curp` | Buscar por CURP | Todos |
| POST | `/api/electoral/persons` | Crear persona | ADMIN, CAPTURISTA |
| PUT | `/api/electoral/persons/:id` | Actualizar | ADMIN, CAPTURISTA |
| DELETE | `/api/electoral/persons/:id` | Eliminar | ADMIN |

---

## 🔧 ACTUALIZACIÓN NECESARIA

### Antes (INCORRECTO):
```javascript
// ❌ Esto NO funciona
await api.get('/states')
// → http://localhost:3002/api/states (404 Not Found)
```

### Después (CORRECTO):
```javascript
// ✅ Esto funciona
await api.get('/electoral/states')
// → http://localhost:3002/api/electoral/states (200 OK)
```

---

## 📝 EJEMPLOS DE USO

### Desde el navegador/Postman:

```bash
# Health check
GET http://localhost:3002/health

# Login
POST http://localhost:3002/api/auth/login
Body: { "email": "test@test.com", "password": "123456" }

# Obtener estados (con token)
GET http://localhost:3002/api/electoral/states
Headers: { "Authorization": "Bearer <token>" }

# Obtener personas
GET http://localhost:3002/api/electoral/persons
Headers: { "Authorization": "Bearer <token>" }

# Buscar por CURP
GET http://localhost:3002/api/electoral/search/curp/PEMJ900120HDFRNN09
Headers: { "Authorization": "Bearer <token>" }

# Dashboard stats
GET http://localhost:3002/api/electoral/stats
Headers: { "Authorization": "Bearer <token>" }
```

---

## 🔒 AUTENTICACIÓN

**TODAS las rutas de `/api/electoral/*` requieren autenticación** (token JWT).

### Flujo:
1. Login: `POST /api/auth/login` → Obtener token
2. Usar token en header: `Authorization: Bearer <token>`
3. Acceder a rutas protegidas

---

## ⚠️ ERRORES COMUNES

### Error 404 - Not Found

**Causa:** Ruta incorrecta, falta `/electoral`

```javascript
// ❌ INCORRECTO
GET /api/states

// ✅ CORRECTO
GET /api/electoral/states
```

### Error 401 - Unauthorized

**Causa:** Falta token o token inválido

**Solución:**
1. Hacer login para obtener token
2. Agregar header: `Authorization: Bearer <token>`

### Error 403 - Forbidden

**Causa:** No tiene permisos para esa acción

**Solución:**
- Usar usuario con rol ADMIN para operaciones de escritura
- Credenciales: `test@test.com` / `123456` (ADMIN)

---

## 📊 RESUMEN DE PREFIJOS

| Prefijo | Descripción |
|---------|-------------|
| `/health` | Health check (sin auth) |
| `/api/auth/*` | Autenticación (sin auth) |
| `/api/electoral/*` | Todas las operaciones CRUD (requiere auth) |
| `/api/cache/stats` | Cache stats (solo dev) |

---

**Fecha:** 2025-11-17
**Estado:** ✅ DOCUMENTADO
**Acción requerida:** Actualizar servicios de API en frontend
