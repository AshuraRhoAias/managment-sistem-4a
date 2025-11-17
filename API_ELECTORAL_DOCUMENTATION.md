# 📚 Documentación del Sistema Electoral - API y Hooks

**Versión:** 3.1
**Fecha:** 2025-11-17
**Sistema:** Manejo de APIs Electorales con Cifrado Total y Validación de Usuario

---

## 🎯 Resumen

Sistema completo de gestión electoral con:
- ✅ **Backend:** Servicios con cifrado total de todos los campos
- ✅ **API REST:** Endpoints completos para CRUD
- ✅ **Frontend:** Hooks personalizados para React
- ✅ **Seguridad:** Validación de usuario en cada operación
- ✅ **Geolocalización:** Headers automáticos en todas las peticiones

---

## 🏗️ Arquitectura

```
Backend                      Frontend
├── Services                 ├── Hooks
│   ├── estados.service      │   ├── useEstados
│   ├── delegaciones.service │   ├── useDelegaciones
│   ├── colonias.service     │   ├── useColonias
│   ├── familias.service     │   ├── useFamilias
│   └── personas.service     │   └── usePersonas
│                            │
├── Routes                   ├── Components
│   └── electoral.routes     │   └── Forms (por crear)
│                            │
└── Middleware               └── Utils
    ├── auth.middleware          └── ElectoralApi
    └── advanced-security
```

---

## 🔐 Seguridad Implementada

### 1. Cifrado de Todos los Campos

**Estados:** codigo, nombre
**Delegaciones:** nombre
**Colonias:** nombre, codigo_postal
**Familias:** nombre_familia, direccion, notas
**Personas:** nombre, curp, telefono, edad, genero, rol_familia, notas

### 2. Validación de Usuario

Todas las operaciones de escritura (POST, PUT, DELETE) registran:
- `id_registro` - Usuario que creó el registro
- `id_ultima_modificacion` - Usuario que modificó por última vez
- `created_at` - Fecha de creación
- `updated_at` - Fecha de última modificación

### 3. Roles y Permisos

| Operación | ADMIN | CAPTURISTA | CONSULTOR |
|-----------|-------|------------|-----------|
| **GET** (Consultar) | ✅ | ✅ | ✅ |
| **POST** (Crear) | ✅ | ✅ | ❌ |
| **PUT** (Actualizar) | ✅ | ✅ | ❌ |
| **DELETE** (Eliminar) | ✅ | ❌ | ❌ |

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3002/api/electoral
```

### Autenticación Requerida
Todas las rutas requieren header:
```
Authorization: Bearer <token>
```

---

## 🗺️ Estados

### GET /states
Obtener todos los estados (descifrados)

**Request:**
```javascript
const result = await ElectoralApi.getAllStates();
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "CDMX",
      "nombre": "Ciudad de México",
      "activo": 1,
      "created_at": "2025-11-17T10:00:00.000Z"
    }
  ]
}
```

### GET /states/:id
Obtener estado específico

```javascript
const result = await ElectoralApi.getStateById(1);
```

### POST /states
Crear nuevo estado (requiere ADMIN)

**Request Body:**
```json
{
  "codigo": "JAL",
  "nombre": "Jalisco"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "codigo": "JAL",
    "nombre": "Jalisco",
    "message": "Estado creado exitosamente"
  }
}
```

### PUT /states/:id
Actualizar estado (requiere ADMIN)

```javascript
await ElectoralApi.updateState(5, {
  nombre: "Jalisco Actualizado"
});
```

### DELETE /states/:id
Eliminar estado (soft delete, requiere ADMIN)

```javascript
await ElectoralApi.deleteState(5);
```

---

## 🏛️ Delegaciones

### GET /states/:id/delegations
Obtener delegaciones de un estado

```javascript
const result = await ElectoralApi.getDelegationsByState(1);
```

### POST /delegations
Crear delegación

**Request Body:**
```json
{
  "id_estado": 1,
  "nombre": "Benito Juárez"
}
```

### PUT /delegations/:id
Actualizar delegación

### DELETE /delegations/:id
Eliminar delegación

---

## 🏘️ Colonias

### GET /delegations/:id/colonies
Obtener colonias de una delegación

```javascript
const result = await ElectoralApi.getColoniesByDelegation(1);
```

### POST /colonies
Crear colonia

**Request Body:**
```json
{
  "id_delegacion": 1,
  "nombre": "Del Valle",
  "codigo_postal": "03100"
}
```

---

## 👨‍👩‍👧‍👦 Familias

### GET /families
Obtener todas las familias

**Query Params:**
- `colonia_id` - Filtrar por colonia
- `estado` - Filtrar por estado (ACTIVA/INACTIVA)

```javascript
const result = await ElectoralApi.getAllFamilies({
  colonia_id: 1
});
```

### GET /families/:id
Obtener familia con sus personas

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_familia": "López García",
    "direccion": "Av. Insurgentes 123",
    "notas": "Familia activa",
    "personas": [
      {
        "id": 1,
        "nombre": "Juan López",
        "edad": 45,
        "puede_votar": true
      }
    ],
    "total_miembros": 4,
    "total_votantes": 3
  }
}
```

### POST /families
Crear familia

**Request Body:**
```json
{
  "id_colonia": 1,
  "nombre_familia": "González Pérez",
  "direccion": "Calle Morelos 456",
  "notas": "Primera visita"
}
```

### PUT /families/:id
Actualizar familia

### DELETE /families/:id
Eliminar familia (cambia estado a INACTIVA)

---

## 👥 Personas

### GET /persons
Obtener todas las personas

**Query Params:**
- `familia_id` - Filtrar por familia
- `puede_votar` - Filtrar por votantes (1/0)
- `limit` - Limitar resultados

```javascript
const result = await ElectoralApi.getAllPersons({
  familia_id: 1,
  puede_votar: 1
});
```

### GET /search/curp/:curp
Buscar persona por CURP

```javascript
const result = await ElectoralApi.searchByCurp('LOGJ800315HDFPRL01');
```

### POST /persons
Crear persona

**Request Body:**
```json
{
  "id_familia": 1,
  "nombre": "María González",
  "curp": "GOMM950420MDFNZR08",
  "telefono": "5555-1234",
  "edad": "29",
  "genero": "F",
  "fecha_nacimiento": "1995-04-20",
  "rol_familia": "ESPOSA",
  "notas": "Estudiante universitaria"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 20,
    "nombre": "María González",
    "curp": "GOMM950420MDFNZR08",
    "edad": 29,
    "puede_votar": true,
    "message": "Persona creada exitosamente",
    "usuario_registro": 1
  }
}
```

### PUT /persons/:id
Actualizar persona

### DELETE /persons/:id
Eliminar persona (soft delete)

---

## 🎣 Hooks de React

### useEstados()

Hook para gestión completa de estados.

**Uso:**
```javascript
import { useEstados } from '@/hooks/useElectoralData';

function EstadosManager() {
  const {
    estados,
    loading,
    error,
    refresh,
    create,
    update,
    delete: deleteEstado
  } = useEstados();

  const handleCreate = async () => {
    const result = await create({
      codigo: 'NL',
      nombre: 'Nuevo León'
    });

    if (result.success) {
      alert('Estado creado exitosamente');
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleUpdate = async (id) => {
    const result = await update(id, {
      nombre: 'Nuevo León Actualizado'
    });
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar estado?')) {
      await deleteEstado(id);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Crear Estado</button>
      <button onClick={refresh}>Refrescar</button>

      <ul>
        {estados.map(estado => (
          <li key={estado.id}>
            {estado.codigo} - {estado.nombre}
            <button onClick={() => handleUpdate(estado.id)}>Editar</button>
            <button onClick={() => handleDelete(estado.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### useDelegaciones(estadoId)

**Uso:**
```javascript
function DelegacionesList({ estadoId }) {
  const {
    delegaciones,
    loading,
    create,
    update,
    delete: deleteDelegacion
  } = useDelegaciones(estadoId);

  const handleCreate = async () => {
    await create({
      id_estado: estadoId,
      nombre: 'Nueva Delegación'
    });
  };

  return (
    <div>
      <button onClick={handleCreate}>Agregar Delegación</button>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {delegaciones.map(deleg => (
            <li key={deleg.id}>{deleg.nombre}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### useColonias(delegacionId)

Igual que useDelegaciones pero para colonias.

---

### useFamilias(filters)

**Uso con filtros:**
```javascript
function FamiliasList() {
  const {
    familias,
    loading,
    getById,
    create
  } = useFamilias({ colonia_id: 1 });

  const handleViewDetails = async (familiaId) => {
    const result = await getById(familiaId);
    if (result.success) {
      console.log('Familia completa:', result.data);
      console.log('Personas:', result.data.personas);
    }
  };

  const handleCreateFamilia = async () => {
    await create({
      id_colonia: 1,
      nombre_familia: 'Ramírez Torres',
      direccion: 'Calle Principal 789',
      notas: 'Nueva familia'
    });
  };

  return (
    <div>
      {familias.map(familia => (
        <div key={familia.id}>
          <h3>{familia.nombre_familia}</h3>
          <p>{familia.direccion}</p>
          <button onClick={() => handleViewDetails(familia.id)}>
            Ver Detalles
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### usePersonas(filters)

**Uso con búsqueda por CURP:**
```javascript
function PersonasManager() {
  const {
    personas,
    loading,
    searchByCurp,
    create,
    update
  } = usePersonas({ familia_id: 1 });

  const handleSearchCurp = async () => {
    const curp = prompt('Ingresa CURP:');
    const result = await searchByCurp(curp);

    if (result.success) {
      alert(`Persona encontrada: ${result.data.nombre}`);
    } else {
      alert('Persona no encontrada');
    }
  };

  const handleCreatePersona = async () => {
    const result = await create({
      id_familia: 1,
      nombre: 'Pedro Martínez',
      curp: 'MAMP850615HDFRRD02',
      edad: '39',
      genero: 'M',
      fecha_nacimiento: '1985-06-15',
      rol_familia: 'JEFE_FAMILIA'
    });

    if (result.success) {
      console.log('Persona creada:', result.data);
    }
  };

  return (
    <div>
      <button onClick={handleSearchCurp}>Buscar por CURP</button>
      <button onClick={handleCreatePersona}>Crear Persona</button>

      <ul>
        {personas.map(persona => (
          <li key={persona.id}>
            {persona.nombre} - {persona.edad} años
            {persona.puede_votar && <span> ✅ Puede votar</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔄 Flujo de Trabajo Completo

### Ejemplo: Crear Familia Completa con Personas

```javascript
function RegistroFamiliaCompleto() {
  const { create: createFamilia } = useFamilias();
  const { create: createPersona } = usePersonas();

  const handleRegistro = async () => {
    // 1. Crear familia
    const resultFamilia = await createFamilia({
      id_colonia: 1,
      nombre_familia: 'Castro Ruiz',
      direccion: 'Av. Reforma 1010',
      notas: 'Registro completo'
    });

    if (!resultFamilia.success) {
      alert('Error al crear familia: ' + resultFamilia.error);
      return;
    }

    const familiaId = resultFamilia.data.id;

    // 2. Crear personas de la familia
    const personas = [
      {
        nombre: 'Fernando Castro Ruiz',
        curp: 'CARF760930HDFSTS07',
        edad: '48',
        genero: 'M',
        fecha_nacimiento: '1976-09-30',
        rol_familia: 'JEFE_FAMILIA'
      },
      {
        nombre: 'Gabriela Ruiz Mendoza',
        curp: 'RUMG790312MDFZNB05',
        edad: '45',
        genero: 'F',
        fecha_nacimiento: '1979-03-12',
        rol_familia: 'ESPOSA'
      }
    ];

    for (const persona of personas) {
      await createPersona({
        ...persona,
        id_familia: familiaId
      });
    }

    alert('Familia registrada exitosamente con ' + personas.length + ' personas');
  };

  return (
    <button onClick={handleRegistro}>
      Registrar Familia Completa
    </button>
  );
}
```

---

## 🎨 Validaciones y Mensajes

### Campos Requeridos

**Estados:**
- `codigo` (requerido, se convierte a mayúsculas)
- `nombre` (requerido)

**Delegaciones:**
- `id_estado` (requerido)
- `nombre` (requerido)

**Colonias:**
- `id_delegacion` (requerido)
- `nombre` (requerido)
- `codigo_postal` (opcional)

**Familias:**
- `id_colonia` (requerido)
- `nombre_familia` (requerido)
- `direccion` (requerido)
- `notas` (opcional)

**Personas:**
- `id_familia` (requerido)
- `nombre` (requerido)
- `curp` (requerido, se convierte a mayúsculas)
- `edad` (requerido, número)
- `genero` (requerido: M/F)
- `rol_familia` (requerido: JEFE_FAMILIA, ESPOSA, HIJO, HIJA, OTRO)
- `telefono` (opcional)
- `fecha_nacimiento` (opcional)
- `notas` (opcional)

---

## ⚡ Performance y Optimización

### Cifrado Automático
Todos los campos sensibles se cifran automáticamente en el backend. El frontend siempre recibe datos descifrados.

### Caching
Los hooks React cachean los datos automáticamente y solo refrescan cuando:
- Se crea un nuevo registro
- Se actualiza un registro
- Se elimina un registro
- Se llama a `refresh()` manualmente

### Lazy Loading
Los hooks solo cargan datos cuando:
- El componente se monta
- Cambian los filtros
- Se llama a refresh explícitamente

---

## 🚨 Manejo de Errores

### Errores Comunes

**401 Unauthorized:**
```javascript
// Token expirado o inválido
// Solución: Redirigir a login
```

**403 Forbidden:**
```javascript
// Usuario sin permisos
// Ejemplo: CAPTURISTA intentando eliminar
```

**404 Not Found:**
```javascript
// Recurso no encontrado
// Verificar que el ID existe
```

**400 Bad Request:**
```javascript
// Datos inválidos
// Revisar campos requeridos
```

### Ejemplo de Manejo:
```javascript
const handleCreate = async () => {
  const result = await create(data);

  if (!result.success) {
    switch (result.status) {
      case 401:
        router.push('/login');
        break;
      case 403:
        alert('No tienes permisos para esta acción');
        break;
      case 400:
        alert('Datos inválidos: ' + result.error);
        break;
      default:
        alert('Error: ' + result.error);
    }
  }
};
```

---

## 📊 Estadísticas

### GET /persons/stats
Estadísticas generales de personas

```javascript
const result = await ElectoralApi.getAllPersons({});
// Incluye total_personas, total_votantes
```

### GET /families/:id/stats
Estadísticas de una familia específica

```javascript
const stats = await familiasService.getFamiliaStats(1);
// {
//   familia: "López García",
//   total_personas: 4,
//   total_votantes: 3,
//   total_no_votantes: 1
// }
```

---

## 🎯 Próximos Pasos

1. ✅ Backend completado con cifrado total
2. ✅ Rutas API REST implementadas
3. ✅ Hooks React personalizados
4. ⬜ Componentes de formularios UI
5. ⬜ Validación de formularios en frontend
6. ⬜ Componentes de tablas con paginación
7. ⬜ Sistema de búsqueda avanzada
8. ⬜ Dashboard con estadísticas

---

**Autor:** Sistema Electoral Ultra-Seguro
**Contacto:** Documentación técnica
**Versión:** 3.1
**Última actualización:** 2025-11-17
