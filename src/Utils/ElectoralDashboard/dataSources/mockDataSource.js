import {
    estados,
    delegaciones,
    colonias,
    familias,
    personas,
    createRecord,
    updateRecord,
    deleteRecord,
    findById,
} from '../mockElectoralData'

// ============================================
// 🎭 DATA SOURCE MOCK (en memoria)
//
// Implementa el mismo contrato que httpDataSource, incluyendo las reglas
// de negocio que en el backend viven en los servicios (puede_votar por edad,
// no borrar padres con hijos, borrar familia = borrar sus personas…).
// ============================================
const SIMULATED_DELAY_MS = 200
const delay = (ms = SIMULATED_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

const TABLES = { estados, delegaciones, colonias, familias, personas }

// Tabla padre → [tabla hija, columna FK, mensaje]
const CHILDREN = {
    estados: ['delegaciones', 'id_estado', 'No se puede eliminar un estado con delegaciones asociadas'],
    delegaciones: ['colonias', 'id_delegacion', 'No se puede eliminar una delegación con colonias asociadas'],
    colonias: ['familias', 'id_colonia', 'No se puede eliminar una colonia con familias asociadas'],
}

/**
 * Registra una tabla mock nueva para un recurso propio (ver "Cómo crear una API" en el README):
 *   registerMockTable('casillas', [{ id: 1, id_colonia: 1, numero: 'C-01' }], ['id_colonia', 'numero'])
 */
export function registerMockTable(name, rows = [], required = []) {
    TABLES[name] = rows
    REQUIRED[name] = required
}

const table = (name) => {
    if (!TABLES[name]) throw new Error(`Tabla desconocida: ${name}`)
    return TABLES[name]
}

// Normalizaciones que el backend aplica antes de guardar
const normalize = (name, data) => {
    const result = { ...data }
    if (name === 'estados' && result.codigo) result.codigo = String(result.codigo).toUpperCase()
    if (name === 'familias' && !result.estado) result.estado = 'ACTIVA'
    if (name === 'personas') {
        if (result.curp) result.curp = String(result.curp).toUpperCase()
        if (result.genero) result.genero = String(result.genero).toUpperCase()
        if (result.rol_familia) result.rol_familia = String(result.rol_familia).toUpperCase()
        if (result.edad !== undefined && result.edad !== '') {
            result.edad = Number(result.edad)
            result.puede_votar = result.edad >= 18
        }
    }
    return result
}

const assertRequired = (name, data, fields = []) => {
    const missing = fields.filter((field) => data[field] === undefined || data[field] === null || data[field] === '')
    if (missing.length) throw new Error(`Campos requeridos: ${missing.join(', ')}`)
}

const REQUIRED = {
    estados: ['codigo', 'nombre'],
    delegaciones: ['id_estado', 'nombre'],
    colonias: ['id_delegacion', 'nombre'],
    familias: ['id_colonia', 'nombre_familia', 'direccion'],
    personas: ['id_familia', 'nombre', 'curp', 'edad', 'genero', 'rol_familia'],
}

const mockDataSource = {
    name: 'mock',

    async loadTables() {
        await delay()
        return {
            estados: [...estados],
            delegaciones: [...delegaciones],
            colonias: [...colonias],
            familias: familias.filter((f) => f.estado !== 'INACTIVA'),
            personas: [...personas],
        }
    },

    // `query` solo lo usa el backend real; el mock devuelve la tabla y ElectoralApi filtra.
    async list(name) {
        await delay()
        const rows = table(name)
        return name === 'familias' ? rows.filter((f) => f.estado !== 'INACTIVA') : [...rows]
    },

    async create(name, data) {
        await delay()
        const rows = table(name)
        const record = normalize(name, data)
        assertRequired(name, record, REQUIRED[name])
        if (name === 'personas' && rows.some((p) => p.curp === record.curp)) {
            throw new Error('Ya existe una persona con ese CURP')
        }
        return createRecord(rows, record)
    },

    async update(name, id, data) {
        await delay()
        return updateRecord(table(name), id, normalize(name, data))
    },

    async remove(name, id) {
        await delay()
        const rows = table(name)
        findById(rows, id)

        const child = CHILDREN[name]
        if (child) {
            const [childTable, fk, message] = child
            if (table(childTable).some((row) => String(row[fk]) === String(id))) throw new Error(message)
        }

        if (name === 'familias') {
            for (let i = personas.length - 1; i >= 0; i--) {
                if (String(personas[i].id_familia) === String(id)) personas.splice(i, 1)
            }
        }
        deleteRecord(rows, id)
    },

    // El mock no tiene endpoint propio: ElectoralApi busca/exporta sobre las tablas.
    search: null,
    exportFile: null,
}

export default mockDataSource
