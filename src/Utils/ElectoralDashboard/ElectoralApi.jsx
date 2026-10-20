import dataSource from './dataSources'
import { toCsv, downloadBlob } from '@/lib/download'
import {
    createIndex,
    buildStatsCards,
    buildStatesList,
    buildStateDetail,
    buildMonthlySummary,
    buildRecentActivity,
    buildColoniasView,
    buildFamiliasView,
    buildReport,
    buildReportFilters,
    buildCoverageAnalytics,
    searchPersons,
} from './viewModels'

// ============================================
// 📊 ELECTORAL API (fachada única para la UI)
//
// Toda la UI habla con este objeto. Por debajo usa un data source:
//   - mock → datos en memoria          (NEXT_PUBLIC_API_MODE=mock, por defecto)
//   - http → backend Express + MySQL   (NEXT_PUBLIC_API_MODE=real)
// Los métodos devuelven siempre { success, data } o { success: false, error }.
// ============================================

// Convierte cualquier excepción en { success: false, error }
const run = async (fn) => {
    try {
        return { success: true, data: await fn() }
    } catch (error) {
        return { success: false, error: error?.message || String(error) }
    }
}

const loadIndex = async () => createIndex(await dataSource.loadTables())

const sameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()

const filterBy = (rows, filters = {}) =>
    rows.filter((row) =>
        Object.entries(filters).every(([key, expected]) => {
            if (expected === undefined || expected === null || expected === '') return true
            return String(row[key]) === String(expected)
        })
    )

// Busca la colonia a partir de los nombres escritos en el formulario de familias
const resolveColonia = (index, { state, delegation, colony }) => {
    const { colonias, delegaciones, estados } = index.tables
    const match = colonias.find((colonia) => {
        if (!sameText(colonia.nombre, colony)) return false
        const delegacion = delegaciones.find((d) => String(d.id) === String(colonia.id_delegacion))
        const estado = delegacion && estados.find((e) => String(e.id) === String(delegacion.id_estado))
        return delegacion && estado && sameText(delegacion.nombre, delegation) && sameText(estado.nombre, state)
    })
    if (!match) {
        throw new Error(`No existe la colonia "${colony}" en ${delegation}, ${state}. Verifica que esté registrada en Zonas Electorales.`)
    }
    return match
}

const birthDateFromAge = (age) => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - Number(age))
    return date.toISOString().slice(0, 10)
}

const memberToPerson = (member, familiaId) => {
    const label = member.name || 'sin nombre'
    if (!String(member.name || '').trim()) throw new Error('Todos los miembros deben tener nombre')
    if (!String(member.curp || '').trim()) throw new Error(`Falta el CURP de ${label}`)
    if (member.age === '' || member.age === undefined || Number.isNaN(Number(member.age))) throw new Error(`Falta la edad de ${label}`)
    if (!String(member.gender || '').trim()) throw new Error(`Falta el género de ${label}`)

    return {
        id_familia: familiaId,
        nombre: member.name.trim(),
        curp: member.curp.trim(),
        edad: Number(member.age),
        genero: member.gender.trim(),
        telefono: member.phone || '',
        rol_familia: member.role || 'MIEMBRO',
        fecha_nacimiento: birthDateFromAge(member.age),
    }
}

const CSV_COLUMNS = {
    families: [
        { header: 'ID', key: 'id' },
        { header: 'Familia', key: 'name' },
        { header: 'Jefe de familia', key: 'jefe' },
        { header: 'Estado', key: 'state' },
        { header: 'Delegación', key: 'delegation' },
        { header: 'Colonia', key: 'colony' },
        { header: 'Dirección', key: 'address' },
        { header: 'Personas', key: 'persons' },
        { header: 'Situación', key: 'status' },
    ],
    persons: [
        { header: 'ID', key: 'id' },
        { header: 'Nombre', key: 'nombre' },
        { header: 'CURP', key: 'curp' },
        { header: 'Teléfono', key: 'telefono' },
        { header: 'Edad', key: 'edad' },
        { header: 'Género', key: 'genero' },
        { header: 'Rol', key: 'rol_familia' },
        { header: 'Puede votar', value: (p) => (p.puede_votar ? 'Sí' : 'No') },
    ],
}

const ElectoralApi = {

    // ==================== RECURSOS GENÉRICOS ====================

    /**
     * CRUD para cualquier recurso nuevo sin escribir métodos a mano:
     *   const casillas = ElectoralApi.crud('casillas')
     *   await casillas.list({ id_colonia: 3 })   // { success, data }
     * En modo real llama a /api/electoral/<name>; en modo mock usa la tabla
     * registrada con registerMockTable(name, rows, requiredFields).
     */
    crud: (name) => ({
        list: (query) => run(() => dataSource.list(name, query)),
        get: (id) =>
            run(async () => {
                const found = (await dataSource.list(name)).find((row) => String(row.id) === String(id))
                if (!found) throw new Error('Registro no encontrado')
                return found
            }),
        create: (data) => run(() => dataSource.create(name, data)),
        update: (id, data) => run(() => dataSource.update(name, id, data)),
        remove: (id) => run(() => dataSource.remove(name, id)),
    }),

    // ==================== DASHBOARD GENERAL ====================

    getGeneralStats: () => run(async () => buildStatsCards(await loadIndex())),

    getMonthlySummary: () => run(async () => buildMonthlySummary(await loadIndex())),

    getRecentActivity: () => run(async () => buildRecentActivity(await loadIndex())),

    // ==================== ESTADOS ====================

    // Resumen con conteos para el dashboard ({ id, name, code, delegations, families, persons })
    getAllStates: () => run(async () => buildStatesList(await loadIndex())),

    // Registros crudos ({ id, codigo, nombre }) para los formularios de administración
    listStates: () => run(() => dataSource.list('estados')),

    getStateById: (stateId) => run(async () => buildStateDetail(await loadIndex(), stateId)),

    createState: (stateData) => run(() => dataSource.create('estados', { codigo: stateData.codigo, nombre: stateData.nombre })),

    updateState: (stateId, stateData) => run(() => dataSource.update('estados', stateId, stateData)),

    deleteState: (stateId) => run(() => dataSource.remove('estados', stateId)),

    // ==================== DELEGACIONES ====================

    getDelegationsByState: (stateId) =>
        run(async () => filterBy(await dataSource.list('delegaciones'), { id_estado: stateId })),

    getAllDelegations: () => run(() => dataSource.list('delegaciones')),

    getDelegationById: (delegationId) =>
        run(async () => {
            const found = (await dataSource.list('delegaciones')).find((d) => String(d.id) === String(delegationId))
            if (!found) throw new Error('Delegación no encontrada')
            return found
        }),

    createDelegation: (data) => run(() => dataSource.create('delegaciones', data)),

    updateDelegation: (delegationId, data) => run(() => dataSource.update('delegaciones', delegationId, data)),

    deleteDelegation: (delegationId) => run(() => dataSource.remove('delegaciones', delegationId)),

    // ==================== COLONIAS ====================

    getColoniesByDelegation: (delegationId) =>
        run(async () => filterBy(await dataSource.list('colonias'), { id_delegacion: delegationId })),

    getAllColonies: () => run(() => dataSource.list('colonias')),

    createColony: (data) => run(() => dataSource.create('colonias', data)),

    updateColony: (colonyId, data) => run(() => dataSource.update('colonias', colonyId, data)),

    deleteColony: (colonyId) => run(() => dataSource.remove('colonias', colonyId)),

    // ==================== FAMILIAS ====================

    getAllFamilies: (filters = {}) =>
        run(async () => filterBy(await dataSource.list('familias', filters), {
            id_colonia: filters.colonia_id,
            estado: filters.estado_familia,
        })),

    getFamilyById: (familyId) =>
        run(async () => {
            const index = await loadIndex()
            const familia = index.tables.familias.find((f) => String(f.id) === String(familyId))
            if (!familia) throw new Error('Familia no encontrada')
            return { ...familia, personas: index.personasDe(familia.id) }
        }),

    createFamily: (data) => run(() => dataSource.create('familias', data)),

    updateFamily: (familyId, data) => run(() => dataSource.update('familias', familyId, data)),

    deleteFamily: (familyId) => run(() => dataSource.remove('familias', familyId)),

    // ==================== PERSONAS ====================

    getAllPersons: (filters = {}) =>
        run(async () => {
            const puedeVotar = filters.puede_votar === undefined ? undefined : ['1', 'true'].includes(String(filters.puede_votar))
            let rows = (await dataSource.list('personas', filters)).filter(
                (p) => puedeVotar === undefined || (p.puede_votar === true || p.puede_votar === 1) === puedeVotar
            )
            rows = filterBy(rows, { id_familia: filters.familia_id })
            if (filters.limit) rows = rows.slice(0, parseInt(filters.limit, 10))
            return rows
        }),

    getPersonById: (personId) =>
        run(async () => {
            const found = (await dataSource.list('personas')).find((p) => String(p.id) === String(personId))
            if (!found) throw new Error('Persona no encontrada')
            return found
        }),

    createPerson: (data) => run(() => dataSource.create('personas', data)),

    updatePerson: (personId, data) => run(() => dataSource.update('personas', personId, data)),

    deletePerson: (personId) => run(() => dataSource.remove('personas', personId)),

    // ==================== BÚSQUEDA ====================

    // CURP, nombre, teléfono o dirección
    search: (searchTerm) =>
        run(async () => {
            if (!String(searchTerm || '').trim()) return []
            if (dataSource.search) return dataSource.search(searchTerm)
            return searchPersons(await loadIndex(), searchTerm)
        }),

    searchByCurp: (curp) =>
        run(async () => {
            const found = (await dataSource.list('personas')).find((p) => sameText(p.curp, curp))
            if (!found) throw new Error('No se encontró ninguna persona con ese CURP')
            return found
        }),

    // ==================== VISTAS PARA LAS PANTALLAS ====================
    // Devuelven exactamente lo que necesita cada página (ya unido y listo para pintar).

    getColoniasView: () => run(async () => buildColoniasView(await loadIndex())),

    getFamiliasView: () => run(async () => buildFamiliasView(await loadIndex())),

    getReportFilters: () => run(async () => buildReportFilters(await loadIndex())),

    getReport: (filters) => run(async () => buildReport(await loadIndex(), filters)),

    /**
     * Guarda el formulario de familia (crear o editar) con sus miembros.
     * formData = { name, address, state, delegation, colony, status, members: [{ id?, name, curp, age, gender, phone, role }] }
     */
    saveFamilyView: (familyId, formData) =>
        run(async () => {
            const index = await loadIndex()
            if (!String(formData.name || '').trim()) throw new Error('El nombre de la familia es obligatorio')
            if (!String(formData.address || '').trim()) throw new Error('La dirección es obligatoria')

            const colonia = resolveColonia(index, formData)
            // Validar a todos los miembros antes de escribir nada
            formData.members.forEach((member) => memberToPerson(member, familyId))

            const payload = {
                id_colonia: colonia.id,
                nombre_familia: formData.name.trim(),
                direccion: formData.address.trim(),
                estado: formData.status === 'Inactiva' ? 'INACTIVA' : 'ACTIVA',
            }

            const familia = familyId
                ? await dataSource.update('familias', familyId, payload)
                : await dataSource.create('familias', payload)
            const id = familia?.id ?? familyId

            const existing = familyId ? index.personasDe(familyId) : []
            const keptIds = new Set(formData.members.filter((m) => m.id).map((m) => String(m.id)))

            for (const person of existing) {
                if (!keptIds.has(String(person.id))) await dataSource.remove('personas', person.id)
            }
            for (const member of formData.members) {
                const person = memberToPerson(member, id)
                if (member.id) await dataSource.update('personas', member.id, person)
                else await dataSource.create('personas', person)
            }

            return { id }
        }),

    // ==================== REPORTES ====================

    generateStateReport: (stateId) =>
        run(async () => {
            const detail = buildStateDetail(await loadIndex(), stateId)
            return { estado: detail.name, families: detail.families, persons: detail.persons, generado: new Date().toISOString() }
        }),

    generateDelegationReport: (delegationId) =>
        run(async () => {
            const index = await loadIndex()
            const delegacion = index.delegacionPorId.get(String(delegationId))
            if (!delegacion) throw new Error('Delegación no encontrada')
            const familias = index.familiasDeColonias(index.coloniasDe(delegacion.id))
            return {
                delegacion: delegacion.nombre,
                families: familias.length,
                persons: index.personasDeFamilias(familias).length,
                generado: new Date().toISOString(),
            }
        }),

    /**
     * Descarga un CSV. type: 'families' | 'persons'.
     * En modo real lo genera el backend; en modo mock se arma en el navegador.
     */
    exportToCSV: (type = 'families', id) =>
        run(async () => {
            if (!CSV_COLUMNS[type]) throw new Error(`Tipo de exportación no soportado: ${type}`)

            if (dataSource.exportFile) {
                const { blob, filename } = await dataSource.exportFile(type, id)
                downloadBlob(blob, filename)
                return { type, filename }
            }

            const index = await loadIndex()
            const rows = type === 'families' ? buildFamiliasView(index) : index.tables.personas
            const csv = toCsv(rows, CSV_COLUMNS[type])
            const filename = `${type}-${new Date().toISOString().slice(0, 10)}.csv`
            downloadBlob(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }), filename)
            return { type, filename, rows: rows.length }
        }),

    // ==================== ESTADÍSTICAS AVANZADAS ====================

    getCoverageAnalytics: () => run(async () => buildCoverageAnalytics(await loadIndex())),

    getGrowthTrends: (period = 'monthly') =>
        run(async () => ({
            period,
            trend: buildMonthlySummary(await loadIndex()).map((m) => m.familias),
        })),
}

export default ElectoralApi
