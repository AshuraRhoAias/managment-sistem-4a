# 🔗 CONFIGURACIÓN DE RUTAS API

## ✅ CONFIGURACIÓN ACTUAL

### Variables de Entorno (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

Esta variable define la **URL base completa** del backend API.

---

## 📁 ARCHIVOS DE CONFIGURACIÓN

### 1. **apiClient.jsx** (Fetch API)

📍 Ubicación: `src/Utils/Login/apiClient.jsx`

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

// Uso interno:
const response = await fetch(`${API_URL}${endpoint}`, config)

// Ejemplo:
// API_URL = 'http://localhost:3002'
// endpoint = '/api/auth/login'
// URL final = 'http://localhost:3002/api/auth/login' ✅
```

**⚠️ IMPORTANTE:** En `apiClient.jsx`, el `API_URL` NO incluye `/api` al final, por lo que los endpoints deben incluirlo:

```javascript
// ✅ CORRECTO
async login(email, password) {
    return this.request('/api/auth/login', { ... })
    // URL final: http://localhost:3002/api/auth/login
}

// ❌ INCORRECTO
async login(email, password) {
    return this.request('/auth/login', { ... })
    // URL final: http://localhost:3002/auth/login (falta /api)
}
```

---

### 2. **api.js** (Axios)

📍 Ubicación: `src/services/api.js`

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL, // Ya incluye /api
  // ...
});

// Uso:
await api.get('/states')
// URL final: http://localhost:3002/api/states ✅
```

**✅ CORRECTO:** En `api.js`, el `baseURL` YA incluye `/api`, por lo que las rutas NO deben incluirlo:

```javascript
// ✅ CORRECTO
import api from './api';

await api.get('/states')
// URL final: http://localhost:3002/api/states

await api.post('/persons', data)
// URL final: http://localhost:3002/api/persons

// ❌ INCORRECTO
await api.get('/api/states')
// URL final: http://localhost:3002/api/api/states (duplicado)
```

---

## 🔄 DIFERENCIAS ENTRE LOS DOS CLIENTES

### apiClient.jsx (Fetch)
```javascript
API_URL = 'http://localhost:3002'  // SIN /api

// Las rutas DEBEN incluir /api
this.request('/api/auth/login', { ... })
// → http://localhost:3002/api/auth/login ✅
```

### api.js (Axios)
```javascript
baseURL = 'http://localhost:3002/api'  // CON /api

// Las rutas NO deben incluir /api
api.get('/states')
// → http://localhost:3002/api/states ✅
```

---

## 📊 TABLA DE RUTAS

### Con apiClient.jsx (Fetch):

| Método | Ruta en código | URL Final |
|--------|---------------|-----------|
| `login()` | `/api/auth/login` | `http://localhost:3002/api/auth/login` |
| `register()` | `/api/auth/register` | `http://localhost:3002/api/auth/register` |
| `verifyToken()` | `/api/auth/verify` | `http://localhost:3002/api/auth/verify` |

### Con api.js (Axios):

| Servicio | Método | Ruta en código | URL Final |
|----------|--------|---------------|-----------|
| authService | `login()` | `/auth/login` | `http://localhost:3002/api/auth/login` |
| statesService | `getAll()` | `/states` | `http://localhost:3002/api/states` |
| personsService | `search()` | `/persons/search` | `http://localhost:3002/api/persons/search` |
| reportsService | `export()` | `/reports/export` | `http://localhost:3002/api/reports/export` |

---

## 🧪 PRUEBAS DE CONEXIÓN

### 1. Probar Backend Directamente:

```bash
# Health check
curl http://localhost:3002/health

# Login (sin /api porque el endpoint es /health, no /api/health)
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### 2. Probar desde Frontend (apiClient.jsx):

```javascript
import apiClient from '@/Utils/Login/apiClient';

// Login
const result = await apiClient.login('test@test.com', 'test123');
console.log(result);
// Petición a: http://localhost:3002/api/auth/login
```

### 3. Probar desde Frontend (api.js):

```javascript
import authService from '@/services/authService';

// Login
const result = await authService.login('test@test.com', 'test123');
console.log(result);
// Petición a: http://localhost:3002/api/auth/login
```

---

## ⚙️ CONFIGURACIÓN PARA DIFERENTES ENTORNOS

### Desarrollo Local:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

### Desarrollo con IP Local:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:3002/api
```

### Producción:
```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
```

### Staging:
```env
NEXT_PUBLIC_API_URL=https://api-staging.tudominio.com/api
```

---

## 🔍 DEBUGGING

### Ver las URLs generadas:

#### En apiClient.jsx:
```javascript
async request(endpoint, options = {}) {
    const fullUrl = `${API_URL}${endpoint}`;
    console.log('🌐 URL:', fullUrl); // Agregar este log
    const response = await fetch(fullUrl, config);
    // ...
}
```

#### En api.js (Axios):
Los logs ya están implementados en el interceptor:
```javascript
// En desarrollo, verás en consola:
// 📤 POST /auth/login { email: '...', password: '...' }
```

### Verificar variable de entorno:

```javascript
console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL);
// Debe mostrar: http://localhost:3002/api
```

---

## 🚨 PROBLEMAS COMUNES

### 1. Error 404 - Not Found

**Causa:** URL incorrecta, falta `/api` o está duplicado.

**Solución:**
```javascript
// ❌ INCORRECTO con api.js
await api.get('/api/states')
// URL: http://localhost:3002/api/api/states (duplicado)

// ✅ CORRECTO con api.js
await api.get('/states')
// URL: http://localhost:3002/api/states
```

### 2. Error de CORS

**Causa:** Backend no permite el origen del frontend.

**Solución:** Verificar configuración de CORS en backend:
```javascript
// backend/server.js
const corsOptions = {
  origin: 'http://localhost:3000', // Permitir frontend
  credentials: true,
};
app.use(cors(corsOptions));
```

### 3. Variable de entorno no se carga

**Causa:** Next.js requiere `NEXT_PUBLIC_` para variables del cliente.

**Solución:**
```env
# ❌ INCORRECTO
API_URL=http://localhost:3002/api

# ✅ CORRECTO
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

Luego reiniciar el servidor:
```bash
npm run dev
```

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [x] Variable `NEXT_PUBLIC_API_URL` en `.env`
- [x] Valor incluye protocolo (`http://` o `https://`)
- [x] Valor incluye puerto si es necesario (`:3002`)
- [x] Valor incluye `/api` al final
- [x] Backend escuchando en el puerto correcto
- [x] CORS configurado en backend
- [x] Servidor reiniciado después de cambiar `.env`

---

## 📝 RESUMEN

### ✅ CONFIGURACIÓN CORRECTA ACTUAL:

```env
# .env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

```javascript
// apiClient.jsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
// Nota: Si usa la env, ya tiene /api incluido

// api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
```

### ✅ USO CORRECTO:

```javascript
// Con apiClient.jsx
await apiClient.login(email, password)
// → POST http://localhost:3002/api/auth/login

// Con api.js
await api.get('/states')
// → GET http://localhost:3002/api/states
```

---

**Estado:** ✅ CONFIGURADO CORRECTAMENTE
**Última revisión:** 2025-11-17
