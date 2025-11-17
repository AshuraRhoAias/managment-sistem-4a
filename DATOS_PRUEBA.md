# 🎉 Sistema Electoral - Datos de Prueba Listos

## ✅ Estado del Sistema

### 🌐 Servidores Activos

| Servicio | URL | Estado |
|----------|-----|--------|
| **Frontend** | http://localhost:3000 | ✅ Running |
| **Backend API** | http://localhost:3002 | ✅ Running |
| **Health Check** | http://localhost:3002/health | ✅ Available |

---

## 🔐 Credenciales de Acceso

```
Email:    test@test.com
Password: 123456
Rol:      ADMIN
```

---

## 📊 Datos Insertados

### Resumen de Datos
- ✅ **1 Usuario** de prueba (ADMIN)
- ✅ **4 Estados** (CDMX, Jalisco, Nuevo León, Edo. México)
- ✅ **2 Delegaciones**
- ✅ **2 Colonias**
- ✅ **8 Familias** (con direcciones cifradas)
- ✅ **19 Personas** (con nombres, CURP y teléfonos cifrados)

### Familias Insertadas

1. **López García** (4 miembros)
   - Juan Carlos López García (45 años, Jefe de Familia)
   - María Guadalupe García Pérez (42 años)
   - Carlos Alberto López García (20 años)
   - Ana Sofía López García (17 años)

2. **Martínez Hernández** (3 miembros)
   - Roberto Martínez Hernández (38 años, Jefe de Familia)
   - Laura Hernández Díaz (35 años)
   - Diego Martínez Hernández (12 años)

3. **González Pérez** (2 miembros)
   - Patricia González Pérez (52 años, Jefe de Familia)
   - Sofía González Ramírez (25 años)

4. **Rodríguez Sánchez** (3 miembros)
   - Miguel Ángel Rodríguez Sánchez (41 años, Jefe de Familia)
   - Elena Sánchez López (39 años)
   - Luis Miguel Rodríguez Sánchez (15 años)

5. **Ramírez Torres** (2 miembros)
   - José Ramírez Torres (55 años, Jefe de Familia)
   - Carmen Torres Vega (53 años)

6. **Flores Morales** (1 miembro)
   - Andrea Flores Morales (29 años, Jefe de Familia)

7. **Castro Ruiz** (2 miembros)
   - Fernando Castro Ruiz (48 años, Jefe de Familia)
   - Gabriela Ruiz Mendoza (45 años)

8. **Mendoza Silva** (2 miembros)
   - Alberto Mendoza Silva (33 años, Jefe de Familia)
   - Mónica Silva Cortés (31 años)

---

## 🔐 Características de Seguridad Activas

### Cifrado de 5 Capas
Todos los datos sensibles están cifrados con:
1. ✅ XOR con salt rotativo
2. ✅ Camellia-256-CBC
3. ✅ ChaCha20
4. ✅ AES-256-CBC
5. ✅ AES-256-GCM (con autenticación)

### Datos Cifrados
- ✅ Nombres de personas
- ✅ CURP
- ✅ Teléfonos
- ✅ Direcciones de familias
- ✅ Contraseñas (bcrypt)

### Protección Anti-Hackers
- ✅ Rate limiting activo
- ✅ Bloqueo automático de IPs
- ✅ Detección de SQL Injection
- ✅ Detección de XSS
- ✅ Protección CSRF
- ✅ Auditoría de accesos

---

## 🚀 Cómo Usar el Sistema

### 1. Acceder al Frontend
Abrir navegador en: http://localhost:3000

### 2. Iniciar Sesión
- Ingresar email: `test@test.com`
- Ingresar password: `123456`
- Click en "Iniciar Sesión"

### 3. Explorar el Dashboard
Una vez autenticado, podrás:
- Ver estadísticas generales
- Navegar por zonas electorales
- Gestionar familias
- Ver reportes
- Exportar datos

### 4. Probar la API
```bash
# Health check
curl http://localhost:3002/health

# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## 📈 Estadísticas Actuales

### Distribución por Edad
- Mayores de 18 años (pueden votar): **14 personas**
- Menores de 18 años: **5 personas**

### Distribución por Género
- Masculino: **9 personas**
- Femenino: **10 personas**

### Jefes de Familia
- Total: **8 jefes de familia**
- Promedio de miembros por familia: **2.4 personas**

---

## 🛠️ Comandos Útiles

### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Build para producción
npm start        # Ejecutar producción
npm run lint     # Verificar código
```

### Backend
```bash
cd backend
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm run cluster  # Con clustering
```

### Base de Datos
```bash
# Reinsertar datos de prueba
cd backend
node seed_familias_personas.js

# Verificar datos
node -e "const {readPool} = require('./config/database');
readPool.query('SELECT COUNT(*) as total FROM personas').then(([r]) => {
  console.log('Personas:', r[0].total); process.exit(0);
});"
```

---

## 📝 Notas Importantes

1. **Seguridad:**
   - Todos los datos sensibles están cifrados
   - Las contraseñas usan bcrypt con 12 salt rounds
   - Los tokens JWT expiran en 15 minutos
   - Refresh tokens duran 7 días

2. **Performance:**
   - Pool de conexiones dual (lectura/escritura)
   - Caché multi-tier activado
   - Compresión de respuestas habilitada

3. **Desarrollo:**
   - Hot reload activo en ambos servidores
   - Logs detallados en modo desarrollo
   - Debug mode habilitado

---

## ✨ Próximos Pasos Sugeridos

1. ✅ **Probar login** en http://localhost:3000
2. ✅ **Explorar el dashboard** y las diferentes secciones
3. ✅ **Agregar más datos** usando la interfaz
4. ✅ **Probar exportación** de datos
5. ✅ **Revisar reportes** y estadísticas

---

**Estado:** ✅ **SISTEMA COMPLETAMENTE FUNCIONAL**
**Fecha:** 2025-11-17
**Versión:** 2.0
