/**
 * ============================================
 * DATOS FALSOS (MOCK) DEL SISTEMA ELECTORAL
 * Reemplaza por completo las llamadas a la API real.
 * Todo vive en memoria: se reinicia al recargar la página.
 * ============================================
 */

let nextId = 1000;
const genId = () => nextId++;
const nowIso = () => new Date().toISOString();

const NOMBRES = ['María', 'José', 'Juan', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Laura', 'Miguel', 'Sofía', 'Jorge', 'Elena'];
const APELLIDOS = ['García', 'Hernández', 'López', 'Martínez', 'Rodríguez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];

const pick = (arr, i) => arr[i % arr.length];

// ==================== ESTADOS ====================
export const estados = [
  { id: 1, codigo: 'CDMX', nombre: 'Ciudad de México', created_at: nowIso() },
  { id: 2, codigo: 'MEX', nombre: 'Estado de México', created_at: nowIso() },
  { id: 3, codigo: 'JAL', nombre: 'Jalisco', created_at: nowIso() },
];

// ==================== DELEGACIONES ====================
export const delegaciones = [
  { id: 1, id_estado: 1, nombre: 'Coyoacán', created_at: nowIso() },
  { id: 2, id_estado: 1, nombre: 'Iztapalapa', created_at: nowIso() },
  { id: 3, id_estado: 2, nombre: 'Ecatepec', created_at: nowIso() },
  { id: 4, id_estado: 2, nombre: 'Naucalpan', created_at: nowIso() },
  { id: 5, id_estado: 3, nombre: 'Guadalajara', created_at: nowIso() },
  { id: 6, id_estado: 3, nombre: 'Zapopan', created_at: nowIso() },
];

// ==================== COLONIAS ====================
export const colonias = [
  { id: 1, id_delegacion: 1, nombre: 'Del Carmen', codigo_postal: '04100', created_at: nowIso() },
  { id: 2, id_delegacion: 1, nombre: 'Santa Catarina', codigo_postal: '04010', created_at: nowIso() },
  { id: 3, id_delegacion: 2, nombre: 'San Lorenzo Tezonco', codigo_postal: '09790', created_at: nowIso() },
  { id: 4, id_delegacion: 2, nombre: 'Santa Cruz Meyehualco', codigo_postal: '09230', created_at: nowIso() },
  { id: 5, id_delegacion: 3, nombre: 'Ciudad Azteca', codigo_postal: '55120', created_at: nowIso() },
  { id: 6, id_delegacion: 3, nombre: 'Las Américas', codigo_postal: '55076', created_at: nowIso() },
  { id: 7, id_delegacion: 4, nombre: 'Satélite', codigo_postal: '53100', created_at: nowIso() },
  { id: 8, id_delegacion: 4, nombre: 'Del Valle Naucalpan', codigo_postal: '53050', created_at: nowIso() },
  { id: 9, id_delegacion: 5, nombre: 'Americana', codigo_postal: '44160', created_at: nowIso() },
  { id: 10, id_delegacion: 5, nombre: 'Chapultepec', codigo_postal: '44600', created_at: nowIso() },
  { id: 11, id_delegacion: 6, nombre: 'Ciudad Granja', codigo_postal: '45010', created_at: nowIso() },
  { id: 12, id_delegacion: 6, nombre: 'Valle Real', codigo_postal: '45019', created_at: nowIso() },
];

// ==================== FAMILIAS ====================
export const familias = colonias.flatMap((colonia, coloniaIndex) =>
  [0, 1].map((n) => {
    const id = coloniaIndex * 2 + n + 1;
    return {
      id,
      id_colonia: colonia.id,
      nombre_familia: `Familia ${pick(APELLIDOS, id)}`,
      direccion: `Calle ${id} #${100 + id}, ${colonia.nombre}`,
      estado_familia: n === 0 ? 'activa' : 'activa',
      created_at: nowIso(),
    };
  })
);

// ==================== PERSONAS ====================
export const personas = familias.flatMap((familia, familiaIndex) =>
  [0, 1, 2].map((n) => {
    const id = familiaIndex * 3 + n + 1;
    return {
      id,
      id_familia: familia.id,
      nombre: pick(NOMBRES, id),
      apellidos: `${pick(APELLIDOS, id)} ${pick(APELLIDOS, id + 3)}`,
      curp: `MOCK${String(id).padStart(6, '0')}HDFXXX01`,
      telefono: `55${String(10000000 + id).slice(0, 8)}`,
      direccion: familia.direccion,
      puede_votar: n !== 2,
      created_at: nowIso(),
    };
  })
);

// ==================== HELPERS DE TABLA (CRUD EN MEMORIA) ====================
export function createRecord(table, data) {
  const record = { id: genId(), created_at: nowIso(), ...data };
  table.push(record);
  return record;
}

export function updateRecord(table, id, data) {
  const index = table.findIndex((row) => String(row.id) === String(id));
  if (index === -1) throw new Error('Registro no encontrado');
  table[index] = { ...table[index], ...data };
  return table[index];
}

export function deleteRecord(table, id) {
  const index = table.findIndex((row) => String(row.id) === String(id));
  if (index === -1) throw new Error('Registro no encontrado');
  table.splice(index, 1);
}

export function findById(table, id) {
  const record = table.find((row) => String(row.id) === String(id));
  if (!record) throw new Error('Registro no encontrado');
  return record;
}

// ==================== AGREGACIONES ====================
export function familiasByColonia(coloniaId) {
  return familias.filter((f) => String(f.id_colonia) === String(coloniaId));
}

export function personasByFamilia(familiaId) {
  return personas.filter((p) => String(p.id_familia) === String(familiaId));
}

export function coloniasByDelegacion(delegacionId) {
  return colonias.filter((c) => String(c.id_delegacion) === String(delegacionId));
}

export function delegacionesByEstado(estadoId) {
  return delegaciones.filter((d) => String(d.id_estado) === String(estadoId));
}

export function countFamiliasEnDelegacion(delegacionId) {
  return coloniasByDelegacion(delegacionId).reduce(
    (total, colonia) => total + familiasByColonia(colonia.id).length,
    0
  );
}

export function countPersonasEnDelegacion(delegacionId) {
  return coloniasByDelegacion(delegacionId).reduce(
    (total, colonia) =>
      total +
      familiasByColonia(colonia.id).reduce(
        (sub, familia) => sub + personasByFamilia(familia.id).length,
        0
      ),
    0
  );
}

export function countColoniasEnEstado(estadoId) {
  return delegacionesByEstado(estadoId).reduce(
    (total, delegacion) => total + coloniasByDelegacion(delegacion.id).length,
    0
  );
}

export function countFamiliasEnEstado(estadoId) {
  return delegacionesByEstado(estadoId).reduce(
    (total, delegacion) => total + countFamiliasEnDelegacion(delegacion.id),
    0
  );
}

export function countPersonasEnEstado(estadoId) {
  return delegacionesByEstado(estadoId).reduce(
    (total, delegacion) => total + countPersonasEnDelegacion(delegacion.id),
    0
  );
}
