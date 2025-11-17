# 🗳️ SISTEMA ELECTORAL CON CIFRADO DE 5 CAPAS

Sistema completo de gestión electoral desarrollado con **React + Node.js**, con seguridad máxima mediante **cifrado de 5 capas** y protección anti-hackers avanzada.

## 📋 Índice

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Seguridad](#seguridad)
- [Despliegue](#despliegue)

---

## ✨ Características

### 🔐 Seguridad Avanzada

- **Cifrado de 5 capas** para datos sensibles:
  1. XOR con salt rotativo
  2. Camellia-256-CBC
  3. ChaCha20
  4. AES-256-CBC
  5. AES-256-GCM (con autenticación)

- **Protección Anti-Hackers:**
  - Bloqueo automático de IPs por intentos fallidos
  - Detección de ataques SQL Injection, XSS, CSRF
  - Rate limiting avanzado por rol
  - Detección de actividad sospechosa
  - Auditoría completa de accesos

- **Autenticación:**
  - JWT con refresh tokens
  - Sesiones persistentes en base de datos
  - Revocación de tokens en tiempo real
  - Multi-sesión por usuario

### 📊 Funcionalidades

- ✅ Gestión de estados, delegaciones y colonias
- ✅ Registro de familias y personas
- ✅ Búsqueda cifrada en tiempo real
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Exportación a CSV, Excel, PDF, JSON
- ✅ Sistema de roles (Admin, Coordinador, Capturista)
- ✅ Auditoría completa de operaciones
- ✅ Clustering para alta disponibilidad

### ⚡ Rendimiento

- Pool de conexiones dual (lectura/escritura)
- Caché multi-tier con Redis-like
- Paginación eficiente
- Lazy loading de datos
- Compresión de respuestas
- CDN ready

---

## 🏗️ Arquitectura

```
managment-sistem-4a/
├── backend/                 # Servidor Node.js
│   ├── config/             # Configuraciones (DB, Cache, Constants)
│   ├── controllers/        # Controladores de rutas
│   ├── middleware/         # Middleware (Auth, Security, RateLimit)
│   ├── routes/             # Definición de rutas
│   ├── services/           # Lógica de negocio
│   │   └── base/          # Servicios base (Crypto, BaseService)
│   ├── utils/             # Utilidades
│   ├── logs/              # Logs del sistema
│   ├── server.js          # Servidor principal
│   ├── cluster.js         # Clustering
│   └── package.json
│
├── src/                    # Frontend React
│   ├── components/        # Componentes reutilizables
│   │   ├── common/       # Button, Input, Table, Modal, etc.
│   │   ├── forms/        # Formularios
│   │   └── layout/       # Layout components
│   ├── pages/            # Páginas
│   │   ├── auth/        # Login, Register
│   │   ├── dashboard/   # Dashboard
│   │   ├── states/      # Gestión de estados
│   │   ├── persons/     # Gestión de personas
│   │   └── reports/     # Reportes
│   ├── services/        # API services (axios)
│   ├── context/         # Context API (Auth)
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilidades
│   ├── assets/          # Estilos, imágenes
│   ├── App.jsx          # App principal
│   └── main.jsx         # Entry point
│
└── dbserver_completo_32_estados.sql  # Base de datos
```

---

## 🚀 Instalación

### Requisitos

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm >= 9.0.0

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd managment-sistem-4a
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ..
npm install
```

### 4. Configurar base de datos

```bash
# Crear base de datos
mysql -u root -p

# Importar estructura y datos
mysql -u root -p < dbserver_completo_32_estados.sql
```

---

## ⚙️ Configuración

### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=dbserverine

# JWT
JWT_SECRET=tu_secret_key_muy_larga_y_segura
JWT_REFRESH_SECRET=tu_refresh_secret_key_muy_larga

# Cifrado (GENERAR CLAVES ÚNICAS)
ENCRYPTION_KEY_LAYER1=generar_clave_hex_64_caracteres
ENCRYPTION_KEY_LAYER2=generar_clave_hex_64_caracteres
ENCRYPTION_KEY_LAYER3=generar_clave_hex_64_caracteres
ENCRYPTION_KEY_LAYER4=generar_clave_hex_64_caracteres
ENCRYPTION_KEY_LAYER5=generar_clave_hex_64_caracteres
ENCRYPTION_SALT=tu_salt_aleatorio_minimo_32_caracteres

# Otros
PORT=3002
NODE_ENV=development
```

**⚠️ IMPORTANTE:** Generar claves únicas de cifrado:

```bash
# Generar clave hex de 64 caracteres
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (.env)

```bash
cp .env.example .env
```

Editar `.env`:

```env
VITE_API_URL=http://localhost:3002/api
VITE_ENV=development
```

---

## 🏃 Uso

### Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Abrir navegador en: `http://localhost:5173`

### Producción

**Backend:**
```bash
cd backend
npm run cluster  # Con clustering
# o
npm start        # Sin clustering
```

**Frontend:**
```bash
npm run build
npm run preview
```

---

## 📡 API Endpoints

### Autenticación

```http
POST   /api/auth/login          # Login
POST   /api/auth/logout         # Logout
POST   /api/auth/refresh        # Renovar token
GET    /api/auth/me             # Usuario actual
PUT    /api/auth/change-password # Cambiar contraseña
```

### Estados

```http
GET    /api/states              # Listar estados
GET    /api/states/:id          # Obtener estado
POST   /api/states              # Crear estado
PUT    /api/states/:id          # Actualizar estado
DELETE /api/states/:id          # Eliminar estado
GET    /api/states/search?q=    # Buscar estados
```

### Delegaciones

```http
GET    /api/delegations                    # Listar delegaciones
GET    /api/delegations/state/:stateId    # Por estado
GET    /api/delegations/:id               # Obtener delegación
POST   /api/delegations                   # Crear delegación
PUT    /api/delegations/:id               # Actualizar
DELETE /api/delegations/:id               # Eliminar
```

### Colonias

```http
GET    /api/colonies                           # Listar colonias
GET    /api/colonies/delegation/:delegationId # Por delegación
GET    /api/colonies/:id                      # Obtener colonia
POST   /api/colonies                          # Crear
PUT    /api/colonies/:id                      # Actualizar
DELETE /api/colonies/:id                      # Eliminar
```

### Familias

```http
GET    /api/families                    # Listar familias
GET    /api/families/colony/:colonyId  # Por colonia
GET    /api/families/:id               # Obtener familia
POST   /api/families                   # Crear
PUT    /api/families/:id               # Actualizar
DELETE /api/families/:id               # Eliminar
```

### Personas

```http
GET    /api/persons                     # Listar personas
GET    /api/persons/search?q=          # Buscar (cifrado)
GET    /api/persons/family/:familyId   # Por familia
GET    /api/persons/:id                # Obtener persona
POST   /api/persons                    # Crear
POST   /api/persons/batch              # Crear múltiples
PUT    /api/persons/:id                # Actualizar
DELETE /api/persons/:id                # Eliminar
```

### Reportes

```http
GET    /api/reports/general                # Estadísticas generales
GET    /api/reports/coverage              # Cobertura territorial
GET    /api/reports/voters                # Analytics de votantes
GET    /api/reports/state/:stateId        # Reporte por estado
GET    /api/reports/export?type=csv       # Exportar (csv, xlsx, pdf, json)
```

---

## 🛡️ Seguridad

### Cifrado de Datos

**Campos cifrados automáticamente:**
- Nombres de personas
- CURP
- Teléfonos
- Direcciones de familias
- Contraseñas (bcrypt)

### Rate Limiting

| Endpoint | Límite |
|----------|--------|
| Login | 5 req/15min |
| API Read | 100 req/min |
| API Write | 30 req/min |
| Search | 50 req/min |
| Export | 10 req/5min |

### Bloqueo de IPs

- **Intentos fallidos:** 5 intentos = bloqueo 30 min
- **Actividad sospechosa:** Score >= 30 = bloqueo 2 horas
- **Lista negra:** Bloqueo permanente por IP

### Detección de Ataques

- SQL Injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Path Traversal
- Command Injection
- User-Agent sospechosos (sqlmap, nikto, etc.)

---

## 🚀 Despliegue

### Con Docker (Recomendado)

```bash
# Construir imagen
docker build -t electoral-system .

# Ejecutar contenedor
docker run -d -p 3002:3002 --env-file .env electoral-system
```

### Con PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
cd backend
pm2 start cluster.js --name electoral-backend

# Guardar configuración
pm2 save
pm2 startup
```

### Nginx (Frontend)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /var/www/electoral-system/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📝 Credenciales de Prueba

**⚠️ CAMBIAR EN PRODUCCIÓN**

```
Email: admin@ejemplo.com
Password: admin123
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

---

## 📄 Licencia

MIT License - Ver `LICENSE` para más detalles

---

## 🆘 Soporte

Para problemas o preguntas, abrir un issue en GitHub.

---

**Desarrollado con ❤️ para sistemas electorales seguros**
