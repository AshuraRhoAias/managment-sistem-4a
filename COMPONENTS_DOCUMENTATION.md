# 📦 Documentación de Componentes Reutilizables

## Sistema Electoral - Arquitectura de Componentes

Este documento detalla todos los componentes React reutilizables creados para maximizar el rendimiento y la mantenibilidad del sistema.

---

## 🎨 Componentes UI Base

### 1. **Button** (`src/components/UI/Button.jsx`)

Botón reutilizable con múltiples variantes y estados.

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `icon`: ReactNode

**Ejemplo:**
```jsx
import { Button } from '@/components/UI';

<Button variant="primary" size="md" loading={false}>
  Guardar
</Button>
```

---

### 2. **Input** (`src/components/UI/Input.jsx`)

Input con label, validación y manejo de errores.

**Props:**
- `label`: string
- `name`: string
- `type`: string
- `value`: string
- `onChange`: function
- `error`: string
- `required`: boolean
- `icon`: ReactNode

**Ejemplo:**
```jsx
import { Input } from '@/components/UI';

<Input
  label="Nombre Completo"
  name="nombre"
  value={formData.nombre}
  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
  required
  error={errors.nombre}
/>
```

---

### 3. **Card** (`src/components/UI/Card.jsx`)

Tarjeta con header, footer y variantes.

**Props:**
- `title`: string
- `subtitle`: string
- `headerAction`: ReactNode
- `footer`: ReactNode
- `variant`: 'default' | 'outlined' | 'elevated' | 'gradient' | 'dark'
- `padding`: 'none' | 'sm' | 'default' | 'lg'

**Ejemplo:**
```jsx
import { Card, Button } from '@/components/UI';

<Card
  title="Gestión de Estados"
  subtitle="Administra los estados del sistema"
  headerAction={<Button>+ Nuevo</Button>}
>
  {/* Contenido */}
</Card>
```

---

### 4. **Modal** (`src/components/UI/Modal.jsx`)

Modal con animaciones y cierre con backdrop/ESC.

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `footer`: ReactNode
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnBackdrop`: boolean
- `showCloseButton`: boolean

**Ejemplo:**
```jsx
import { Modal, Button } from '@/components/UI';

<Modal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  title="Editar Estado"
  size="lg"
  footer={
    <>
      <Button variant="ghost" onClick={() => setModalOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSubmit}>Guardar</Button>
    </>
  }
>
  {/* Formulario */}
</Modal>
```

---

### 5. **Table** (`src/components/UI/Table.jsx`)

Tabla con sorting, paginación y acciones.

**Props:**
- `columns`: Array<{ key, label, sortable, render }>
- `data`: Array
- `actions`: function
- `loading`: boolean
- `onRowClick`: function
- `striped`: boolean
- `hoverable`: boolean
- `pagination`: boolean
- `itemsPerPage`: number

**Ejemplo:**
```jsx
import { Table } from '@/components/UI';

const columns = [
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'codigo', label: 'Código', sortable: true },
  {
    key: 'created_at',
    label: 'Fecha',
    render: (value) => new Date(value).toLocaleDateString()
  }
];

<Table
  columns={columns}
  data={estados}
  actions={(row) => (
    <>
      <Button size="sm" onClick={() => handleEdit(row)}>Editar</Button>
      <Button size="sm" onClick={() => handleDelete(row.id)}>Eliminar</Button>
    </>
  )}
  loading={loading}
  pagination
  itemsPerPage={10}
/>
```

---

### 6. **Alert** (`src/components/UI/Alert.jsx`)

Alertas con diferentes tipos.

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `title`: string
- `message`: string
- `onClose`: function

**Ejemplo:**
```jsx
import { Alert } from '@/components/UI';

<Alert
  type="success"
  title="Éxito"
  message="Estado creado exitosamente"
  onClose={() => setAlert(null)}
/>
```

---

## 📊 Componentes de Dashboard

### 1. **DashboardMain** (`src/components/Dashboard/DashboardMain.jsx`)

Dashboard principal con estadísticas y actividad reciente.

**Características:**
- Estadísticas en tiempo real
- Tarjetas de resumen
- Actividad reciente
- Refresh automático

**Ejemplo:**
```jsx
import { DashboardMain } from '@/components/Dashboard';

<DashboardMain />
```

---

### 2. **StatsCard** (`src/components/Dashboard/StatsCard.jsx`)

Tarjeta de estadística individual.

**Props:**
- `title`: string
- `value`: string | number
- `icon`: ReactNode
- `color`: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
- `trend`: 'up' | 'down'
- `trendValue`: string
- `loading`: boolean

**Ejemplo:**
```jsx
import { StatsCard } from '@/components/Dashboard';

<StatsCard
  title="Total Familias"
  value={150}
  color="purple"
  trend="up"
  trendValue="+10 este mes"
  icon={<FamilyIcon />}
/>
```

---

### 3. **ActivityList** (`src/components/Dashboard/ActivityList.jsx`)

Lista de actividad reciente del sistema.

**Props:**
- `activities`: Array<{ type, description, user, timestamp }>
- `loading`: boolean

**Ejemplo:**
```jsx
import { ActivityList } from '@/components/Dashboard';

<ActivityList
  activities={[
    {
      type: 'CREATE',
      description: 'Nueva familia creada',
      user: 'Juan Pérez',
      timestamp: new Date()
    }
  ]}
/>
```

---

## 🗳️ Componentes Electorales

### 1. **EstadosManager** (`src/components/Electoral/EstadosManager.jsx`)

Gestión completa de Estados con CRUD.

**Características:**
- Lista paginada de estados
- Crear/Editar/Eliminar estados
- Validación de formularios
- Alertas de confirmación

**Ejemplo:**
```jsx
import { EstadosManager } from '@/components/Electoral';

<EstadosManager />
```

---

### 2. **DelegacionesManager** (`src/components/Electoral/DelegacionesManager.jsx`)

Gestión completa de Delegaciones.

**Props:**
- `estadoId`: number (opcional) - Filtrar por estado

**Características:**
- CRUD completo
- Relación con Estados
- Filtrado opcional

**Ejemplo:**
```jsx
import { DelegacionesManager } from '@/components/Electoral';

<DelegacionesManager estadoId={1} />
```

---

### 3. **ColoniasManager** (`src/components/Electoral/ColoniasManager.jsx`)

Gestión completa de Colonias.

**Props:**
- `delegacionId`: number (opcional) - Filtrar por delegación

**Características:**
- CRUD completo
- Gestión de código postal
- Relación con Delegaciones

**Ejemplo:**
```jsx
import { ColoniasManager } from '@/components/Electoral';

<ColoniasManager delegacionId={5} />
```

---

### 4. **FamiliasManager** (`src/components/Electoral/FamiliasManager.jsx`)

Gestión completa de Familias.

**Características:**
- CRUD completo
- Gestión de dirección y notas
- Relación con Colonias
- Modal ampliado

**Ejemplo:**
```jsx
import { FamiliasManager } from '@/components/Electoral';

<FamiliasManager />
```

---

### 5. **PersonasManager** (`src/components/Electoral/PersonasManager.jsx`)

Gestión completa de Personas.

**Características:**
- CRUD completo
- Validación de CURP
- Cálculo automático de edad votante
- Múltiples campos (nombre, curp, teléfono, edad, género, rol)
- Relación con Familias

**Ejemplo:**
```jsx
import { PersonasManager } from '@/components/Electoral';

<PersonasManager />
```

---

## 🔐 Componentes de Seguridad

### LocationGuard (`src/components/LocationGuard.jsx`)

Componente de guardia que verifica la ubicación del navegador.

**Características:**
- Verificación obligatoria de ubicación
- Bloqueo de acceso sin permisos
- UI amigable con instrucciones
- Manejo de errores
- Diseño responsivo y atractivo

**Ejemplo:**
```jsx
import LocationGuard from '@/components/LocationGuard';

// En layout.js
<LocationGuard>
  <AuthGuard>
    {children}
  </AuthGuard>
</LocationGuard>
```

---

## 🎣 Custom Hooks

Todos los hooks están en `src/hooks/useElectoralData.js`:

### 1. **useEstados()**
```jsx
const { estados, loading, error, refresh, create, update, delete: deleteEstado } = useEstados();
```

### 2. **useDelegaciones(estadoId)**
```jsx
const { delegaciones, loading, error, refresh, create, update, delete: deleteDelegacion } = useDelegaciones(estadoId);
```

### 3. **useColonias(delegacionId)**
```jsx
const { colonias, loading, error, refresh, create, update, delete: deleteColonia } = useColonias(delegacionId);
```

### 4. **useFamilias(filters)**
```jsx
const { familias, loading, error, refresh, getById, create, update, delete: deleteFamilia } = useFamilias();
```

### 5. **usePersonas(filters)**
```jsx
const { personas, loading, error, refresh, getById, searchByCurp, create, update, delete: deletePersona } = usePersonas();
```

---

## 📡 API Backend

### Dashboard Service (`backend/services/dashboard.service.js`)

**Endpoints creados:**
- `GET /api/electoral/stats` - Estadísticas generales
- `GET /api/electoral/monthly-summary` - Resumen mensual
- `GET /api/electoral/recent-activity` - Actividad reciente

**Métodos:**
- `getGeneralStats()` - Obtiene todas las estadísticas del sistema
- `getMonthlySummary()` - Resumen de los últimos 6 meses
- `getRecentActivity(limit)` - Actividad de los últimos 7 días

---

## 🚀 Cómo Usar los Componentes

### Importación Individual:
```jsx
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Card from '@/components/UI/Card';
```

### Importación Grupal:
```jsx
import { Button, Input, Card, Modal, Table, Alert } from '@/components/UI';
import { EstadosManager, DelegacionesManager } from '@/components/Electoral';
import { DashboardMain, StatsCard, ActivityList } from '@/components/Dashboard';
```

---

## 🎨 Estilos y Temas

Todos los componentes usan Tailwind CSS con:
- Diseño responsivo
- Dark mode ready
- Animaciones suaves
- Colores consistentes
- Accesibilidad (ARIA labels)

**Paleta de colores:**
- Azul: Primario
- Verde: Éxito
- Rojo: Peligro/Error
- Amarillo: Advertencia
- Púrpura: Información
- Gris: Secundario

---

## ✅ Características de Rendimiento

1. **Memoización**: Uso de `useCallback` y `useMemo` en hooks
2. **Paginación**: Tablas con paginación para grandes datasets
3. **Lazy Loading**: Componentes cargados bajo demanda
4. **Optimistic Updates**: Actualización de UI antes de confirmar con servidor
5. **Cache**: SessionStorage para ubicación del usuario
6. **Debouncing**: En búsquedas y filtros (si se implementa)

---

## 📝 Validaciones Implementadas

- **CURP**: Formato válido y único
- **Edad**: Cálculo automático de puede_votar (>=18)
- **Códigos postales**: Formato válido
- **Teléfonos**: Formato válido
- **Campos requeridos**: Validación en formularios
- **Foreign keys**: Validación de relaciones

---

## 🔒 Seguridad

Todos los componentes están protegidos por:
1. **Autenticación**: Token JWT obligatorio
2. **Geolocalización**: Obligatoria para acceder
3. **Cifrado**: Todos los datos cifrados en backend (5 capas)
4. **Validación**: Input sanitization
5. **CORS**: Configuración estricta
6. **Rate Limiting**: Protección contra ataques

---

## 📦 Estructura de Archivos

```
src/
├── components/
│   ├── UI/
│   │   ├── Alert.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   └── index.js
│   ├── Dashboard/
│   │   ├── DashboardMain.jsx
│   │   ├── StatsCard.jsx
│   │   ├── ActivityList.jsx
│   │   └── index.js
│   ├── Electoral/
│   │   ├── EstadosManager.jsx
│   │   ├── DelegacionesManager.jsx
│   │   ├── ColoniasManager.jsx
│   │   ├── FamiliasManager.jsx
│   │   ├── PersonasManager.jsx
│   │   └── index.js
│   └── LocationGuard.jsx
├── hooks/
│   └── useElectoralData.js
└── Utils/
    └── ElectoralDashboard/
        └── ElectoralApi.jsx
```

---

## 🔄 Flujo de Datos

```
Usuario → Componente UI → Custom Hook → API Client → Backend API → Database
                ↓                                          ↓
           Estado Local ←────────────────────────────── Response
```

---

## 🧪 Testing (Recomendado)

```jsx
// Ejemplo de test para Button
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/UI/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('calls onClick handler', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

## 📚 Recursos Adicionales

- [API Documentation](./API_ELECTORAL_DOCUMENTATION.md)
- [Database Schema](./backend/database_schema_encrypted.sql)
- [Encryption Guide](./backend/services/encryption.service.js)

---

## 🎯 Próximas Mejoras Sugeridas

1. ✅ Componentes de búsqueda avanzada
2. ✅ Exportación de datos (CSV, Excel, PDF)
3. ✅ Gráficas y visualizaciones
4. ✅ Notificaciones push
5. ✅ Modo offline con sync
6. ✅ Internacionalización (i18n)
7. ✅ Temas personalizables
8. ✅ Accesibilidad mejorada (WCAG 2.1)

---

**Última actualización**: 17 de Noviembre de 2025
**Versión**: 2.0.0
**Autor**: Sistema Electoral con Seguridad Avanzada
