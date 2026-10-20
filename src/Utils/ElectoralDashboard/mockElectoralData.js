/**
 * ============================================
 * DATOS FALSOS (MOCK) DEL SISTEMA ELECTORAL
 * Los usa dataSources/mockDataSource.js cuando NEXT_PUBLIC_API_MODE=mock.
 * Todo vive en memoria: se reinicia al recargar la página.
 * ============================================
 */

let nextId = 1000;
const genId = () => nextId++;
const nowIso = () => new Date().toISOString();
// Fecha hace `months` meses (y `days` días): reparte los registros para que las gráficas tengan historia.
const monthsAgoIso = (months, days = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setDate(Math.max(1, date.getDate() - days));
  return date.toISOString();
};

const yearsAgoDate = (years) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
};

const NOMBRES_M = ['José', 'Juan', 'Luis', 'Pedro', 'Miguel', 'Jorge', 'Carlos', 'Diego'];
const NOMBRES_F = ['María', 'Ana', 'Carmen', 'Laura', 'Sofía', 'Elena', 'Gabriela', 'Valentina'];
const APELLIDOS = ['García', 'Hernández', 'López', 'Martínez', 'Rodríguez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];

const pick = (arr, i) => arr[i % arr.length];

// Las tablas replican los nombres de columna del backend (ver backend/services/*.service.js),
// así la UI recibe la misma forma de datos en modo mock y en modo real.

// ==================== ESTADOS ====================
export const estados = [
  { id: 1, codigo: 'CDMX', nombre: 'Ciudad de México', created_at: monthsAgoIso(6) },
  { id: 2, codigo: 'MEX', nombre: 'Estado de México', created_at: monthsAgoIso(6) },
  { id: 3, codigo: 'JAL', nombre: 'Jalisco', created_at: monthsAgoIso(6) },
];

// ==================== DELEGACIONES ====================
export const delegaciones = [
  { id: 1, id_estado: 1, nombre: 'Coyoacán', created_at: monthsAgoIso(6) },
  { id: 2, id_estado: 1, nombre: 'Iztapalapa', created_at: monthsAgoIso(6) },
  { id: 3, id_estado: 2, nombre: 'Ecatepec', created_at: monthsAgoIso(6) },
  { id: 4, id_estado: 2, nombre: 'Naucalpan', created_at: monthsAgoIso(6) },
  { id: 5, id_estado: 3, nombre: 'Guadalajara', created_at: monthsAgoIso(6) },
  { id: 6, id_estado: 3, nombre: 'Zapopan', created_at: monthsAgoIso(6) },
];

// ==================== COLONIAS ====================
export const colonias = [
  { id: 1, id_delegacion: 1, nombre: 'Del Carmen', codigo_postal: '04100', created_at: monthsAgoIso(6) },
  { id: 2, id_delegacion: 1, nombre: 'Santa Catarina', codigo_postal: '04010', created_at: monthsAgoIso(6) },
  { id: 3, id_delegacion: 2, nombre: 'San Lorenzo Tezonco', codigo_postal: '09790', created_at: monthsAgoIso(6) },
  { id: 4, id_delegacion: 2, nombre: 'Santa Cruz Meyehualco', codigo_postal: '09230', created_at: monthsAgoIso(6) },
  { id: 5, id_delegacion: 3, nombre: 'Ciudad Azteca', codigo_postal: '55120', created_at: monthsAgoIso(6) },
  { id: 6, id_delegacion: 3, nombre: 'Las Américas', codigo_postal: '55076', created_at: monthsAgoIso(6) },
  { id: 7, id_delegacion: 4, nombre: 'Satélite', codigo_postal: '53100', created_at: monthsAgoIso(6) },
  { id: 8, id_delegacion: 4, nombre: 'Del Valle Naucalpan', codigo_postal: '53050', created_at: monthsAgoIso(6) },
  { id: 9, id_delegacion: 5, nombre: 'Americana', codigo_postal: '44160', created_at: monthsAgoIso(6) },
  { id: 10, id_delegacion: 5, nombre: 'Chapultepec', codigo_postal: '44600', created_at: monthsAgoIso(6) },
  { id: 11, id_delegacion: 6, nombre: 'Ciudad Granja', codigo_postal: '45010', created_at: monthsAgoIso(6) },
  { id: 12, id_delegacion: 6, nombre: 'Valle Real', codigo_postal: '45019', created_at: monthsAgoIso(6) },
];

// ==================== FAMILIAS ====================
export const familias = colonias.flatMap((colonia, coloniaIndex) =>
  [0, 1].map((n) => {
    const id = coloniaIndex * 2 + n + 1;
    return {
      id,
      id_colonia: colonia.id,
      nombre_familia: `${pick(APELLIDOS, id)} ${pick(APELLIDOS, id + 3)}`,
      direccion: `Calle ${id} #${100 + id}`,
      estado: 'ACTIVA',
      created_at: monthsAgoIso(id % 6, id % 20),
    };
  })
);

// ==================== PERSONAS ====================
// Cada familia tiene jefe, cónyuge y 0-2 hijos (con edades cercanas a los 18 para los reportes).
const HIJOS_EDADES = [17, 16, 19, 12, 22, 9];

export const personas = familias.flatMap((familia, familiaIndex) => {
  const [apellidoP, apellidoM] = familia.nombre_familia.split(' ');
  const jefeEdad = 30 + ((familiaIndex * 7) % 25);
  const miembros = [
    { rol_familia: 'JEFE DE FAMILIA', genero: 'MASCULINO', edad: jefeEdad },
    { rol_familia: 'MIEMBRO', genero: 'FEMENINO', edad: jefeEdad - 3 },
  ];
  for (let h = 0; h < familiaIndex % 3; h++) {
    miembros.push({
      rol_familia: 'MIEMBRO',
      genero: (familiaIndex + h) % 2 === 0 ? 'FEMENINO' : 'MASCULINO',
      edad: HIJOS_EDADES[(familiaIndex + h) % HIJOS_EDADES.length],
    });
  }

  return miembros.map((miembro, n) => {
    const id = familiaIndex * 4 + n + 1;
    const primerNombre = miembro.genero === 'FEMENINO' ? pick(NOMBRES_F, id) : pick(NOMBRES_M, id);
    return {
      id,
      id_familia: familia.id,
      nombre: `${primerNombre} ${apellidoP} ${apellidoM}`,
      curp: `MOCK${String(id).padStart(6, '0')}HDFXXX01`,
      telefono: miembro.edad >= 18 ? `55${String(10000000 + id).slice(0, 8)}` : '',
      edad: miembro.edad,
      genero: miembro.genero,
      fecha_nacimiento: yearsAgoDate(miembro.edad),
      rol_familia: miembro.rol_familia,
      puede_votar: miembro.edad >= 18,
      created_at: familia.created_at,
    };
  });
});

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
