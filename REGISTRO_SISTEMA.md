# 📋 Sistema de Registro con Frase Secreta

## 🔐 Información de Seguridad

Este sistema utiliza una **frase secreta** obligatoria para crear nuevos usuarios, garantizando que solo personal autorizado pueda registrarse.

### Frase Secreta de Registro

```
AshuraRhoAiasTekkenKaioh
```

**⚠️ IMPORTANTE:** Sin esta frase exacta, es **IMPOSIBLE** crear un registro de usuario en el sistema.

## 📝 Proceso de Registro

### Paso 1: Acceder al Formulario de Registro

1. Navega a la página de inicio de sesión
2. Haz clic en el enlace "Registrarse" en la parte inferior
3. Se mostrará el formulario de registro

### Paso 2: Completar el Formulario

El formulario de registro requiere los siguientes campos:

| Campo | Descripción | Requerido |
|-------|-------------|-----------|
| Nombre Completo | Tu nombre completo | ✅ Sí |
| Correo Electrónico | Email válido y único | ✅ Sí |
| Contraseña | Mínimo 8 caracteres | ✅ Sí |
| Confirmar Contraseña | Debe coincidir con la contraseña | ✅ Sí |
| **Frase Secreta** | `AshuraRhoAiasTekkenKaioh` | ✅ **SÍ** |

### Paso 3: Enviar el Registro

- Completa todos los campos
- Ingresa la frase secreta exacta: `AshuraRhoAiasTekkenKaioh`
- Haz clic en "Crear Cuenta"
- Si la frase es correcta, la cuenta se creará automáticamente
- Serás redirigido al dashboard principal

## 🚫 Errores Comunes

### Error: "Frase secreta incorrecta"

**Causa:** La frase ingresada no coincide exactamente con `AshuraRhoAiasTekkenKaioh`

**Solución:**
- Verifica que no haya espacios al inicio o al final
- Asegúrate de respetar mayúsculas y minúsculas
- Copia y pega la frase si es necesario

### Error: "El email ya está registrado"

**Causa:** Ya existe un usuario con ese correo electrónico

**Solución:** Usa un correo diferente o contacta al administrador si olvidaste tu contraseña

### Error: "Las contraseñas no coinciden"

**Causa:** Los campos de contraseña y confirmar contraseña son diferentes

**Solución:** Asegúrate de escribir la misma contraseña en ambos campos

## 🔧 Configuración Técnica

### Backend (server-complete.js)

El servidor valida la frase secreta en el endpoint `/api/auth/register`:

```javascript
// Validar frase secreta
if (secretPhrase !== 'AshuraRhoAiasTekkenKaioh') {
  return res.status(403).json({
    success: false,
    error: 'FORBIDDEN',
    message: 'Frase secreta incorrecta. No es posible crear el registro.',
  });
}
```

### Frontend (LoginPage.jsx)

El formulario de registro incluye un campo específico para la frase:

```jsx
<input
  id="secretPhrase"
  name="secretPhrase"
  type="password"
  placeholder="Ingresa la frase secreta"
  required
/>
```

## 🌐 URLs y Puertos

- **Frontend:** http://localhost:3000
- **Backend (API):** http://localhost:3002
- **Endpoint de Registro:** POST `http://localhost:3002/api/auth/register`

## 📊 Flujo Completo de Registro

```
┌─────────────────────────────────────────────┐
│  Usuario accede a página de Login          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Click en "Registrarse"                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Completa formulario de registro            │
│  - Nombre                                   │
│  - Email                                    │
│  - Contraseña                               │
│  - Confirmar Contraseña                     │
│  - Frase Secreta (AshuraRhoAiasTekkenKaioh) │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Frontend valida contraseñas coincidan      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Envía datos a POST /api/auth/register      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Backend valida frase secreta               │
│  ¿secretPhrase === "AshuraRhoAiasTekkenKaioh"? │
└──────────┬────────────────────┬──────────────┘
           │                    │
         ❌ NO                ✅ SÍ
           │                    │
           ▼                    ▼
┌─────────────────┐    ┌──────────────────────┐
│  Error 403      │    │  Crea usuario        │
│  "Frase         │    │  Hash contraseña     │
│  incorrecta"    │    │  Cifra datos         │
└─────────────────┘    └──────┬───────────────┘
                              │
                              ▼
                     ┌──────────────────────┐
                     │  Login automático    │
                     │  Redirección a       │
                     │  Dashboard           │
                     └──────────────────────┘
```

## 🔒 Niveles de Seguridad

1. **Validación Frontend:** Verifica que todos los campos estén completos
2. **Validación de Frase:** Backend rechaza cualquier frase incorrecta (403 Forbidden)
3. **Cifrado de Datos:** Todos los datos sensibles se cifran con AES-256-GCM
4. **Hash de Contraseña:** Bcrypt con 12 salt rounds
5. **Rate Limiting:** Máximo 5 intentos cada 15 minutos

## 📱 Interfaz de Usuario

### Vista de Login
```
┌────────────────────────────────────┐
│     Management System              │
│     Inicia sesión para continuar   │
├────────────────────────────────────┤
│                                    │
│  📧 Correo Electrónico             │
│  ┌──────────────────────────────┐  │
│  │ usuario@ejemplo.com          │  │
│  └──────────────────────────────┘  │
│                                    │
│  🔒 Contraseña                     │
│  ┌──────────────────────────────┐  │
│  │ ••••••••                     │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │    Iniciar Sesión            │  │
│  └──────────────────────────────┘  │
│                                    │
│  ¿No tienes cuenta? Registrarse    │
└────────────────────────────────────┘
```

### Vista de Registro
```
┌────────────────────────────────────┐
│     Management System              │
│     Crea una nueva cuenta          │
├────────────────────────────────────┤
│                                    │
│  👤 Nombre Completo                │
│  ┌──────────────────────────────┐  │
│  │ Juan Pérez                   │  │
│  └──────────────────────────────┘  │
│                                    │
│  📧 Correo Electrónico             │
│  ┌──────────────────────────────┐  │
│  │ usuario@ejemplo.com          │  │
│  └──────────────────────────────┘  │
│                                    │
│  🔒 Contraseña                     │
│  ┌──────────────────────────────┐  │
│  │ ••••••••                     │  │
│  └──────────────────────────────┘  │
│                                    │
│  🔒 Confirmar Contraseña           │
│  ┌──────────────────────────────┐  │
│  │ ••••••••                     │  │
│  └──────────────────────────────┘  │
│                                    │
│  🔑 Frase Secreta de Registro *    │
│  ┌──────────────────────────────┐  │
│  │ AshuraRhoAiasTekkenKaioh     │  │
│  └──────────────────────────────┘  │
│  * Requerida para crear usuarios  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │    Crear Cuenta              │  │
│  └──────────────────────────────┘  │
│                                    │
│  ¿Ya tienes cuenta? Iniciar Sesión│
└────────────────────────────────────┘
```

## 🎯 Roles de Usuario

Después del registro, los usuarios obtienen el rol por defecto:

- **CAPTURISTA:** Puede leer y crear datos básicos

Los administradores pueden cambiar roles a:

- **COORDINADOR:** Puede leer, crear, actualizar y exportar
- **ADMIN:** Control total del sistema

## 📞 Soporte

Si tienes problemas con el registro:

1. Verifica que estés usando la frase exacta
2. Comprueba que el backend esté ejecutándose en el puerto 3002
3. Revisa los logs del servidor para más detalles
4. Contacta al administrador del sistema

---

**Última actualización:** 2025-11-17
**Servidor:** server-complete.js
**Puerto:** 3002
