# 🔐 Sistema Electoral - Backend

Backend con Node.js, Express y MySQL con **cifrado de 5 capas** y protección anti-hackers.

## 🚀 Instalación

```bash
cd backend
npm install
```

## ⚙️ Configuración

1. Copiar `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configurar variables de entorno en `.env`:
   - Credenciales de base de datos
   - Claves de cifrado (generar claves únicas)
   - JWT secrets
   - Configuración de seguridad

3. Importar base de datos:
```bash
mysql -u root -p < ../dbserver_completo_32_estados.sql
```

## 🏃 Ejecución

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

**Con Clustering:**
```bash
npm run cluster
```

## 🔒 Seguridad

- ✅ Cifrado de 5 capas para datos sensibles
- ✅ Rate limiting avanzado
- ✅ Bloqueo automático de IPs sospechosas
- ✅ Detección de ataques (SQL injection, XSS, etc.)
- ✅ JWT con refresh tokens
- ✅ Auditoría completa de accesos

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario actual

Ver documentación completa en el archivo principal del proyecto.

## 🛡️ Sistema de Cifrado

El sistema utiliza 5 capas de cifrado:
1. XOR con salt rotativo
2. Camellia-256-CBC
3. ChaCha20
4. AES-256-CBC
5. AES-256-GCM (con autenticación)

## 📊 Monitoreo

- Health check: `GET /health`
- Cache stats: `GET /api/cache/stats` (solo desarrollo)
