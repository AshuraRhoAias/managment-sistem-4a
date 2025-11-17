# 🔌 SERVICIOS DE API IMPLEMENTADOS

Sistema completo de servicios de API para el frontend React con axios, interceptors y manejo de errores.

---

## ✅ ARCHIVOS CREADOS

### 📁 Estructura de Servicios

```
src/
├── services/
│   ├── api.js                    # Cliente axios con interceptors
│   ├── authService.js            # Servicio de autenticación
│   ├── statesService.js          # Servicio de estados
│   ├── personsService.js         # Servicio de personas
│   └── reportsService.js         # Servicio de reportes
│
├── context/
│   └── AuthContext.js            # Context de autenticación global
│
├── components/
│   ├── common/                   # Componentes reutilizables
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Table.jsx
│   │   └── FileDownload.jsx
│   ├── forms/                    # Formularios
│   └── layout/                   # Layout components
```

---

## 🔧 SERVICIOS IMPLEMENTADOS

### 1. **api.js** - Cliente HTTP Base

#### Características:
- ✅ Configuración base de axios
- ✅ Request interceptor (agrega token automáticamente)
- ✅ Response interceptor (manejo de errores y refresh token)
- ✅ Renovación automática de tokens expirados
- ✅ Cola de peticiones durante renovación
- ✅ Redirección automática al login si falla auth
- ✅ Logs de desarrollo

#### Uso:
```javascript
import api from '../services/api';

// GET
const response = await api.get('/endpoint');

// POST
const response = await api.post('/endpoint', data);

// PUT
const response = await api.put('/endpoint/:id', data);

// DELETE
const response = await api.delete('/endpoint/:id');
```

---

### 2. **authService.js** - Autenticación

#### Métodos disponibles:

| Método | Descripción |
|--------|-------------|
| `login(email, password)` | Iniciar sesión |
| `logout()` | Cerrar sesión |
| `getCurrentUser()` | Obtener usuario actual |
| `changePassword(oldPass, newPass)` | Cambiar contraseña |
| `refreshToken(refreshToken)` | Renovar token |
| `getSessions()` | Obtener sesiones activas |

#### Ejemplo de uso:
```javascript
import authService from '../services/authService';

// Login
const response = await authService.login('usuario@email.com', 'password123');
console.log(response); // { token, refreshToken, user }

// Obtener usuario actual
const currentUser = await authService.getCurrentUser();
console.log(currentUser.data); // { id, nombre, email, rol }

// Cambiar contraseña
await authService.changePassword('oldPass', 'newPass');
```

---

### 3. **statesService.js** - Estados

#### Métodos disponibles:

| Método | Descripción |
|--------|-------------|
| `getAll(params)` | Listar estados con paginación |
| `getById(id)` | Obtener estado por ID |
| `create(data)` | Crear nuevo estado |
| `update(id, data)` | Actualizar estado |
| `delete(id)` | Eliminar estado |
| `search(query)` | Buscar estados |
| `getStats(id)` | Obtener estadísticas |

#### Ejemplo de uso:
```javascript
import statesService from '../services/statesService';

// Listar estados
const states = await statesService.getAll({ page: 1, limit: 20 });

// Buscar
const results = await statesService.search('jalisco');

// Crear
const newState = await statesService.create({
  codigo: 'JAL',
  nombre: 'Jalisco'
});

// Estadísticas
const stats = await statesService.getStats(1);
```

---

### 4. **personsService.js** - Personas

#### Métodos disponibles:

| Método | Descripción |
|--------|-------------|
| `getAll(params)` | Listar personas |
| `getById(id)` | Obtener persona por ID |
| `search(query, params)` | Buscar (cifrado) |
| `getByFamily(familyId)` | Por familia |
| `create(data)` | Crear persona |
| `createBatch(persons)` | Crear múltiples |
| `update(id, data)` | Actualizar |
| `delete(id)` | Eliminar |

#### Ejemplo de uso:
```javascript
import personsService from '../services/personsService';

// Buscar personas (búsqueda cifrada)
const results = await personsService.search('María', {
  page: 1,
  limit: 50
});

// Crear persona
const newPerson = await personsService.create({
  id_familia: 1,
  nombre: 'Juan Pérez',
  curp: 'PEMJ900120HDFRNN09',
  edad: 34,
  genero: 'MASCULINO'
});

// Crear múltiples personas
await personsService.createBatch([
  { nombre: 'Persona 1', ... },
  { nombre: 'Persona 2', ... }
]);

// Por familia
const familyMembers = await personsService.getByFamily(1);
```

---

### 5. **reportsService.js** - Reportes

#### Métodos disponibles:

| Método | Descripción |
|--------|-------------|
| `getGeneral()` | Estadísticas generales |
| `getCoverage()` | Cobertura territorial |
| `getVoters()` | Analytics de votantes |
| `getByState(stateId)` | Reporte por estado |
| `getByDelegation(delId)` | Reporte por delegación |
| `export(type, filters)` | Exportar datos |
| `getDashboard()` | Dashboard electoral |

#### Ejemplo de uso:
```javascript
import reportsService from '../services/reportsService';

// Estadísticas generales
const stats = await reportsService.getGeneral();
console.log(stats.data);
// {
//   resumen: { total_estados: 32, total_personas: 50000, ... },
//   votantes: { total: 45000, con_ine_vigente: 42000, ... }
// }

// Exportar datos
const blob = await reportsService.export('csv', {
  estado_id: 1,
  fecha_inicio: '2024-01-01'
});

// Descargar archivo
const url = window.URL.createObjectURL(blob.data);
const link = document.createElement('a');
link.href = url;
link.download = 'reporte.csv';
link.click();
```

---

## 🔐 AuthContext - Autenticación Global

### Características:
- ✅ Estado global de autenticación
- ✅ Login/Logout
- ✅ Verificación de permisos
- ✅ Verificación de roles
- ✅ Cambio de contraseña
- ✅ Recarga automática del usuario

### Uso en componentes:

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const {
    user,              // Usuario actual
    isAuthenticated,   // Si está autenticado
    loading,           // Estado de carga
    login,             // Función de login
    logout,            // Función de logout
    hasPermission,     // Verificar permiso
    hasRole            // Verificar rol
  } = useAuth();

  // Login
  const handleLogin = async () => {
    const result = await login('email@test.com', 'password');
    if (result.success) {
      console.log('Login exitoso', result.user);
    } else {
      console.error('Error:', result.message);
    }
  };

  // Verificar permisos
  if (hasPermission('delete')) {
    // Usuario tiene permiso de eliminar
  }

  // Verificar rol
  if (hasRole('ADMIN')) {
    // Usuario es admin
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user?.nombre}</p>
      ) : (
        <button onClick={handleLogin}>Iniciar Sesión</button>
      )}
    </div>
  );
}
```

### Integrar en App:

```javascript
// app/layout.jsx o _app.js
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 🔄 INTERCEPTORS

### Request Interceptor

**Funcionalidad:**
1. Obtiene token de localStorage
2. Agrega header `Authorization: Bearer <token>`
3. Logs en desarrollo

**Código:**
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor

**Funcionalidad:**
1. Detecta errores 401 (no autorizado)
2. Intenta renovar el token con refresh token
3. Re-intenta la petición original
4. Maneja cola de peticiones durante renovación
5. Redirige al login si falla la renovación

**Flujo:**
```
Petición → Error 401 → ¿Está renovando?
                         ├─ Sí → Agregar a cola
                         └─ No → Renovar token
                                  ├─ Éxito → Re-intentar petición
                                  └─ Error → Logout y redirect
```

---

## 🎯 CONFIGURACIÓN

### Variables de entorno (.env):

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

### En el código:

```javascript
// api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
```

---

## 📦 DEPENDENCIAS NECESARIAS

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "next": "^14.0.0"
  }
}
```

Instalar:
```bash
npm install axios
```

---

## 🧪 TESTING

### Ejemplo de test con Jest:

```javascript
import authService from '../services/authService';
import api from '../services/api';

jest.mock('../services/api');

describe('authService', () => {
  it('should login successfully', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        user: { id: 1, nombre: 'Test' }
      }
    };

    api.post.mockResolvedValue(mockResponse);

    const result = await authService.login('test@test.com', 'password');

    expect(result.token).toBe('test-token');
    expect(result.user.nombre).toBe('Test');
  });
});
```

---

## 🚀 ESTADO ACTUAL

### ✅ Completado:
- [x] Cliente axios base con configuración
- [x] Request interceptor con tokens
- [x] Response interceptor con refresh token
- [x] Servicio de autenticación completo
- [x] Servicio de estados completo
- [x] Servicio de personas completo
- [x] Servicio de reportes completo
- [x] Context de autenticación global
- [x] Manejo de errores centralizado
- [x] Cola de peticiones durante renovación
- [x] Logs de desarrollo
- [x] Componentes reutilizables organizados

### 🎯 Próximos pasos:
- [ ] Servicios adicionales (delegaciones, colonias, familias, usuarios)
- [ ] Tests unitarios para cada servicio
- [ ] Documentación de tipos con TypeScript
- [ ] Caché de peticiones
- [ ] Retry automático en errores de red
- [ ] WebSockets para actualizaciones en tiempo real

---

## 📊 SERVIDORES ACTIVOS

### Backend:
- **URL:** http://localhost:3002
- **API:** http://localhost:3002/api
- **Health:** http://localhost:3002/health
- **Estado:** ✅ ACTIVO

### Frontend:
- **URL:** http://localhost:3000
- **Estado:** ✅ ACTIVO

---

## 🔗 ENDPOINTS DISPONIBLES

Ver documentación completa en: `API_ELECTORAL_DOCUMENTATION.md`

### Principales:
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
GET    /api/states
GET    /api/persons/search?q=
POST   /api/persons
GET    /api/reports/general
GET    /api/reports/export?type=csv
```

---

## 📝 NOTAS IMPORTANTES

1. **Tokens:** Se almacenan en `localStorage`
2. **Renovación automática:** Cuando un token expira (15 min)
3. **Refresh token:** Válido por 7 días
4. **Búsqueda cifrada:** Los datos se descifran en el servidor
5. **Exportación:** Soporta CSV, Excel, PDF, JSON
6. **Rate limiting:** Backend tiene límites por endpoint
7. **Seguridad:** Todos los endpoints requieren autenticación (excepto login)

---

**Fecha:** 2025-11-17
**Versión:** 1.0
**Estado:** ✅ IMPLEMENTADO Y FUNCIONANDO
